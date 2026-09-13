/*
  Processamento de Pagamento - representa o envio do pagamento a um serviço externo sem integração real: usamos setTimeout para simular o tempo de resposta do gateway, com base no fluxo alternativo (timeout). O retorno é sorteado apenas para permitir demonstrar os dois desfechos (tela de Confirmação e tela de Erro) — em uma integração real, esse resultado viria da resposta do sistema de pagamento externo.
*/

import { estado, limparCarrinho } from "../state.js";
import { montarPedido, confirmarPagamentoPedido } from "../pedidoOrquestrador.js";
import { navegarPara } from "../app.js";

const TEMPO_SIMULADO_MS = 2500;
const CHANCE_DE_SUCESSO = 0.85;

function renderErroProcessamento(container) {
  container.innerHTML = `
    <section class="tela estado-central">
      <p class="selo selo--indisponivel">Não foi possível concluir o processamento do pagamento. Tente novamente.</p>
      <div class="flex-linha">
        <button type="button" class="botao botao--primario" data-papel="tentar-novamente">Tentar novamente</button>
        <button type="button" class="botao botao--secundario" data-papel="carrinho">Voltar ao carrinho</button>
      </div>
    </section>
  `;
  container.querySelector('[data-papel="tentar-novamente"]').addEventListener("click", () => navegarPara("#/checkout"));
  container.querySelector('[data-papel="carrinho"]').addEventListener("click", () => navegarPara("#/carrinho"));
}

export function renderProcessandoPagamento(container) {
  container.innerHTML = `
    <section class="tela estado-central">
      <div class="spinner" role="status" aria-label="Processando pagamento"></div>
      <h1>Processando pagamento...</h1>
      <p>Aguarde enquanto confirmamos com o sistema de pagamento externo.</p>
    </section>
  `;

  setTimeout(async () => {
    try {
      const sucesso = Math.random() < CHANCE_DE_SUCESSO;

      if (sucesso) {
        const pedido = montarPedido({
          formaPagamento: estado.formaPagamentoSelecionada,
          statusPagamento: "pago",
        });
        await confirmarPagamentoPedido(pedido);
        estado.resultadoPagamento = "sucesso";
        limparCarrinho();
      } else {
        estado.resultadoPagamento = "falha";
      }

      navegarPara("#/pagamento/confirmacao");
    } catch (erro) {
      console.error(erro);
      renderErroProcessamento(container);
    }
  }, TEMPO_SIMULADO_MS);
}
