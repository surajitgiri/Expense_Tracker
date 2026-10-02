"use client";

import { useEffect } from "react";

interface PageMetadataProps {
  title: string;
  description?: string;
}

export default function PageMetadata({ title, description }: PageMetadataProps) {
  useEffect(() => {
    const fullTitle = `${title} | SG-Finance`;
    document.title = fullTitle;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", description);
      } else {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        metaDesc.setAttribute("content", description);
        document.head.appendChild(metaDesc);
      }
    }
  }, [title, description]);

  return null;
}
