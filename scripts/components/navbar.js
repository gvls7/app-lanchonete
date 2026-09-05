/*
  Componente de navegação: barra superior (marca + unidade + carrinho) e barra inferior fixa em mobile (padrão de app). Ambas são recalculadas a
  cada troca de rota para refletir o item ativo e o contador do carrinho.
*/

import { estado, totalItensCarrinho, ehTotem, encerrarSessao } from "../state.js";
import { navegarPara } from "../app.js";

const ITENS_NAV = [
  { rota: "#/cardapio", rotulo: "Cardápio", icone: "🍽️" },
  { rota: "#/carrinho", rotulo: "Carrinho", icone: "🛒", comContador: true },
  { rota: "#/pedido/status", rotulo: "Pedidos", icone: "📦" },
  { rota: "#/fidelidade", rotulo: "Fidelidade", icone: "⭐" },
  { rota: "#/promocoes", rotulo: "Promoções", icone: "🏷️" },
];

// Controla a abertura do menu suspenso da conta (nome do usuário na navbar superior). Fica em memória do módulo porque a navbar inteira é remontada
// (innerHTML) a cada renderização, então não dá para guardar isso no DOM.
let menuContaAberto = false;
let ultimaRotaConhecida = null;
let listenerGlobalPronto = false;

function escapeHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

export function renderNavbar(rotaAtual) {
  if (rotaAtual !== ultimaRotaConhecida) {
    menuContaAberto = false;
    ultimaRotaConhecida = rotaAtual;
  }
  garantirListenerGlobal();
  renderTopo(rotaAtual);
  renderInferior(rotaAtual);
}

function garantirListenerGlobal() {
  if (listenerGlobalPronto) return;
  listenerGlobalPronto = true;

  document.addEventListener("click", (evento) => {
    if (!menuContaAberto) return;
    const container = document.getElementById("navbar");
    if (container && !container.contains(evento.target)) {
      menuContaAberto = false;
      renderTopo(ultimaRotaConhecida);
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && menuContaAberto) {
      menuContaAberto = false;
      renderTopo(ultimaRotaConhecida);
    }
  });
}

function renderTopo(rotaAtual) {
  const container = document.getElementById("navbar");
  if (!container) return;

  const unidade = estado.unidadeSelecionada;
  const contador = totalItensCarrinho();
  const totem = ehTotem();

  const nomeUnidade = unidade ? escapeHTML(unidade.nome) : "Escolha uma unidade";
  const linkTrocarUnidade = unidade
    ? `<a class="navbar__trocar-unidade" href="#/boas-vindas">Trocar unidade</a>`
    : "";
  const linkSessao = totem
    ? `<span class="navbar__link">Modo convidado</span>`
    : estado.usuario
    ? `
      <div class="navbar__conta">
        <button
          type="button"
          class="navbar__link navbar__conta-botao"
          data-papel="conta-toggle"
          aria-haspopup="true"
          aria-expanded="${menuContaAberto}"
        >${escapeHTML(estado.usuario.nome.split(" ")[0])}<span aria-hidden="true">${menuContaAberto ? "▲" : "▼"}</span>
        </button>
        <div class="navbar__conta-menu" role="menu" ${menuContaAberto ? "" : "hidden"}>
          <a role="menuitem" href="#/pedido/status">📦 Meus pedidos</a>
          <a role="menuitem" href="#/fidelidade">⭐ Fidelidade</a>
          <button type="button" role="menuitem" data-papel="sair">↪ Sair</button>
        </div>
      </div>
    `
    : `<a class="navbar__link" href="#/login">Entrar</a>`;

  container.innerHTML = `
    <div class="navbar__marca">
      <span aria-hidden="true">🌵</span>
      <span>
        Raízes do Nordeste
        <div class="navbar__unidade">${nomeUnidade} ${linkTrocarUnidade}</div>
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
  const botaoConta = container.querySelector('[data-papel="conta-toggle"]');
  if (botaoConta) {
    botaoConta.addEventListener("click", (evento) => {
      evento.stopPropagation();
      menuContaAberto = !menuContaAberto;
      renderTopo(rotaAtual);
    });
  }

  const botaoSair = container.querySelector('[data-papel="sair"]');
  if (botaoSair) {
    botaoSair.addEventListener("click", () => {
      menuContaAberto = false;
      encerrarSessao();
      navegarPara("#/boas-vindas");
    });
  }
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
