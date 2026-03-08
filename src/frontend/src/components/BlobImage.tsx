import { useEffect, useRef, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

interface BlobImageProps {
  blobKey: string;
  alt: string;
  className?: string;
  fallback?: string;
}

// Simple cache for blob URLs
const urlCache = new Map<string, string>();

async function getBlobUrl(blobKey: string): Promise<string> {
  if (!blobKey) return "";
  if (urlCache.has(blobKey)) return urlCache.get(blobKey)!;

  try {
    const config = await loadConfig();
    const storageClient = new StorageClient(
      "default",
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      // biome-ignore lint/suspicious/noExplicitAny: StorageClient requires agent param but getDirectURL doesn't need real auth
      null as any,
    );
    const url = await storageClient.getDirectURL(blobKey);
    urlCache.set(blobKey, url);
    return url;
  } catch {
    return "";
  }
}

export function BlobImage({
  blobKey,
  alt,
  className = "",
  fallback,
}: BlobImageProps) {
  const [url, setUrl] = useState<string>(() => urlCache.get(blobKey) || "");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!blobKey) return;

    getBlobUrl(blobKey).then((u) => {
      if (mounted.current) setUrl(u);
    });

    return () => {
      mounted.current = false;
    };
  }, [blobKey]);

  if (!url && !fallback) {
    return <div className={`bg-muted animate-pulse ${className}`} />;
  }

  return (
    <img
      src={url || fallback}
      alt={alt}
      className={className}
      onError={(e) => {
        if (fallback) (e.target as HTMLImageElement).src = fallback;
      }}
    />
  );
}
