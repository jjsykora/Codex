# RAG Chatbot

This project provides a full-stack Retrieval-Augmented Generation (RAG) chat app with a Next.js + Tailwind front end and a FastAPI + LangChain backend. It connects to a separately hosted Elasticsearch cluster for vector kNN search.

## Repository Layout

```
rag_chatbot/
  frontend/   # Next.js chat UI
  backend/    # FastAPI + LangChain RAG API
```

## Prerequisites

- Elasticsearch 8.x with a kNN vector index
- Ollama or vLLM running locally or remotely

## Frontend

```bash
cd rag_chatbot/frontend
npm install
npm run dev
```

Environment variables (optional):

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Backend

```bash
cd rag_chatbot/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Elasticsearch Index Requirements

Your index should include a vector field matching `ES_VECTOR_FIELD`, plus `title` and `content` fields for metadata. Example mapping:

```json
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "content": { "type": "text" },
      "embedding": {
        "type": "dense_vector",
        "dims": 768,
        "index": true,
        "similarity": "cosine"
      }
    }
  }
}
```

## Chat Workflow

1. The Next.js client sends chat messages to the FastAPI backend.
2. The backend retrieves relevant documents from Elasticsearch using a kNN query.
3. LangChain builds a prompt that includes the retrieved context and routes the request to Ollama or vLLM.
4. The UI renders the answer and shows retrieved sources in a right-side panel.
