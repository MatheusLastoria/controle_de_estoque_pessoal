import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const gasto = await prisma.gastoFixo.update({
    where: { id: params.id },
    data: {
      nome: body.nome,
      valor: body.valor !== undefined ? Number(body.valor) : undefined,
      diaVencimento: body.diaVencimento !== undefined ? Number(body.diaVencimento) : undefined,
      categoria: body.categoria,
      status: body.status,
    },
  });
  return NextResponse.json(gasto);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.gastoFixo.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
