/*
  Estado global da aplicação (sessão, unidade escolhida, carrinho, consentimento LGPD e canal de atendimento). Tudo é mantido em memória + persistido em localStorage, simulando uma sessão de usuário sem backend real.

  Um pequeno padrão "observador" (subscribe/notificar) permite que a navbar e outras telas reajam a mudanças (ex: contador do carrinho) sem framework.
*/

const CHAVES = {
  SESSAO: "ln_sessao",
  SESSAO_ADMIN: "ln_sessao_admin",
  CARRINHO: "ln_carrinho",
  UNIDADE: "ln_unidade_selecionada",
  LGPD: "ln_consentimento_lgpd",
  PEDIDO_ATUAL: "ln_pedido_atual",
};

const CAMPO_POR_CHAVE = {
  [CHAVES.SESSAO]: "usuario",
  [CHAVES.SESSAO_ADMIN]: "admin",
  [CHAVES.CARRINHO]: "carrinho",
  [CHAVES.UNIDADE]: "unidadeSelecionada",
  [CHAVES.LGPD]: "consentimentoLGPD",
  [CHAVES.PEDIDO_ATUAL]: "pedidoAtual",
};

function lerLocalStorage(chave, valorPadrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : valorPadrao;
  } catch (erro) {
    console.warn(`Falha ao ler "${chave}" do armazenamento local`, erro);
    return valorPadrao;
  }
}

function salvarLocalStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.warn(`Falha ao salvar "${chave}" no armazenamento local`, erro);
  }
}

const ouvintes = new Set();

function notificar(info) {
  ouvintes.forEach((fn) => fn(estado, info));
}

export function inscrever(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

export const estado = {
  usuario: lerLocalStorage(CHAVES.SESSAO, null),
  admin: lerLocalStorage(CHAVES.SESSAO_ADMIN, null), // sessão do Gerente/Administrador, separada da sessão do Cliente
  carrinho: lerLocalStorage(CHAVES.CARRINHO, []), // [{ itemId, unidadeId, quantidade, adicionais, removidos, observacao, precoUnitario }]
  unidadeSelecionada: lerLocalStorage(CHAVES.UNIDADE, null),
  consentimentoLGPD: lerLocalStorage(CHAVES.LGPD, null), // null | { aceitouCookies, aceitouCadastro, data }
  pedidoAtual: lerLocalStorage(CHAVES.PEDIDO_ATUAL, null),
  canal: "padrao", // "padrao" | "totem" - definido no boot a partir de ?canal=totem
};

/* ---------- Sessão / autenticação (Cliente) ---------- */

export function definirUsuario(usuario) {
  estado.usuario = usuario;
  salvarLocalStorage(CHAVES.SESSAO, usuario);
  notificar();
}

export function encerrarSessao() {
  estado.usuario = null;
  salvarLocalStorage(CHAVES.SESSAO, null);
  notificar();
}

/* ---------- Sessão / autenticação (Gerente/Administrador) ---------- */
// Mantida separada da sessão do Cliente: um Gerente autenticado no painel - admin não é um Cliente logado (e vice-versa)

export function definirAdmin(admin) {
  estado.admin = admin;
  salvarLocalStorage(CHAVES.SESSAO_ADMIN, admin);
  notificar();
}

export function encerrarSessaoAdmin() {
  estado.admin = null;
  salvarLocalStorage(CHAVES.SESSAO_ADMIN, null);
  notificar();
}

/* ---------- Unidade ---------- */

export function definirUnidade(unidade) {
  estado.unidadeSelecionada = unidade;
  salvarLocalStorage(CHAVES.UNIDADE, unidade);
  notificar();
}

/* ---------- Carrinho ---------- */

export function adicionarAoCarrinho(itemCarrinho) {
  estado.carrinho.push(itemCarrinho);
  salvarLocalStorage(CHAVES.CARRINHO, estado.carrinho);
  notificar();
}

export function removerDoCarrinho(indice) {
  estado.carrinho.splice(indice, 1);
  salvarLocalStorage(CHAVES.CARRINHO, estado.carrinho);
  notificar();
}

export function atualizarQuantidade(indice, quantidade) {
  if (quantidade <= 0) {
    removerDoCarrinho(indice);
    return;
  }
  estado.carrinho[indice].quantidade = quantidade;
  salvarLocalStorage(CHAVES.CARRINHO, estado.carrinho);
  notificar();
}

export function limparCarrinho() {
  estado.carrinho = [];
  salvarLocalStorage(CHAVES.CARRINHO, estado.carrinho);
  notificar();
}

export function totalItensCarrinho() {
  return estado.carrinho.reduce((soma, i) => soma + i.quantidade, 0);
}

export function calcularSubtotalCarrinho() {
  return estado.carrinho.reduce((soma, i) => {
    const precoAdicionais = (i.adicionais || []).reduce((s, a) => s + a.preco, 0);
    return soma + (i.precoUnitario + precoAdicionais) * i.quantidade;
  }, 0);
}

/* ---------- LGPD ---------- */

export function registrarConsentimento(parcial) {
  estado.consentimentoLGPD = {
    ...(estado.consentimentoLGPD || {}),
    ...parcial,
    data: new Date().toISOString(),
  };
  salvarLocalStorage(CHAVES.LGPD, estado.consentimentoLGPD);
  notificar();
}

/* ---------- Pedido / status simulado ---------- */

export function definirPedidoAtual(pedido) {
  estado.pedidoAtual = pedido;
  salvarLocalStorage(CHAVES.PEDIDO_ATUAL, pedido);
  notificar();
}

/* ---------- Canal (App/Web padrão x Totem) ---------- */

export function definirCanal(canal) {
  estado.canal = canal;
  document.body.dataset.canal = canal;
}

export function ehTotem() {
  return estado.canal === "totem";
}

/* ---------- Sincronização entre abas ---------- */
function aoAlterarStorageEmOutraAba(evento) {
  const campo = CAMPO_POR_CHAVE[evento.key];
  if (!campo) return;

  const valorPadrao = campo === "carrinho" ? [] : null;
  try {
    estado[campo] = evento.newValue ? JSON.parse(evento.newValue) : valorPadrao;
  } catch (erro) {
    console.warn(`Falha ao sincronizar "${evento.key}" alterado em outra aba`, erro);
    return;
  }

  notificar({ origem: "outra-aba", campo });
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", aoAlterarStorageEmOutraAba);
}