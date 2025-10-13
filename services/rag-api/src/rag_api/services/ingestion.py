"""Ingestion helpers for the RAG API service."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, Dict, Iterable

from llama_index.core import Document, Settings, StorageContext, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.ollama import OllamaEmbedding

from ..config import Settings as AppSettings
from .vector_store import build_pgvector_store, ensure_vector_extension

LOGGER = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _text_splitter() -> SentenceSplitter:
    return SentenceSplitter(chunk_size=512, chunk_overlap=80)


@lru_cache(maxsize=None)
def _embedding_model(base_url: str, model_name: str) -> OllamaEmbedding:
    return OllamaEmbedding(model_name=model_name, base_url=str(base_url))


def get_embedding_model(settings: AppSettings) -> OllamaEmbedding:
    if not settings.ollama_base_url:
        raise ValueError("OLLAMA base URL is required")

    return _embedding_model(settings.ollama_base_url, settings.ollama_embedding_model)


def clear_embedding_cache() -> None:
    """Clear cached embedding model instances (after config changes)."""

    _embedding_model.cache_clear()


def _prepare_documents(
    document_id: str,
    content: str,
    metadata: Dict[str, Any],
) -> Iterable[Document]:
    return [Document(id_=document_id, text=content, metadata=metadata)]


def ingest_text(
    settings: AppSettings,
    *,
    kb_id: str,
    document_id: str,
    content: str,
    collection_name: str,
    metadata: Dict[str, Any] | None = None,
) -> None:
    """Ingest a text payload into the vector store."""

    if not content.strip():
        raise ValueError("Empty content cannot be ingested")

    ensure_vector_extension(settings)

    embed_model = get_embedding_model(settings)
    splitter = _text_splitter()

    documents = _prepare_documents(
        document_id,
        content,
        {
            "kb_id": kb_id,
            **(metadata or {}),
        },
    )

    nodes = list(splitter.get_nodes_from_documents(documents))

    if not nodes:
        raise ValueError("Unable to create nodes for the supplied document")

    sample_embedding = embed_model.get_text_embedding(nodes[0].get_content())
    embed_dim = len(sample_embedding)

    vector_store = build_pgvector_store(
        settings,
        collection_name=collection_name,
        embed_dim=embed_dim,
    )

    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    Settings.embed_model = embed_model
    Settings.text_splitter = splitter

    index = VectorStoreIndex.from_vector_store(vector_store=vector_store, storage_context=storage_context)
    index.insert_nodes(nodes)

    LOGGER.info("Ingested %s nodes for document %s in kb %s", len(nodes), document_id, kb_id)


def delete_document(
    settings: AppSettings,
    *,
    document_id: str,
    collection_name: str,
) -> None:
    """Delete a document and its chunks from the vector store."""

    ensure_vector_extension(settings)

    if not settings.ollama_base_url:
        raise ValueError("OLLAMA base URL is required for deletion operations")

    embed_model = get_embedding_model(settings)
    sample_embedding = embed_model.get_text_embedding("placeholder")
    embed_dim = len(sample_embedding)

    vector_store = build_pgvector_store(
        settings,
        collection_name=collection_name,
        embed_dim=embed_dim,
    )

    vector_store.delete(doc_ids=[document_id])
