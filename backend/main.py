from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal
import models

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


DIMENSION_WEIGHTS = {
    "Authentication & Account Security": 0.25,
    "Phishing & Social Engineering": 0.20,
    "Patch & Update Hygiene": 0.18,
    "Device Protection & Secure Configuration": 0.15,
    "Network Hygiene": 0.12,
    "Data Protection & Privacy": 0.10
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