"use client";

import { useEffect, useState } from "react";
import { Card, EmptyState } from "@/components/ui";

type Produto = { id: string; marca: string; sabor: string; tamanho: string; custo: number; estoqueAtual: number };
type MiniVenda = { quantidade: number; produto: { id: string } };
type MiniEntrega = { quantidade: number; produto: { id: string } };
type Consignado = { id: string; nome: string; vendas: MiniVenda[]; entregas: MiniEntrega[] };

function produtoLabel(p: Produto) {
  return `${p.marca} ${p.sabor} ${p.tamanho}`;
}

export default function EstoqueGeralPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [consignados, setConsignados] = useState<Consignado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [resProdutos, resConsignados] = await Promise.all([fetch("/api/produtos"), fetch("/api/consignados")]);
      setProdutos(await resProdutos.json());
      setConsignados(await resConsignados.json());
      setLoading(false);
    }
    load();
  }, []);

  function estoqueLocal(consignado: Consignado, produtoId: string) {
    const entrada = consignado.entregas.filter((e) => e.produto.id === produtoId).reduce((s, e) => s + e.quantidade, 0);
    const vendas = consignado.vendas.filter((v) => v.produto.id === produtoId).reduce((s, v) => s + v.quantidade, 0);
    return entrada - vendas;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-ink">Estoque geral</h1>
        <p className="text-sm text-muted">
          Estoque em casa (não enviado a ninguém) + estoque já entregue a cada consignado, para cada produto.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-muted">Carregando...</p>
      ) : produtos.length === 0 ? (
        <EmptyState text="Nenhum produto cadastrado ainda." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-2 pr-3 font-medium">Produto</th>
                <th className="py-2 pr-3 font-medium">Casa (livre)</th>
                {consignados.map((c) => (
                  <th key={c.id} className="py-2 pr-3 font-medium">{c.nome}</th>
                ))}
                <th className="py-2 pr-3 font-medium">Total geral</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => {
                const locais = consignados.map((c) => estoqueLocal(c, p.id));
                const total = p.estoqueAtual + locais.reduce((s, v) => s + v, 0);
                return (
                  <tr key={p.id} className="border-t border-line">
                    <td className="py-2 pr-3 text-ink">{produtoLabel(p)}</td>
                    <td className={`py-2 pr-3 font-medium ${p.estoqueAtual < 0 ? "text-alert" : "text-ink"}`}>{p.estoqueAtual}</td>
                    {locais.map((v, i) => (
                      <td key={consignados[i].id} className={`py-2 pr-3 ${v < 0 ? "text-alert" : "text-ink"}`}>{v}</td>
                    ))}
                    <td className="py-2 pr-3 font-medium text-ink">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <p className="text-xs text-muted">
        "Casa (livre)" é o estoque que ainda não foi enviado a nenhum consignado — é dali que você abastece qualquer um deles, inclusive o Shopee,
        ao registrar uma "entrada" na página de Consignados.
      </p>
    </div>
  );
}
