from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, DECIMAL, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    dimension = Column(String(100), nullable=False)
    reverse_scored = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    overall_score = Column(DECIMAL(5, 2), nullable=False)
    risk_level = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)


class DimensionScore(Base):
    __tablename__ = "dimension_scores"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    dimension = Column(String(100), nullable=False)
    score = Column(DECIMAL(5, 2), nullable=False)