import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const consignados = await prisma.consignado.findMany({
    orderBy: { nome: "asc" },
    include: { vendas: { include: { produto: true } } },
  });
  return NextResponse.json(consignados);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.nome) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }
  const consignado = await prisma.consignado.create({
    data: {
      nome: body.nome,
      comissaoPercentual: body.comissaoPercentual ? Number(body.comissaoPercentual) : 0,
    },
  });
  return NextResponse.json(consignado, { status: 201 });
}
