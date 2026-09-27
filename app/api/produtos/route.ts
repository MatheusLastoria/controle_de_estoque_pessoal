import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const produtos = await prisma.produto.findMany({ orderBy: [{ marca: "asc" }, { sabor: "asc" }] });
  return NextResponse.json(produtos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.marca || !body.sabor || !body.tamanho || body.custo === undefined) {
    return NextResponse.json({ error: "Marca, sabor, tamanho e custo são obrigatórios." }, { status: 400 });
  }
  const produto = await prisma.produto.create({
    data: {
      marca: body.marca,
      sabor: body.sabor,
      tamanho: body.tamanho,
      custo: Number(body.custo),
      estoqueAtual: body.estoqueAtual !== undefined ? Number(body.estoqueAtual) : 0,
    },
  });
  return NextResponse.json(produto, { status: 201 });
}
