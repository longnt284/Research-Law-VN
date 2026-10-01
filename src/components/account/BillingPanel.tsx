"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { encode } from "uqr";

import { CHAT_OPEN_EVENT } from "@/components/chat/ChatHost";
import type { Lang } from "@/data/types";
import { getBillingCopy, type BillingCopy } from "@/i18n/billing";
import { authHeaders } from "@/lib/account";
import type { OrderStatus, OrderView } from "@/lib/payments/server";
import { formatVnd, planById, PLANS, type PlanId } from "@/lib/plans";

/**
 * Mua lượt Pro trên trang tài khoản: chọn gói, quét mã VietQR, chờ xác nhận.
 *
 * Trang không tự coi là đã thanh toán vì bất cứ điều gì ở trình duyệt (kể cả
 * khi payOS chuyển người dùng về đây): nó chỉ hỏi lại máy chủ vài giây một lần,
 * và máy chủ chỉ đổi đơn sang PAID khi nhận webhook payOS hợp lệ.
 */

const POLL_MS = 3000;
/** Hỏi thêm chừng này sau giờ hết hạn của mã, cho webhook đến muộn. */
const POLL_GRACE_MS = 60_000;

interface Billing {
  payments: boolean;
  balance: number;
  orders: { id: string; planId: string; amountVnd: number; status: OrderStatus; createdAt: string }[];
}

async function call<T>(path: string, init?: RequestInit): Promise<{ status: number; data: T | null }> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      cache: "no-store",
    });
    return { status: res.status, data: res.ok ? ((await res.json()) as T) : null };
  } catch {
    return { status: 0, data: null };
  }
}

function errorText(t: BillingCopy, status: number): string {
  if (status === 401) return t.errors.auth;
  if (status === 400) return t.errors.plan;
  if (status === 502) return t.errors.provider;
  if (status === 503) return t.errors.config;
  return t.errors.generic;
}

