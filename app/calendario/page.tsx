"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Button, Input, EmptyState } from "@/components/ui";
import { formatMoney, formatDateLong, MESES } from "@/lib/utils";

type GastoFixo = { id: string; nome: string; valor: number; diaVencimento: number };
type Evento = {
  id: string;
  nome: string;
  data: string;
  valorPlanejado: number;
  valorGasto: number | null;
  observacao: string | null;
};

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function CalendarioPage() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: "", data: "", valorPlanejado: "", observacao: "" });
  const [editingGasto, setEditingGasto] = useState<{ id: string; valor: string } | null>(null);

  async function load() {
    const [gf, ev] = await Promise.all([
      fetch("/api/gastos-fixos").then((r) => r.json()),
      fetch("/api/eventos").then((r) => r.json()),
    ]);
    setGastosFixos(gf);
    setEventos(ev);
  }

  useEffect(() => {
    load();
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [year, month]);

  function eventosNoDia(day: number) {
    return eventos.filter((e) => {
      const d = new Date(e.data);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  function gastosNoDia(day: number) {
    return gastosFixos.filter((g) => g.diaVencimento === day);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.data || !form.valorPlanejado) return;
    setSaving(true);
    await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valorPlanejado: Number(form.valorPlanejado) }),
    });
    setForm({ nome: "", data: "", valorPlanejado: "", observacao: "" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/eventos/${id}`, { method: "DELETE" });
    load();
  }

  async function salvarValorGasto(id: string, valor: string) {
    await fetch(`/api/eventos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valorGasto: Number(valor) }),
    });
    setEditingGasto(null);
    load();
  }

  const eventosDoMes = eventos
    .filter((e) => {
      const d = new Date(e.data);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const today = new Date();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Calendário</h1>
          <p className="text-sm text-muted">{MESES[month]} de {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setViewDate(new Date(year, month - 1, 1))}>←</Button>
          <Button variant="ghost" onClick={() => setViewDate(new Date())}>Hoje</Button>
          <Button variant="ghost" onClick={() => setViewDate(new Date(year, month + 1, 1))}>→</Button>
          <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Novo evento"}</Button>
        </div>
      </header>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome do evento" placeholder="Ex: Cinema" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            <Input label="Data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />
            <Input label="Valor planejado (R$)" type="number" step="0.01" min="0" value={form.valorPlanejado} onChange={(e) => setForm({ ...form, valorPlanejado: e.target.value })} required />
            <Input label="Observação" placeholder="Opcional" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar evento"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
          {DIAS_SEMANA.map((d, i) => (
            <div key={i} className="py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (day === null) return <div key={i} />;
            const evs = eventosNoDia(day);
            const gastos = gastosNoDia(day);
            const isToday =
              today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(day)}
                className={`focus-ring flex min-h-16 flex-col items-start rounded-md border p-1.5 text-left text-xs transition-colors ${
                  isToday ? "border-money bg-moneySoft" : "border-line hover:bg-bg"
                } ${selectedDay === day ? "ring-2 ring-money" : ""}`}
              >
                <span className={`font-medium ${isToday ? "text-money" : "text-ink"}`}>{day}</span>
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {gastos.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-alert" title="conta fixa" />}
                  {evs.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-plan" title="evento" />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-alert" /> conta fixa</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-plan" /> evento</span>
        </div>
      </Card>

      {selectedDay !== null && (
        <Card>
          <h3 className="mb-2 font-display text-lg text-ink">
            {formatDateLong(new Date(year, month, selectedDay))}
          </h3>
          {gastosNoDia(selectedDay).length === 0 && eventosNoDia(selectedDay).length === 0 ? (
            <p className="text-sm text-muted">Nada planejado para este dia.</p>
          ) : (
            <ul className="space-y-2">
              {gastosNoDia(selectedDay).map((g) => (
                <li key={g.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{g.nome} <span className="text-muted">· conta fixa</span></span>
                  <span className="font-medium text-alert">{formatMoney(g.valor)}</span>
                </li>
              ))}
              {eventosNoDia(selectedDay).map((e) => (
                <li key={e.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ink">{e.nome}</span>
                    <span className="font-medium text-plan">{formatMoney(e.valorPlanejado)} planejado</span>
                  </div>
                  {e.observacao && <p className="text-xs text-muted">{e.observacao}</p>}
                  <div className="mt-1 flex items-center gap-2">
                    {e.valorGasto !== null ? (
                      <span className="text-xs text-muted">gasto real: {formatMoney(e.valorGasto)}</span>
                    ) : editingGasto?.id === e.id ? (
                      <>
                        <input
                          autoFocus
                          type="number"
                          step="0.01"
                          placeholder="Valor gasto"
                          className="focus-ring w-28 rounded-md border border-line px-2 py-1 text-xs"
                          value={editingGasto.valor}
                          onChange={(ev) => setEditingGasto({ id: e.id, valor: ev.target.value })}
                        />
                        <button
                          onClick={() => salvarValorGasto(e.id, editingGasto.valor)}
                          className="focus-ring text-xs font-medium text-money"
                        >
                          salvar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingGasto({ id: e.id, valor: "" })}
                        className="focus-ring text-xs text-muted underline hover:text-ink"
                      >
                        registrar valor gasto
                      </button>
                    )}
                    <button onClick={() => handleDelete(e.id)} className="focus-ring ml-auto text-xs text-muted hover:text-alert">
                      remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg text-ink">Eventos do mês</h2>
        {eventosDoMes.length === 0 ? (
          <EmptyState text="Nenhum evento planejado para este mês." />
        ) : (
          <ul className="space-y-2">
            {eventosDoMes.map((e) => (
              <li key={e.id}>
                <Card className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{e.nome}</p>
                    <p className="text-xs text-muted">{formatDateLong(e.data)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-plan">{formatMoney(e.valorPlanejado)}</p>
                    {e.valorGasto !== null && (
                      <p className="text-xs text-muted">gasto: {formatMoney(e.valorGasto)}</p>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
