import { prisma } from "@/lib/prisma";
import { Card, EmptyState } from "@/components/ui";
import { formatMoney, formatDate, currentMonthRange, daysUntilDueDay, MESES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { start, end } = currentMonthRange();
  const now = new Date();

  const [rendas, gastosFixos, gastosVariaveis, eventos] = await Promise.all([
    prisma.renda.findMany(),
    prisma.gastoFixo.findMany({ orderBy: { diaVencimento: "asc" } }),
    prisma.gastoVariavel.findMany({ where: { data: { gte: start, lte: end } } }),
    prisma.evento.findMany({ where: { data: { gte: now } }, orderBy: { data: "asc" }, take: 5 }),
  ]);

  const rendaTotal = rendas.reduce((s, r) => s + r.valor, 0);
  const fixosTotal = gastosFixos.reduce((s, g) => s + g.valor, 0);
  const fixosPagos = gastosFixos.filter((g) => g.status === "pago").reduce((s, g) => s + g.valor, 0);
  const variaveisTotal = gastosVariaveis.reduce((s, g) => s + g.valor, 0);
  const gastoTotal = fixosTotal + variaveisTotal;
  const disponivel = rendaTotal - gastoTotal;

  const proximosVencimentos = gastosFixos
    .filter((g) => g.status === "pendente")
    .map((g) => ({ ...g, dias: daysUntilDueDay(g.diaVencimento) }))
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 5);

  const mesAtual = MESES[now.getMonth()];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted">{mesAtual} de {now.getFullYear()}</p>
        <h1 className="font-display text-3xl text-ink">Painel financeiro</h1>
      </header>

      <Card className="bg-ink">
        <p className="text-sm text-white/60">Saldo disponível no mês</p>
        <p className={`font-display text-5xl ${disponivel >= 0 ? "text-white" : "text-alert"}`}>
          {formatMoney(disponivel)}
        </p>
        <p className="mt-2 text-sm text-white/60">
          de {formatMoney(rendaTotal)} de renda, {formatMoney(gastoTotal)} já comprometidos
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Renda do mês" value={formatMoney(rendaTotal)} />
        <Stat label="Gastos fixos" value={formatMoney(fixosTotal)} sub={`${formatMoney(fixosPagos)} pagos`} />
        <Stat label="Gastos variáveis" value={formatMoney(variaveisTotal)} sub="neste mês" />
        <Stat
          label="Ainda posso gastar"
          value={formatMoney(disponivel)}
          tone={disponivel >= 0 ? "money" : "alert"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-lg text-ink">Próximos vencimentos</h2>
          {proximosVencimentos.length === 0 ? (
            <EmptyState text="Nenhuma conta pendente. Tudo em dia." />
          ) : (
            <ul className="space-y-2">
              {proximosVencimentos.map((g) => (
                <li key={g.id}>
                  <Card className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{g.nome}</p>
                      <p className="text-xs text-muted">
                        vence dia {g.diaVencimento} · {g.dias === 0 ? "hoje" : g.dias === 1 ? "amanhã" : `em ${g.dias} dias`}
                      </p>
                    </div>
                    <span className="font-medium text-ink">{formatMoney(g.valor)}</span>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg text-ink">Próximos eventos</h2>
          {eventos.length === 0 ? (
            <EmptyState text="Nenhum evento planejado. Que tal marcar algo?" />
          ) : (
            <ul className="space-y-2">
              {eventos.map((e) => (
                <li key={e.id}>
                  <Card className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{e.nome}</p>
                      <p className="text-xs text-muted">{formatDate(e.data)}</p>
                    </div>
                    <span className="font-medium text-plan">{formatMoney(e.valorPlanejado)}</span>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "ink",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "ink" | "money" | "alert";
}) {
  const toneClass = tone === "money" ? "text-money" : tone === "alert" ? "text-alert" : "text-ink";
  return (
    <Card>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl ${toneClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </Card>
  );
}
