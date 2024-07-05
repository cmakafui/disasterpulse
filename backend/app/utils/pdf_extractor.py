# app/utils/pdf_extractor.py
import asyncio
import base64
import httpx
import fitz  # PyMuPDF
import io
from fastapi import HTTPException
from PIL import Image


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


async def pdf_to_base64_pngs(
    url: str, quality: int = 75, max_size: tuple = (1024, 1024)
):
    async def process_page(page):
        pix = page.get_pixmap(matrix=fitz.Matrix(300 / 72, 300 / 72))
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)

        image_data = io.BytesIO()
        img.save(image_data, format="PNG", optimize=True, quality=quality)
        image_data.seek(0)
        return base64.b64encode(image_data.getvalue()).decode("utf-8")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()

            pdf_content = response.content
            pdf_file = io.BytesIO(pdf_content)

            doc = fitz.open(stream=pdf_file, filetype="pdf")
            tasks = [
                asyncio.create_task(process_page(doc.load_page(page_num)))
                for page_num in range(doc.page_count)
            ]

            base64_encoded_pngs = await asyncio.gather(*tasks)

            doc.close()
            return base64_encoded_pngs
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code, detail=f"HTTP error occurred: {e}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
