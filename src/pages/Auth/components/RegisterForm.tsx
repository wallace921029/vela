import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFirstValidationError } from "@/utils/validation";
import AuthPageShell from "./AuthPageShell";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const result = z
      .object({
        email: z.string().trim().email(t("validation.email")),
        password: z.string().min(6, t("validation.passwordMin")),
        confirmPassword: z.string().min(1, t("validation.required")),
        inviteCode: z.string().trim().min(1, t("validation.inviteCode")),
        nickname: z
          .string()
          .trim()
          .max(40, t("validation.nicknameMax"))
          .optional(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: t("validation.passwordMismatch"),
        path: ["confirmPassword"],
      })
      .safeParse({ email, password, confirmPassword, inviteCode, nickname });

    if (!result.success) {
      setError(getFirstValidationError(result.error, t("validation.required")));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.data.email,
          password: result.data.password,
          inviteCode: result.data.inviteCode,
          nickname: result.data.nickname || "",
        }),
      });
      const data = await res.json();

      if (res.ok) {
        navigate("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Join Vela"
      description="Create your personal new tab experience."
      className="p-4 py-12"
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </>
      }
    >
      {error && <div className="text-sm text-red-500 text-center">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="bg-white/50 dark:bg-neutral-900/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="bg-white/50 dark:bg-neutral-900/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          className="bg-white/50 dark:bg-neutral-900/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inviteCode">Invite Code *</Label>
        <Input
          id="inviteCode"
          type="text"
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
          required
          placeholder="e.g. 000000"
          className="bg-white/50 dark:bg-neutral-900/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname (Optional)</Label>
        <Input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="What should we call you?"
          className="bg-white/50 dark:bg-neutral-900/50"
        />
      </div>
    </AuthPageShell>
  );
};

export default RegisterForm;
