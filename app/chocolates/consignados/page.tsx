"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, Select, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/lib/utils";

type Produto = { id: string; marca: string; sabor: string; tamanho: string; custo: number };
type Venda = {
  id: string;
  quantidade: number;
  valorUnitario: number;
  data: string;
  produto: Produto;
};
type Consignado = {
  id: string;
  nome: string;
  comissaoPercentual: number;
  vendas: Venda[];
};

export default function ConsignadosPage() {
  const [consignados, setConsignados] = useState<Consignado[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormConsignado, setShowFormConsignado] = useState(false);
  const [showFormVenda, setShowFormVenda] = useState<string | null>(null); // id do consignado
  const [saving, setSaving] = useState(false);
  const todayISO = new Date().toISOString().slice(0, 10);

  const [formConsignado, setFormConsignado] = useState({ nome: "", comissaoPercentual: "" });
  const [formVenda, setFormVenda] = useState({ produtoId: "", quantidade: "1", valorUnitario: "", data: todayISO });

  async function load() {
    setLoading(true);
    const [resConsignados, resProdutos] = await Promise.all([fetch("/api/consignados"), fetch("/api/produtos")]);
    setConsignados(await resConsignados.json());
    setProdutos(await resProdutos.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmitConsignado(e: React.FormEvent) {
    e.preventDefault();
    if (!formConsignado.nome) return;
    setSaving(true);
    await fetch("/api/consignados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: formConsignado.nome,
        comissaoPercentual: Number(formConsignado.comissaoPercentual || 0) / 100,
      }),
    });
    setFormConsignado({ nome: "", comissaoPercentual: "" });
    setShowFormConsignado(false);
    setSaving(false);
    load();
  }

  async function handleDeleteConsignado(id: string) {
    await fetch(`/api/consignados/${id}`, { method: "DELETE" });
    load();
  }

  async function handleSubmitVenda(e: React.FormEvent, consignadoId: string) {
    e.preventDefault();
    if (!formVenda.produtoId || !formVenda.quantidade || !formVenda.valorUnitario) return;
    setSaving(true);
    await fetch("/api/vendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produtoId: formVenda.produtoId,
        consignadoId,
        quantidade: Number(formVenda.quantidade),
        valorUnitario: Number(formVenda.valorUnitario),
        data: formVenda.data,
      }),
    });
    setFormVenda({ produtoId: "", quantidade: "1", valorUnitario: "", data: todayISO });
    setShowFormVenda(null);
    setSaving(false);
    load();
  }

  async function handleDeleteVenda(id: string) {
    await fetch(`/api/vendas/${id}`, { method: "DELETE" });
    load();
  }

  function totais(c: Consignado) {
    const bruto = c.vendas.reduce((s, v) => s + v.quantidade * v.valorUnitario, 0);
    const comissao = bruto * c.comissaoPercentual;
    const liquido = bruto - comissao;
    return { bruto, comissao, liquido };
  }

  const produtoOptions = produtos.map((p) => `${p.marca} ${p.sabor} ${p.tamanho}`);

  const totalGeral = consignados.reduce((acc, c) => {
    const t = totais(c);
    return { bruto: acc.bruto + t.bruto, comissao: acc.comissao + t.comissao, liquido: acc.liquido + t.liquido };
  }, { bruto: 0, comissao: 0, liquido: 0 });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Consignados / plataformas</h1>
          <p className="text-sm text-muted">
            Ganhos brutos: {formatMoney(totalGeral.bruto)} · Comissões/gastos: {formatMoney(totalGeral.comissao)} · Líquido: {formatMoney(totalGeral.liquido)}
          </p>
        </div>
        <Button onClick={() => setShowFormConsignado((v) => !v)}>{showFormConsignado ? "Cancelar" : "Novo consignado"}</Button>
      </header>

      {showFormConsignado && (
        <Card>
          <form onSubmit={handleSubmitConsignado} className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome (ex: Shopee, Carlinhos, Divina...)" value={formConsignado.nome} onChange={(e) => setFormConsignado({ ...formConsignado, nome: e.target.value })} required />
            <Input label="Comissão / desconto (%)" type="number" step="0.01" min="0" max="100" value={formConsignado.comissaoPercentual} onChange={(e) => setFormConsignado({ ...formConsignado, comissaoPercentual: e.target.value })} />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando...</p>
      ) : consignados.length === 0 ? (
        <EmptyState text="Nenhum consignado cadastrado ainda." />
      ) : (
        <ul className="space-y-4">
          {consignados.map((c) => {
            const t = totais(c);
            return (
              <li key={c.id}>
                <Card className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{c.nome}</p>
                      <p className="text-xs text-muted">
                        comissão {(c.comissaoPercentual * 100).toFixed(0)}% · bruto {formatMoney(t.bruto)} · gasto comissão {formatMoney(t.comissao)} · líquido {formatMoney(t.liquido)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" onClick={() => setShowFormVenda(showFormVenda === c.id ? null : c.id)}>
                        {showFormVenda === c.id ? "Cancelar" : "Registrar venda"}
                      </Button>
                      <button onClick={() => handleDeleteConsignado(c.id)} className="focus-ring text-xs text-muted hover:text-alert">
                        remover
                      </button>
                    </div>
                  </div>

                  {showFormVenda === c.id && (
                    <form onSubmit={(e) => handleSubmitVenda(e, c.id)} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                      <Select
                        label="Produto"
                        options={["Selecione...", ...produtoOptions]}
                        value={formVenda.produtoId ? `${produtos.find((p) => p.id === formVenda.produtoId)?.marca} ${produtos.find((p) => p.id === formVenda.produtoId)?.sabor} ${produtos.find((p) => p.id === formVenda.produtoId)?.tamanho}` : "Selecione..."}
                        onChange={(e) => {
                          const idx = produtoOptions.indexOf(e.target.value);
                          setFormVenda({ ...formVenda, produtoId: idx >= 0 ? produtos[idx].id : "" });
                        }}
                      />
                      <Input label="Quantidade" type="number" min="1" value={formVenda.quantidade} onChange={(e) => setFormVenda({ ...formVenda, quantidade: e.target.value })} required />
                      <Input label="Valor unitário de venda (R$)" type="number" step="0.01" min="0" value={formVenda.valorUnitario} onChange={(e) => setFormVenda({ ...formVenda, valorUnitario: e.target.value })} required />
                      <Input label="Data" type="date" value={formVenda.data} onChange={(e) => setFormVenda({ ...formVenda, data: e.target.value })} />
                      <div className="sm:col-span-2">
                        <Button type="submit" disabled={saving || !formVenda.produtoId}>{saving ? "Salvando..." : "Registrar"}</Button>
                      </div>
                    </form>
                  )}

                  {c.vendas.length > 0 && (
                    <ul className="space-y-1 border-t border-line pt-3 text-xs text-muted">
                      {c.vendas.map((v) => (
                        <li key={v.id} className="flex items-center justify-between">
                          <span>
                            {v.produto.marca} {v.produto.sabor} {v.produto.tamanho} · {v.quantidade}x {formatMoney(v.valorUnitario)} · {formatDate(v.data)}
                          </span>
                          <span className="flex items-center gap-3">
                            {formatMoney(v.quantidade * v.valorUnitario)}
                            <button onClick={() => handleDeleteVenda(v.id)} className="focus-ring hover:text-alert">
                              remover
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
