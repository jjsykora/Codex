from __future__ import annotations

import io
import os
from typing import Any

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
from pydantic import BaseModel
from transformers import AutoModel, AutoProcessor

MODEL_DIR = os.getenv("MODEL_DIR", "/app/models/PE-Core-G14-448")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

app = FastAPI(title="PE-Core-G14-448 Embeddings API")


class TextRequest(BaseModel):
    text: str


def _load_model() -> tuple[Any, Any]:
    if not os.path.isdir(MODEL_DIR):
        raise RuntimeError(
            "Model directory not found. Ensure the local model files are available at "
            f"{MODEL_DIR} inside the container."
        )
    processor = AutoProcessor.from_pretrained(MODEL_DIR, local_files_only=True)
    model = AutoModel.from_pretrained(MODEL_DIR, local_files_only=True)
    model.to(DEVICE)
    model.eval()
    return processor, model


processor, model = _load_model()


def _to_embedding(output: Any) -> torch.Tensor:
    if hasattr(output, "pooler_output") and output.pooler_output is not None:
        return output.pooler_output
    if hasattr(output, "last_hidden_state") and output.last_hidden_state is not None:
        return output.last_hidden_state.mean(dim=1)
    raise RuntimeError("Model output does not contain recognizable embeddings.")


def _extract_features(inputs: dict[str, torch.Tensor]) -> list[float]:
    with torch.no_grad():
        if hasattr(model, "get_image_features") and "pixel_values" in inputs:
            features = model.get_image_features(**inputs)
        elif hasattr(model, "get_text_features") and "input_ids" in inputs:
            features = model.get_text_features(**inputs)
        else:
            output = model(**inputs)
            features = _to_embedding(output)
    normalized = torch.nn.functional.normalize(features, p=2, dim=-1)
    return normalized.squeeze(0).cpu().tolist()


@app.post("/embed/image")
async def embed_image(file: UploadFile = File(...)) -> JSONResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    image_bytes = await file.read()
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except OSError as exc:
        raise HTTPException(status_code=400, detail="Invalid image data.") from exc
    inputs = processor(images=image, return_tensors="pt")
    inputs = {key: value.to(DEVICE) for key, value in inputs.items()}
    embedding = _extract_features(inputs)
    return JSONResponse({"embedding": embedding})


@app.post("/embed/text")
async def embed_text(payload: TextRequest) -> JSONResponse:
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")
    inputs = processor(text=payload.text, return_tensors="pt")
    inputs = {key: value.to(DEVICE) for key, value in inputs.items()}
    embedding = _extract_features(inputs)
    return JSONResponse({"embedding": embedding})
