export function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Primeiro e último dia do mês corrente (para filtrar gastos variáveis/eventos do mês)
export function currentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export function isSameMonth(date: Date | string, ref: Date = new Date()): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

// Quantos dias faltam até o vencimento (dia do mês) — considera próximo mês se já passou
export function daysUntilDueDay(diaVencimento: number): number {
  const now = new Date();
  let due = new Date(now.getFullYear(), now.getMonth(), diaVencimento);
  if (due < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    due = new Date(now.getFullYear(), now.getMonth() + 1, diaVencimento);
  }
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const CATEGORIAS_FIXAS = [
  "Moradia", "Internet", "Telefone", "Energia", "Água", "Assinatura", "Transporte", "Outro",
];

export const CATEGORIAS_VARIAVEIS = [
  "Alimentação", "Lazer", "Transporte", "Saúde", "Compras", "Mercado", "Outro",
];
