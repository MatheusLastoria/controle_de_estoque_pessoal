import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.$transaction(async (tx) => {
    const venda = await tx.venda.findUnique({ where: { id: params.id } });
    if (venda) {
      await tx.produto.update({
        where: { id: venda.produtoId },
        data: { estoqueAtual: { increment: venda.quantidade } },
      });
      await tx.venda.delete({ where: { id: params.id } });
    }
  });
  return NextResponse.json({ ok: true });
}
