import instructor
from anthropic import AsyncAnthropic
from app.core.config import settings
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class Language(str, Enum):
    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"


class TimelineEvent(BaseModel):
    date: str = Field(..., description="Date of the event. e.g 2022-01-01")
    description: str = Field(..., description="Description of the event")


class Timeline(BaseModel):
    events: List[TimelineEvent]


class ImpactAnalysis(BaseModel):
    affected_people: Optional[int] = Field(
        None, description="Number of people affected by the disaster"
    )
    economic_impact: str
    infrastructure_damage: str


class NeedsAnalysis(BaseModel):
    immediate_needs: List[str]
    long_term_needs: List[str]
    resource_gaps: List[str]


class DisasterAnalysis(BaseModel):
    executive_summary: str = Field(
        ..., description="Executive summary of the situational report"
    )
    timeline: Timeline
    impact_analysis: ImpactAnalysis
    needs_analysis: NeedsAnalysis


class MapAnalysis(BaseModel):
    disaster_extent: Optional[str] = Field(
        None, description="Description of the disaster's geographical extent"
    )
    affected_areas: List[str] = Field(..., description="List of affected areas")
    key_findings: List[str] = Field(
        ..., description="List of key findings from the map analysis"
    )


instructor_client = instructor.from_anthropic(
    AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
)

language_prompts = {
    Language.ENGLISH: "Provide the analysis in English",
    Language.SPANISH: "Proporcione el análisis en español",
    Language.FRENCH: "Fournissez l'analyse en français",
}


async def generate_report_analysis(
    disaster: str, report_title: str, report_content: str, lang: str
) -> Timeline:

    lang_prompt = language_prompts.get(lang, language_prompts[Language.ENGLISH])

    prompt = f"Generate a timeline of events, impact analysis and needs analysis for the disaster '{disaster}' based on the following report. {lang_prompt}:\n\n"

    prompt += f"Title: {report_title}\n\nContent: {report_content}"

    return await instructor_client.chat.completions.create(
        model="claude-3-5-sonnet-20240620",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4096,
        response_model=DisasterAnalysis,
    )


async def generate_map_analysis(
    disaster: str, map_title: str, encoded_images: List[str], lang: str
) -> DisasterAnalysis:
    lang_prompt = language_prompts.get(lang, language_prompts[Language.ENGLISH])

    content = [
        {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": encoded_png,
            },
        }
        for encoded_png in encoded_images
    ]

    prompt = f"Analyze the following map images from '{map_title}' related to the disaster '{disaster}'. {lang_prompt}."
    content.append({"type": "text", "text": prompt})

    messages = [{"role": "user", "content": content}]

    return await instructor_client.chat.completions.create(
        model="claude-3-5-sonnet-20240620",
        messages=messages,
        max_tokens=4096,
        response_model=MapAnalysis,
    )
