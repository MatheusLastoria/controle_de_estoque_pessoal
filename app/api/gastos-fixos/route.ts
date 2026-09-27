import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const gastos = await prisma.gastoFixo.findMany({ orderBy: { diaVencimento: "asc" } });
  return NextResponse.json(gastos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.nome || body.valor === undefined || !body.diaVencimento || !body.categoria) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
  }
  const gasto = await prisma.gastoFixo.create({
    data: {
      nome: body.nome,
      valor: Number(body.valor),
      diaVencimento: Number(body.diaVencimento),
      categoria: body.categoria,
      status: body.status ?? "pendente",
    },
  });
  return NextResponse.json(gasto, { status: 201 });
}
