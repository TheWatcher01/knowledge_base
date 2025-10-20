import axe from "axe-core";
import { act, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { KnowledgeBaseChatPanel } from "@/components/kb/chat-panel";
import enMessages from "@/i18n/messages/en.json";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/fr/kb/kb_test/chat",
  useSelectedLayoutSegments: () => [],
}));

describe("KnowledgeBaseChatPanel accessibility", () => {
  const originalFetch = global.fetch;
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
  const originalCanvasGetContext =
    window.HTMLCanvasElement && window.HTMLCanvasElement.prototype.getContext;

  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    if (window.HTMLCanvasElement) {
      window.HTMLCanvasElement.prototype.getContext = vi.fn();
    }
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  afterAll(() => {
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    if (window.HTMLCanvasElement && originalCanvasGetContext) {
      window.HTMLCanvasElement.prototype.getContext = originalCanvasGetContext;
    }
  });

  it("renders without axe violations in idle state", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        models: [
          {
            id: "mock-model",
            label: "Mock Model",
          },
        ],
      }),
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const { container } = render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <KnowledgeBaseChatPanel kbId="kb_test" />
      </NextIntlClientProvider>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/models"));
    const settingsButton = await screen.findByRole("button", { name: /chat settings/i });
    await act(async () => {
      settingsButton.click();
    });

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: /available chat models/i })).toHaveTextContent(
        "Mock Model",
      ),
    );

    const results = await axe.run(container);

    expect(results.violations).toEqual([]);
  });
});
