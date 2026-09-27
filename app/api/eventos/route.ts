import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const eventos = await prisma.evento.findMany({ orderBy: { data: "asc" } });
  return NextResponse.json(eventos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.nome || !body.data || body.valorPlanejado === undefined) {
    return NextResponse.json({ error: "Nome, data e valor planejado são obrigatórios." }, { status: 400 });
  }
  const evento = await prisma.evento.create({
    data: {
      nome: body.nome,
      data: new Date(body.data),
      valorPlanejado: Number(body.valorPlanejado),
      observacao: body.observacao || null,
    },
  });
  return NextResponse.json(evento, { status: 201 });
}
