import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const compras = await prisma.compra.findMany({ orderBy: { data: "desc" } });
  return NextResponse.json(compras);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.valorProdutos === undefined) {
    return NextResponse.json({ error: "Valor dos produtos é obrigatório." }, { status: 400 });
  }
  const compra = await prisma.compra.create({
    data: {
      data: body.data ? new Date(body.data) : new Date(),
      fornecedor: body.fornecedor || null,
      valorProdutos: Number(body.valorProdutos),
      frete: body.frete ? Number(body.frete) : 0,
      cupomDesconto: body.cupomDesconto ? Number(body.cupomDesconto) : 0,
      investimento: body.investimento ? Number(body.investimento) : 0,
      observacao: body.observacao || null,
    },
  });
  return NextResponse.json(compra, { status: 201 });
}
