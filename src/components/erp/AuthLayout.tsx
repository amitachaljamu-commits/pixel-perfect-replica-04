import type { ReactNode } from "react";
import { Boxes } from "lucide-react";

export function AuthLayout({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Boxes className="size-6" aria-hidden />
          </span>
          <div className="text-center">
            <div className="text-lg font-semibold">StockSense</div>
            <h1 className="text-sm text-muted-foreground">{title}</h1>
          </div>
        </div>
        <div className="erp-panel p-6 shadow-sm">{children}</div>
        <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  error,
  ...props
}: { label: string; error?: string | undefined } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-1">
      <label htmlFor={props.id} className="erp-label">
        {label}
      </label>
      <input
        {...props}
        aria-invalid={!!error}
        className="h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
