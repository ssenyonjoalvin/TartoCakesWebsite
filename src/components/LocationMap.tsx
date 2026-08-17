"use client";

import { useState } from "react";
import {
  contactInfo,
  getCopyableAddress,
  getCopyableCoordinates,
} from "@/data/contact";

type CopyFieldProps = {
  label: string;
  value: string;
};

function CopyField({ label, value }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-lg border border-tarto-ink/10 bg-tarto-cream/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-tarto-ink/55">
        {label}
      </p>
      <div className="mt-1.5 flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 break-words text-sm text-tarto-ink">
          {value}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-tarto-red shadow-sm transition hover:bg-tarto-red hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function LocationMap() {
  const copyableAddress = getCopyableAddress();
  const copyableCoordinates = getCopyableCoordinates();

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <iframe
        title="Tarto Cakes UG location"
        src={contactInfo.mapEmbedUrl}
        className="aspect-[4/3] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="border-t border-tarto-ink/10 p-4 sm:p-5">
        <p className="text-base font-bold text-tarto-ink">
          {contactInfo.businessName}
        </p>
        <p className="mt-1 text-sm text-tarto-ink/75">
          At {contactInfo.mapLandmark}
        </p>
        <p className="text-sm text-tarto-ink/75">{contactInfo.address}</p>
        <p className="text-sm text-tarto-ink/75">{contactInfo.city}</p>
        <p className="mt-2 text-xs text-tarto-ink/55">
          Google Maps lists this spot as {contactInfo.mapLandmark}. Copy the
          address below for SafeBoda or directions.
        </p>

        <div className="mt-4 space-y-3">
          <CopyField label="Copy for SafeBoda or Google Maps" value={copyableAddress} />
          <CopyField label="GPS coordinates" value={copyableCoordinates} />
        </div>

        <a
          href={contactInfo.mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex text-sm font-semibold text-tarto-red hover:underline"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
