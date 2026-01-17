from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .rag import generate_answer
from .schemas import ChatRequest, ChatResponse, ChatMessage

app = FastAPI(title="RAG Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    response_text, sources = generate_answer(
        question=request.message,
        provider=request.provider,
        history=request.history,
        use_rag=request.use_rag,
    )

    message = ChatMessage(
        id="assistant-response",
        role="assistant",
        content=response_text,
    )

    return ChatResponse(message=message, sources=sources)
