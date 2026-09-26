import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { actions } from "@/lib/inventory";
import { AuthField, AuthLayout } from "@/components/erp/AuthLayout";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — StockSense" },
      { name: "description", content: "Create your StockSense account." },
      { property: "og:title", content: "Create account — StockSense" },
      { property: "og:description", content: "Create your StockSense account." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [f, setF] = useState({ loginId: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<"loginId" | "email" | "password" | "confirm", string>>>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (f.loginId.length < 6 || f.loginId.length > 12) errs.loginId = "Login ID must be 6–12 characters";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) errs.email = "Enter a valid email";
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/.test(f.password))
      errs.password = "At least 9 characters with upper, lower and a special character";
    if (f.password !== f.confirm) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const err = actions.signup({ loginId: f.loginId, email: f.email, password: f.password });
    if (err) return setErrors({ [err.includes("Email") ? "email" : "loginId"]: err });
    navigate({ to: "/" });
  };

  return (
    <AuthLayout
      title="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-link hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <AuthField id="loginId" label="Login ID" value={f.loginId} onChange={set("loginId")} error={errors.loginId} />
        <AuthField id="email" label="Email" type="email" value={f.email} onChange={set("email")} error={errors.email} />
        <AuthField id="password" label="Password" type="password" value={f.password} onChange={set("password")} error={errors.password} />
        <AuthField id="confirm" label="Re-enter password" type="password" value={f.confirm} onChange={set("confirm")} error={errors.confirm} />
        <Button type="submit" className="w-full">
          Sign up
        </Button>
      </form>
    </AuthLayout>
  );
}
