import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const evento = await prisma.evento.update({
    where: { id: params.id },
    data: {
      nome: body.nome,
      data: body.data ? new Date(body.data) : undefined,
      valorPlanejado: body.valorPlanejado !== undefined ? Number(body.valorPlanejado) : undefined,
      valorGasto: body.valorGasto !== undefined ? Number(body.valorGasto) : undefined,
      observacao: body.observacao,
    },
  });
  return NextResponse.json(evento);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.evento.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
