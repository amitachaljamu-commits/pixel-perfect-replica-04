import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
};

export function RecordDialog({
  open,
  onOpenChange,
  title,
  fields,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  fields: FieldDef[];
  initial: Record<string, string>;
  onSave: (v: Record<string, string>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {open && <Form fields={fields} initial={initial} onSave={onSave} onCancel={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function Form({
  fields,
  initial,
  onSave,
  onCancel,
}: {
  fields: FieldDef[];
  initial: Record<string, string>;
  onSave: (v: Record<string, string>) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    fields.forEach((f) => f.required && !v[f.name]?.trim() && (errs[f.name] = `${f.label} is required`));
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave(v);
  };
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {fields.map((f) => {
        let input: ReactNode;
        const common = {
          id: f.name,
          className: "erp-field-input",
          value: v[f.name] ?? "",
          "aria-invalid": !!errors[f.name],
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setV({ ...v, [f.name]: e.target.value }),
        };
        if (f.type === "select")
          input = (
            <select {...common}>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          );
        else input = <input type={f.type ?? "text"} {...common} />;
        return (
          <div key={f.name} className="grid gap-1">
            <label htmlFor={f.name} className="erp-label">
              {f.label}
              {f.required && <span className="text-destructive"> *</span>}
            </label>
            {input}
            {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]}</p>}
          </div>
        );
      })}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Discard
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}
