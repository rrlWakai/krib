import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { cn } from "../../lib/cn";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REQUIREMENTS = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "At least 1 uppercase letter (A-Z)",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "At least 1 lowercase letter (a-z)",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "At least 1 number (0-9)",
    test: (value: string) => /\d/.test(value),
  },
];

export function AdminLogin() {
  const { signIn, signUp, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/admin";
  const denied = searchParams.get("denied") === "1";
  const pending = searchParams.get("pending") === "1";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const passwordRequirementState = PASSWORD_REQUIREMENTS.map((requirement) =>
    requirement.test(password),
  );
  const passwordIsValid = passwordRequirementState.every(Boolean);
  const confirmPasswordIsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  function switchMode(nextMode: "signin" | "signup") {
    setMode(nextMode);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!passwordIsValid) {
        setError("Password must meet all of the requirements shown below.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);
    if (mode === "signup") {
      const { error: signUpError } = await signUp(
        fullName,
        normalizedEmail,
        password,
      );
      if (signUpError) {
        setSubmitting(false);
        setError(signUpError.message);
        return;
      }
      await signOut();
      setSubmitting(false);
      setPassword("");
      setConfirmPassword("");
      setSuccess(
        "Account created successfully. Your administrator access is pending approval.",
      );
      setMode("signin");
      return;
    }

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
            {mode === "signin" ? "Sign In" : "Create Admin Account"}
          </h1>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-body text-[13px] text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 font-body text-[13px] text-green-700">
              {success}
            </div>
          )}

          {mode === "signup" && (
            <div className="mb-4">
              <label
                htmlFor="full-name"
                className="mb-1.5 block font-body text-[13px] font-medium text-[#0A1F44]"
              >
                Full Name
              </label>
              <input
                id="full-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#D4D4D4] px-3 font-body text-[14px] text-[#0A1F44] outline-none focus:border-[#0A1F44]"
              />
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

          <div className={cn(mode === "signup" ? "mb-2" : "mb-4")}>
            <label
              htmlFor="password"
              className="mb-1.5 block font-body text-[13px] font-medium text-[#0A1F44]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#D4D4D4] px-3 font-body text-[14px] text-[#0A1F44] outline-none focus:border-[#0A1F44]"
            />
          </div>

          {mode === "signup" && (
            <div
              className="mb-4 rounded-lg bg-[#FAFAFA] px-3 py-2.5"
              aria-live="polite"
            >
              <p className="mb-1.5 font-body text-[12px] font-medium text-[#0A1F44]">
                Password must contain:
              </p>
              <ul className="space-y-1">
                {PASSWORD_REQUIREMENTS.map((requirement, index) => {
                  const satisfied = passwordRequirementState[index];
                  return (
                    <li
                      key={requirement.label}
                      className={cn(
                        "flex items-center gap-2 font-body text-[12px]",
                        satisfied ? "text-[#2F6B3B]" : "text-[#757575]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[9px] leading-none",
                          satisfied
                            ? "border-[#7FAE87] bg-[#F0F7F1]"
                            : "border-[#D4D4D4] bg-white",
                        )}
                        aria-hidden="true"
                      >
                        {satisfied ? "✓" : ""}
                      </span>
                      {requirement.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {mode === "signup" && (
            <div className="mb-6">
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block font-body text-[13px] font-medium text-[#0A1F44]"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#D4D4D4] px-3 font-body text-[14px] text-[#0A1F44] outline-none focus:border-[#0A1F44]"
              />
              {confirmPassword.length > 0 && (
                <p
                  className={cn(
                    "mt-1.5 font-body text-[12px]",
                    confirmPasswordIsMatch ? "text-[#2F6B3B]" : "text-[#B45309",
                  )}
                >
                  {confirmPasswordIsMatch
                    ? "Passwords match."
                    : "Passwords do not match."}
                </p>
              )}
            </div>
          )}

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
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Create Admin Account"
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 block w-full text-center font-body text-[13px] font-medium text-[#0A1F44] underline"
        >
          {mode === "signin" ? "Sign Up" : "Back to Sign In"}
        </button>
        <p className="mt-6 text-center font-body text-[12px] text-[#B0B0B0]">
          KRiB Beverly Place · Administrator Access
        </p>
      </div>
    </div>
  );
}
