# Painel Financeiro Pessoal

Sistema simples de controle financeiro pessoal: rendas, gastos fixos, gastos variáveis, um calendário de eventos/compromissos e um módulo de controle do negócio de chocolates (produtos, compras e vendas por consignado/plataforma), com dashboard consolidado.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** para estilo
- **Prisma + PostgreSQL** para persistência real dos dados (necessário porque a Vercel roda em ambiente serverless — arquivos locais ou localStorage não sobrevivem entre execuções)

## Estrutura do projeto

```
app/
  page.tsx                 → Dashboard (saldo, renda, gastos, próximos vencimentos/eventos)
  rendas/page.tsx           → Cadastro de fontes de renda
  gastos-fixos/page.tsx     → Contas fixas mensais (nome, valor, vencimento, categoria, status)
  gastos-variaveis/page.tsx → Registro manual de gastos do dia a dia
  calendario/page.tsx       → Calendário mensal com contas e eventos, registro de valor gasto
  chocolates/
    produtos/page.tsx        → Cadastro de produtos (marca, sabor, tamanho, custo, estoque)
    compras/page.tsx         → Registro de compras (produto, frete, cupom, investimento)
    consignados/page.tsx     → Plataformas/parceiros de consignação, comissão e vendas por produto
  api/                       → Rotas REST (GET/POST/PUT/DELETE) para cada entidade
components/
  ui.tsx                     → Input, Select, Button, Card, EmptyState
  Nav.tsx                    → Navegação lateral/superior
lib/
  prisma.ts                  → Cliente Prisma
  utils.ts                   → Formatação de moeda/data e cálculos de mês
prisma/
  schema.prisma              → Modelos: Renda, GastoFixo, GastoVariavel, Evento, Produto, Compra, Consignado, Venda
```

## Rodando localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Crie um banco Postgres gratuito.** Opções simples:
   - [Neon](https://neon.tech) (recomendado, tem plano gratuito generoso)
   - [Vercel Postgres](https://vercel.com/storage/postgres) (integrado à Vercel)
   - [Supabase](https://supabase.com)

3. **Configure a variável de ambiente:**
   ```bash
   cp .env.example .env
   ```
   Edite `.env` e cole a `DATABASE_URL` do seu banco.

4. **Crie as tabelas no banco:**
   ```bash
   npx prisma db push
   ```

5. **Rode o projeto:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

## Deploy na Vercel

1. Suba este projeto para um repositório no GitHub (ou GitLab/Bitbucket).
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, adicione `DATABASE_URL` com a connection string do seu Postgres (Neon/Vercel Postgres/Supabase).
   - Se usar o próprio **Vercel Postgres**, ao criar o banco pelo painel da Vercel a variável já é preenchida automaticamente.
4. Clique em **Deploy**. O `postinstall` já roda `prisma generate` automaticamente.
5. Após o primeiro deploy, rode a criação das tabelas uma vez (pode ser da sua máquina, apontando para o mesmo banco):
   ```bash
   npx prisma db push
   ```

Pronto — o sistema estará no ar com dados persistentes.

## Observações sobre o modelo de dados

- **Gastos fixos** têm um status único (pago/pendente) — pense neles como "a conta deste mês". Ao virar o mês, edite o status de volta para "pendente" nas contas que já foram pagas (uma automação de reset mensal pode ser adicionada depois, se fizer falta).
- **Gastos variáveis** e **eventos** têm data própria, então o dashboard já filtra automaticamente pelo mês corrente.
- Não há cartão de crédito, investimentos financeiros ou funcionalidades empresariais além do módulo de chocolates — por design, conforme pedido.

## Módulo Chocolates (produtos, compras e consignados)

Baseado na planilha de controle de chocolates (`Produto`, `Compras`, `Controle`, `Estoque`):

- **Produtos**: cadastro de marca, sabor, tamanho e custo unitário. O estoque atual pode ser editado diretamente na lista (compra recebida, ajuste manual etc.).
- **Compras**: cada compra registra valor dos produtos, frete, cupom/desconto e "investimento" (embalagens, banners, cartões de visita etc. — o que na planilha aparece na aba Investimento). O card mostra o custo total já líquido do cupom.
- **Consignados**: cada plataforma/parceiro (Shopee, mercado livre, uma pessoa que revende etc.) tem uma comissão/desconto percentual própria. Ao registrar uma venda para um consignado, o sistema:
  - dá baixa automática no estoque do produto vendido;
  - calcula o valor bruto, a comissão (gasto) e o líquido recebido daquele consignado — equivalente às colunas "Entrada/Vendas/Estoque" e aos percentuais de "Consignação/Shopee" da planilha.
- O cabeçalho da página de consignados soma tudo: total bruto vendido, total pago em comissões e o líquido — o mesmo papel da aba Controle (Ganhos totais / Gasto compra / Lucro), mas calculado automaticamente a partir das vendas lançadas, em vez de digitado à mão.

Depois de colar o novo `schema.prisma`, rode `npx prisma db push` novamente para criar as tabelas `Produto`, `Compra`, `Consignado` e `Venda` no banco.
