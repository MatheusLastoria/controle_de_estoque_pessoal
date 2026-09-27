import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.$transaction(async (tx) => {
    const entrega = await tx.entrega.findUnique({ where: { id: params.id } });
    if (entrega) {
      await tx.produto.update({
        where: { id: entrega.produtoId },
        data: { estoqueAtual: { increment: entrega.quantidade } },
      });
      await tx.entrega.delete({ where: { id: params.id } });
    }
  });
  return NextResponse.json({ ok: true });
}
