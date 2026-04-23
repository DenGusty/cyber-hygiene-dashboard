from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from database import SessionLocal
from decimal import Decimal
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
import models
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import case


app = FastAPI()

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost,http://127.0.0.1,http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "change-this-to-a-long-random-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


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
    answers: list[AnswerItem]


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: EmailStr


# ----------------------------
# Helper functions
# ----------------------------
def calculate_risk_level(score: float) -> str:
    if score <= 50:
        return "High Risk"
    elif score <= 75:
        return "Medium Risk"
    else:
        return "Low Risk"

def validate_bcrypt_password(password: str):
    password_bytes = password.encode("utf-8")

    if len(password_bytes) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 bytes long."
        )

    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password must be no more than 72 bytes long. Use only simple English letters, numbers, and symbols."
        )

def to_float(value):
    """
    Safely convert Decimal / numeric DB values to float for JSON response.
    """
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise credentials_exception

    return user


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
    "title": "Use unique passwords for important accounts",
    "critical": [
        "Stop reusing passwords on important accounts immediately.",
        "Use a different password for your email, banking, and other high-value accounts.",
        "Use a password manager to help create and store unique passwords."
    ],
    "improve": [
        "Start replacing reused passwords on your most important accounts first.",
        "Make sure at least your email and financial accounts use unique passwords."
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
    "title": "Use trusted networks for sensitive activities",
    "critical": [
        "Avoid logging into important accounts or entering sensitive information on untrusted networks.",
        "Wait until you are on a trusted network before performing sensitive activities.",
        "Use mobile data or a secure home network when possible."
    ],
    "improve": [
        "Reduce the number of sensitive activities performed on unfamiliar networks.",
        "Be more cautious when accessing important services outside trusted environments."
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
    "title": "Use built-in protections for sensitive files and accounts",
    "critical": [
        "Enable built-in device or cloud protections for sensitive files and accounts.",
        "Avoid storing sensitive information in unprotected locations.",
        "Use available security features such as secure storage, device protection, or account protection settings."
    ],
    "improve": [
        "Review your current protection settings and enable additional built-in security features.",
        "Move sensitive files or accounts to more secure storage or protection options."
    ]
},
    24: {
    "title": "Review publicly visible personal information",
    "critical": [
        "Check what personal information is publicly visible on your online accounts immediately.",
        "Restrict access to sensitive details such as contact information, location, and identity-related data.",
        "Reduce unnecessary public exposure across social media and other online platforms."
    ],
    "improve": [
        "Review visible personal information more regularly.",
        "Reduce unnecessary public exposure of personal details where possible."
    ]
},
    25: {
    "title": "Protect passwords from insecure sharing or storage",
    "critical": [
        "Do not share your passwords with others.",
        "Do not store passwords in plain text, notes, or screenshots.",
        "Use a password manager instead of insecure manual storage."
    ],
    "improve": [
        "Reduce insecure password storage practices.",
        "Start moving important passwords into a secure password manager."
    ]
},
    26: {
    "title": "Do not ignore security warnings",
    "critical": [
        "Do not ignore browser or system security warnings when accessing websites.",
        "Leave the page immediately if a warning appears and you do not fully trust the site.",
        "Only continue when you understand the warning and trust the source."
    ],
    "improve": [
        "Pay closer attention to browser and system warnings.",
        "Avoid dismissing security warnings without checking the risk first."
    ]
},
}

# ----------------------------
# GET /questions
# ----------------------------
@app.get("/questions")
def get_questions(db: Session = Depends(get_db)):
    dimension_order = case(
        (models.Question.dimension == "Authentication & Account Security", 1),
        (models.Question.dimension == "Phishing & Social Engineering", 2),
        (models.Question.dimension == "Patch & Update Hygiene", 3),
        (models.Question.dimension == "Device Protection & Secure Configuration", 4),
        (models.Question.dimension == "Network Hygiene", 5),
        (models.Question.dimension == "Data Protection & Privacy", 6),
        else_=99
    )

    questions = (
        db.query(models.Question)
        .order_by(dimension_order, models.Question.id.asc())
        .all()
    )

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
def submit_assessment(
    data: AssessmentSubmission,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
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

    dimension_scores = {}
    for dimension, total in dimension_totals.items():
        count = dimension_counts[dimension]
        normalized_score = (total / (count * 4)) * 100
        dimension_scores[dimension] = round(normalized_score, 2)

    overall_score = 0
    for dimension, score in dimension_scores.items():
        weight = DIMENSION_WEIGHTS.get(dimension, 0)
        overall_score += score * weight

    overall_score = round(overall_score, 2)
    risk_level = calculate_risk_level(overall_score)

    new_assessment = models.Assessment(
        user_id=current_user.id,
        overall_score=overall_score,
        risk_level=risk_level
    )

    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)

    for item in processed_answers:
        response = models.Response(
            assessment_id=new_assessment.id,
            question_id=item["question_id"],
            score=item["score"]
        )
        db.add(response)

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
# GET /user-history
# token-based current user history
# ----------------------------
@app.get("/user-history")
def get_user_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    assessments = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(models.Assessment.created_at.asc(), models.Assessment.id.asc())
        .all()
    )

    if not assessments:
        raise HTTPException(status_code=404, detail="No assessment history found for this user.")

    history = []

    for index, assessment in enumerate(assessments, start=1):
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
            "assessment_number": index,
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
            "previous_assessment_number": previous["assessment_number"],
            "current_assessment_number": current["assessment_number"],
            "previous_overall_score": previous["overall_score"],
            "current_overall_score": current["overall_score"],
            "overall_change": overall_change,
            "previous_risk_level": previous["risk_level"],
            "current_risk_level": current["risk_level"],
            "dimension_changes": dimension_changes
        }

    return {
        "user_id": current_user.id,
        "total_assessments": len(history),
        "history": history,
        "latest_comparison": latest_comparison
    }


@app.get("/assessment/{assessment_id}")
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id == assessment_id,
            models.Assessment.user_id == current_user.id
        )
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
def get_recommendations(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id == assessment_id,
            models.Assessment.user_id == current_user.id
        )
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

    critical_count = sum(
        1 for x in flat_recommendations if x["level"] == "critical"
    )

    improve_count = sum(
        1 for x in flat_recommendations if x["level"] == "improve"
    )

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

@app.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    validate_bcrypt_password(data.password)

    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    new_user = models.User(
        email=data.email,
        password_hash=hash_password(data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token({"sub": str(new_user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "email": new_user.email
    }


@app.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    validate_bcrypt_password(data.password)

    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    access_token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email
    }


@app.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email
    }
