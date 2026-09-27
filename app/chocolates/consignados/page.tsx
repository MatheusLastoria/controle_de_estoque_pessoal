"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, Select, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/lib/utils";

type Produto = { id: string; marca: string; sabor: string; tamanho: string; custo: number; estoqueAtual: number };
type Venda = { id: string; quantidade: number; valorUnitario: number; data: string; produto: Produto };
type Entrega = { id: string; quantidade: number; data: string; produto: Produto };
type Consignado = {
  id: string;
  nome: string;
  comissaoPercentual: number;
  vendas: Venda[];
  entregas: Entrega[];
};

function produtoLabel(p: Produto) {
  return `${p.marca} ${p.sabor} ${p.tamanho}`;
}

export default function ConsignadosPage() {
  const [consignados, setConsignados] = useState<Consignado[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormConsignado, setShowFormConsignado] = useState(false);
  const [showFormVenda, setShowFormVenda] = useState<string | null>(null);
  const [showFormEntrega, setShowFormEntrega] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const todayISO = new Date().toISOString().slice(0, 10);

  const [formConsignado, setFormConsignado] = useState({ nome: "", comissaoPercentual: "" });
  const [formVenda, setFormVenda] = useState({ produtoId: "", quantidade: "1", valorUnitario: "", data: todayISO });
  const [formEntrega, setFormEntrega] = useState({ produtoId: "", quantidade: "1", data: todayISO });

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

  function produtoIdFromLabel(label: string) {
    const p = produtos.find((x) => produtoLabel(x) === label);
    return p ? p.id : "";
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

  async function handleSubmitEntrega(e: React.FormEvent, consignadoId: string) {
    e.preventDefault();
    if (!formEntrega.produtoId || !formEntrega.quantidade) return;
    setSaving(true);
    await fetch("/api/entregas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produtoId: formEntrega.produtoId,
        consignadoId,
        quantidade: Number(formEntrega.quantidade),
        data: formEntrega.data,
      }),
    });
    setFormEntrega({ produtoId: "", quantidade: "1", data: todayISO });
    setShowFormEntrega(null);
    setSaving(false);
    load();
  }

  async function handleDeleteEntrega(id: string) {
    await fetch(`/api/entregas/${id}`, { method: "DELETE" });
    load();
  }

  function totaisFinanceiros(c: Consignado) {
    const bruto = c.vendas.reduce((s, v) => s + v.quantidade * v.valorUnitario, 0);
    const comissao = bruto * c.comissaoPercentual;
    const liquido = bruto - comissao;
    return { bruto, comissao, liquido };
  }

  // Estoque local por produto neste consignado = soma(entregas) - soma(vendas)
  function estoquePorProduto(c: Consignado) {
    const map = new Map<string, { produto: Produto; entrada: number; vendas: number }>();
    c.entregas.forEach((en) => {
      const cur = map.get(en.produto.id) ?? { produto: en.produto, entrada: 0, vendas: 0 };
      cur.entrada += en.quantidade;
      map.set(en.produto.id, cur);
    });
    c.vendas.forEach((v) => {
      const cur = map.get(v.produto.id) ?? { produto: v.produto, entrada: 0, vendas: 0 };
      cur.vendas += v.quantidade;
      map.set(v.produto.id, cur);
    });
    return Array.from(map.values()).sort((a, b) => produtoLabel(a.produto).localeCompare(produtoLabel(b.produto)));
  }

  const produtoOptions = produtos.map(produtoLabel);

  const totalGeral = consignados.reduce(
    (acc, c) => {
      const t = totaisFinanceiros(c);
      return { bruto: acc.bruto + t.bruto, comissao: acc.comissao + t.comissao, liquido: acc.liquido + t.liquido };
    },
    { bruto: 0, comissao: 0, liquido: 0 }
  );

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

      <p className="text-xs text-muted">
        Fluxo do estoque: em <strong>Produtos</strong> fica o estoque em casa (ainda não enviado a ninguém). Aqui, <strong>Registrar entrada</strong> transfere unidades de casa para este consignado
        (inclusive Shopee, que "recebe" pra despachar). <strong>Registrar venda</strong> dá baixa no estoque que já está com o consignado, sem mexer no estoque de casa.
      </p>

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
            const t = totaisFinanceiros(c);
            const estoques = estoquePorProduto(c);
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
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowFormEntrega(showFormEntrega === c.id ? null : c.id);
                          setShowFormVenda(null);
                        }}
                      >
                        {showFormEntrega === c.id ? "Cancelar" : "Registrar entrada"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowFormVenda(showFormVenda === c.id ? null : c.id);
                          setShowFormEntrega(null);
                        }}
                      >
                        {showFormVenda === c.id ? "Cancelar" : "Registrar venda"}
                      </Button>
                      <button onClick={() => handleDeleteConsignado(c.id)} className="focus-ring text-xs text-muted hover:text-alert">
                        remover
                      </button>
                    </div>
                  </div>

                  {showFormEntrega === c.id && (
                    <form onSubmit={(e) => handleSubmitEntrega(e, c.id)} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                      <Select
                        label="Produto"
                        options={["Selecione...", ...produtoOptions]}
                        value={formEntrega.produtoId ? produtoLabel(produtos.find((p) => p.id === formEntrega.produtoId)!) : "Selecione..."}
                        onChange={(e) => setFormEntrega({ ...formEntrega, produtoId: produtoIdFromLabel(e.target.value) })}
                      />
                      <Input label="Quantidade enviada" type="number" min="1" value={formEntrega.quantidade} onChange={(e) => setFormEntrega({ ...formEntrega, quantidade: e.target.value })} required />
                      <Input label="Data" type="date" value={formEntrega.data} onChange={(e) => setFormEntrega({ ...formEntrega, data: e.target.value })} />
                      <div className="sm:col-span-2">
                        <Button type="submit" disabled={saving || !formEntrega.produtoId}>{saving ? "Salvando..." : "Registrar entrada"}</Button>
                      </div>
                    </form>
                  )}

                  {showFormVenda === c.id && (
                    <form onSubmit={(e) => handleSubmitVenda(e, c.id)} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                      <Select
                        label="Produto"
                        options={["Selecione...", ...produtoOptions]}
                        value={formVenda.produtoId ? produtoLabel(produtos.find((p) => p.id === formVenda.produtoId)!) : "Selecione..."}
                        onChange={(e) => setFormVenda({ ...formVenda, produtoId: produtoIdFromLabel(e.target.value) })}
                      />
                      <Input label="Quantidade vendida" type="number" min="1" value={formVenda.quantidade} onChange={(e) => setFormVenda({ ...formVenda, quantidade: e.target.value })} required />
                      <Input label="Valor unitário de venda (R$)" type="number" step="0.01" min="0" value={formVenda.valorUnitario} onChange={(e) => setFormVenda({ ...formVenda, valorUnitario: e.target.value })} required />
                      <Input label="Data" type="date" value={formVenda.data} onChange={(e) => setFormVenda({ ...formVenda, data: e.target.value })} />
                      <div className="sm:col-span-2">
                        <Button type="submit" disabled={saving || !formVenda.produtoId}>{saving ? "Salvando..." : "Registrar venda"}</Button>
                      </div>
                    </form>
                  )}

                  {estoques.length > 0 && (
                    <div className="border-t border-line pt-3">
                      <p className="mb-2 text-xs font-medium text-muted">Estoque neste consignado</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-muted">
                              <th className="py-1 pr-3 font-medium">Produto</th>
                              <th className="py-1 pr-3 font-medium">Entrada</th>
                              <th className="py-1 pr-3 font-medium">Vendas</th>
                              <th className="py-1 pr-3 font-medium">Estoque</th>
                            </tr>
                          </thead>
                          <tbody>
                            {estoques.map((e) => (
                              <tr key={e.produto.id} className="border-t border-line/60">
                                <td className="py-1 pr-3 text-ink">{produtoLabel(e.produto)}</td>
                                <td className="py-1 pr-3">{e.entrada}</td>
                                <td className="py-1 pr-3">{e.vendas}</td>
                                <td className={`py-1 pr-3 font-medium ${e.entrada - e.vendas < 0 ? "text-alert" : "text-ink"}`}>
                                  {e.entrada - e.vendas}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {(c.vendas.length > 0 || c.entregas.length > 0) && (
                    <div className="grid gap-4 border-t border-line pt-3 sm:grid-cols-2">
                      {c.entregas.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted">Entradas (enviado para cá)</p>
                          <ul className="space-y-1 text-xs text-muted">
                            {c.entregas.map((en) => (
                              <li key={en.id} className="flex items-center justify-between">
                                <span>{produtoLabel(en.produto)} · {en.quantidade}x · {formatDate(en.data)}</span>
                                <button onClick={() => handleDeleteEntrega(en.id)} className="focus-ring hover:text-alert">
                                  remover
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {c.vendas.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted">Vendas registradas</p>
                          <ul className="space-y-1 text-xs text-muted">
                            {c.vendas.map((v) => (
                              <li key={v.id} className="flex items-center justify-between">
                                <span>{produtoLabel(v.produto)} · {v.quantidade}x {formatMoney(v.valorUnitario)} · {formatDate(v.data)}</span>
                                <span className="flex items-center gap-3">
                                  {formatMoney(v.quantidade * v.valorUnitario)}
                                  <button onClick={() => handleDeleteVenda(v.id)} className="focus-ring hover:text-alert">
                                    remover
                                  </button>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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
