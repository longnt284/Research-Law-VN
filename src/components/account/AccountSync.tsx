"use client";

import { useEffect } from "react";

import { ACCOUNTS_ENABLED, hasStoredSession, schedulePush, supabase, syncOnSignIn } from "@/lib/account";
import { readAccount, setAccount, SYNC_EVENT } from "@/lib/client-store";

/**
 * Đồng bộ tài khoản, đặt một lần trong layout. Không vẽ gì.
 *
 * Trình duyệt không có phiên đăng nhập thì thành phần này không nạp thư viện
 * Supabase và không gửi yêu cầu nào.
 */
export function AccountSync() {
  useEffect(() => {
    if (!ACCOUNTS_ENABLED) return;
    const onDirty = () => schedulePush();
    window.addEventListener(SYNC_EVENT, onDirty);

    let unsub: (() => void) | undefined;
    if (hasStoredSession()) {
      supabase()
        .then(async (sb) => {
          const { data } = await sb.auth.getUser();
          if (data.user) await syncOnSignIn(data.user);
          else setAccount(null);
          const sub = sb.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT") setAccount(null);
          });
          unsub = () => sub.data.subscription.unsubscribe();
        })
        .catch((e) => console.warn("Lex & Lineage: không nạp được tài khoản", e));
    } else if (readAccount()) {
      // Phiên đã hết hoặc đã bị xóa khỏi trình duyệt: bỏ bản ghi hiển thị.
      setAccount(null);
    }

    return () => {
      window.removeEventListener(SYNC_EVENT, onDirty);
      unsub?.();
    };
  }, []);
  return null;
}
