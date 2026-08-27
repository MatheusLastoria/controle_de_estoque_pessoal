import { useState, useEffect, useMemo } from "react";
import {
  Package, Users, ShoppingCart, Boxes, LogOut, Plus, Trash2, Pencil,
  X, Check, AlertTriangle, LayoutDashboard, ArrowUpCircle, ArrowDownCircle,
  Search, Loader2
} from "lucide-react";
import { storage } from "./storage";

const ACCESS_CODES = ["RC003", "IL001", "ST002"];
const STORAGE_KEY = "dados-sistema";

const emptyData = () => ({ clientes: [], produtos: [], vendas: [], movimentacoes: [] });

function nextId(list) {
  return list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1;
}

function formatBRL(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function formatData(ts) {
  return new Date(ts).toLocaleString("pt-BR");
}

// ---------- Modal genérico ----------
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800 tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500";

// ---------- Login ----------
function LoginScreen({ onLogin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (ACCESS_CODES.includes(clean)) {
      onLogin(clean);
    } else {
      setError("Código de acesso inválido.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="bg-amber-500 rounded-lg p-2">
            <Boxes className="text-slate-900" size={24} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">EstoqueCerto</span>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-6">
          <h1 className="text-slate-800 font-semibold text-lg mb-1">Acesso ao sistema</h1>
          <p className="text-slate-500 text-sm mb-4">Digite seu código de acesso para entrar.</p>
          <input
            autoFocus
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(""); }}
            placeholder="Ex: RC003"
            className={inputCls + " text-center tracking-widest font-mono uppercase mb-3"}
          />
          {error && (
            <p className="text-red-600 text-xs mb-3 flex items-center gap-1">
              <AlertTriangle size={14} /> {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg py-2 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------- Sidebar ----------
function Sidebar({ tab, setTab, user, onLogout }) {
  const items = [
    { id: "inicio", label: "Início", icon: LayoutDashboard },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "produtos", label: "Produtos", icon: Package },
    { id: "estoque", label: "Estoque", icon: Boxes },
    { id: "vendas", label: "Vendas", icon: ShoppingCart },
  ];
  return (
    <div className="w-56 bg-slate-900 flex flex-col shrink-0 min-h-screen">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="bg-amber-500 rounded-lg p-1.5">
          <Boxes className="text-slate-900" size={18} />
        </div>
        <span className="text-white font-bold tracking-tight">EstoqueCerto</span>
      </div>
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-amber-500 text-slate-900" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon size={17} /> {it.label}
            </button>
          );
        })}
      </nav>
      <div className="px-3 pb-5 pt-3 border-t border-slate-800 mt-3">
        <div className="text-xs text-slate-400 px-2 mb-2">Usuário: <span className="font-mono text-slate-200">{user}</span></div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------- Início ----------
function Inicio({ data }) {
  const { clientes, produtos, vendas } = data;
  const estoqueBaixo = produtos.filter((p) => p.quantidade <= 5);
  const hoje = new Date();
  const vendasMes = vendas.filter((v) => {
    const d = new Date(v.data);
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  });
  const totalMes = vendasMes.reduce((s, v) => s + v.total, 0);

  const cards = [
    { label: "Clientes cadastrados", value: clientes.length, icon: Users },
    { label: "Produtos cadastrados", value: produtos.length, icon: Package },
    { label: "Vendas no mês", value: vendasMes.length, icon: ShoppingCart },
    { label: "Faturado no mês", value: formatBRL(totalMes), icon: Boxes },
  ];

  return (
    <div>
      <PageHeader title="Início" subtitle="Resumo geral do sistema" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <Icon className="text-amber-500 mb-2" size={20} />
              <div className="text-xl font-bold text-slate-800">{c.value}</div>
              <div className="text-xs text-slate-500">{c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" /> Produtos com estoque baixo (≤ 5 un.)
        </h3>
        {estoqueBaixo.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum produto com estoque baixo. 👍</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {estoqueBaixo.map((p) => (
              <li key={p.id} className="py-2 flex justify-between text-sm">
                <span className="text-slate-700">{p.nome} <span className="text-slate-400">({p.codigo})</span></span>
                <span className="font-semibold text-red-600">{p.quantidade} un.</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------- Clientes ----------
function ClientesTab({ data, mutate }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", endereco: "" });

  function openNew() {
    setEditing(null);
    setForm({ nome: "", telefone: "", email: "", endereco: "" });
    setShowForm(true);
  }
  function openEdit(c) {
    setEditing(c.id);
    setForm({ nome: c.nome, telefone: c.telefone, email: c.email, endereco: c.endereco });
    setShowForm(true);
  }
  function save(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    mutate((d) => {
      const clientes = [...d.clientes];
      if (editing) {
        const idx = clientes.findIndex((c) => c.id === editing);
        clientes[idx] = { ...clientes[idx], ...form };
      } else {
        clientes.push({ id: nextId(clientes), ...form });
      }
      return { ...d, clientes };
    });
    setShowForm(false);
  }
  function remove(id) {
    if (!confirm("Remover este cliente?")) return;
    mutate((d) => ({ ...d, clientes: d.clientes.filter((c) => c.id !== id) }));
  }

  const filtered = data.clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${data.clientes.length} cliente(s) cadastrado(s)`}
        action={
          <button onClick={openNew} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg px-4 py-2 text-sm flex items-center gap-2">
            <Plus size={16} /> Novo cliente
          </button>
        }
      />
      <div className="relative mb-4 max-w-xs">
        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..." className={inputCls + " pl-9"} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Telefone</th>
              <th className="text-left px-4 py-3">E-mail</th>
              <th className="text-left px-4 py-3">Endereço</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{c.nome}</td>
                <td className="px-4 py-3 text-slate-600">{c.telefone || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{c.email || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{c.endereco || "-"}</td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <button onClick={() => openEdit(c)} className="text-slate-400 hover:text-amber-600"><Pencil size={15} /></button>
                  <button onClick={() => remove(c.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center text-slate-400 py-8">Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? "Editar cliente" : "Novo cliente"} onClose={() => setShowForm(false)}>
          <form onSubmit={save}>
            <Field label="Nome *">
              <input required className={inputCls} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </Field>
            <Field label="Telefone">
              <input className={inputCls} value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </Field>
            <Field label="E-mail">
              <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Endereço">
              <input className={inputCls} value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            </Field>
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg py-2 mt-2">Salvar</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ---------- Produtos ----------
function ProdutosTab({ data, mutate }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nome: "", codigo: "", categoria: "", preco: "", quantidade: "" });

  function openNew() {
    setEditing(null);
    setForm({ nome: "", codigo: "", categoria: "", preco: "", quantidade: "" });
    setShowForm(true);
  }
  function openEdit(p) {
    setEditing(p.id);
    setForm({ nome: p.nome, codigo: p.codigo, categoria: p.categoria, preco: p.preco, quantidade: p.quantidade });
    setShowForm(true);
  }
  function save(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.codigo.trim()) return;
    mutate((d) => {
      const produtos = [...d.produtos];
      const movimentacoes = [...d.movimentacoes];
      if (editing) {
        const idx = produtos.findIndex((p) => p.id === editing);
        produtos[idx] = { ...produtos[idx], nome: form.nome, codigo: form.codigo, categoria: form.categoria, preco: Number(form.preco) || 0 };
      } else {
        const id = nextId(produtos);
        const qtd = Number(form.quantidade) || 0;
        produtos.push({ id, nome: form.nome, codigo: form.codigo, categoria: form.categoria, preco: Number(form.preco) || 0, quantidade: qtd });
        if (qtd > 0) {
          movimentacoes.push({ id: nextId(movimentacoes), produtoId: id, produtoNome: form.nome, tipo: "entrada", quantidade: qtd, motivo: "Estoque inicial", data: Date.now() });
        }
      }
      return { ...d, produtos, movimentacoes };
    });
    setShowForm(false);
  }
  function remove(id) {
    if (!confirm("Remover este produto?")) return;
    mutate((d) => ({ ...d, produtos: d.produtos.filter((p) => p.id !== id) }));
  }

  const filtered = data.produtos.filter(
    (p) => p.nome.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${data.produtos.length} produto(s) cadastrado(s)`}
        action={
          <button onClick={openNew} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg px-4 py-2 text-sm flex items-center gap-2">
            <Plus size={16} /> Novo produto
          </button>
        }
      />
      <div className="relative mb-4 max-w-xs">
        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou código..." className={inputCls + " pl-9"} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Categoria</th>
              <th className="text-right px-4 py-3">Preço</th>
              <th className="text-right px-4 py-3">Estoque</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-slate-500">{p.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{p.nome}</td>
                <td className="px-4 py-3 text-slate-600">{p.categoria || "-"}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatBRL(p.preco)}</td>
                <td className={`px-4 py-3 text-right font-semibold ${p.quantidade <= 5 ? "text-red-600" : "text-slate-700"}`}>{p.quantidade}</td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-amber-600"><Pencil size={15} /></button>
                  <button onClick={() => remove(p.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-400 py-8">Nenhum produto encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? "Editar produto" : "Novo produto"} onClose={() => setShowForm(false)}>
          <form onSubmit={save}>
            <Field label="Nome *">
              <input required className={inputCls} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </Field>
            <Field label="Código (SKU) *">
              <input required className={inputCls} value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
            </Field>
            <Field label="Categoria">
              <input className={inputCls} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            </Field>
            <Field label="Preço (R$)">
              <input type="number" step="0.01" min="0" className={inputCls} value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
            </Field>
            {!editing && (
              <Field label="Quantidade inicial em estoque">
                <input type="number" min="0" className={inputCls} value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
              </Field>
            )}
            {editing && (
              <p className="text-xs text-slate-400 mb-3">Para ajustar a quantidade em estoque, use a aba "Estoque".</p>
            )}
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg py-2 mt-2">Salvar</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ---------- Estoque ----------
function EstoqueTab({ data, mutate }) {
  const [adjusting, setAdjusting] = useState(null);
  const [form, setForm] = useState({ tipo: "entrada", quantidade: "", motivo: "" });

  function openAdjust(p) {
    setAdjusting(p);
    setForm({ tipo: "entrada", quantidade: "", motivo: "" });
  }

  function save(e) {
    e.preventDefault();
    const qtd = Number(form.quantidade);
    if (!qtd || qtd <= 0) return;
    mutate((d) => {
      const produtos = [...d.produtos];
      const idx = produtos.findIndex((p) => p.id === adjusting.id);
      const atual = produtos[idx].quantidade;
      const nova = form.tipo === "entrada" ? atual + qtd : atual - qtd;
      if (nova < 0) {
        alert("Quantidade insuficiente em estoque para essa saída.");
        return d;
      }
      produtos[idx] = { ...produtos[idx], quantidade: nova };
      const movimentacoes = [
        ...d.movimentacoes,
        { id: nextId(d.movimentacoes), produtoId: adjusting.id, produtoNome: adjusting.nome, tipo: form.tipo, quantidade: qtd, motivo: form.motivo || (form.tipo === "entrada" ? "Entrada manual" : "Saída manual"), data: Date.now() },
      ];
      return { ...d, produtos, movimentacoes };
    });
    setAdjusting(null);
  }

  const historico = [...data.movimentacoes].sort((a, b) => b.data - a.data).slice(0, 25);

  return (
    <div>
      <PageHeader title="Estoque" subtitle="Consulte e ajuste as quantidades em estoque" />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Produto</th>
              <th className="text-right px-4 py-3">Quantidade</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.produtos.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-slate-500">{p.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{p.nome}</td>
                <td className={`px-4 py-3 text-right font-semibold ${p.quantidade <= 5 ? "text-red-600" : "text-slate-700"}`}>{p.quantidade} un.</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openAdjust(p)} className="text-amber-600 hover:text-amber-700 text-xs font-semibold">Ajustar</button>
                </td>
              </tr>
            ))}
            {data.produtos.length === 0 && (
              <tr><td colSpan={4} className="text-center text-slate-400 py-8">Nenhum produto cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="font-semibold text-slate-800 mb-3">Histórico de movimentações</h3>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Data</th>
              <th className="text-left px-4 py-3">Produto</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-right px-4 py-3">Qtd.</th>
              <th className="text-left px-4 py-3">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {historico.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 text-slate-500">{formatData(m.data)}</td>
                <td className="px-4 py-3 text-slate-700">{m.produtoNome}</td>
                <td className="px-4 py-3">
                  {m.tipo === "entrada" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium"><ArrowUpCircle size={14} /> Entrada</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 font-medium"><ArrowDownCircle size={14} /> Saída</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{m.quantidade}</td>
                <td className="px-4 py-3 text-slate-500">{m.motivo}</td>
              </tr>
            ))}
            {historico.length === 0 && (
              <tr><td colSpan={5} className="text-center text-slate-400 py-8">Nenhuma movimentação registrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {adjusting && (
        <Modal title={`Ajustar estoque — ${adjusting.nome}`} onClose={() => setAdjusting(null)}>
          <p className="text-xs text-slate-500 mb-3">Quantidade atual: <span className="font-semibold text-slate-700">{adjusting.quantidade} un.</span></p>
          <form onSubmit={save}>
            <Field label="Tipo de movimentação">
              <select className={inputCls} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="entrada">Entrada (adicionar)</option>
                <option value="saida">Saída (remover)</option>
              </select>
            </Field>
            <Field label="Quantidade *">
              <input required type="number" min="1" className={inputCls} value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
            </Field>
            <Field label="Motivo">
              <input placeholder="Ex: compra de fornecedor, perda, ajuste..." className={inputCls} value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
            </Field>
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg py-2 mt-2">Confirmar</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ---------- Vendas ----------
function VendasTab({ data, mutate, user }) {
  const [clienteId, setClienteId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [qtd, setQtd] = useState("1");
  const [carrinho, setCarrinho] = useState([]);
  const [showHistorico, setShowHistorico] = useState(false);

  const produtoSelecionado = data.produtos.find((p) => p.id === Number(produtoId));
  const jaNoCarrinho = carrinho.filter((i) => i.produtoId === Number(produtoId)).reduce((s, i) => s + i.quantidade, 0);
  const disponivel = produtoSelecionado ? produtoSelecionado.quantidade - jaNoCarrinho : 0;

  function addItem() {
    const q = Number(qtd);
    if (!produtoSelecionado || !q || q <= 0) return;
    if (q > disponivel) {
      alert(`Estoque insuficiente. Disponível: ${disponivel} un.`);
      return;
    }
    setCarrinho((c) => {
      const idx = c.findIndex((i) => i.produtoId === produtoSelecionado.id);
      if (idx >= 0) {
        const copy = [...c];
        copy[idx] = { ...copy[idx], quantidade: copy[idx].quantidade + q };
        return copy;
      }
      return [...c, { produtoId: produtoSelecionado.id, nome: produtoSelecionado.nome, preco: produtoSelecionado.preco, quantidade: q }];
    });
    setQtd("1");
  }

  function removeItem(produtoId) {
    setCarrinho((c) => c.filter((i) => i.produtoId !== produtoId));
  }

  const total = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);

  function finalizarVenda() {
    if (!clienteId || carrinho.length === 0) return;
    mutate((d) => {
      const produtos = [...d.produtos];
      const movimentacoes = [...d.movimentacoes];
      const vendaId = nextId(d.vendas);
      for (const item of carrinho) {
        const idx = produtos.findIndex((p) => p.id === item.produtoId);
        if (idx === -1 || produtos[idx].quantidade < item.quantidade) {
          alert(`Estoque insuficiente para ${item.nome}. Venda cancelada.`);
          throw new Error("estoque insuficiente");
        }
      }
      for (const item of carrinho) {
        const idx = produtos.findIndex((p) => p.id === item.produtoId);
        produtos[idx] = { ...produtos[idx], quantidade: produtos[idx].quantidade - item.quantidade };
        movimentacoes.push({
          id: nextId(movimentacoes), produtoId: item.produtoId, produtoNome: item.nome,
          tipo: "saida", quantidade: item.quantidade, motivo: `Venda #${vendaId}`, data: Date.now(),
        });
      }
      const cliente = d.clientes.find((c) => c.id === Number(clienteId));
      const vendas = [...d.vendas, {
        id: vendaId, data: Date.now(), clienteId: Number(clienteId), clienteNome: cliente?.nome || "-",
        itens: carrinho, total, vendedor: user,
      }];
      return { ...d, produtos, vendas, movimentacoes };
    });
    setCarrinho([]);
    setClienteId("");
  }

  const historico = [...data.vendas].sort((a, b) => b.data - a.data);

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Registre uma venda e o estoque é atualizado automaticamente"
        action={
          <button onClick={() => setShowHistorico((s) => !s)} className="text-sm font-semibold text-amber-600 hover:text-amber-700">
            {showHistorico ? "Nova venda" : "Ver histórico de vendas"}
          </button>
        }
      />

      {showHistorico ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Data</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Itens</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Vendedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historico.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 text-slate-500">{formatData(v.data)}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{v.clienteNome}</td>
                  <td className="px-4 py-3 text-slate-600">{v.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(", ")}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatBRL(v.total)}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{v.vendedor}</td>
                </tr>
              ))}
              {historico.length === 0 && (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">Nenhuma venda registrada ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <Field label="Cliente *">
              <select className={inputCls} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Selecione um cliente</option>
                {data.clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </Field>
            {data.clientes.length === 0 && <p className="text-xs text-red-500 -mt-2 mb-3">Cadastre um cliente antes de vender.</p>}

            <div className="flex gap-2">
              <div className="flex-1">
                <Field label="Produto">
                  <select className={inputCls} value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
                    <option value="">Selecione um produto</option>
                    {data.produtos.map((p) => <option key={p.id} value={p.id} disabled={p.quantidade <= 0}>{p.nome} ({p.quantidade} un.)</option>)}
                  </select>
                </Field>
              </div>
              <div className="w-24">
                <Field label="Qtd.">
                  <input type="number" min="1" className={inputCls} value={qtd} onChange={(e) => setQtd(e.target.value)} />
                </Field>
              </div>
            </div>
            {produtoSelecionado && (
              <p className="text-xs text-slate-400 -mt-2 mb-3">Disponível: {disponivel} un. &middot; {formatBRL(produtoSelecionado.preco)} / un.</p>
            )}
            <button onClick={addItem} disabled={!produtoId} className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-semibold rounded-lg py-2 text-sm flex items-center justify-center gap-2">
              <Plus size={16} /> Adicionar item
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-3">Carrinho</h3>
            {carrinho.length === 0 ? (
              <p className="text-sm text-slate-400 flex-1">Nenhum item adicionado.</p>
            ) : (
              <ul className="divide-y divide-slate-100 mb-3 flex-1">
                {carrinho.map((i) => (
                  <li key={i.produtoId} className="py-2 flex justify-between items-center text-sm">
                    <div>
                      <div className="text-slate-700 font-medium">{i.nome}</div>
                      <div className="text-slate-400 text-xs">{i.quantidade} x {formatBRL(i.preco)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-800">{formatBRL(i.preco * i.quantidade)}</span>
                      <button onClick={() => removeItem(i.produtoId)} className="text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center mb-3">
              <span className="text-slate-500 text-sm">Total</span>
              <span className="text-xl font-bold text-slate-800">{formatBRL(total)}</span>
            </div>
            <button
              onClick={finalizarVenda}
              disabled={!clienteId || carrinho.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-900 font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2"
            >
              <Check size={17} /> Finalizar venda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- App principal ----------
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("inicio");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(STORAGE_KEY);
        setData(res ? JSON.parse(res.value) : emptyData());
      } catch {
        setData(emptyData());
      }
      setLoading(false);
    })();
  }, []);

  async function mutate(updater) {
    setData((prev) => {
      let next;
      try {
        next = updater(prev);
      } catch {
        return prev;
      }
      storage.set(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  if (!user) return <LoginScreen onLogin={setUser} />;

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-amber-500" size={28} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar tab={tab} setTab={setTab} user={user} onLogout={() => setUser(null)} />
      <main className="flex-1 p-8 max-w-6xl">
        {tab === "inicio" && <Inicio data={data} />}
        {tab === "clientes" && <ClientesTab data={data} mutate={mutate} />}
        {tab === "produtos" && <ProdutosTab data={data} mutate={mutate} />}
        {tab === "estoque" && <EstoqueTab data={data} mutate={mutate} />}
        {tab === "vendas" && <VendasTab data={data} mutate={mutate} user={user} />}
      </main>
    </div>
  );
}
