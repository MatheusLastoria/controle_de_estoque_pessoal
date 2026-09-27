"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/utils";

type Renda = { id: string; nome: string; valor: number };

export default function RendasPage() {
  const [rendas, setRendas] = useState<Renda[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/rendas");
    setRendas(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !valor) return;
    setSaving(true);
    await fetch("/api/rendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, valor: Number(valor) }),
    });
    setNome("");
    setValor("");
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/rendas/${id}`, { method: "DELETE" });
    load();
  }

  const total = rendas.reduce((s, r) => s + r.valor, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Rendas</h1>
          <p className="text-sm text-muted">Total mensal: {formatMoney(total)}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Nova renda"}</Button>
      </header>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <Input label="Fonte de renda" placeholder="Ex: Emprego 1" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <Input label="Valor mensal (R$)" type="number" step="0.01" min="0" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} required />
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando...</p>
      ) : rendas.length === 0 ? (
        <EmptyState text="Nenhuma renda cadastrada ainda." />
      ) : (
        <ul className="space-y-2">
          {rendas.map((r) => (
            <li key={r.id}>
              <Card className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-ink">{r.nome}</span>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-money">{formatMoney(r.valor)}</span>
                  <button onClick={() => handleDelete(r.id)} className="focus-ring text-xs text-muted hover:text-alert">
                    remover
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
