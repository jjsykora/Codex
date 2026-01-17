import os
from typing import List, Tuple

from elasticsearch import Elasticsearch
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_community.llms import VLLM
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from .schemas import ChatMessage, SourceDocument


def get_es_client() -> Elasticsearch:
    es_url = os.environ.get("ES_URL", "http://localhost:9200")
    return Elasticsearch(es_url)


def get_embeddings() -> OllamaEmbeddings:
    return OllamaEmbeddings(
        model=os.environ.get("OLLAMA_EMBED_MODEL", "nomic-embed-text"),
        base_url=os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434"),
    )


def get_llm(provider: str):
    if provider == "ollama":
        return ChatOllama(
            model=os.environ.get("OLLAMA_MODEL", "llama3"),
            base_url=os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434"),
            temperature=0.2,
        )
    return VLLM(
        model=os.environ.get("VLLM_MODEL", "meta-llama/Meta-Llama-3-8B-Instruct"),
        temperature=0.2,
        base_url=os.environ.get("VLLM_BASE_URL", "http://localhost:8001"),
        max_new_tokens=512,
    )


def format_history(history: List[ChatMessage]) -> List[Tuple[str, str]]:
    formatted = []
    for message in history:
        if message.role == "system":
            formatted.append(("system", message.content))
        elif message.role == "assistant":
            formatted.append(("assistant", message.content))
        else:
            formatted.append(("user", message.content))
    return formatted


def retrieve_documents(query: str, k: int = 4) -> List[SourceDocument]:
    es = get_es_client()
    index_name = os.environ.get("ES_INDEX", "rag-docs")
    vector_field = os.environ.get("ES_VECTOR_FIELD", "embedding")
    title_field = os.environ.get("ES_TITLE_FIELD", "title")
    content_field = os.environ.get("ES_CONTENT_FIELD", "content")

    embeddings = get_embeddings()
    vector = embeddings.embed_query(query)

    response = es.search(
        index=index_name,
        knn={
            "field": vector_field,
            "query_vector": vector,
            "k": k,
            "num_candidates": max(10, k * 2),
        },
        source=True,
    )

    sources: List[SourceDocument] = []
    for hit in response.get("hits", {}).get("hits", []):
        source = hit.get("_source", {})
        content = str(source.get(content_field, ""))
        snippet = content[:280] + ("..." if len(content) > 280 else "")
        sources.append(
            SourceDocument(
                id=str(hit.get("_id", "")),
                title=str(source.get(title_field, "Untitled")),
                snippet=snippet,
                score=float(hit.get("_score", 0.0)),
            )
        )

    return sources


def build_prompt(
    question: str,
    sources: List[SourceDocument],
    history: List[ChatMessage],
) -> ChatPromptTemplate:
    context_blocks = "\n\n".join(
        [f"Title: {doc.title}\nExcerpt: {doc.snippet}" for doc in sources]
    )

    system = (
        "You are a helpful RAG assistant. Answer the user using the provided context. "
        "If the context is insufficient, say you do not know."
    )

    if context_blocks:
        system += f"\n\nContext:\n{context_blocks}"

    messages = [("system", system)]
    messages.extend(format_history(history))
    messages.append(("user", question))

    return ChatPromptTemplate.from_messages(messages)


def generate_answer(
    question: str,
    provider: str,
    history: List[ChatMessage],
    use_rag: bool,
) -> tuple[str, List[SourceDocument]]:
    sources: List[SourceDocument] = []
    if use_rag:
        sources = retrieve_documents(question)
        prompt = build_prompt(question, sources, history)
    else:
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", "You are a helpful assistant."),
                *format_history(history),
                ("user", question),
            ]
        )

    llm = get_llm(provider)
    chain = prompt | llm | StrOutputParser()
    response_text = chain.invoke({})
    return response_text, sources
