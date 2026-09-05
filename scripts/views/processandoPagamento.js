/*
  Processamento de Pagamento - representa o envio do pagamento a um serviço externo sem integração real: usamos setTimeout para simular o tempo de resposta do gateway, com base no fluxo alternativo FA02 (timeout). O retorno é sorteado apenas para permitir demonstrar os dois desfechos
  (tela de Confirmação e tela de Erro) — em uma integração real, esse resultado viria da resposta do sistema de pagamento externo.
*/

import { estado, definirPedidoAtual, limparCarrinho } from "../state.js";
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

  setTimeout(() => {
    const sucesso = Math.random() < CHANCE_DE_SUCESSO;

    if (sucesso) {
      const numeroPedido = `#${Math.floor(10000 + Math.random() * 9000)}`;
      definirPedidoAtual({
        numero: numeroPedido,
        unidade: estado.unidadeSelecionada,
        itens: estado.carrinho,
        total: estado.pedidoResumo.total,
        pontosGanhos: estado.pedidoResumo.pontosAGanhar,
        formaPagamento: estado.formaPagamentoSelecionada,
        statusPagamento: "pago",
        status: "recebido",
        criadoEm: new Date().toISOString(),
      });
      estado.resultadoPagamento = "sucesso";
      limparCarrinho();
    } else {
      estado.resultadoPagamento = "falha";
    }

    navegarPara("#/pagamento/confirmacao");
  }, TEMPO_SIMULADO_MS);
}
