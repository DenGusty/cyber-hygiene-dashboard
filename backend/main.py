from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal
from decimal import Decimal
import models
from fastapi.middleware.cors import CORSMiddleware

# python -m uvicorn main:app --reload

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
QUESTION_RECOMMENDATIONS = {
    1: {
        "title": "Avoid password reuse",
        "critical": [
            "Stop reusing the same password across different websites.",
            "Change reused passwords on your email, banking, and social media accounts first.",
            "Use a password manager to create unique passwords for every important account."
        ],
        "improve": [
            "Reduce password reuse on your most important accounts first.",
            "Start replacing reused passwords with unique ones for email and banking."
        ]
    },
    2: {
        "title": "Use a password manager",
        "critical": [
            "Start using a password manager to generate and store strong unique passwords.",
            "Begin with your email account and other high-value accounts.",
            "Do not rely on memory alone for multiple important passwords."
        ],
        "improve": [
            "Use a password manager at least for your main accounts.",
            "Gradually move frequently used accounts into a password manager."
        ]
    },
    3: {
        "title": "Strengthen password length",
        "critical": [
            "Use longer passwords or passphrases for important accounts.",
            "Avoid short and predictable passwords.",
            "Update weak passwords on email, banking, and cloud accounts first."
        ],
        "improve": [
            "Increase password length on your most sensitive accounts.",
            "Replace medium-strength passwords with longer passphrases."
        ]
    },
    4: {
        "title": "Enable two-factor authentication",
        "critical": [
            "Enable two-factor authentication (2FA) on your email account immediately.",
            "Then enable 2FA on banking, social media, and other important accounts.",
            "Prefer authenticator apps or secure verification methods where available."
        ],
        "improve": [
            "Expand 2FA to more important accounts.",
            "Review which critical accounts still do not have 2FA enabled."
        ]
    },

    5: {
        "title": "Check sender addresses carefully",
        "critical": [
            "Always check the sender address before opening attachments.",
            "Be cautious of unexpected emails even if the display name looks familiar.",
            "Treat mismatched or unusual sender domains as suspicious."
        ],
        "improve": [
            "Check sender addresses more consistently before opening attachments.",
            "Pause and verify the sender when an email feels unusual or urgent."
        ]
    },
    6: {
        "title": "Verify links before clicking",
        "critical": [
            "Do not click links in emails or messages without checking where they lead.",
            "Hover over links or inspect the URL before opening them.",
            "Open important websites manually instead of using embedded links."
        ],
        "improve": [
            "Verify links more carefully before clicking.",
            "Use direct website access for sensitive accounts instead of message links."
        ]
    },
    7: {
        "title": "Avoid entering credentials after email links",
        "critical": [
            "Stop entering login credentials after clicking links in emails.",
            "Go directly to the official website or app when signing in.",
            "Change passwords on important accounts if you may have entered credentials on a suspicious page."
        ],
        "improve": [
            "Reduce the habit of signing in through email links.",
            "Use bookmarks or manually typed URLs for important services."
        ]
    },
    8: {
        "title": "Report suspicious messages",
        "critical": [
            "Report suspicious emails or messages instead of ignoring them.",
            "Use the reporting feature in email systems when available.",
            "Reporting helps reduce repeated phishing exposure."
        ],
        "improve": [
            "Report suspicious messages more consistently.",
            "Use built-in phishing reporting tools when possible."
        ]
    },

    9: {
        "title": "Install operating system updates regularly",
        "critical": [
            "Install operating system updates much more regularly.",
            "Do not leave devices unpatched for long periods.",
            "Prioritise updates on devices used for email, banking, or coursework."
        ],
        "improve": [
            "Install operating system updates more consistently.",
            "Reduce the delay between update availability and installation."
        ]
    },
    10: {
        "title": "Enable automatic updates",
        "critical": [
            "Turn on automatic updates for your devices.",
            "Automatic updates reduce the chance of long unprotected periods.",
            "Check both system and security update settings."
        ],
        "improve": [
            "Enable automatic updates on more of your devices.",
            "Review whether update settings are active and working properly."
        ]
    },
    11: {
        "title": "Stop delaying security updates",
        "critical": [
            "Stop delaying security updates when they become available.",
            "Security patches close known vulnerabilities and should be installed promptly.",
            "Treat urgent security updates as a priority."
        ],
        "improve": [
            "Reduce the time you wait before installing security updates.",
            "Install security patches sooner, especially on frequently used devices."
        ]
    },
    12: {
        "title": "Keep applications updated",
        "critical": [
            "Update installed applications regularly, not just the operating system.",
            "Outdated browsers, office tools, and messaging apps can create avoidable risks.",
            "Review commonly used apps for pending updates."
        ],
        "improve": [
            "Check application updates more often.",
            "Focus first on browsers, communication apps, and software that handles personal data."
        ]
    },

    13: {
        "title": "Lock your device properly",
        "critical": [
            "Protect your device with a password, PIN, or biometric lock.",
            "Do not leave phones or laptops unlocked, especially in shared spaces.",
            "Use screen lock and auto-lock settings."
        ],
        "improve": [
            "Use stronger and more consistent device locking.",
            "Review whether your current lock method is reliable enough."
        ]
    },
    14: {
        "title": "Install apps only from trusted sources",
        "critical": [
            "Only install applications from trusted and official sources.",
            "Avoid downloading software from unknown websites or unofficial stores.",
            "Check publisher details and reviews before installation."
        ],
        "improve": [
            "Be more selective about where you install apps from.",
            "Prioritise official app stores and trusted vendors."
        ]
    },
    15: {
        "title": "Use antivirus or built-in protection",
        "critical": [
            "Enable antivirus or built-in device security protection.",
            "Do not leave your device without any active security protection.",
            "Check that protection tools are turned on and updated."
        ],
        "improve": [
            "Review whether your current protection is enabled and working properly.",
            "Make sure built-in or third-party security protection stays active."
        ]
    },
    16: {
        "title": "Review application permissions",
        "critical": [
            "Review app permissions regularly and remove unnecessary access.",
            "Limit access to location, camera, microphone, contacts, and files unless needed.",
            "Delete or restrict apps with excessive permissions."
        ],
        "improve": [
            "Check app permissions more often.",
            "Reduce unnecessary permissions for apps that do not need broad access."
        ]
    },

    17: {
        "title": "Avoid sensitive activity on public Wi-Fi",
        "critical": [
            "Do not use public Wi-Fi for banking, account login, or other sensitive activity.",
            "Delay sensitive actions until you are on a trusted network or mobile data.",
            "Public networks should be treated as higher risk by default."
        ],
        "improve": [
            "Reduce sensitive activity on public Wi-Fi.",
            "Use safer alternatives for logins and financial tasks when away from home."
        ]
    },
    18: {
        "title": "Check for HTTPS before entering credentials",
        "critical": [
            "Check that websites use HTTPS before entering credentials or personal information.",
            "Do not sign in on websites with insecure or suspicious connection indicators.",
            "Be especially careful on pages reached through links in emails or messages."
        ],
        "improve": [
            "Verify HTTPS more consistently before entering credentials.",
            "Pay closer attention to browser security indicators on login pages."
        ]
    },
    19: {
        "title": "Avoid unknown Wi-Fi networks",
        "critical": [
            "Avoid connecting to unknown or suspicious Wi-Fi networks.",
            "Do not trust networks just because the name looks familiar or convenient.",
            "Use known networks or mobile data when possible."
        ],
        "improve": [
            "Be more cautious when choosing Wi-Fi networks.",
            "Prefer trusted networks and avoid unnecessary connections to unknown hotspots."
        ]
    },
    20: {
        "title": "Use a VPN on public networks",
        "critical": [
            "Use a VPN when accessing the internet on public networks.",
            "A VPN adds protection when you cannot avoid public Wi-Fi.",
            "Prioritise VPN use for work, study, and account-related activity on shared networks."
        ],
        "improve": [
            "Use a VPN more consistently on public networks.",
            "Enable VPN especially when handling accounts or personal data outside home."
        ]
    },

    21: {
        "title": "Back up important files regularly",
        "critical": [
            "Back up important files regularly.",
            "Use automatic backup if possible instead of relying only on memory.",
            "Make sure important coursework, photos, and personal files can be recovered."
        ],
        "improve": [
            "Back up important files more consistently.",
            "Review whether your most valuable files are included in backup routines."
        ]
    },
    22: {
        "title": "Review privacy settings",
        "critical": [
            "Review privacy settings on your social media and online accounts.",
            "Reduce unnecessary public visibility of personal information.",
            "Check who can view your posts, profile details, and contact information."
        ],
        "improve": [
            "Review privacy settings more regularly.",
            "Tighten visibility settings on the accounts you use most."
        ]
    },
    23: {
        "title": "Protect sensitive files with encryption",
        "critical": [
            "Store sensitive files in encrypted form when possible.",
            "Do not keep highly sensitive personal data unprotected on shared or portable devices.",
            "Use encrypted storage features or secure cloud options for important files."
        ],
        "improve": [
            "Protect more of your sensitive files with encryption.",
            "Start with financial, identity, and private personal documents."
        ]
    },
    24: {
        "title": "Delete unnecessary personal data",
        "critical": [
            "Delete unnecessary personal data from online services and old accounts.",
            "Reduce the amount of personal information stored where it is no longer needed.",
            "Review unused accounts and remove outdated personal data where possible."
        ],
        "improve": [
            "Clean up unnecessary personal data more regularly.",
            "Start by reviewing old accounts and services you no longer use."
        ]
    }
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

@app.get("/assessment/{assessment_id}")
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.id == assessment_id)
        .first()
    )

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    dimension_rows = (
        db.query(models.DimensionScore)
        .filter(models.DimensionScore.assessment_id == assessment_id)
        .all()
    )

    dimension_scores = {
        row.dimension: round(to_float(row.score), 2)
        for row in dimension_rows
    }

    return {
        "assessment_id": assessment.id,
        "user_id": assessment.user_id,
        "overall_score": round(to_float(assessment.overall_score), 2),
        "risk_level": assessment.risk_level,
        "created_at": assessment.created_at,
        "dimension_scores": dimension_scores
    }
