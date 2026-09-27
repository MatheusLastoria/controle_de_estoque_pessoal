"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, Select, EmptyState } from "@/components/ui";
import { formatMoney, CATEGORIAS_FIXAS } from "@/lib/utils";

type GastoFixo = {
  id: string;
  nome: string;
  valor: number;
  diaVencimento: number;
  categoria: string;
  status: string;
};

export default function GastosFixosPage() {
  const [gastos, setGastos] = useState<GastoFixo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", valor: "", diaVencimento: "", categoria: CATEGORIAS_FIXAS[0] });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/gastos-fixos");
    setGastos(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.valor || !form.diaVencimento) return;
    setSaving(true);
    await fetch("/api/gastos-fixos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valor: Number(form.valor), diaVencimento: Number(form.diaVencimento) }),
    });
    setForm({ nome: "", valor: "", diaVencimento: "", categoria: CATEGORIAS_FIXAS[0] });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function toggleStatus(g: GastoFixo) {
    await fetch(`/api/gastos-fixos/${g.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: g.status === "pago" ? "pendente" : "pago" }),
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/gastos-fixos/${id}`, { method: "DELETE" });
    load();
  }

  const total = gastos.reduce((s, g) => s + g.valor, 0);
  const pago = gastos.filter((g) => g.status === "pago").reduce((s, g) => s + g.valor, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Gastos fixos</h1>
          <p className="text-sm text-muted">{formatMoney(pago)} pagos de {formatMoney(total)}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Novo gasto fixo"}</Button>
      </header>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" placeholder="Ex: Internet" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            <Input label="Valor (R$)" type="number" step="0.01" min="0" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />
            <Input label="Dia do vencimento" type="number" min="1" max="31" value={form.diaVencimento} onChange={(e) => setForm({ ...form, diaVencimento: e.target.value })} required />
            <Select label="Categoria" options={CATEGORIAS_FIXAS} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando...</p>
      ) : gastos.length === 0 ? (
        <EmptyState text="Nenhum gasto fixo cadastrado ainda." />
      ) : (
        <ul className="space-y-2">
          {gastos.map((g) => (
            <li key={g.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{g.nome}</p>
                  <p className="text-xs text-muted">{g.categoria} · vence dia {g.diaVencimento}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-ink">{formatMoney(g.valor)}</span>
                  <button
                    onClick={() => toggleStatus(g)}
                    className={`focus-ring rounded-md px-2.5 py-1 text-xs font-medium ${
                      g.status === "pago" ? "bg-moneySoft text-money" : "bg-alertSoft text-alert"
                    }`}
                  >
                    {g.status === "pago" ? "pago" : "pendente"}
                  </button>
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
