import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const produto = await prisma.produto.update({
    where: { id: params.id },
    data: {
      ...(body.marca !== undefined ? { marca: body.marca } : {}),
      ...(body.sabor !== undefined ? { sabor: body.sabor } : {}),
      ...(body.tamanho !== undefined ? { tamanho: body.tamanho } : {}),
      ...(body.custo !== undefined ? { custo: Number(body.custo) } : {}),
      ...(body.estoqueAtual !== undefined ? { estoqueAtual: Number(body.estoqueAtual) } : {}),
    },
  });
  return NextResponse.json(produto);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.produto.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
