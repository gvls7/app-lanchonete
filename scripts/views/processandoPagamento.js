/*
  Processamento de Pagamento - representa o envio do pagamento a um serviço externo sem integração real: usamos setTimeout para simular o tempo de resposta do gateway, com base no fluxo alternativo (timeout). O retorno é sorteado apenas para permitir demonstrar os dois desfechos (tela de Confirmação e tela de Erro) — em uma integração real, esse resultado viria da resposta do sistema de pagamento externo.
*/

import { estado, limparCarrinho } from "../state.js";
import { montarPedido, confirmarPagamentoPedido } from "../pedidoOrquestrador.js";
import { navegarPara } from "../app.js";

const TEMPO_SIMULADO_MS = 2500;
const CHANCE_DE_SUCESSO = 0.85;

export function renderProcessandoPagamento(container) {
  container.innerHTML = `
    <section class="tela estado-central">
      <div class="spinner" role="status" aria-label="Processando pagamento"></div>
      <h1>Processando pagamento...</h1>
      <p>Aguarde enquanto confirmamos com o sistema de pagamento externo.</p>
    </section>
  `;

  setTimeout(async () => {
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
  }, TEMPO_SIMULADO_MS);
}
