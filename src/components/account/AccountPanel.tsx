"use client";

import type { AuthError, User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Lang } from "@/data/types";
import { getAccountCopy } from "@/i18n/account";
import { formatDate } from "@/i18n/dictionary";
import { ACCOUNTS_ENABLED, signOut, supabase, syncOnSignIn } from "@/lib/account";
import { replaceUserData, setAccount, useFollowed, useMatters } from "@/lib/client-store";

/**
 * Trang tài khoản: tạo tài khoản, đăng nhập, quên mật khẩu, đổi mật khẩu,
 * đăng xuất, xóa tài khoản. Mọi việc xác thực do Supabase Auth làm; trang chỉ
 * gọi thư viện của nó.
 */

type Tab = "signIn" | "signUp" | "reset";

export function AccountPanel({ lang }: { lang: Lang }) {
  const c = getAccountCopy(lang);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (!ACCOUNTS_ENABLED) return;
    let unsub: (() => void) | undefined;
    supabase().then(async (sb) => {
      const sub = sb.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") setRecovery(true);
        setUser(session?.user ?? null);
      });
      unsub = () => sub.data.subscription.unsubscribe();
      const { data } = await sb.auth.getUser();
      setUser(data.user);
      setReady(true);
    });
    return () => unsub?.();
  }, []);

  if (!ACCOUNTS_ENABLED) return <p className="acc-note">{c.disabled}</p>;
  if (!ready) return <p className="acc-note">{c.working}</p>;
  if (user && recovery) return <NewPassword lang={lang} onDone={() => setRecovery(false)} intro={c.recovery} />;
  if (user) return <SignedIn lang={lang} user={user} />;
  return <SignedOut lang={lang} />;
}

function errorText(lang: Lang, e: AuthError | Error | null): string {
  const c = getAccountCopy(lang).errors;
  if (!e) return "";
  const code = "code" in e ? String(e.code ?? "") : "";
  const msg = e.message.toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login")) return c.invalid;
  if (code === "user_already_exists" || msg.includes("already registered")) return c.exists;
  if (code === "weak_password" || msg.includes("password should")) return c.weak;
  if (code === "email_not_confirmed" || msg.includes("not confirmed")) return c.notConfirmed;
  if (code.includes("rate_limit") || msg.includes("rate limit")) return c.rate;
  return c.generic;
}

function SignedOut({ lang }: { lang: Lang }) {
  const c = getAccountCopy(lang);
  const [tab, setTab] = useState<Tab>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const sb = await supabase();
      const back = `${window.location.origin}/${lang}/tai-khoan`;
      if (tab === "signIn") {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await syncOnSignIn(data.user);
      } else if (tab === "signUp") {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: back },
        });
        if (error) throw error;
        if (data.session && data.user) await syncOnSignIn(data.user);
        else setInfo(c.signedUpConfirm);
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: back });
        if (error) throw error;
        setInfo(c.resetSent);
      }
    } catch (err) {
      setError(errorText(lang, err as AuthError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="acc">
      <div className="ldiff-modes" role="group" aria-label={c.title}>
        {(["signIn", "signUp", "reset"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className="ldiff-mode"
            aria-pressed={tab === t}
            onClick={() => {
              setTab(t);
              setError("");
              setInfo("");
            }}
          >
            {c.tabs[t]}
          </button>
        ))}
      </div>
      <form className="fb-form" onSubmit={submit}>
        <label className="fb-field">
          <span className="eyebrow">{c.email}</span>
          <input
            className="field"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {tab !== "reset" && (
          <label className="fb-field">
            <span className="eyebrow">{c.password}</span>
            <input
              className="field"
              type="password"
              autoComplete={tab === "signUp" ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="acc-pw-hint"
            />
            {tab === "signUp" && (
              <span id="acc-pw-hint" className="fb-note">
                {c.passwordHint}
              </span>
            )}
          </label>
        )}
        {error && (
          <p className="acc-error" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="acc-info" role="status">
            {info}
          </p>
        )}
        <div className="fb-actions">
          <button type="submit" className="btn btn-solid" disabled={busy}>
            {busy ? c.working : tab === "signIn" ? c.signIn : tab === "signUp" ? c.signUp : c.sendReset}
          </button>
        </div>
        <p className="fb-note">{c.privacy}</p>
      </form>
    </div>
  );
}

function NewPassword({ lang, onDone, intro }: { lang: Lang; onDone: () => void; intro?: string }) {
  const c = getAccountCopy(lang);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="fb-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const sb = await supabase();
          const { error } = await sb.auth.updateUser({ password });
          if (error) throw error;
          setSaved(true);
          setPassword("");
          window.setTimeout(onDone, 1500);
        } catch (err) {
          setError(errorText(lang, err as AuthError));
        } finally {
          setBusy(false);
        }
      }}
    >
      {intro && <p className="acc-info">{intro}</p>}
      <label className="fb-field">
        <span className="eyebrow">{c.passwordNew}</span>
        <input
          className="field"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p className="acc-error" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="acc-info" role="status">
          {c.passwordSaved}
        </p>
      )}
      <div className="fb-actions">
        <button type="submit" className="btn btn-solid" disabled={busy}>
          {busy ? c.working : c.savePassword}
        </button>
      </div>
    </form>
  );
}

