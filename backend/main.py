from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal
from decimal import Decimal
import models

#python -m uvicorn main:app --reload

app = FastAPI()


# ----------------------------
# Database dependency
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------------
# Pydantic request models
# ----------------------------
class AnswerItem(BaseModel):
    question_id: int
    answer: int   # 0-4


class AssessmentSubmission(BaseModel):
    user_id: int
    answers: list[AnswerItem]


# ----------------------------
# Helper functions
# ----------------------------
def calculate_risk_level(score: float) -> str:
    if score <= 40:
        return "High Risk"
    elif score <= 70:
        return "Medium Risk"
    else:
        return "Low Risk"


def to_float(value):
    """
    Safely convert Decimal / numeric DB values to float for JSON response.
    """
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


DIMENSION_WEIGHTS = {
    "Authentication & Account Security": 0.25,
    "Phishing & Social Engineering": 0.20,
    "Patch & Update Hygiene": 0.18,
    "Device Protection & Secure Configuration": 0.15,
    "Network Hygiene": 0.12,
    "Data Protection & Privacy": 0.10
}
RECOMMENDATIONS = {
    "Authentication & Account Security": [
        "Enable two-factor authentication (2FA)",
        "Use a password manager",
        "Avoid password reuse",
        "Use strong and unique passwords"
    ],

    "Phishing & Social Engineering": [
        "Verify sender addresses before opening emails",
        "Avoid clicking unknown links",
        "Do not enter credentials after email links",
        "Report suspicious emails"
    ],

    "Patch & Update Hygiene": [
        "Enable automatic updates",
        "Install updates promptly",
        "Avoid delaying security patches",
        "Keep applications updated"
    ],

    "Device Protection & Secure Configuration": [
        "Lock device with PIN or biometrics",
        "Install apps only from trusted sources",
        "Enable antivirus protection",
        "Review app permissions regularly"
    ],

    "Network Hygiene": [
        "Avoid public Wi-Fi for sensitive activity",
        "Use VPN on public networks",
        "Verify HTTPS before login",
        "Avoid unknown Wi-Fi networks"
    ],

    "Data Protection & Privacy": [
        "Regularly back up important data",
        "Review privacy settings",
        "Encrypt sensitive files",
        "Delete unnecessary personal data"
    ]
}




# ----------------------------
# GET /questions
# ----------------------------
@app.get("/questions")
def get_questions(db: Session = Depends(get_db)):
    questions = db.query(models.Question).all()

    return [
        {
            "id": q.id,
            "text": q.text,
            "dimension": q.dimension,
            "reverse_scored": q.reverse_scored
        }
        for q in questions
    ]


# ----------------------------
# POST /submit-assessment
# ----------------------------
@app.post("/submit-assessment")
def submit_assessment(data: AssessmentSubmission, db: Session = Depends(get_db)):
    if not data.answers:
        raise HTTPException(status_code=400, detail="No answers submitted.")

    dimension_totals = {}
    dimension_counts = {}
    processed_answers = []

    for item in data.answers:
        if item.answer < 0 or item.answer > 4:
            raise HTTPException(
                status_code=400,
                detail=f"Answer for question {item.question_id} must be between 0 and 4."
            )

        question = db.query(models.Question).filter(models.Question.id == item.question_id).first()

        if not question:
            raise HTTPException(
                status_code=404,
                detail=f"Question with id {item.question_id} not found."
            )

        # Reverse scoring
        final_score = 4 - item.answer if question.reverse_scored else item.answer

        processed_answers.append({
            "question_id": question.id,
            "dimension": question.dimension,
            "score": final_score
        })

        if question.dimension not in dimension_totals:
            dimension_totals[question.dimension] = 0
            dimension_counts[question.dimension] = 0

        dimension_totals[question.dimension] += final_score
        dimension_counts[question.dimension] += 1

    # Calculate dimension scores
    dimension_scores = {}
    for dimension, total in dimension_totals.items():
        count = dimension_counts[dimension]
        normalized_score = (total / (count * 4)) * 100
        dimension_scores[dimension] = round(normalized_score, 2)

    # Calculate overall weighted score
    overall_score = 0
    for dimension, score in dimension_scores.items():
        weight = DIMENSION_WEIGHTS.get(dimension, 0)
        overall_score += score * weight

    overall_score = round(overall_score, 2)
    risk_level = calculate_risk_level(overall_score)

    # Save assessment
    new_assessment = models.Assessment(
        user_id=data.user_id,
        overall_score=overall_score,
        risk_level=risk_level
    )
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)

    # Save responses
    for item in processed_answers:
        response = models.Response(
            assessment_id=new_assessment.id,
            question_id=item["question_id"],
            score=item["score"]
        )
        db.add(response)

    # Save dimension scores
    for dimension, score in dimension_scores.items():
        ds = models.DimensionScore(
            assessment_id=new_assessment.id,
            dimension=dimension,
            score=score
        )
        db.add(ds)

    db.commit()

    return {
        "assessment_id": new_assessment.id,
        "overall_score": overall_score,
        "risk_level": risk_level,
        "dimension_scores": dimension_scores
    }


