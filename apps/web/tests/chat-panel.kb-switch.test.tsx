import { render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { KnowledgeBaseChatPanel } from "@/components/kb/chat-panel";
import enMessages from "@/i18n/messages/en.json";

const searchParamsState = { value: "conversation=existing-convo" };

const replaceSpy = vi.fn<(href: string, options?: { scroll?: boolean }) => void>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: (href: string, options?: { scroll?: boolean }) => {
      replaceSpy(href, options);

      if (typeof href !== "string") {
        return;
      }

      if (href.startsWith("?")) {
        searchParamsState.value = href.slice(1);
        return;
      }

      if (href.length === 0) {
        searchParamsState.value = "";
        return;
      }

      const queryIndex = href.indexOf("?");
      searchParamsState.value = queryIndex >= 0 ? href.slice(queryIndex + 1) : "";
    },
  }),
  useSearchParams: () => new URLSearchParams(searchParamsState.value),
  useSelectedLayoutSegments: () => [],
}));

const originalFetch = global.fetch;
const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;

function createJsonResponse(body: unknown, status = 200, headers?: Record<string, string>) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    headers: {
      get: (key: string) => headers?.[key.toLowerCase()] ?? headers?.[key] ?? null,
    },
  } as Response;
}

describe("KnowledgeBaseChatPanel kb switch", () => {
  beforeAll(() => {
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  beforeEach(() => {
    searchParamsState.value = "conversation=existing-convo";
    replaceSpy.mockClear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  afterAll(() => {
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: originalScrollIntoView,
    });
  });

  it("clears the active conversation state when the kbId changes", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo) => {
      const url = typeof input === "string" ? input : input.url;

      if (url === "/api/models") {
        return createJsonResponse({
          models: [
            {
              id: "mock-model",
              label: "Mock Model",
            },
          ],
        });
      }

      if (url === "/api/kb/kb-1/chat/conversations") {
        return createJsonResponse({
          conversations: [
            {
              id: "existing-convo",
              title: "Loaded Conversation",
              model: "mock-model",
              summary: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              archived: false,
              pinned: false,
              meta: null,
            },
          ],
        });
      }

      if (url === "/api/kb/kb-1/chat/conversations/existing-convo") {
        return createJsonResponse({
          conversation: {
            id: "existing-convo",
            title: "Loaded Conversation",
            model: "mock-model",
            summary: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
            archived: false,
            pinned: false,
            meta: null,
            messages: [
              {
                id: "message-1",
                role: "assistant",
                content: "Hello from KB-1",
                sequence: 0,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        });
      }

      if (url === "/api/kb/kb-2/chat/conversations") {
        return createJsonResponse({ conversations: [] });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const { rerender } = render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <KnowledgeBaseChatPanel kbId="kb-1" />
      </NextIntlClientProvider>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/models"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/kb/kb-1/chat/conversations"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/kb/kb-1/chat/conversations/existing-convo"));
    await screen.findByRole("heading", { name: "Loaded Conversation" });

    rerender(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <KnowledgeBaseChatPanel kbId="kb-2" />
      </NextIntlClientProvider>,
    );

    await waitFor(() => expect(replaceSpy).toHaveBeenCalledWith("", { scroll: false }));
    await waitFor(() => expect(searchParamsState.value).toBe(""));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/kb/kb-2/chat/conversations"));
    await screen.findByRole("heading", { name: "New conversation" });
  });
});
