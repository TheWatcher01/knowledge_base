"""Chat completions endpoint compatible with the existing Open WebUI contract."""

from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from ..config import Settings, get_settings
from ..dependencies.auth import verify_bearer_token

router = APIRouter(tags=["chat"], dependencies=[Depends(verify_bearer_token)])


class ChatMessage(BaseModel):
    """Minimal chat message schema to mirror Open WebUI payloads."""

    role: Literal["system", "user", "assistant"]
    content: str


class ChatCompletionRequest(BaseModel):
    """Expected body for POST /api/v1/chat/completions."""

    model: str = Field(..., description="Target model name (Ollama route).")
    stream: bool = Field(default=True, description="Enable streaming responses.")
    messages: list[ChatMessage] = Field(default_factory=list)


class ChatCompletionResponse(BaseModel):
    """Placeholder response until streaming is implemented."""

    message: str
    streamed: bool = False


@router.post(
    "/chat/completions",
    response_model=ChatCompletionResponse,
    summary="Chat completions proxy",
)
async def chat_completions(
    payload: ChatCompletionRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> ChatCompletionResponse:
    """
    Temporary implementation returning a placeholder response.

    The actual streaming bridge to Ollama/LlamaIndex will be implemented
    in upcoming steps. This endpoint keeps the signature expected by the
    Next.js frontend so we can wire it progressively.
    """

    if settings.ollama_base_url is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ollama service not configured.",
        )

    summary = (
        f"Received {len(payload.messages)} messages for model '{payload.model}'. "
        "Streaming pipeline not yet implemented."
    )

    return ChatCompletionResponse(message=summary, streamed=False)
