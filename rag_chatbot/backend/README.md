# RAG Chatbot Backend

## Overview
This FastAPI service powers the retrieval-augmented generation workflow. It connects to a hosted Elasticsearch cluster for kNN vector search and uses LangChain to talk to either Ollama or vLLM.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Environment

Create a `.env` file in `backend/` with the following values:

```bash
ES_URL=http://localhost:9200
ES_INDEX=rag-docs
ES_VECTOR_FIELD=embedding
ES_TITLE_FIELD=title
ES_CONTENT_FIELD=content

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
OLLAMA_EMBED_MODEL=nomic-embed-text

VLLM_BASE_URL=http://localhost:8001
VLLM_MODEL=meta-llama/Meta-Llama-3-8B-Instruct
```

## Run the API

```bash
uvicorn app.main:app --reload --port 8000
```