function SignedIn({ lang, user }: { lang: Lang; user: User }) {
  const c = getAccountCopy(lang);
  const followed = useFollowed();
  const matters = useMatters();
  const [changing, setChanging] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const created = user.created_at.slice(0, 10);

  return (
    <div className="acc">
      <section className="acc-card">
        <p className="eyebrow">{c.signedInAs}</p>
        <p className="acc-email">{user.email}</p>
        <p className="fb-note tnum">{c.since(formatDate(created, lang, created))}</p>
        <p className="acc-info">{c.synced}</p>
        <ul className="acc-stats tnum">
          <li>{c.follows(followed.length)}</li>
          <li>{c.matters(matters.length)}</li>
        </ul>
        <div className="fb-actions">
          <Link href={`/${lang}/theo-doi`} className="btn btn-quiet btn-sm">
            {c.openWatch} →
          </Link>
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setChanging((v) => !v)} aria-expanded={changing}>
            {c.changePassword}
          </button>
          <button
            type="button"
            className="btn btn-solid btn-sm"
            onClick={async () => {
              await signOut();
              window.location.reload();
            }}
          >
            {c.signOut}
          </button>
        </div>
        <p className="fb-note">{c.signOutNote}</p>
        {changing && <NewPassword lang={lang} onDone={() => setChanging(false)} />}
      </section>

      <section className="acc-card acc-danger">
        <h2 className="acc-h">{c.deleteTitle}</h2>
        <p className="fb-note">{c.deleteText}</p>
        <form
          className="fb-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (confirm.trim().toLowerCase() !== (user.email ?? "").toLowerCase()) return;
            setBusy(true);
            setError("");
            try {
              const sb = await supabase();
              const { error } = await sb.rpc("delete_my_account");
              if (error) throw error;
              await sb.auth.signOut().catch(() => undefined);
              setAccount(null);
              replaceUserData(null, null);
              window.localStorage.removeItem("ll:synced-user");
              window.location.reload();
            } catch (err) {
              setError(errorText(lang, err as Error));
              setBusy(false);
            }
          }}
        >
          <label className="fb-field">
            <span className="eyebrow">{c.deleteConfirm}</span>
            <input className="field" type="email" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
          </label>
          {error && (
            <p className="acc-error" role="alert">
              {error}
            </p>
          )}
          <div className="fb-actions">
            <button
              type="submit"
              className="btn btn-outline"
              disabled={busy || confirm.trim().toLowerCase() !== (user.email ?? "").toLowerCase()}
            >
              {c.deleteButton}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
