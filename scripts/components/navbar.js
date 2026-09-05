/*
  Componente de navegação: barra superior (marca + unidade + carrinho)e barra inferior fixa em mobile (padrão de app). Ambas são recalculadas a
  cada troca de rota para refletir o item ativo e o contador do carrinho.
*/

import { estado, totalItensCarrinho, ehTotem } from "../state.js";

const ITENS_NAV = [
  { rota: "#/cardapio", rotulo: "Cardápio", icone: "🍽️" },
  { rota: "#/carrinho", rotulo: "Carrinho", icone: "🛒", comContador: true },
  { rota: "#/pedido/status", rotulo: "Pedidos", icone: "📦" },
  { rota: "#/fidelidade", rotulo: "Fidelidade", icone: "⭐" },
  { rota: "#/promocoes", rotulo: "Promoções", icone: "🏷️" },
];

function escapeHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

export function renderNavbar(rotaAtual) {
  renderTopo(rotaAtual);
  renderInferior(rotaAtual);
}

function renderTopo(rotaAtual) {
  const container = document.getElementById("navbar");
  if (!container) return;

  const unidade = estado.unidadeSelecionada;
  const contador = totalItensCarrinho();
  const totem = ehTotem();

  const nomeUnidade = unidade ? escapeHTML(unidade.nome) : "Escolha uma unidade";
  const linkSessao = totem
    ? `<span class="navbar__link">Modo convidado</span>`
    : estado.usuario
    ? `<a class="navbar__link" href="#/fidelidade">${escapeHTML(estado.usuario.nome.split(" ")[0])}</a>`
    : `<a class="navbar__link" href="#/login">Entrar</a>`;

  container.innerHTML = `
    <div class="navbar__marca">
      <span aria-hidden="true">🌵</span>
      <span>
        Raízes do Nordeste
        <div class="navbar__unidade">${nomeUnidade}</div>
      </span>
    </div>
    <div class="navbar__acoes">
      ${linkSessao}
      <a class="navbar__link navbar__carrinho" href="#/carrinho" aria-label="Ver carrinho, ${contador} ${contador === 1 ? "item" : "itens"}">
        🛒
        ${contador > 0 ? `<span class="navbar__carrinho-contador">${contador}</span>` : ""}
      </a>
    </div>
  `;
}

function renderInferior(rotaAtual) {
  const container = document.getElementById("navbar-inferior");
  if (!container) return;

  const contador = totalItensCarrinho();

  container.innerHTML = ITENS_NAV.map((item) => {
    const ativo = rotaAtual.startsWith(item.rota);
    return `
      <a class="navbar-inferior__item" href="${item.rota}" ${ativo ? 'aria-current="page"' : ""}>
        <span aria-hidden="true">${item.icone}</span>
        <span>${item.rotulo}${item.comContador && contador > 0 ? ` (${contador})` : ""}</span>
      </a>
    `;
  }).join("");
}
