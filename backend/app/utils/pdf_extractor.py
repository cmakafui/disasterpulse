# app/utils/pdf_extractor.py
import httpx
import fitz  # PyMuPDF
import io
from fastapi import HTTPException


async def extract_text_from_pdf_url(url: str) -> str:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()

            pdf_content = response.content
            pdf_file = io.BytesIO(pdf_content)

            doc = fitz.open(stream=pdf_file, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()

            return text
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code, detail=f"HTTP error occurred: {e}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
