import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entregas = await prisma.entrega.findMany({
    orderBy: { data: "desc" },
    include: { produto: true, consignado: true },
  });
  return NextResponse.json(entregas);
}

// Entrega = transferência de estoque de casa (Produto.estoqueAtual) para um consignado.
// Reduz o estoque em casa; o estoque local do consignado é sempre calculado como
// soma(entregas) - soma(vendas) daquele produto naquele consignado.
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.produtoId || !body.consignadoId || !body.quantidade) {
    return NextResponse.json(
      { error: "Produto, consignado e quantidade são obrigatórios." },
      { status: 400 }
    );
  }

  const entrega = await prisma.$transaction(async (tx) => {
    const nova = await tx.entrega.create({
      data: {
        produtoId: body.produtoId,
        consignadoId: body.consignadoId,
        quantidade: Number(body.quantidade),
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

  return NextResponse.json(entrega, { status: 201 });
}
