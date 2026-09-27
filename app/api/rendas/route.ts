import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rendas = await prisma.renda.findMany({ orderBy: { criadoEm: "asc" } });
  return NextResponse.json(rendas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.nome || body.valor === undefined) {
    return NextResponse.json({ error: "Nome e valor são obrigatórios." }, { status: 400 });
  }
  const renda = await prisma.renda.create({
    data: { nome: body.nome, valor: Number(body.valor) },
  });
  return NextResponse.json(renda, { status: 201 });
}
