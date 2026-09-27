"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, Select, EmptyState } from "@/components/ui";
import { formatMoney, formatDate, CATEGORIAS_VARIAVEIS } from "@/lib/utils";

type GastoVariavel = { id: string; nome: string; valor: number; categoria: string | null; data: string };

export default function GastosVariaveisPage() {
  const [gastos, setGastos] = useState<GastoVariavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const todayISO = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ nome: "", valor: "", categoria: CATEGORIAS_VARIAVEIS[0], data: todayISO });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/gastos-variaveis");
    setGastos(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.valor) return;
    setSaving(true);
    await fetch("/api/gastos-variaveis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valor: Number(form.valor) }),
    });
    setForm({ nome: "", valor: "", categoria: CATEGORIAS_VARIAVEIS[0], data: todayISO });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/gastos-variaveis/${id}`, { method: "DELETE" });
    load();
  }

  const now = new Date();
  const doMes = gastos.filter((g) => {
    const d = new Date(g.data);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const total = doMes.reduce((s, g) => s + g.valor, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Gastos variáveis</h1>
          <p className="text-sm text-muted">Total no mês: {formatMoney(total)}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Novo gasto"}</Button>
      </header>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input label="Descrição" placeholder="Ex: Jantar" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            <Input label="Valor (R$)" type="number" step="0.01" min="0" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />
            <Select label="Categoria" options={CATEGORIAS_VARIAVEIS} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            <Input label="Data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando...</p>
      ) : gastos.length === 0 ? (
        <EmptyState text="Nenhum gasto variável registrado ainda." />
      ) : (
        <ul className="space-y-2">
          {gastos.map((g) => (
            <li key={g.id}>
              <Card className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{g.nome}</p>
                  <p className="text-xs text-muted">{g.categoria ?? "Sem categoria"} · {formatDate(g.data)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-ink">{formatMoney(g.valor)}</span>
                  <button onClick={() => handleDelete(g.id)} className="focus-ring text-xs text-muted hover:text-alert">
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
