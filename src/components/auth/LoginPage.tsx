import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { cn } from "../../lib/cn";
import { setNoIndex, restoreIndex } from "../../lib/seo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AdminLogin() {
  const { signIn, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/admin";
  const denied = searchParams.get("denied") === "1";
  const pending = searchParams.get("pending") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setNoIndex();
    return restoreIndex;
  }, []);
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await signIn(normalizedEmail, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate(from, { replace: true });
  }

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-1 font-display text-[28px] font-semibold text-[#0A1F44]">
            KRiB
          </div>
          <div className="font-body text-[13px] text-[#757575]">
            Control Center
          </div>
        </div>

        {(denied || pending) && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="font-body text-[13px] font-medium text-amber-800">
              {pending
                ? "Account pending approval"
                : "Admin access not activated"}
            </p>
            <p className="mt-1 font-body text-[12px] text-amber-700">
              Your account cannot access the KRiB Control Center until an owner
              activates it.
            </p>
            {user && (
              <button
                onClick={handleSignOut}
                className="mt-2 font-body text-[12px] font-medium text-amber-800 underline"
              >
                Sign out and use another account
              </button>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#ECECEC] bg-white p-8 shadow-sm"
        >
          <h1 className="mb-6 font-display text-[20px] font-semibold text-[#0A1F44]">
            Sign In
          </h1>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-body text-[13px] text-red-600">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1.5 block font-body text-[13px] font-medium text-[#0A1F44]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#D4D4D4] px-3 font-body text-[14px] text-[#0A1F44] outline-none focus:border-[#0A1F44]"
              placeholder="admin@krib.ph"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-1.5 block font-body text-[13px] font-medium text-[#0A1F44]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#D4D4D4] px-3 font-body text-[14px] text-[#0A1F44] outline-none focus:border-[#0A1F44]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "flex h-10 w-full items-center justify-center rounded-lg bg-[#0A1F44] font-body text-[14px] font-medium text-white",
              submitting && "opacity-60",
            )}
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-[12px] text-[#B0B0B0]">
          KRiB Beverly Place · Administrator Access
        </p>
      </div>
    </div>
  );
}
