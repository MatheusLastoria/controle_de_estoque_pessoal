"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/utils";

type Produto = {
  id: string;
  marca: string;
  sabor: string;
  tamanho: string;
  custo: number;
  estoqueAtual: number;
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ marca: "", sabor: "", tamanho: "", custo: "", estoqueAtual: "" });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/produtos");
    setProdutos(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.marca || !form.sabor || !form.tamanho || !form.custo) return;
    setSaving(true);
    await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, custo: Number(form.custo), estoqueAtual: Number(form.estoqueAtual || 0) }),
    });
    setForm({ marca: "", sabor: "", tamanho: "", custo: "", estoqueAtual: "" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleEstoqueChange(id: string, estoqueAtual: number) {
    await fetch(`/api/produtos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estoqueAtual }),
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    load();
  }

  const valorEstoque = produtos.reduce((s, p) => s + p.custo * p.estoqueAtual, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Produtos (chocolates)</h1>
          <p className="text-sm text-muted">Valor total em estoque: {formatMoney(valorEstoque)}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Novo produto"}</Button>
      </header>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input label="Marca" placeholder="Ex: Feastables" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} required />
            <Input label="Sabor / variante" placeholder="Ex: Milk Crunch" value={form.sabor} onChange={(e) => setForm({ ...form, sabor: e.target.value })} required />
            <Input label="Tamanho" placeholder="Ex: 60g" value={form.tamanho} onChange={(e) => setForm({ ...form, tamanho: e.target.value })} required />
            <Input label="Custo unitário (R$)" type="number" step="0.01" min="0" value={form.custo} onChange={(e) => setForm({ ...form, custo: e.target.value })} required />
            <Input label="Estoque inicial em casa" type="number" min="0" value={form.estoqueAtual} onChange={(e) => setForm({ ...form, estoqueAtual: e.target.value })} />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando...</p>
      ) : produtos.length === 0 ? (
        <EmptyState text="Nenhum produto cadastrado ainda." />
      ) : (
        <ul className="space-y-2">
          {produtos.map((p) => (
            <li key={p.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{p.marca} · {p.sabor}</p>
                  <p className="text-xs text-muted">{p.tamanho} · custo {formatMoney(p.custo)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-muted">
                    Estoque em casa
                    <input
                      type="number"
                      min="0"
                      value={p.estoqueAtual}
                      onChange={(e) => handleEstoqueChange(p.id, Number(e.target.value))}
                      className="focus-ring w-20 rounded-md border border-line bg-surface px-2 py-1 text-ink"
                    />
                  </label>
                  <button onClick={() => handleDelete(p.id)} className="focus-ring text-xs text-muted hover:text-alert">
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
