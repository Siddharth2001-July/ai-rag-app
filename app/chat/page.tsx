"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Starfield } from "./Starfield";

// Map raw error messages to something a visitor can read. We expose a
// short title and keep the technical detail in the description.
function describeError(err: Error): { title: string; description: string } {
  const msg = err.message ?? "";
  if (/429|rate limit|quota/i.test(msg)) {
    return {
      title: "Hit a rate limit",
      description: "The chat is being rate-limited by an upstream provider. Try again in a moment.",
    };
  }
  if (/network|fetch|connection|ECONN/i.test(msg)) {
    return {
      title: "Connection problem",
      description: "Couldn't reach the chat backend. Check your connection and try again.",
    };
  }
  if (/api key|not set|GOOGLE|UPSTASH/i.test(msg)) {
    return {
      title: "Server error",
      description: "Please try again later.",
    };
  }
  return {
    title: "Something went wrong",
    description: msg.slice(0, 200) || "Please try again.",
  };
}

// Sources we attach to each assistant message in the API route's
// `messageMetadata` callback. The shape must match what's sent there.
type MessageMetadata = {
  sources?: { source: string; score: number }[];
};

type ChatMessage = UIMessage<MessageMetadata>;

const SUGGESTIONS = [
  "What does Sid do at Nutrient?",
  "What AI projects has Sid built?",
  "What's Sid's engineering philosophy?",
];

export default function ChatPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (err) => {
      const { title, description } = describeError(err);
      // Keep the toast around for a full minute unless the user dismisses
      // it — errors are important enough that a 4-second auto-dismiss can
      // be missed if the user looked away.
      toast.error(title, { description, duration: 60_000 });
    },
  });

  const hasMessages = messages.length > 0;
  const isBusy = status === "submitted" || status === "streaming";

  // Auto-scroll to the latest message as it streams.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06060f] text-white antialiased">
      <Starfield />

      {/* Subtle vignette so text stays readable over the starfield */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,6,15,0.0) 0%, rgba(6,6,15,0.55) 70%, rgba(6,6,15,0.85) 100%)",
        }}
      />

      <div className="relative z-20 flex h-screen flex-col">
        {/* Header — subtle, top-center */}
        <header className="px-6 py-5 text-center">
          <h1 className="text-sm font-semibold tracking-wider text-white/90">
            Siddharth Kamboj
          </h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
            RAG-powered portfolio chat
          </p>
        </header>

        {/* Main */}
        <main
          className={`relative flex min-h-0 flex-1 flex-col px-4 pb-6 ${
            hasMessages ? "justify-end" : "justify-center"
          }`}
        >
          <AnimatePresence mode="wait">
            {hasMessages ? (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto w-full min-h-0 max-w-3xl flex-1 overflow-y-auto py-8"
              >
                <div className="space-y-8">
                  {messages.map((m) => (
                    <MessageView key={m.id} message={m} />
                  ))}
                  {isBusy &&
                    messages[messages.length - 1]?.role === "user" && (
                      <ThinkingIndicator />
                    )}
                  <div ref={messagesEndRef} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mx-auto mb-8 w-full max-w-2xl text-center"
              >
                <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                  Ask me anything about Siddharth.
                </h2>
                <p className="mt-3 text-sm text-white/55 md:text-base">
                  His work, projects, skills, and what he&apos;s looking for next —
                  answered with citations from his portfolio content.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input — framer-motion's `layout` prop animates its position
              smoothly when the parent layout shifts (centered → bottom). */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
            className="mx-auto w-full max-w-3xl"
          >
            <form onSubmit={onSubmit} className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about Sid…"
                rows={1}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 pr-14 text-[15px] leading-relaxed text-white placeholder:text-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_8px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md focus:border-white/20 focus:bg-white/[0.06] focus:outline-none"
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />
              <button
                type="submit"
                disabled={!input.trim() || isBusy}
                aria-label="Send"
                className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-xl bg-white text-black transition disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40 enabled:hover:bg-white/90"
              >
                <SendIcon />
              </button>
            </form>

          </motion.div>

          {/* Suggestion chips — only on empty state */}
          {!hasMessages && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mt-4 flex w-full max-w-3xl flex-wrap justify-center gap-2"
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/70 backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

// The model writes citations like `[bio.md]` or `[work/nutrient-solutions-engineer.md]`
// inline. Convert those into markdown links with a special href so we can detect
// and render them as styled pills via ReactMarkdown's components prop.
function preprocessCitations(text: string): string {
  return text.replace(/\[([^\]\n]+?\.md)\]/g, "[$1](#cite)");
}

function MessageView({ message }: { message: ChatMessage }) {
  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("");

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2.5 text-[15px] text-white/95 backdrop-blur-md">
          {text}
        </div>
      </div>
    );
  }

  // Assistant message that failed before producing any text — show a small
  // inline indicator instead of an empty bubble with orphaned sources.
  // The toast already explained what went wrong; this is the breadcrumb in
  // the conversation itself so the user can see where the failure was.
  if (!text.trim()) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400/70" />
        <span>The response failed. Please try again.</span>
      </div>
    );
  }

  const sources = message.metadata?.sources ?? [];
  const processed = preprocessCitations(text);

  return (
    <div className="space-y-3">
      <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-p:leading-relaxed prose-p:text-white/90 prose-headings:text-white prose-strong:text-white prose-code:text-white/90 prose-a:text-blue-300 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children, ...rest }) => {
              if (href === "#cite") {
                return <CitationPill>{children}</CitationPill>;
              }
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...rest}
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {processed}
        </ReactMarkdown>
      </div>
      {sources.length > 0 && <SourcesRow sources={sources} />}
    </div>
  );
}

function CitationPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex items-center rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 align-baseline font-mono text-[11px] font-normal text-white/60 no-underline">
      {children}
    </span>
  );
}

function SourcesRow({
  sources,
}: {
  sources: { source: string; score: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      <span className="text-[10px] uppercase tracking-wider text-white/40">
        Sources:
      </span>
      {sources.map((s) => (
        <span
          key={s.source}
          title={`similarity: ${s.score.toFixed(3)}`}
          className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/55"
        >
          {s.source}
        </span>
      ))}
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 text-white/50">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:200ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:400ms]" />
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