# --------------------------------------------------
# GET /recommendations/{assessment_id}
# grouped + question-level recommendation API
# --------------------------------------------------
@app.get("/recommendations/{assessment_id}")
def get_recommendations(assessment_id: int, db: Session = Depends(get_db)):

    assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.id == assessment_id)
        .first()
    )

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    response_rows = (
        db.query(models.Response, models.Question)
        .join(models.Question, models.Response.question_id == models.Question.id)
        .filter(models.Response.assessment_id == assessment_id)
        .all()
    )

    flat_recommendations = []

    # ----------------------------
    # Question-level trigger
    # ----------------------------
    for response, question in response_rows:
        score = int(response.score)

        if score <= 1:
            level = "critical"
        elif score == 2:
            level = "improve"
        else:
            continue

        rec_config = QUESTION_RECOMMENDATIONS.get(question.id)

        if not rec_config:
            continue

        flat_recommendations.append({
            "question_id": question.id,
            "question_text": question.text,
            "dimension": question.dimension,
            "score": score,
            "level": level,
            "title": rec_config["title"],
            "recommendations": rec_config[level]
        })

    # ----------------------------
    # Sort: dimension + severity
    # ----------------------------
    severity_order = {
        "critical": 0,
        "improve": 1
    }

    flat_recommendations.sort(
        key=lambda x: (
            x["dimension"],
            severity_order.get(x["level"], 99),
            x["question_id"]
        )
    )

    # ----------------------------
    # Group by dimension
    # ----------------------------
    grouped = {}

    for item in flat_recommendations:
        dimension = item["dimension"]

        if dimension not in grouped:
            grouped[dimension] = {
                "dimension": dimension,
                "count": 0,
                "highest_level": item["level"],
                "items": []
            }

        # update highest severity
        if item["level"] == "critical":
            grouped[dimension]["highest_level"] = "critical"

        grouped[dimension]["items"].append({
            "question_id": item["question_id"],
            "question_text": item["question_text"],
            "score": item["score"],
            "level": item["level"],
            "title": item["title"],
            "recommendations": item["recommendations"]
        })

        grouped[dimension]["count"] += 1

    # ----------------------------
    # Keep fixed dimension order
    # ----------------------------
    dimension_order = [
        "Authentication & Account Security",
        "Phishing & Social Engineering",
        "Patch & Update Hygiene",
        "Device Protection & Secure Configuration",
        "Network Hygiene",
        "Data Protection & Privacy"
    ]

    grouped_list = [
        grouped[d]
        for d in dimension_order
        if d in grouped
    ]

    # ----------------------------
    # Summary stats
    # ----------------------------
    critical_count = sum(
        1 for x in flat_recommendations if x["level"] == "critical"
    )

    improve_count = sum(
        1 for x in flat_recommendations if x["level"] == "improve"
    )

    # ----------------------------
    # Final response
    # ----------------------------
    return {
        "assessment_id": assessment_id,
        "overall_score": round(float(assessment.overall_score), 2),
        "risk_level": assessment.risk_level,

        "has_recommendations": len(grouped_list) > 0,

        "summary": {
            "critical_count": critical_count,
            "improve_count": improve_count,
            "total_issues": len(flat_recommendations),
            "affected_dimensions": len(grouped_list)
        },

        "recommendation_groups": grouped_list
    }