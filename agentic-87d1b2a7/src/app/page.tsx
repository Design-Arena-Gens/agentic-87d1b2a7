"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  sources?: SourceSummary[];
  disclaimer?: string;
};

type SourceSummary = {
  id: string;
  title: string;
  summary: string;
  citations: string[];
  era: string;
  jurisdiction: string;
  category: string;
  matchedKeywords: string[];
};

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function renderTextBlocks(text: string) {
  return text
    .split(/\n+/)
    .filter(Boolean)
    .map((paragraph, index) => (
      <p
        key={`${paragraph.slice(0, 32)}-${index}`}
        className="text-sm leading-relaxed text-slate-200"
      >
        {paragraph}
      </p>
    ));
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "assistant-welcome",
      role: "assistant",
      content:
        "I help practitioners surface definitions and obscure doctrines anchored in Black's Law Dictionary and historic authorities. Ask about archaic writs, legacy statutes, or foundational definitions whenever you need a research jump-start.",
      createdAt: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      ),
    [messages]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || isLoading) {
      return;
    }

    const prompt = question.trim();
    const timestamp = new Date();

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${timestamp.getTime()}`,
        role: "user",
        content: prompt,
        createdAt: timestamp,
      },
      {
        id: `assistant-pending-${timestamp.getTime()}`,
        role: "assistant",
        content: "Analyzing historical authorities…",
        createdAt: new Date(timestamp.getTime() + 1),
      },
    ]);
    setQuestion("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: prompt }),
      });

      const data = await response.json();

      setMessages((prev) =>
        prev
          .filter((message) => !message.id.startsWith("assistant-pending-"))
          .concat({
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.answer ?? "No answer available.",
            createdAt: new Date(),
            sources: data.sources ?? [],
            disclaimer: data.disclaimer ?? undefined,
          })
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev
          .filter((message) => !message.id.startsWith("assistant-pending-"))
          .concat({
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            content:
              "I encountered an issue retrieving the research notes. Please try again in a moment.",
            createdAt: new Date(),
          })
      );
      setError("Network error while contacting the legal agent.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Blackletter Compass
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Research assistant tuned for Black&apos;s Law Dictionary
              definitions, chancery writs, and stubbornly persistent historical
              statutes.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 text-xs text-slate-300 sm:text-right">
            <p>Research guidance only · Not legal advice</p>
            <p>Focus: U.S. &amp; Anglo-American common law traditions</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl flex-col gap-6 px-6 py-10">
        <section className="flex-1 space-y-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-6 shadow-lg shadow-black/20">
          <div className="grid h-full gap-4">
            <div className="space-y-4 overflow-y-auto pr-2">
              {orderedMessages.map((message) => (
                <article
                  key={message.id}
                  className={classNames(
                    "rounded-xl border border-transparent bg-white/5 p-4 shadow-sm transition",
                    message.role === "assistant"
                      ? "border-emerald-400/10"
                      : "border-blue-400/10 bg-blue-500/10"
                  )}
                >
                  <header className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                    <span>
                      {message.role === "assistant"
                        ? "Blackletter Agent"
                        : "Counsel"}
                    </span>
                    <time>{formatTimestamp(message.createdAt)}</time>
                  </header>
                  <div className="mt-3 space-y-3">
                    {renderTextBlocks(message.content)}
                  </div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-5 grid gap-3 rounded-lg border border-emerald-300/20 bg-emerald-500/5 p-3">
                      <h3 className="text-xs font-semibold uppercase text-emerald-200">
                        Supporting Authorities
                      </h3>
                      <ul className="space-y-3">
                        {message.sources.map((source) => (
                          <li
                            key={source.id}
                            className="rounded-md border border-emerald-300/20 bg-white/5 p-3"
                          >
                            <p className="text-sm font-semibold text-emerald-100">
                              {source.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-200">
                              {source.summary}
                            </p>
                            <p className="mt-2 text-xs text-slate-300">
                              Citations: {source.citations.join("; ")}
                            </p>
                            <p className="mt-1 text-[11px] uppercase text-emerald-200/80">
                              {source.category} · {source.jurisdiction} ·{" "}
                              {source.era}
                            </p>
                            {source.matchedKeywords.length > 0 && (
                              <p className="mt-1 text-[11px] text-slate-300">
                                Matched: {source.matchedKeywords.join(", ")}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {message.disclaimer && (
                    <p className="mt-4 text-[11px] uppercase tracking-wide text-amber-200/80">
                      {message.disclaimer}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-emerald-400/10 bg-emerald-500/5 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-semibold text-emerald-100">
            Pose a Question
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
          >
            <label htmlFor="question" className="sr-only">
              Legal research question
            </label>
            <textarea
              id="question"
              name="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about a Black's Law definition, archaic writ, or obscure statute…"
              className="h-28 w-full resize-none rounded-xl border border-emerald-400/30 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 caret-emerald-300 outline-none ring-emerald-400/40 transition focus:border-emerald-300 focus:ring-2"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-500/80 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:border-emerald-300/20 disabled:bg-emerald-500/40 disabled:text-slate-800 sm:h-28 sm:px-6"
            >
              {isLoading ? "Researching…" : "Generate Answer"}
            </button>
          </form>
          {error && (
            <p className="text-sm text-amber-200">
              {error} · Check your connection and retry.
            </p>
          )}

          <div className="grid gap-2 text-xs text-emerald-100/80 sm:grid-cols-2">
            <p className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
              Try: “Explain the writ of scire facias and where it might still
              apply.”
            </p>
            <p className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
              Try: “Summarize Black&apos;s Law definition of consideration with
              modern relevance.”
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
