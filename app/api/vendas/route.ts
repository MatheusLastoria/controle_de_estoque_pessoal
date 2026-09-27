import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const vendas = await prisma.venda.findMany({
    orderBy: { data: "desc" },
    include: { produto: true, consignado: true },
  });
  return NextResponse.json(vendas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.produtoId || !body.consignadoId || !body.quantidade || body.valorUnitario === undefined) {
    return NextResponse.json(
      { error: "Produto, consignado, quantidade e valor unitário são obrigatórios." },
      { status: 400 }
    );
  }

  const venda = await prisma.$transaction(async (tx) => {
    const nova = await tx.venda.create({
      data: {
        produtoId: body.produtoId,
        consignadoId: body.consignadoId,
        quantidade: Number(body.quantidade),
        valorUnitario: Number(body.valorUnitario),
        data: body.data ? new Date(body.data) : new Date(),
      },
      include: { produto: true, consignado: true },
    });
    await tx.produto.update({
      where: { id: body.produtoId },
      data: { estoqueAtual: { decrement: Number(body.quantidade) } },
    });
    return nova;
  });

  return NextResponse.json(venda, { status: 201 });
}
