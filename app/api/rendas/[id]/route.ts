import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const renda = await prisma.renda.update({
    where: { id: params.id },
    data: { nome: body.nome, valor: body.valor !== undefined ? Number(body.valor) : undefined },
  });
  return NextResponse.json(renda);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.renda.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