# ----------------------------
# GET /user-history/{user_id}
# Returns:
# 1. all assessment history
# 2. dimension scores for each assessment
# 3. latest comparison if there are at least 2 assessments
# ----------------------------
@app.get("/user-history/{user_id}")
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    assessments = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == user_id)
        .order_by(models.Assessment.created_at.asc(), models.Assessment.id.asc())
        .all()
    )

    if not assessments:
        raise HTTPException(status_code=404, detail="No assessment history found for this user.")

    history = []

    for assessment in assessments:
        dimension_rows = (
            db.query(models.DimensionScore)
            .filter(models.DimensionScore.assessment_id == assessment.id)
            .all()
        )

        dimension_scores = {
            row.dimension: round(to_float(row.score), 2)
            for row in dimension_rows
        }

        history.append({
            "assessment_id": assessment.id,
            "overall_score": round(to_float(assessment.overall_score), 2),
            "risk_level": assessment.risk_level,
            "created_at": assessment.created_at,
            "dimension_scores": dimension_scores
        })

    latest_comparison = None

    if len(history) >= 2:
        previous = history[-2]
        current = history[-1]

        overall_change = round(
            current["overall_score"] - previous["overall_score"], 2
        )

        dimension_changes = {}
        all_dimensions = set(previous["dimension_scores"].keys()) | set(current["dimension_scores"].keys())

        for dimension in all_dimensions:
            prev_score = previous["dimension_scores"].get(dimension, 0.0)
            curr_score = current["dimension_scores"].get(dimension, 0.0)

            dimension_changes[dimension] = {
                "previous_score": round(prev_score, 2),
                "current_score": round(curr_score, 2),
                "change": round(curr_score - prev_score, 2)
            }

        latest_comparison = {
            "previous_assessment_id": previous["assessment_id"],
            "current_assessment_id": current["assessment_id"],
            "previous_overall_score": previous["overall_score"],
            "current_overall_score": current["overall_score"],
            "overall_change": overall_change,
            "previous_risk_level": previous["risk_level"],
            "current_risk_level": current["risk_level"],
            "dimension_changes": dimension_changes
        }

    return {
        "user_id": user_id,
        "total_assessments": len(history),
        "history": history,
        "latest_comparison": latest_comparison
    }

    # ----------------------------
# GET /recommendations/{assessment_id}
# ----------------------------
@app.get("/recommendations/{assessment_id}")
def get_recommendations(assessment_id: int, db: Session = Depends(get_db)):

    assessment = db.query(models.Assessment).filter(
        models.Assessment.id == assessment_id
    ).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    dimension_scores = db.query(models.DimensionScore).filter(
        models.DimensionScore.assessment_id == assessment_id
    ).all()

    recommendations = []

    for ds in dimension_scores:
        score = round(float(ds.score), 2)

        if score < 40:
            level = "critical"
        elif score < 60:
            level = "improve"
        else:
            continue

        recs = RECOMMENDATIONS.get(ds.dimension, [])

        recommendations.append({
            "dimension": ds.dimension,
            "score": score,
            "level": level,
            "recommendations": recs
        })

    return {
    "assessment_id": assessment_id,
    "overall_score": round(float(assessment.overall_score), 2),
    "risk_level": assessment.risk_level,
    "has_recommendations": len(recommendations) > 0,
    "recommendations": recommendations
}