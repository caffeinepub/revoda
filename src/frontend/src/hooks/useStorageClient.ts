import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function useStorageClient(): StorageClient | null {
  const { identity } = useInternetIdentity();
  const [client, setClient] = useState<StorageClient | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadConfig().then((config) => {
      if (cancelled) return;
      const agent = new HttpAgent({
        host: config.backend_host,
        identity: identity ?? undefined,
      });
      if (config.backend_host?.includes("localhost")) {
        agent.fetchRootKey().catch(console.warn);
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      setClient(storageClient);
    });
    return () => {
      cancelled = true;
    };
  }, [identity]);

  return client;
}
