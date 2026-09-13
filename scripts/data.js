/*
  Camada de acesso aos dados mockados (JSON estáticos em /data).
  Não existe backend real: cada função abaixo simula uma "consulta" fazendo fetch de um arquivo local e devolvendo uma Promise, para que o restante do código já esteja pronto para, no futuro, trocar por chamadas reais a uma API sem precisar mudar as telas.
*/

const cache = {};

async function carregarJSON(caminho) {
  if (cache[caminho]) return cache[caminho];
  const resposta = await fetch(caminho);
  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar ${caminho} (status ${resposta.status})`);
  }
  const dados = await resposta.json();
  cache[caminho] = dados;
  return dados;
}

/* ---------- Sincronização entre abas dos dados mockados ---------- */

const CHAVES_MOCK = {
  CARDAPIO_OVERRIDES: "ln_mock_cardapio_overrides", // { [itemId]: { preco?, disponivel? } }
  PROMOCOES: "ln_mock_promocoes", // array de promoções
  PEDIDOS: "ln_mock_pedidos", // array do histórico de pedidos
  FIDELIDADE: "ln_mock_fidelidade", // array de registros de fidelidade
};

function lerStorageMock(chave, valorPadrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : valorPadrao;
  } catch (erro) {
    console.warn(`Falha ao ler "${chave}" do armazenamento local`, erro);
    return valorPadrao;
  }
}

function salvarStorageMock(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.warn(`Falha ao salvar "${chave}" no armazenamento local`, erro);
  }
}

const ouvintesDados = new Set();

/**
 * Permite que outras partes do app (app.js) sejam avisadas sempre que cardápio, promoções, pedidos ou fidelidade mudarem, seja por uma edição feita nesta mesma aba, seja por uma mudança sincronizada de outra aba (info.origem distingue os dois casos).
 */
export function inscreverMudancasDeDados(fn) {
  ouvintesDados.add(fn);
  return () => ouvintesDados.delete(fn);
}

function notificarMudancaDados(origem, campo) {
  ouvintesDados.forEach((fn) => fn({ origem, campo }));
}

export function listarUnidades() {
  return carregarJSON("data/unidades.json");
}

export async function buscarUnidade(unidadeId) {
  const unidades = await listarUnidades();
  return unidades.find((u) => u.id === unidadeId) || null;
}

/* ---------- Cardápio (com overrides de preço/disponibilidade do Admin) ---------- */

function aplicarOverrideNoItem(item, overrides) {
  const over = overrides[item.id];
  if (!over) return;
  if (typeof over.preco === "number") item.preco = over.preco;
  if (typeof over.disponivel === "boolean") item.disponivel = over.disponivel;
}

function aplicarOverridesCardapio(cardapios) {
  const overrides = lerStorageMock(CHAVES_MOCK.CARDAPIO_OVERRIDES, {});
  cardapios.forEach((c) => c.categorias.forEach((categoria) => categoria.itens.forEach((item) => aplicarOverrideNoItem(item, overrides))));
}

let cardapioInicializado = false;

async function carregarCardapiosComOverrides() {
  const cardapios = await carregarJSON("data/cardapio.json");
  if (!cardapioInicializado) {
    aplicarOverridesCardapio(cardapios);
    cardapioInicializado = true;
  }
  return cardapios;
}

export async function buscarCardapio(unidadeId) {
  const cardapios = await carregarCardapiosComOverrides();
  return cardapios.find((c) => c.unidadeId === unidadeId) || cardapios[0];
}

export async function buscarItemPorId(unidadeId, itemId) {
  const cardapio = await buscarCardapio(unidadeId);
  for (const categoria of cardapio.categorias) {
    const item = categoria.itens.find((i) => i.id === itemId);
    if (item) return { item, categoria };
  }
  return null;
}

/*
 Usada pelo Painel Admin (adminCardapio.js) depois de alterar preço e/ou disponibilidade de um item em memória: grava a alteração como um "override" em localStorage (por id de item) e avisa quem estiver inscrito. Não repete a busca/edição do item em si - isso continua sendo feito na própria tela
 */
export function persistirOverrideCardapio(itemId, alteracoes) {
  const overrides = lerStorageMock(CHAVES_MOCK.CARDAPIO_OVERRIDES, {});
  overrides[itemId] = { ...(overrides[itemId] || {}), ...alteracoes };
  salvarStorageMock(CHAVES_MOCK.CARDAPIO_OVERRIDES, overrides);
  notificarMudancaDados("local", "cardapio");
}


export function listarUsuarios() {
  return carregarJSON("data/usuarios.json");
}

export async function autenticar(email, senha) {
  const usuarios = await listarUsuarios();
  return usuarios.find((u) => u.email === email && u.senha === senha) || null;
}

export async function buscarUsuarioPorEmail(email) {
  const usuarios = await listarUsuarios();
  return usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

/* ---------- Promoções e campanhas ---------- */

let promocoesInicializadas = false;

export async function listarPromocoes() {
  const promocoes = await carregarJSON("data/promocoes.json");
  if (!promocoesInicializadas) {
    const persistido = lerStorageMock(CHAVES_MOCK.PROMOCOES, null);
    if (persistido) {
      promocoes.length = 0;
      promocoes.push(...persistido);
    }
    promocoesInicializadas = true;
  }
  return promocoes;
}

export async function buscarPromocaoPorCodigo(codigo) {
  const promocoes = await listarPromocoes();
  return (
    promocoes.find(
      (p) => p.ativa && p.codigo && p.codigo.toUpperCase() === codigo.toUpperCase()
    ) || null
  );
}

/**
Usada pelo Painel Admin depois de criar, ativar/desativar ou excluir uma promoção: grava o array inteiro (já alterado em memória) em localStorage e avisa quem estiver inscrito.
 */
export function persistirPromocoes() {
  const promocoes = cache["data/promocoes.json"];
  if (!promocoes) return;
  salvarStorageMock(CHAVES_MOCK.PROMOCOES, promocoes);
  notificarMudancaDados("local", "promocoes");
}

/* ---------- Fidelidade ---------- */

let fidelidadeInicializada = false;

async function carregarFidelidadeComPersistencia() {
  const registros = await carregarJSON("data/fidelidade.json");
  if (!fidelidadeInicializada) {
    const persistido = lerStorageMock(CHAVES_MOCK.FIDELIDADE, null);
    if (persistido) {
      registros.length = 0;
      registros.push(...persistido);
    }
    fidelidadeInicializada = true;
  }
  return registros;
}

export async function buscarFidelidade(usuarioId) {
  const registros = await carregarFidelidadeComPersistencia();
  return registros.find((f) => f.usuarioId === usuarioId) || null;
}

export function listarTodaFidelidade() {
  return carregarFidelidadeComPersistencia();
}

/*
Usada depois de qualquer alteração num registro de fidelidade já carregado (crédito de pontos, resgate de recompensa): grava o array inteiro em localStorage e avisa quem estiver inscrito.
 */
export function persistirFidelidade() {
  const registros = cache["data/fidelidade.json"];
  if (!registros) return;
  salvarStorageMock(CHAVES_MOCK.FIDELIDADE, registros);
  notificarMudancaDados("local", "fidelidade");
}

// Catálogo padrão de recompensas usado apenas para criar o registro de fidelidade de um usuário novo. Mantém o mesmo catálogo já usado pelos registros de exemplo, todas com "disponivel: true"
const RECOMPENSAS_PADRAO = () => [
  { id: "rec01", nome: "Sobremesa gratis", pontosNecessarios: 100, disponivel: true },
  { id: "rec02", nome: "Bebida gratis", pontosNecessarios: 60, disponivel: true },
  { id: "rec03", nome: "15% de desconto no próximo pedido", pontosNecessarios: 250, disponivel: true },
  { id: "rec04", nome: "Lanche gratis (até R$ 30)", pontosNecessarios: 500, disponivel: true },
];

/*
 Devolve o registro de fidelidade do usuário, criando um novo quando ele ainda não existir. Criar um registro isolado por usuário evita que o saldo de um cliente novo se misture com o do usr01
 */
export async function obterOuCriarFidelidade(usuario) {
  const registros = await listarTodaFidelidade();
  let registro = registros.find((f) => f.usuarioId === usuario.id);
  if (!registro) {
    registro = {
      usuarioId: usuario.id,
      pontosAtuais: 0,
      nivelAtual: "Bronze",
      proximoNivel: "Prata",
      pontosProximoNivel: 150,
      historico: [],
      recompensasDisponiveis: RECOMPENSAS_PADRAO(),
    };
    registros.push(registro);
    persistirFidelidade();
  }
  return registro;
}

/*
 * Credita pontos de fidelidade de verdade no registro do usuário criando um registro próprio antes, se necessário e insere o lançamento no extrato.
 */
export async function creditarPontosFidelidade(usuario, pontos, descricao) {
  if (!usuario || !pontos || pontos <= 0) return null;

  const registro = await obterOuCriarFidelidade(usuario);
  registro.pontosAtuais += pontos;
  registro.historico.unshift({
    id: `credito-${Date.now()}`,
    tipo: "credito",
    pontos,
    descricao,
    data: new Date().toISOString(),
  });
  persistirFidelidade();
  return registro;
}

/* ---------- Histórico de pedidos (Admin - Relatórios) ---------- */
// data/pedidos.json traz um pequeno histórico mockado de pedidos já concluídos usado como base inicial para os relatórios de vendas do Painel Admin, nada é gravado de volta no arquivo .json, um recarregamento da página restaura só os dados de exemplo.

export async function listarHistoricoPedidos() {
  const historico = await carregarJSON("data/pedidos.json");
  if (!pedidosInicializados) {
    const persistido = lerStorageMock(CHAVES_MOCK.PEDIDOS, null);
    if (persistido) {
      historico.length = 0;
      historico.push(...persistido);
    }
    pedidosInicializados = true;
  }
  return historico;
}

export async function registrarPedidoConcluido(registroPedido) {
  const historico = await listarHistoricoPedidos();
  historico.unshift(registroPedido);
  salvarStorageMock(CHAVES_MOCK.PEDIDOS, historico);
  notificarMudancaDados("local", "pedidos");
  return historico;
}

/* ---------- Gerente/Administrador ---------- */

export function listarAdministradores() {
  return carregarJSON("data/administradores.json");
}

export async function autenticarAdmin(email, senha) {
  const administradores = await listarAdministradores();
  return (
    administradores.find((a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.senha === senha) || null
  );
}

/* ---------- Sincronização entre abas dos dados mockados ---------- */

function aoAlterarStorageDeOutraAba(evento) {
  switch (evento.key) {
    case CHAVES_MOCK.CARDAPIO_OVERRIDES: {
      const cardapios = cache["data/cardapio.json"];
      if (cardapios) aplicarOverridesCardapio(cardapios);
      notificarMudancaDados("outra-aba", "cardapio");
      break;
    }
    case CHAVES_MOCK.PROMOCOES: {
      const promocoes = cache["data/promocoes.json"];
      if (promocoes) {
        const novo = lerStorageMock(CHAVES_MOCK.PROMOCOES, []);
        promocoes.length = 0;
        promocoes.push(...novo);
      }
      notificarMudancaDados("outra-aba", "promocoes");
      break;
    }
    case CHAVES_MOCK.PEDIDOS: {
      const historico = cache["data/pedidos.json"];
      if (historico) {
        const novo = lerStorageMock(CHAVES_MOCK.PEDIDOS, []);
        historico.length = 0;
        historico.push(...novo);
      }
      notificarMudancaDados("outra-aba", "pedidos");
      break;
    }
    case CHAVES_MOCK.FIDELIDADE: {
      const registros = cache["data/fidelidade.json"];
      if (registros) {
        const novo = lerStorageMock(CHAVES_MOCK.FIDELIDADE, []);
        registros.length = 0;
        registros.push(...novo);
      }
      notificarMudancaDados("outra-aba", "fidelidade");
      break;
    }
    default:
      return;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", aoAlterarStorageDeOutraAba);
}
