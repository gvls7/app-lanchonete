/*
  data.js
  Camada de acesso aos dados mockados (JSON estáticos em /data).
  Não existe backend real: cada função abaixo simula uma "consulta"
  fazendo fetch de um arquivo local e devolvendo uma Promise, para que
  o restante do código já esteja pronto para, no futuro, trocar por
  chamadas reais a uma API sem precisar mudar as telas.
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
  // Dado mockado só cobre a unidade un01; demais unidades reutilizam o
  // mesmo cardápio-base como fallback (documentado no README).
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
