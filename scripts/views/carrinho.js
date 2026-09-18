/*
  Carrinho, cupom de promoção no checkout e mostra a estimativa de pontos de fidelidade a ganhar (1 ponto por R$ 1,00).
*/
/*
Cupons são benefícios do programa de fidelidade, então só podem ser aplicados por quem está logado. Sem login, o bloco de cupom fica desabilitado com uma chamada para entrar na conta.
*/

import { buscarPromocaoPorCodigo } from "../data.js";
import {
  estado,
  removerDoCarrinho,
  atualizarQuantidade,
  calcularSubtotalCarrinho,
  ehTotem,
  usuarioAtivo,
} from "../state.js";
import { navegarPara } from "../app.js";
import { formatarPreco } from "../components/productCard.js";

let cupomAplicado = null;
let mensagemCupom = { texto: "", classe: "campo__ajuda" };

export async function renderCarrinho(container) {
  function calcularDesconto(subtotal) {
    if (!cupomAplicado) return 0;
    if (cupomAplicado.tipo === "percentual") return subtotal * (cupomAplicado.valorDesconto / 100);
    return Math.min(cupomAplicado.valorDesconto, subtotal);
  }

  function renderBlocoCupom() {

    if (ehTotem()) {
      // Totem é atendimento como convidado por definição então nao tem cupom
      return `<p class="campo__ajuda">Cupons de fidelidade não estão disponíveis no totem.</p>`;
    }
    if (!usuarioAtivo()) {
      return `
        <div class="bloqueio-login">
          <span>Entre na sua conta para aplicar cupons de fidelidade.</span>
          <button type="button" class="botao botao--secundario botao--bloco" data-papel="login-cupom">Entrar ou criar conta</button>
        </div>
      `;
    }
    return `
      <div class="flex-linha">
        <input type="text" id="campo-cupom" placeholder="Ex: OURO10" style="flex:1; padding:var(--espaco-2); border-radius:var(--raio-sm); border:1px solid var(--cor-borda);" />
        <button type="button" class="botao botao--secundario" data-papel="aplicar-cupom">Aplicar</button>
      </div>
      <p id="mensagem-cupom" class="${mensagemCupom.classe}">${mensagemCupom.texto}</p>
    `;
  }

  function renderBlocoPontos(pontosAGanhar) {

    if (ehTotem()) {
      return `<p class="campo__ajuda" style="margin-top:var(--espaco-3);">Pedidos feitos no totem não acumulam pontos de fidelidade.</p>`;
    }
    if (!usuarioAtivo()) {
      // Sem conta, não há onde guardar o saldo de pontos, então não faz sentido mostrar a estimativa de pontos a ganhar.
      return `
        <div class="bloqueio-login" style="margin-top:var(--espaco-3);">
          <span>Crie uma conta para começar a ganhar pontos de fidelidade nos seus pedidos.</span>
          <button type="button" class="botao botao--secundario botao--bloco" data-papel="login-pontos">Entrar ou criar conta</button>
        </div>
      `;
    }
    return `<p class="selo selo--sucesso" style="margin-top:var(--espaco-3);">Você ganha ${pontosAGanhar} pontos de fidelidade neste pedido</p>`;
  }

  function render() {
    const subtotal = calcularSubtotalCarrinho();
    const desconto = usuarioAtivo() ? calcularDesconto(subtotal) : 0;
    const total = Math.max(0, subtotal - desconto);
    const pontosAGanhar = estado.usuario ? Math.floor(total) : 0;

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
              ${renderBlocoCupom()}

              <div style="margin-top:var(--espaco-4);">
                <div class="resumo-linha"><span>Subtotal</span><span>${formatarPreco(subtotal)}</span></div>
                ${desconto > 0 ? `<div class="resumo-linha resumo-linha--desconto"><span>Desconto (${cupomAplicado.titulo})</span><span>- ${formatarPreco(desconto)}</span></div>` : ""}
                <div class="resumo-linha resumo-linha--total"><span>Total</span><span>${formatarPreco(total)}</span></div>
              </div>

              ${renderBlocoPontos(pontosAGanhar)}

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

    const botaoLoginCupom = container.querySelector('[data-papel="login-cupom"]');
    if (botaoLoginCupom) {
      botaoLoginCupom.addEventListener("click", () => navegarPara("#/login"));
    }

    const botaoLoginPontos = container.querySelector('[data-papel="login-pontos"]');
    if (botaoLoginPontos) {
      botaoLoginPontos.addEventListener("click", () => navegarPara("#/login"));
    }

    const botaoAplicarCupom = container.querySelector('[data-papel="aplicar-cupom"]');
    if (botaoAplicarCupom) {
      botaoAplicarCupom.addEventListener("click", async () => {
        if (!usuarioAtivo()) {
          if (!ehTotem()) navegarPara("#/login");
          return;
        }
        const codigo = container.querySelector("#campo-cupom").value.trim();
        if (!codigo) return;
        const promocao = await buscarPromocaoPorCodigo(codigo);
        if (!promocao) {
          mensagemCupom = { texto: "Cupom inválido ou expirado.", classe: "selo selo--indisponivel" };
          cupomAplicado = null;
        } else {
          cupomAplicado = promocao;
          mensagemCupom = { texto: `Cupom "${promocao.titulo}" aplicado!`, classe: "selo selo--sucesso" };
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

  if (!usuarioAtivo()) {
    cupomAplicado = null;
    mensagemCupom = { texto: "", classe: "campo__ajuda" };
  }

  render();
}
