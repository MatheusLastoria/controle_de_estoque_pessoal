// Substitui a API "window.storage" (exclusiva do ambiente Claude) por uma
// versão que funciona em qualquer navegador, usando localStorage.
//
// Importante: os dados ficam salvos apenas no navegador/dispositivo que
// acessou o sistema (não são compartilhados entre computadores diferentes).
// Se no futuro você precisar que todos os usuários vejam os mesmos dados
// (estoque compartilhado entre lojas/computadores), será necessário trocar
// esta camada por uma API com um banco de dados real (ex: Vercel Postgres,
// Supabase, Firebase, etc).

export const storage = {
  async get(key) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      return { key, value: raw };
    } catch {
      return null;
    }
  },

  async set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return { key, value };
    } catch {
      return null;
    }
  },
};
