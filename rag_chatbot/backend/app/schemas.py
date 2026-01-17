from typing import List, Literal, Optional
from pydantic import BaseModel


class ChatMessage(BaseModel):
    id: str
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    message: str
    provider: Literal["ollama", "vllm"]
    history: List[ChatMessage] = []
    use_rag: bool = True


class SourceDocument(BaseModel):
    id: str
    title: str
    snippet: str
    score: float


class ChatResponse(BaseModel):
    message: ChatMessage
    sources: List[SourceDocument] = []
    prompt: Optional[str] = None
