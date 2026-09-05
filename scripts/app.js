/*
  app.js
  Ponto de entrada da aplicação e roteador da SPA (Single Page Application).
  Não usa nenhum framework: um roteador simples baseado em hash (#/rota)
  troca o conteúdo de <main id="app"> conforme a URL muda, e cada "tela"
  vive em scripts/views/*.js como uma função de renderização independente.
*/

import { definirCanal, inscrever } from "./state.js";
import { renderNavbar } from "./components/navbar.js";
import { iniciarBannerCookies } from "./components/lgpdBanner.js";

import { renderBoasVindas } from "./views/boasVindas.js";
import { renderLogin } from "./views/login.js";
import { renderCardapio } from "./views/cardapio.js";
import { renderItemDetalhe } from "./views/itemDetalhe.js";
import { renderCarrinho } from "./views/carrinho.js";
import { renderCheckout } from "./views/checkout.js";
import { renderProcessandoPagamento } from "./views/processandoPagamento.js";
import { renderConfirmacaoPagamento } from "./views/confirmacaoPagamento.js";
import { renderStatusPedido } from "./views/statusPedido.js";
import { renderFidelidade } from "./views/fidelidade.js";
import { renderPromocoes } from "./views/promocoes.js";

// Cada rota tem um padrão (com :parametros opcionais) e a função de render
// correspondente. A ordem não importa pois cada padrão é único.
const ROTAS = [
  { padrao: "#/boas-vindas", render: renderBoasVindas },
  { padrao: "#/login", render: renderLogin },
  { padrao: "#/cardapio", render: renderCardapio },
  { padrao: "#/item/:id", render: renderItemDetalhe },
  { padrao: "#/carrinho", render: renderCarrinho },
  { padrao: "#/checkout", render: renderCheckout },
  { padrao: "#/pagamento/processando", render: renderProcessandoPagamento },
  { padrao: "#/pagamento/confirmacao", render: renderConfirmacaoPagamento },
  { padrao: "#/pedido/status", render: renderStatusPedido },
  { padrao: "#/fidelidade", render: renderFidelidade },
  { padrao: "#/promocoes", render: renderPromocoes },
];

function casarRota(hashAtual) {
  const [caminhoAtual] = hashAtual.split("?");
  for (const rota of ROTAS) {
    const partesPadrao = rota.padrao.split("/");
    const partesAtual = caminhoAtual.split("/");
    if (partesPadrao.length !== partesAtual.length) continue;

    const params = {};
    const bateu = partesPadrao.every((parte, indice) => {
      if (parte.startsWith(":")) {
        params[parte.slice(1)] = decodeURIComponent(partesAtual[indice]);
        return true;
      }
      return parte === partesAtual[indice];
    });

    if (bateu) return { rota, params };
  }
  return null;
}

async function renderizarRotaAtual() {
  const hashAtual = location.hash || "#/boas-vindas";
  const correspondencia = casarRota(hashAtual);
  const app = document.getElementById("app");

  if (!correspondencia) {
    app.innerHTML = `
      <section class="tela estado-central">
        <h1>Página não encontrada</h1>
        <button type="button" class="botao botao--primario" onclick="location.hash='#/boas-vindas'">Voltar ao início</button>
      </section>
    `;
    return;
  }

  renderNavbar(hashAtual);
  app.focus();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

  await correspondencia.rota.render(app, correspondencia.params);

  const regiaoAria = document.getElementById("aria-live-region");
  if (regiaoAria) regiaoAria.textContent = `Tela atualizada: ${hashAtual.replace("#/", "").replace(/[/-]/g, " ")}`;
}

export function navegarPara(rota) {
  if (location.hash === rota) {
    renderizarRotaAtual();
  } else {
    location.hash = rota;
  }
}

function inicializarCanal() {
  const parametros = new URLSearchParams(location.search);
  const canal = parametros.get("canal") === "totem" ? "totem" : "padrao";
  definirCanal(canal);
}

function iniciar() {
  inicializarCanal();
  iniciarBannerCookies();

  if (!location.hash) {
    location.hash = "#/boas-vindas";
  }

  window.addEventListener("hashchange", renderizarRotaAtual);

  // Mantém a navbar (contador do carrinho, sessão) sincronizada sempre que
  // o estado global muda, mesmo sem navegação de rota.
  inscrever(() => renderNavbar(location.hash || "#/boas-vindas"));

  renderizarRotaAtual();
}

document.addEventListener("DOMContentLoaded", iniciar);
