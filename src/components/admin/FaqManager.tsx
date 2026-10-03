"use client";

import { useActionState, useState } from "react";
import {
  saveFaqItems,
  type ContentFormState,
} from "@/app/admin/(dashboard)/settings/content-actions";
import type { FaqItem } from "@/lib/business-fields";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2.5 text-sm text-tarto-ink outline-none focus:border-tarto-red/40 focus:bg-white";

// Questions customers commonly ask (from the website brief). Starters only:
// the owner writes every answer, nothing is pre-filled.
const SUGGESTED_QUESTIONS = [
  "How do I order a cake?",
  "How early should I order?",
  "Do you make custom cakes?",
  "Can I send a reference photo?",
  "Do you deliver? Where?",
  "How much is delivery?",
  "Can I pick up my cake?",
  "What payment methods do you accept?",
  "Can I change or cancel my order?",
  "What flavours do you have?",
];

const smallButton =
  "rounded-lg border border-[#E0E0E0] px-2.5 py-1.5 text-xs font-semibold text-[#555] hover:border-tarto-red/40 disabled:opacity-40";

type Props = {
  initialItems: FaqItem[];
};

function newItem(question = ""): FaqItem {
  return { id: crypto.randomUUID(), question, answer: "", published: true };
}

export default function FaqManager({ initialItems }: Props) {
  const [items, setItems] = useState<FaqItem[]>(initialItems);
  const [state, formAction, pending] = useActionState<ContentFormState, FormData>(
    saveFaqItems,
    {}
  );

  function update(id: string, patch: Partial<FaqItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function move(index: number, direction: -1 | 1) {
    setItems((current) => {
      const next = [...current];
      const target = index + direction;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const unusedSuggestions = SUGGESTED_QUESTIONS.filter(
    (question) => !items.some((item) => item.question.trim() === question)
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DADADA] bg-white p-8 text-center text-sm text-[#777]">
          No questions yet. The FAQ page stays hidden until you add at least one
          question with an answer.
        </div>
      ) : null}

      <ol className="space-y-4">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#A0A0A0]">
                Question {index + 1}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <label className="mr-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#555]">
                  <input
                    type="checkbox"
                    checked={item.published}
                    onChange={(event) => update(item.id, { published: event.target.checked })}
                    className="h-4 w-4 accent-tarto-red"
                  />
                  Visible
                </label>
                <button
                  type="button"
                  className={smallButton}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`Move question ${index + 1} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={smallButton}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`Move question ${index + 1} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={`${smallButton} text-tarto-red`}
                  onClick={() =>
                    setItems((current) => current.filter((entry) => entry.id !== item.id))
                  }
                  aria-label={`Remove question ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            </div>
            <label htmlFor={`q-${item.id}`} className="mt-3 block text-sm font-bold text-tarto-ink">
              Question
            </label>
            <input
              id={`q-${item.id}`}
              value={item.question}
              maxLength={200}
              onChange={(event) => update(item.id, { question: event.target.value })}
              className={fieldClass}
            />
            <label htmlFor={`a-${item.id}`} className="mt-3 block text-sm font-bold text-tarto-ink">
              Answer
            </label>
            <textarea
              id={`a-${item.id}`}
              rows={3}
              maxLength={2000}
              value={item.answer}
              onChange={(event) => update(item.id, { answer: event.target.value })}
              placeholder="Write the answer customers should see."
              className={fieldClass}
            />
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5">
        <button
          type="button"
          onClick={() => setItems((current) => [...current, newItem()])}
          className="rounded-xl border border-tarto-red px-4 py-2 text-sm font-bold text-tarto-red hover:bg-tarto-red hover:text-white"
        >
          + Add question
        </button>
        {unusedSuggestions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold text-[#777]">
              Common questions (click to add, then write your answer):
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {unusedSuggestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => setItems((current) => [...current, newItem(question)])}
                  className="rounded-full bg-[#F5F5F5] px-3 py-1.5 text-xs font-medium text-[#444] hover:bg-[#FBEAEA] hover:text-tarto-red"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {state.error ? (
        <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md bg-[#E8F5EC] px-3 py-2 text-sm text-[#2F6B45]" role="status">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-tarto-red px-5 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90 disabled:opacity-70"
      >
        {pending ? "Saving..." : "Save FAQ"}
      </button>
    </form>
  );
}
