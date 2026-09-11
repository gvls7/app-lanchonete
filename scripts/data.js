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

export function listarUnidades() {
  return carregarJSON("data/unidades.json");
}

export async function buscarUnidade(unidadeId) {
  const unidades = await listarUnidades();
  return unidades.find((u) => u.id === unidadeId) || null;
}

export async function buscarCardapio(unidadeId) {
  const cardapios = await carregarJSON("data/cardapio.json");
  // Dado mockado só cobre a unidade un01; demais unidades reutilizam o mesmo cardápio-base como fallback (documentado no README).
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

export function listarPromocoes() {
  return carregarJSON("data/promocoes.json");
}

export async function buscarPromocaoPorCodigo(codigo) {
  const promocoes = await listarPromocoes();
  return (
    promocoes.find(
      (p) => p.ativa && p.codigo && p.codigo.toUpperCase() === codigo.toUpperCase()
    ) || null
  );
}

export async function buscarFidelidade(usuarioId) {
  const registros = await carregarJSON("data/fidelidade.json");
  return registros.find((f) => f.usuarioId === usuarioId) || null;
}

export function listarTodaFidelidade() {
  return carregarJSON("data/fidelidade.json");
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
  return registro;
}

/* ---------- Histórico de pedidos (Admin - Relatórios) ---------- */
// data/pedidos.json traz um pequeno histórico mockado de pedidos já concluídos usado como base inicial para os relatórios de vendas do Painel Admin, nada é gravado de volta no arquivo .json, um recarregamento da página restaura só os dados de exemplo.

export function listarHistoricoPedidos() {
  return carregarJSON("data/pedidos.json");
}

export async function registrarPedidoConcluido(registroPedido) {
  const historico = await listarHistoricoPedidos();
  historico.unshift(registroPedido);
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
