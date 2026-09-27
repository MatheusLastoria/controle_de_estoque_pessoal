"use client";

import { InputHTMLAttributes, SelectHTMLAttributes, ButtonHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <input
        {...rest}
        className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted/60"
      />
    </label>
  );
}

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] }
) {
  const { label, options, ...rest } = props;
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <select
        {...rest}
        className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2 text-ink"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }
) {
  const { variant = "primary", className = "", ...rest } = props;
  const styles = {
    primary: "bg-ink text-white hover:bg-ink/90",
    ghost: "bg-transparent text-muted hover:bg-bg hover:text-ink border border-line",
    danger: "bg-transparent text-alert hover:bg-alertSoft",
  };
  return (
    <button
      {...rest}
      className={`focus-ring rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-line bg-surface p-5 ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-line px-5 py-8 text-center text-sm text-muted">
      {text}
    </div>
  );
}
