"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const topLink = { href: "/", label: "Painel" };

const groups = [
  {
    label: "PESSOAL",
    links: [
      { href: "/rendas", label: "Rendas" },
      { href: "/gastos-fixos", label: "Gastos fixos" },
      { href: "/gastos-variaveis", label: "Gastos variáveis" },
      { href: "/calendario", label: "Calendário" },
    ],
  },
  {
    label: "IMPORTADOS LASTORIA",
    links: [
      { href: "/chocolates/produtos", label: "Produtos" },
      { href: "/chocolates/compras", label: "Compras" },
      { href: "/chocolates/consignados", label: "Consignados" },
      { href: "/chocolates/estoque", label: "Estoque geral" },
    ],
  },
];

export default function Nav() {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach((g) => {
      initial[g.label] = g.links.some((l) => l.href === pathname);
    });
    return initial;
  });

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <nav className="border-b border-line bg-surface md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="px-5 py-5 md:py-7">
        <span className="font-display text-xl text-ink">Painel</span>
        <span className="block text-xs text-muted">controle pessoal</span>
      </div>

      <div className="px-3 pb-3 md:pb-6">
        <Link
          href={topLink.href}
          className={`focus-ring mb-2 block rounded-md px-3 py-2 text-sm transition-colors ${
            pathname === topLink.href
              ? "bg-moneySoft text-money font-medium"
              : "text-muted hover:bg-bg hover:text-ink"
          }`}
        >
          {topLink.label}
        </Link>

        <ul className="space-y-1">
          {groups.map((group) => {
            const isOpen = openGroups[group.label];
            const hasActive = group.links.some((l) => l.href === pathname);
            return (
              <li key={group.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className={`focus-ring flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    hasActive ? "text-ink" : "text-muted hover:bg-bg hover:text-ink"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true">{isOpen ? "📂" : "📁"}</span>
                    {group.label}
                  </span>
                  <span aria-hidden="true" className={`text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>
                    ▶
                  </span>
                </button>

                {isOpen && (
                  <ul className="ml-4 mt-1 space-y-1 border-l border-line pl-3">
                    {group.links.map((link) => {
                      const active = pathname === link.href;
                      return (
                        <li key={link.href}>
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
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
