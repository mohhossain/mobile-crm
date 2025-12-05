"use client";

import { useState } from "react";
import { ShareIcon, CheckIcon, LinkIcon } from "@heroicons/react/24/outline";

export default function SharePortalButton({ shareToken }: { shareToken: string | null }) {
  const [copied, setCopied] = useState(false);

  // If for some reason a deal doesn't have a token, we can't share it
  if (!shareToken) return null;

  const handleCopy = () => {
    const url = `${window.location.origin}/portal/${shareToken}`;
    
    // Use execCommand for broader compatibility (especially in iframes/non-secure contexts)
    const textArea = document.createElement("textarea");
    textArea.value = url;
    
    // Ensure it's not visible but part of DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <button 
      onClick={handleCopy}
      className="btn btn-sm btn-ghost gap-2 text-base-content/60 hover:text-primary transition-colors"
      title="Share Client Portal"
    >
      {copied ? (
        <>
          <CheckIcon className="w-4 h-4 text-success" />
          <span className="text-success">Copied</span>
        </>
      ) : (
        <>
          <LinkIcon className="w-4 h-4" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}