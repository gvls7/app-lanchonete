/*
  Checkout + Seleção de Pagamento - finalizar pedido, integração externa de pagamento 
  (aqui representada de forma conceitual/mockada) e múltiplas formas de pagamento: cartão, PIX, dinheiro. Reforça o ponto LGPD: dados de
  pagamento não são armazenados localmente — não existe nenhum campo de número de cartão sendo salvo em estado.js/localStorage.
*/

import { estado, ehTotem } from "../state.js";
import { navegarPara } from "../app.js";
import { formatarPreco } from "../components/productCard.js";

const FORMAS_PAGAMENTO = [
  { id: "cartao", titulo: "Cartão de crédito/débito", descricao: "Processado pela maquininha/gateway externo" },
  { id: "pix", titulo: "PIX", descricao: "QR Code gerado pelo sistema de pagamento externo, válido por 15 min" },
  { id: "dinheiro", titulo: "Dinheiro na retirada", descricao: "Pagamento presencial, confirmado pelo atendente" },
];

export function renderCheckout(container) {
  if (!estado.pedidoResumo || estado.carrinho.length === 0) {
    navegarPara("#/carrinho");
    return;
  }

  const totem = ehTotem();
  let formaSelecionada = totem ? "dinheiro" : "cartao";
  const resumo = estado.pedidoResumo;

  function render() {
    container.innerHTML = `
      <section class="tela" style="max-width:560px; margin:0 auto;">
        <div class="tela-cabecalho">
          <h1>Pagamento</h1>
          <p>Revise seu pedido e escolha como pagar.</p>
        </div>

        ${totem ? '<div class="banner-totem">Modo totem — pagamento em dinheiro é confirmado pelo atendente no balcão.</div>' : ""}

        <div class="cartao">
          <div class="resumo-linha"><span>Subtotal</span><span>${formatarPreco(resumo.subtotal)}</span></div>
          ${resumo.desconto > 0 ? `<div class="resumo-linha resumo-linha--desconto"><span>Desconto</span><span>- ${formatarPreco(resumo.desconto)}</span></div>` : ""}
          <div class="resumo-linha resumo-linha--total"><span>Total a pagar</span><span>${formatarPreco(resumo.total)}</span></div>
        </div>

        ${!totem && !estado.usuario ? `
          <p class="banner-totem">Você está finalizando como visitante. <a href="#/login">Entrar ou criar conta</a> para acumular pontos de fidelidade neste pedido.</p>
        ` : ""}

        <div>
          <h2 style="font-size:1rem; margin-bottom:var(--espaco-3);">Forma de pagamento</h2>
          <div style="display:flex; flex-direction:column; gap:var(--espaco-2);">
            ${FORMAS_PAGAMENTO.map(
              (forma) => `
              <button type="button" class="chip-opcao" data-forma="${forma.id}" aria-pressed="${forma.id === formaSelecionada}">
                <div>
                  <div class="chip-opcao__titulo">${forma.titulo}</div>
                  <div class="chip-opcao__descricao">${forma.descricao}</div>
                </div>
              </button>
            `
            ).join("")}
          </div>
        </div>

        <p class="campo__ajuda">
          Dados de pagamento não são armazenados neste sistema — o envio é apenas
          representado, sem processar transações reais (conforme LGPD, Art. 46°).
        </p>

        <button type="button" class="botao botao--primario botao--bloco" data-papel="pagar">
          Pagar ${formatarPreco(resumo.total)}
        </button>
      </section>
    `;

    container.querySelectorAll("[data-forma]").forEach((botao) => {
      botao.addEventListener("click", () => {
        formaSelecionada = botao.dataset.forma;
        render();
      });
    });

    container.querySelector('[data-papel="pagar"]').addEventListener("click", () => {
      estado.formaPagamentoSelecionada = formaSelecionada;
      navegarPara("#/pagamento/processando");
    });
  }

  render();
}
