/*
  Carrinho, cupom de promoção no checkout e mostra a estimativa de pontos de fidelidade a ganhar (1 ponto por R$ 1,00).
*/

import { buscarPromocaoPorCodigo } from "../data.js";
import {
  estado,
  removerDoCarrinho,
  atualizarQuantidade,
  calcularSubtotalCarrinho,
  ehTotem,
} from "../state.js";
import { navegarPara } from "../app.js";
import { formatarPreco } from "../components/productCard.js";

let cupomAplicado = null;

export async function renderCarrinho(container) {
  function calcularDesconto(subtotal) {
    if (!cupomAplicado) return 0;
    if (cupomAplicado.tipo === "percentual") return subtotal * (cupomAplicado.valorDesconto / 100);
    return Math.min(cupomAplicado.valorDesconto, subtotal);
  }

  function render() {
    const subtotal = calcularSubtotalCarrinho();
    const desconto = calcularDesconto(subtotal);
    const total = Math.max(0, subtotal - desconto);
    const pontosAGanhar = Math.floor(total); // RF19: 1 ponto por R$ 1,00 gasto

    container.innerHTML = `
      <section class="tela">
        <div class="tela-cabecalho">
          <h1>Seu carrinho</h1>
          <p>${estado.unidadeSelecionada ? estado.unidadeSelecionada.nome : ""}</p>
        </div>

        ${ehTotem() ? '<div class="banner-totem">Modo totem — confirme os itens antes de seguir para o pagamento no balcão/totem.</div>' : ""}

        ${estado.carrinho.length === 0 ? `
          <div class="estado-central">
            <p>Seu carrinho está vazio.</p>
            <button type="button" class="botao botao--primario" data-papel="ver-cardapio">Ver cardápio</button>
          </div>
        ` : `
          <div class="layout-split">
            <div class="layout-split__principal" style="display:flex; flex-direction:column; gap:var(--espaco-3);">
              ${estado.carrinho.map((linha, indice) => renderLinhaCarrinho(linha, indice)).join("")}
            </div>

            <div class="layout-split__lateral cartao">
              <h2 style="font-size:1rem; margin-bottom:var(--espaco-3);">Cupom de desconto</h2>
              <div class="flex-linha">
                <input type="text" id="campo-cupom" placeholder="Ex: OURO10" style="flex:1; padding:var(--espaco-2); border-radius:var(--raio-sm); border:1px solid var(--cor-borda);" />
                <button type="button" class="botao botao--secundario" data-papel="aplicar-cupom">Aplicar</button>
              </div>
              <p id="mensagem-cupom" class="campo__ajuda"></p>

              <div style="margin-top:var(--espaco-4);">
                <div class="resumo-linha"><span>Subtotal</span><span>${formatarPreco(subtotal)}</span></div>
                ${desconto > 0 ? `<div class="resumo-linha resumo-linha--desconto"><span>Desconto (${cupomAplicado.titulo})</span><span>- ${formatarPreco(desconto)}</span></div>` : ""}
                <div class="resumo-linha resumo-linha--total"><span>Total</span><span>${formatarPreco(total)}</span></div>
              </div>

              <p class="selo selo--sucesso" style="margin-top:var(--espaco-3);">Você ganha ${pontosAGanhar} pontos de fidelidade neste pedido</p>

              <button type="button" class="botao botao--primario botao--bloco" style="margin-top:var(--espaco-4);" data-papel="checkout">
                Ir para pagamento
              </button>
            </div>
          </div>
        `}
      </section>
    `;

    const botaoVerCardapio = container.querySelector('[data-papel="ver-cardapio"]');
    if (botaoVerCardapio) botaoVerCardapio.addEventListener("click", () => navegarPara("#/cardapio"));

    const botaoCheckout = container.querySelector('[data-papel="checkout"]');
    if (botaoCheckout) {
      botaoCheckout.addEventListener("click", () => {
        estado.pedidoResumo = { subtotal, desconto, total, pontosAGanhar, cupom: cupomAplicado };
        navegarPara("#/checkout");
      });
    }

    container.querySelectorAll("[data-remover]").forEach((botao) => {
      botao.addEventListener("click", () => {
        removerDoCarrinho(Number(botao.dataset.remover));
        render();
      });
    });

    container.querySelectorAll("[data-quantidade]").forEach((botao) => {
      botao.addEventListener("click", () => {
        const indice = Number(botao.dataset.indice);
        const delta = Number(botao.dataset.quantidade);
        atualizarQuantidade(indice, estado.carrinho[indice].quantidade + delta);
        render();
      });
    });

    const botaoAplicarCupom = container.querySelector('[data-papel="aplicar-cupom"]');
    if (botaoAplicarCupom) {
      botaoAplicarCupom.addEventListener("click", async () => {
        const codigo = container.querySelector("#campo-cupom").value.trim();
        const mensagemEl = container.querySelector("#mensagem-cupom");
        if (!codigo) return;
        const promocao = await buscarPromocaoPorCodigo(codigo);
        if (!promocao) {
          mensagemEl.textContent = "Cupom inválido ou expirado.";
          mensagemEl.className = "selo selo--indisponivel";
          cupomAplicado = null;
        } else {
          cupomAplicado = promocao;
          mensagemEl.textContent = `Cupom "${promocao.titulo}" aplicado!`;
          mensagemEl.className = "selo selo--sucesso";
        }
        render();
      });
    }
  }

  function renderLinhaCarrinho(linha, indice) {
    const precoAdicionais = (linha.adicionais || []).reduce((s, a) => s + a.preco, 0);
    const precoLinha = (linha.precoUnitario + precoAdicionais) * linha.quantidade;
    return `
      <div class="cartao flex-espacado" style="align-items:flex-start;">
        <div>
          <strong>${linha.nome}</strong>
          ${linha.adicionais && linha.adicionais.length ? `<p style="font-size:0.8rem; color:var(--cor-texto-secundario);">+ ${linha.adicionais.map((a) => a.nome).join(", ")}</p>` : ""}
          ${linha.removidos && linha.removidos.length ? `<p style="font-size:0.8rem; color:var(--cor-texto-secundario);">Sem: ${linha.removidos.join(", ")}</p>` : ""}
          ${linha.observacao ? `<p style="font-size:0.8rem; color:var(--cor-texto-secundario);">Obs: ${linha.observacao}</p>` : ""}
          <div class="flex-linha" style="margin-top:var(--espaco-2);">
            <button type="button" class="botao botao--secundario" data-quantidade="-1" data-indice="${indice}" aria-label="Diminuir quantidade">−</button>
            <span>${linha.quantidade}</span>
            <button type="button" class="botao botao--secundario" data-quantidade="1" data-indice="${indice}" aria-label="Aumentar quantidade">+</button>
          </div>
        </div>
        <div style="text-align:right;">
          <strong>${formatarPreco(precoLinha)}</strong>
          <br />
          <button type="button" class="botao--texto" data-remover="${indice}" style="font-size:0.8rem; margin-top:var(--espaco-2);">Remover</button>
        </div>
      </div>
    `;
  }

  render();
}
