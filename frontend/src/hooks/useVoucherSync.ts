import { useEffect } from "react";
import { flushVoucherQueue, registerBackgroundSync } from "../services/sync";
import { useOnlineStatus } from "./useOnlineStatus";

export function useVoucherSync() {
  const online = useOnlineStatus();

  useEffect(() => {
    if (online) {
      flushVoucherQueue().catch(() => undefined);
    } else {
      registerBackgroundSync().catch(() => undefined);
    }
  }, [online]);
}
