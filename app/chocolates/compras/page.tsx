"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/lib/utils";

type Compra = {
  id: string;
  data: string;
  fornecedor: string | null;
  valorProdutos: number;
  frete: number;
  cupomDesconto: number;
  investimento: number;
  observacao: string | null;
};

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const todayISO = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    data: todayISO,
    fornecedor: "",
    valorProdutos: "",
    frete: "",
    cupomDesconto: "",
    investimento: "",
    observacao: "",
  });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/compras");
    setCompras(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.valorProdutos) return;
    setSaving(true);
    await fetch("/api/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        valorProdutos: Number(form.valorProdutos),
        frete: Number(form.frete || 0),
        cupomDesconto: Number(form.cupomDesconto || 0),
        investimento: Number(form.investimento || 0),
      }),
    });
    setForm({ data: todayISO, fornecedor: "", valorProdutos: "", frete: "", cupomDesconto: "", investimento: "", observacao: "" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/compras/${id}`, { method: "DELETE" });
    load();
  }

  const custoTotal = (c: Compra) => c.valorProdutos + c.frete + c.investimento - c.cupomDesconto;
  const totalGeral = compras.reduce((s, c) => s + custoTotal(c), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Compras</h1>
          <p className="text-sm text-muted">Total investido em compras: {formatMoney(totalGeral)}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Nova compra"}</Button>
      </header>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input label="Data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            <Input label="Fornecedor" placeholder="Ex: Importados Lastoria" value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} />
            <Input label="Valor dos produtos (R$)" type="number" step="0.01" min="0" value={form.valorProdutos} onChange={(e) => setForm({ ...form, valorProdutos: e.target.value })} required />
            <Input label="Frete (R$)" type="number" step="0.01" min="0" value={form.frete} onChange={(e) => setForm({ ...form, frete: e.target.value })} />
            <Input label="Cupom / desconto (R$)" type="number" step="0.01" min="0" value={form.cupomDesconto} onChange={(e) => setForm({ ...form, cupomDesconto: e.target.value })} />
            <Input label="Investimento (embalagem, banner...)" type="number" step="0.01" min="0" value={form.investimento} onChange={(e) => setForm({ ...form, investimento: e.target.value })} />
            <Input label="Observação" placeholder="Opcional" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando...</p>
      ) : compras.length === 0 ? (
        <EmptyState text="Nenhuma compra registrada ainda." />
      ) : (
        <ul className="space-y-2">
          {compras.map((c) => (
            <li key={c.id}>
              <Card className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{c.fornecedor ?? "Compra"} · {formatDate(c.data)}</p>
                  <p className="text-xs text-muted">
                    produtos {formatMoney(c.valorProdutos)} · frete {formatMoney(c.frete)} · investimento {formatMoney(c.investimento)}
                    {c.cupomDesconto > 0 ? ` · cupom -${formatMoney(c.cupomDesconto)}` : ""}
                  </p>
                  {c.observacao && <p className="text-xs text-muted">{c.observacao}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-ink">{formatMoney(custoTotal(c))}</span>
                  <button onClick={() => handleDelete(c.id)} className="focus-ring text-xs text-muted hover:text-alert">
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
