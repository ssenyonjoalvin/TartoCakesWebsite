"use client";

import { useState } from "react";
import { BLOG_LLM_PROMPT } from "@/lib/blog-prompt";

type Props = {
  variant?: "header" | "card";
};

export default function CopyBlogPromptButton({ variant = "header" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(BLOG_LLM_PROMPT);
    } catch {
      const field = document.createElement("textarea");
      field.value = BLOG_LLM_PROMPT;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (variant === "card") {
    return (
      <div className="rounded-2xl border border-[#F3E8D8] bg-[#FFFBF4] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#2B2B2B]">Need help writing?</p>
            <p className="mt-1 max-w-xl text-sm text-[#777]">
              Click to copy a prompt, paste it into ChatGPT or another LLM, fill
              in the topic, then drop the answer into the fields below.
            </p>
          </div>
          <button
            type="button"
            onClick={copyPrompt}
            className="shrink-0 rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-tarto-red/90"
          >
            {copied ? "Copied" : "Copy writing prompt"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={copyPrompt}
      className="rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#444] transition hover:bg-[#F7F7F7]"
    >
      {copied ? "Copied" : "Copy writing prompt"}
    </button>
  );
}
