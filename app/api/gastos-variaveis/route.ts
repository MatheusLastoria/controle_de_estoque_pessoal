import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const gastos = await prisma.gastoVariavel.findMany({ orderBy: { data: "desc" } });
  return NextResponse.json(gastos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.nome || body.valor === undefined) {
    return NextResponse.json({ error: "Nome e valor são obrigatórios." }, { status: 400 });
  }
  const gasto = await prisma.gastoVariavel.create({
    data: {
      nome: body.nome,
      valor: Number(body.valor),
      categoria: body.categoria || null,
      data: body.data ? new Date(body.data) : new Date(),
    },
  });
  return NextResponse.json(gasto, { status: 201 });
}
