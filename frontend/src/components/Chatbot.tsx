import { useEffect, useRef, useState } from "react";
import { Check, Loader2, MessageCircle, Plus, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { aiApi, type AiRecommendation } from "../lib/ai-api";
import { ImageWithFallback } from "../lib/ImageWithFallback";
import { money, type MenuItem } from "../lib/data";
import { useStore } from "../lib/store";
import { CupDoodle } from "./Doodles";

const QUICK_PROMPTS = [
  "Something vegetarian under ₹120",
  "Recommend a spicy shawarma",
  "I want a refreshing drink",
  "Suggest a dessert",
];

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  recommendations?: AiRecommendation[];
};

let messageId = 0;
const nextMessageId = () => {
  messageId += 1;
  return messageId;
};

const welcomeMessage = (): ChatMessage => ({
  id: nextMessageId(),
  role: "assistant",
  text: "Hi! Tell me what you're craving, your budget, or any dietary preference, and I'll find something from today's menu.",
});

function asMenuItem(item: AiRecommendation): MenuItem {
  return {
    id: item.menuItemId,
    name: item.name,
    category: item.category,
    description: item.reason,
    price: item.price,
    image: "",
    available: item.availability,
  };
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcomeMessage()]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 120);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        window.setTimeout(() => launcherRef.current?.focus(), 0);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, error, open]);

  const close = () => {
    setOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  };

  const reset = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setMessages([welcomeMessage()]);
    setDraft("");
    setLoading(false);
    setError(null);
    setLastQuery("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const ask = async (rawMessage: string, appendUserMessage = true) => {
    const message = rawMessage.trim();
    if (!message || loading) return;

    if (appendUserMessage) {
      setMessages((current) => [...current, { id: nextMessageId(), role: "user", text: message }]);
    }
    setDraft("");
    setError(null);
    setLastQuery(message);
    setLoading(true);

    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const response = await aiApi.ask(message, controller.signal);
      if (controller.signal.aborted) return;
      setMessages((current) => [...current, {
        id: nextMessageId(),
        role: "assistant",
        text: response.message || "Here are a few options from the menu.",
        recommendations: Array.isArray(response.recommendations) ? response.recommendations : [],
      }]);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError("I couldn't reach the menu assistant. Please try again in a moment.");
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  };

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          className="group fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-[45] flex items-center gap-2 rounded-full border-2 border-[#7d351d] bg-[#b94b20] p-2.5 text-[#fff8eb] shadow-[0_7px_0_#6d2d19,0_14px_28px_rgba(50,28,15,0.28)] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b94b20] focus-visible:ring-offset-4 motion-reduce:transform-none md:bottom-6 md:right-6 md:px-4 md:py-3"
          aria-label="Open CafeQ food assistant"
          aria-haspopup="dialog"
        >
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-[#271a13] text-[#edc889]">
            <MessageCircle className="h-4 w-4" />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-[#ffa040]" />
          </span>
          <span className="hidden pr-1 text-sm font-bold md:inline">Ask CafeQ</span>
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="cafeq-assistant-title"
          className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[45] flex h-[min(560px,calc(100dvh-6.5rem))] max-h-[calc(100dvh-6.5rem)] flex-col overflow-hidden rounded-[1.75rem] border border-[#9a7048] bg-[#fffaf2] shadow-[0_24px_70px_rgba(36,20,12,0.35)] md:inset-x-auto md:bottom-6 md:right-6 md:h-[min(560px,calc(100dvh-6rem))] md:max-h-none md:w-[410px]"
        >
          <header className="relative flex flex-none items-center gap-3 overflow-hidden border-b border-[#8c6744] bg-[#17120f] px-4 py-3.5 text-[#fff4df]">
            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full border border-[#c6a875]/25" />
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-[#c6a875]/60 bg-[#33251c] text-[#e8bd72]">
              <CupDoodle className="text-[24px]" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="cafeq-assistant-title" className="font-hand text-xl font-bold leading-tight">CafeQ Food Assistant</h2>
              <p className="flex items-center gap-1.5 text-[11px] text-[#d4c2a4]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffa040]" /> AI menu guide
              </p>
            </div>
            <button type="button" onClick={reset} className="relative z-10 grid h-9 w-9 place-items-center rounded-xl text-[#d4c2a4] hover:bg-white/10 hover:text-white" aria-label="Start a new conversation">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button type="button" onClick={close} className="relative z-10 grid h-9 w-9 place-items-center rounded-xl text-[#d4c2a4] hover:bg-white/10 hover:text-white" aria-label="Close food assistant">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.09),transparent_38%)] px-4 py-4" aria-live="polite">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex items-start gap-2.5"}>
                  {message.role === "assistant" && (
                    <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full border border-[#d5bb94] bg-[#f4e4ca] text-[#7c4c2c]">
                      <CupDoodle className="text-[17px]" />
                    </span>
                  )}
                  <div className={`min-w-0 ${message.role === "user" ? "max-w-[82%]" : "max-w-[calc(100%-2.375rem)]"}`}>
                    <div className={message.role === "user"
                      ? "rounded-2xl rounded-br-md bg-[#b94b20] px-3.5 py-2.5 text-sm leading-relaxed text-[#fff8eb] shadow-sm"
                      : "rounded-2xl rounded-tl-md border border-[#dfc9aa] bg-[#fffdfa] px-3.5 py-2.5 text-sm leading-relaxed text-[#3f3024] shadow-sm"}
                    >
                      {message.text}
                    </div>
                    {!!message.recommendations?.length && (
                      <div className="mt-2.5 space-y-2">
                        {message.recommendations.map((item, index) => (
                          <Recommendation key={`${message.id}-${item.menuItemId}-${index}`} item={item} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {messages.length === 1 && !loading && (
                <div className="pl-9">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8d684b]">Try asking</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => { void ask(prompt); }}
                        className="rounded-full border border-[#d8b995] bg-[#fff8ed] px-3 py-1.5 text-left text-xs font-medium text-[#6a422c] transition-colors hover:border-[#b94b20] hover:bg-[#fbe5d5] hover:text-[#873918]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-start gap-2.5" aria-label="CafeQ assistant is thinking">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full border border-[#d5bb94] bg-[#f4e4ca] text-[#7c4c2c]">
                    <CupDoodle className="text-[17px]" />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-[#dfc9aa] bg-[#fffdfa] px-4 py-3 shadow-sm">
                    {[0, 1, 2].map((dot) => <span key={dot} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b94b20]" style={{ animationDelay: `${dot * 120}ms` }} />)}
                  </div>
                </div>
              )}

              {error && (
                <div className="ml-9 rounded-2xl border border-[#d9a99c] bg-[#f9e7e1] p-3 text-sm text-[#7d382d]" role="alert">
                  <p>{error}</p>
                  <button type="button" disabled={loading} onClick={() => { void ask(lastQuery, false); }} className="mt-2 inline-flex items-center gap-1 font-bold underline underline-offset-2 disabled:opacity-50">
                    <RotateCcw className="h-3.5 w-3.5" /> Try again
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form className="flex-none border-t border-[#dfc9aa] bg-[#fffdfa] p-3" onSubmit={(event) => { event.preventDefault(); void ask(draft); }}>
            <div className="flex items-end gap-2 rounded-2xl border border-[#d2b792] bg-[#fffaf2] p-1.5 shadow-inner focus-within:border-[#b94b20] focus-within:ring-2 focus-within:ring-[#b94b20]/15">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void ask(draft);
                  }
                }}
                maxLength={500}
                rows={1}
                placeholder="Ask about the menu…"
                className="max-h-24 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-[#33251c] outline-none placeholder:text-[#937a64]"
                aria-label="Message CafeQ food assistant"
              />
              <button
                type="submit"
                disabled={!draft.trim() || loading}
                className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-[#873a20] bg-[#b94b20] text-white shadow-[0_2px_0_#713019] transition-colors hover:bg-[#a4411e] disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Send message"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-[#8d7763]">Suggestions use currently available CafeQ menu items.</p>
          </form>
        </section>
      )}
    </>
  );
}

function Recommendation({ item }: { item: AiRecommendation }) {
  const { add, qtyOf, cartBusy } = useStore();
  const menuItem = asMenuItem(item);
  const inCart = qtyOf(item.menuItemId) > 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#ddc4a1] bg-[#fffaf0] shadow-sm">
      <div className="flex gap-3 p-3">
        <ImageWithFallback src="" alt={item.name} category={item.category} className="h-16 w-16 flex-none rounded-xl border border-[#e1cdb0] object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#33251c]">{item.name}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9a5834]">{item.category}</p>
            </div>
            <span className="flex-none text-sm font-bold text-[#873918]">{money(item.price)}</span>
          </div>
          {item.reason && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#796552]">{item.reason}</p>}
        </div>
      </div>
      <button
        type="button"
        disabled={cartBusy || !item.availability}
        onClick={() => { void add(menuItem); }}
        className={`flex w-full items-center justify-center gap-1.5 border-t border-[#e2d0b5] px-3 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${inCart ? "bg-[#f0e8dc] text-[#493b30]" : "bg-[#f7ead9] text-[#873918] hover:bg-[#f2dac4]"}`}
      >
        {inCart ? <><Check className="h-3.5 w-3.5" /> Added to cart</> : <><Plus className="h-3.5 w-3.5" /> Add to cart</>}
      </button>
    </article>
  );
}
