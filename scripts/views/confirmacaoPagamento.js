/*
  Confirmação / Erro de Pagamento - feedback visual claro de sucesso ou falha do pagamento.
*/

import { estado } from "../state.js";
import { navegarPara } from "../app.js";
import { formatarPreco } from "../components/productCard.js";

export function renderConfirmacaoPagamento(container) {
  const resultado = estado.resultadoPagamento;

  if (resultado === "sucesso") {
    const pedido = estado.pedidoAtual;
    container.innerHTML = `
      <section class="tela estado-central">
        <div style="font-size:3rem;" aria-hidden="true">✅</div>
        <h1>Pagamento aprovado!</h1>
        <p>Pedido ${pedido.numero} confirmado em ${pedido.unidade.nome}.</p>
        <p class="selo selo--sucesso">Total pago: ${formatarPreco(pedido.total)} • +${pedido.pontosGanhos} pontos de fidelidade</p>
        <div class="flex-linha">
          <button type="button" class="botao botao--primario" data-papel="status">Acompanhar status do pedido</button>
          <button type="button" class="botao botao--secundario" data-papel="cardapio">Voltar ao cardápio</button>
        </div>
      </section>
    `;
    container.querySelector('[data-papel="status"]').addEventListener("click", () => navegarPara("#/pedido/status"));
    container.querySelector('[data-papel="cardapio"]').addEventListener("click", () => navegarPara("#/cardapio"));
  } else {
    container.innerHTML = `
      <section class="tela estado-central">
        <div style="font-size:3rem;" aria-hidden="true">❌</div>
        <h1>Não foi possível concluir o pagamento</h1>
        <p>O sistema de pagamento externo recusou ou não respondeu a tempo. Nenhum valor foi cobrado.</p>
        <div class="flex-linha">
          <button type="button" class="botao botao--primario" data-papel="tentar-novamente">Tentar novamente</button>
          <button type="button" class="botao botao--secundario" data-papel="carrinho">Voltar ao carrinho</button>
        </div>
      </section>
    `;
    container.querySelector('[data-papel="tentar-novamente"]').addEventListener("click", () => navegarPara("#/checkout"));
    container.querySelector('[data-papel="carrinho"]').addEventListener("click", () => navegarPara("#/carrinho"));
  }
}
