# EstoqueCerto

Sistema simples de estoque, clientes e vendas, pronto para rodar como site
comum na web e ser publicado na Vercel.

## O que mudou em relação ao arquivo original

O arquivo original usava `window.storage`, uma API que só existe dentro do
ambiente de artifacts do Claude. Ela foi substituída por `src/storage.js`,
que salva os dados no `localStorage` do navegador — funciona em qualquer
site normal, sem precisar de backend nem de configuração extra.

**Atenção:** com `localStorage`, os dados ficam salvos só no navegador que
foi usado para cadastrar (ex: se você usar no notebook e depois abrir no
celular, os dados não aparecem lá). Isso é ótimo para começar rápido e sem
custo. Se depois você precisar que **todos os computadores/usuários vejam
os mesmos dados** (um estoque único, compartilhado), me avise — dá para
trocar `src/storage.js` por uma API que salva num banco de dados real
(ex: Vercel Postgres, Supabase, Firebase), mantendo o resto do sistema
igual.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

## Publicar na Vercel (passo a passo)

### Opção 1 — sem usar terminal (mais fácil)
1. Crie uma conta em https://vercel.com (dá para entrar com GitHub).
2. Suba esta pasta para um repositório no GitHub (pode arrastar os arquivos
   pela própria interface do GitHub, em "Add file" → "Upload files").
3. Na Vercel, clique em **Add New... → Project**, selecione o repositório.
4. A Vercel detecta automaticamente que é um projeto Vite. Não precisa mudar
   nada — clique em **Deploy**.
5. Em menos de um minuto você recebe um link público (algo como
   `seu-projeto.vercel.app`).

### Opção 2 — via terminal (CLI da Vercel)
```bash
npm install -g vercel
vercel
```
Siga as perguntas na tela (aceite as opções padrão) e ao final ele publica
o site e mostra o link.

## Códigos de acesso

Os códigos válidos para entrar no sistema estão no topo do arquivo
`src/App.jsx`, na constante `ACCESS_CODES`. Edite essa lista para trocar,
adicionar ou remover códigos:

```js
const ACCESS_CODES = ["RC003", "IL001", "ST002"];
```

Vale lembrar que esse é um controle de acesso simples (só no navegador),
não é uma autenticação segura — qualquer pessoa que veja o código no
próprio arquivo do site consegue entrar. Para algo mais seguro (login com
senha de verdade, por usuário), também dá pra evoluir depois.