export function BillingPanel({ lang }: { lang: Lang }) {
  const t = getBillingCopy(lang);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [hidden, setHidden] = useState(false);
  const [plan, setPlan] = useState<PlanId>("plus");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [watching, setWatching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrolled = useRef(false);

  const loadBilling = useCallback(async () => {
    const r = await call<Billing>("/api/user/billing");
    if (r.data) setBilling(r.data);
    // Máy chủ chưa cấu hình phần thanh toán: ẩn hẳn mục này.
    else if (r.status === 503) setHidden(true);
    else setError(errorText(t, r.status));
  }, [t]);

  const check = useCallback(
    async (orderId: string) => {
      setError("");
      const r = await call<OrderView>(`/api/payments/status/${encodeURIComponent(orderId)}`);
      if (!r.data) {
        if (r.status !== 404) setError(errorText(t, r.status));
        return;
      }
      setOrder(r.data);
      setWatching(r.data.status === "PENDING");
      if (r.data.status === "PAID") loadBilling();
    },
    [t, loadBilling],
  );

  useEffect(() => {
    loadBilling();
    // payOS chuyển người dùng về `?order=<mã đơn>`: chỉ để biết theo dõi đơn nào.
    const id = new URLSearchParams(window.location.search).get("order");
    if (id) check(id);
  }, [loadBilling, check]);

  // Liên kết "Mua thêm lượt Pro" trỏ tới `#nang-cap`, nhưng mục này chỉ hiện
  // sau khi trang biết người dùng đã đăng nhập: cuộn tới khi nó đã hiện.
  useEffect(() => {
    if (!billing || scrolled.current) return;
    scrolled.current = true;
    if (window.location.hash === "#nang-cap") document.getElementById("nang-cap")?.scrollIntoView();
  }, [billing]);

  useEffect(() => {
    if (!watching || !order || order.status !== "PENDING") return;
    const stopAt = Date.parse(order.expiresAt) + POLL_GRACE_MS;
    const timer = window.setInterval(async () => {
      if (Date.now() > stopAt) {
        setWatching(false);
        return;
      }
      const r = await call<OrderView>(`/api/payments/status/${order.orderId}`);
      // Lỗi mạng thoáng qua: lần hỏi sau thử lại.
      if (!r.data || r.data.status === "PENDING") return;
      setOrder(r.data);
      setWatching(false);
      if (r.data.status === "PAID") loadBilling();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [watching, order, loadBilling]);

  function reset() {
    setOrder(null);
    setWatching(false);
    setError("");
    const url = new URL(window.location.href);
    if (url.searchParams.has("order")) {
      url.search = "";
      window.history.replaceState(null, "", url);
    }
  }

  async function pay(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const r = await call<OrderView>("/api/payments/create", {
      method: "POST",
      body: JSON.stringify({ planId: plan, provider: "payos", lang }),
    });
    setBusy(false);
    if (!r.data) {
      setError(errorText(t, r.status));
      return;
    }
    setOrder(r.data);
    setWatching(r.data.status === "PENDING");
  }

  if (hidden) return null;
  const chosen = planById(plan) ?? PLANS[0];

  return (
    <section className="acc-card" id="nang-cap">
      <h2 className="acc-h">{t.title}</h2>
      {billing ? (
        <p className="acc-email tnum">{t.balance(billing.balance)}</p>
      ) : (
        !error && <p className="fb-note">{t.loading}</p>
      )}
      <p className="fb-note mt-2">{t.intro}</p>

      {order ? (
        <OrderBox
          t={t}
          order={order}
          watching={watching}
          onRecheck={() => check(order.orderId)}
          onReset={reset}
        />
      ) : (
        billing?.payments && (
          <form className="fb-form" onSubmit={pay}>
            <fieldset className="fb-kinds pay-plans">
              <legend className="eyebrow">{t.plans}</legend>
              {PLANS.map((p) => (
                <label key={p.id} className="fb-kind pay-plan">
                  <input
                    type="radio"
                    name="plan"
                    value={p.id}
                    checked={plan === p.id}
                    onChange={() => setPlan(p.id)}
                  />
                  <span>
                    <strong>{p.name}</strong>
                    <span className="tnum">{formatVnd(p.priceVnd)}</span>
                    <span className="fb-note">{t.credits(p.credits)}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <fieldset className="fb-kinds">
              <legend className="eyebrow">{t.method}</legend>
              <label className="fb-kind">
                <input type="radio" name="method" value="payos" checked readOnly />
                <span>{t.methodBank}</span>
              </label>
            </fieldset>
            <div className="fb-actions">
              <button type="submit" className="btn btn-solid" disabled={busy}>
                {busy ? t.creating : t.pay(formatVnd(chosen.priceVnd))}
              </button>
            </div>
          </form>
        )
      )}

      {error && (
        <p className="acc-error mt-4" role="alert">
          {error}
        </p>
      )}

      {!!billing?.orders.length && (
        <div className="mt-5">
          <h3 className="eyebrow">{t.history}</h3>
          <ul className="pay-history tnum">
            {billing.orders.map((o) => (
              <li key={o.id}>
                {new Date(o.createdAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB")} ·{" "}
                {planById(o.planId)?.name ?? o.planId} · {formatVnd(o.amountVnd)} · {t.status[o.status]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function OrderBox({
  t,
  order,
  watching,
  onRecheck,
  onReset,
}: {
  t: BillingCopy;
  order: OrderView;
  watching: boolean;
  onRecheck: () => void;
  onReset: () => void;
}) {
  if (order.status === "PAID") {
    return (
      <div className="mt-4">
        <p className="acc-info" role="status">
          <strong>{t.paidTitle}.</strong> {t.paidText}
        </p>
        <div className="fb-actions">
          <button
            type="button"
            className="btn btn-solid"
            onClick={() => window.dispatchEvent(new Event(CHAT_OPEN_EVENT))}
          >
            {t.continueChat}
          </button>
          <button type="button" className="btn btn-quiet" onClick={onReset}>
            {t.buyMore}
          </button>
        </div>
      </div>
    );
  }

  if (order.status !== "PENDING") {
    return (
      <div className="mt-4">
        <p className="acc-error" role="alert">
          {order.status === "EXPIRED" ? t.expired : t.failed}
        </p>
        <div className="fb-actions">
          {order.status === "EXPIRED" && (
            <button type="button" className="btn btn-quiet" onClick={onRecheck}>
              {t.recheck}
            </button>
          )}
          <button type="button" className="btn btn-solid" onClick={onReset}>
            {t.newOrder}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="eyebrow">{t.payTitle(formatVnd(order.amountVnd))}</p>
      {order.qrCode && <QrCode value={order.qrCode} label={t.qrLabel} />}
      <p className="fb-note">{t.scan}</p>
      <dl className="pay-facts tnum">
        <dt>{t.amount}</dt>
        <dd>{formatVnd(order.amountVnd)}</dd>
        <dt>{t.note}</dt>
        <dd>{order.description}</dd>
      </dl>
      {watching ? (
        <p className="acc-info" role="status">
          {t.waiting} {t.autoUpdate}
        </p>
      ) : (
        <p className="acc-error" role="alert">
          {t.timeout}
        </p>
      )}
      <div className="fb-actions">
        {order.checkoutUrl && (
          <a href={order.checkoutUrl} target="_blank" rel="noopener noreferrer" className="btn btn-quiet btn-sm">
            {t.openCheckout} ↗
          </a>
        )}
        {!watching && (
          <button type="button" className="btn btn-solid btn-sm" onClick={onRecheck}>
            {t.recheck}
          </button>
        )}
      </div>
    </div>
  );
}

/** Vẽ chuỗi VietQR thành SVG ngay trên trang: không gọi dịch vụ ảnh bên ngoài. */
function QrCode({ value, label }: { value: string; label: string }) {
  const { size, path } = useMemo(() => {
    const qr = encode(value, { ecc: "M", border: 4 });
    let d = "";
    qr.data.forEach((row, y) =>
      row.forEach((on, x) => {
        if (on) d += `M${x} ${y}h1v1h-1z`;
      }),
    );
    return { size: qr.size, path: d };
  }, [value]);
  return (
    <svg className="pay-qr" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}
