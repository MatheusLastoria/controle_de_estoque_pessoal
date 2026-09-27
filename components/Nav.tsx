"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Painel" },
  { href: "/rendas", label: "Rendas" },
  { href: "/gastos-fixos", label: "Gastos fixos" },
  { href: "/gastos-variaveis", label: "Gastos variáveis" },
  { href: "/calendario", label: "Calendário" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-line bg-surface md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="px-5 py-5 md:py-7">
        <span className="font-display text-xl text-ink">Painel</span>
        <span className="block text-xs text-muted">controle pessoal</span>
      </div>
      <ul className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-3 md:pb-6">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href} className="shrink-0 md:shrink">
              <Link
                href={link.href}
                className={`focus-ring block rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-moneySoft text-money font-medium"
                    : "text-muted hover:bg-bg hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
