import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { actions } from "@/lib/inventory";
import { AuthField, AuthLayout } from "@/components/erp/AuthLayout";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — StockSense" },
      { name: "description", content: "Sign in to StockSense inventory management." },
      { property: "og:title", content: "Sign in — StockSense" },
      { property: "og:description", content: "Sign in to StockSense inventory management." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <AuthLayout
      title="Sign in to your account"
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-medium text-link hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (actions.login(loginId.trim(), password)) navigate({ to: "/" });
          else setError("Invalid Login ID or password");
        }}
      >
        <AuthField id="loginId" label="Login ID" value={loginId} onChange={(e) => setLoginId(e.target.value)} autoComplete="username" required />
        <AuthField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        {error && (
          <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full">
          Sign in
        </Button>
        <p className="text-center text-xs text-muted-foreground">Demo: admin1 / Admin@123</p>
      </form>
    </AuthLayout>
  );
}
