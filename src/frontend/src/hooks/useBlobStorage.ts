import { HttpAgent } from "@dfinity/agent";
import { useCallback, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useBlobStorage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      if (!actor || !identity) throw new Error("Not authenticated");

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const config = await loadConfig();
        const agent = await HttpAgent.create({
          host: config.storage_gateway_url,
          identity,
        });

        const storageClient = new StorageClient(
          "default",
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );

        const bytes = new Uint8Array(await file.arrayBuffer());
        const { hash } = await storageClient.putFile(bytes, (pct) => {
          setUploadProgress(pct);
        });

        return hash;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [actor, identity],
  );

  const getBlobUrl = useCallback(async (blobKey: string): Promise<string> => {
    if (!blobKey) return "";
    try {
      const config = await loadConfig();
      const storageClient = new StorageClient(
        "default",
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        // biome-ignore lint/suspicious/noExplicitAny: StorageClient requires agent param but getDirectURL works without real auth
        null as any,
      );
      return storageClient.getDirectURL(blobKey);
    } catch {
      return "";
    }
  }, []);

  return { uploadFile, getBlobUrl, uploadProgress, isUploading };
}
