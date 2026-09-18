/*
  Regras de negócio:
  - Um pedido só é considerado "pago" através de confirmarPagamentoPedido - é o único lugar que credita pontos, e faz isso uma única vez por pedido mesmo que a função seja chamada de novo.
  - Pontos só são creditados para quem está com sessão de Cliente ativa - pedidos do modo visitante nunca creditam fidelidade.
*/

import { estado, definirPedidoAtual, usuarioAtivo } from "./state.js";
import { creditarPontosFidelidade, registrarPedidoConcluido } from "./data.js";

function criarNumeroPedido() {
  return `#${Math.floor(10000 + Math.random() * 9000)}`;
}

/*
 Usado tanto pelo pagamento em dinheiro (status pendente até a retirada) quanto pelo retorno do pagamento por cartão/PIX (status já processado).
 */
export function montarPedido({ formaPagamento, statusPagamento }) {
  const resumo = estado.pedidoResumo;
  return {
    numero: criarNumeroPedido(),
    unidade: estado.unidadeSelecionada,
    itens: estado.carrinho,
    total: resumo.total,
    pontosGanhos: resumo.pontosAGanhar,
    formaPagamento,
    statusPagamento,
    pontosCreditados: false,
    registradoHistorico: false,
    status: "recebido",
    criadoEm: new Date().toISOString(),
  };
}

/*
 * Confirma o pagamento de um pedido (cartão/PIX aprovados na hora, ou dinheiro confirmado depois pelo atendente na retirada) e credita os pontos de fidelidade uma única vez.
 */

export async function confirmarPagamentoPedido(pedido) {
  pedido.statusPagamento = "pago";

  const cliente = usuarioAtivo();

  if (!pedido.pontosCreditados && cliente && pedido.pontosGanhos > 0) {
    await creditarPontosFidelidade(cliente, pedido.pontosGanhos, `Pedido ${pedido.numero} - Obrigado!`);
    pedido.pontosCreditados = true;
  }

  if (!pedido.registradoHistorico) {
    await registrarPedidoConcluido({
      numero: pedido.numero,
      unidadeId: pedido.unidade ? pedido.unidade.id : null,
      unidadeNome: pedido.unidade ? pedido.unidade.nome : "—",
      itens: (pedido.itens || []).map((i) => ({ nome: i.nome, quantidade: i.quantidade })),
      total: pedido.total,
      formaPagamento: pedido.formaPagamento,
      pontosGanhos: pedido.pontosCreditados ? pedido.pontosGanhos : 0,
      visitante: !cliente,
      criadoEm: pedido.criadoEm,
    });
    pedido.registradoHistorico = true;
  }

  definirPedidoAtual(pedido);
  return pedido;
}
