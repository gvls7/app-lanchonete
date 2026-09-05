/*
  Acompanhamento do status do pedido - exibe o progresso do pedido em "tempo real". Sem backend real, a progressão das etapas é simulada com setInterval, avançando automaticamente
  a cada poucos segundos para demonstrar a experiência.
*/

import { estado, definirPedidoAtual } from "../state.js";
import { navegarPara } from "../app.js";
import { formatarPreco } from "../components/productCard.js";

const ETAPAS = [
  { chave: "recebido", titulo: "Pedido recebido", descricao: "Seu pedido chegou até a unidade." },
  { chave: "preparo", titulo: "Em preparo", descricao: "A cozinha está preparando seus itens." },
  { chave: "pronto", titulo: "Pronto", descricao: "Pedido pronto para retirada/entrega." },
  { chave: "concluido", titulo: "Entregue / Retirado", descricao: "Pedido finalizado. Bom apetite!" },
];

const INTERVALO_SIMULADO_MS = 4000;
let intervaloAtivo = null;

export function renderStatusPedido(container) {
  if (intervaloAtivo) {
    clearInterval(intervaloAtivo);
    intervaloAtivo = null;
  }

  const pedido = estado.pedidoAtual;

  if (!pedido) {
    container.innerHTML = `
      <section class="tela estado-central">
        <p>Nenhum pedido em andamento no momento.</p>
        <button type="button" class="botao botao--primario" data-papel="cardapio">Fazer um pedido</button>
      </section>
    `;
    container.querySelector('[data-papel="cardapio"]').addEventListener("click", () => navegarPara("#/cardapio"));
    return;
  }

  let indiceEtapaAtual = ETAPAS.findIndex((e) => e.chave === pedido.status);
  if (indiceEtapaAtual < 0) indiceEtapaAtual = 0;

  function render() {
    const pagamentoPendente = pedido.formaPagamento === "dinheiro" && pedido.statusPagamento === "pendente";
    container.innerHTML = `
      <section class="tela" style="max-width:520px; margin:0 auto;">
        <div class="tela-cabecalho">
          <h1>Pedido ${pedido.numero}</h1>
          <p>${pedido.unidade.nome}</p>
        </div>
        ${pagamentoPendente ? `
          <div class="cartao" style="border-color:var(--cor-alerta);">
            <p class="selo selo--alerta">Pagamento pendente — pague em dinheiro na retirada</p>
            <p class="campo__ajuda" style="margin-top:var(--espaco-2);">
              Seu pedido já foi enviado para a cozinha. O valor de ${formatarPreco(pedido.total)}
              será cobrado e os ${pedido.pontosGanhos} pontos de fidelidade só são creditados quando
              o atendente confirmar o pagamento na retirada.
            </p>
            <button type="button" class="botao botao--secundario botao--bloco" style="margin-top:var(--espaco-3);" data-papel="confirmar-pagamento">
              Confirmar pagamento na retirada
            </button>
          </div>
        ` : pedido.formaPagamento === "dinheiro" ? `
          <p class="selo selo--sucesso">Pagamento recebido em dinheiro na retirada • +${pedido.pontosGanhos} pontos de fidelidade creditados</p>
        ` : ""}
        <div class="cartao">
          <div class="stepper" aria-live="polite">
            ${ETAPAS.map((etapa, indice) => {
              const classe =
                indice < indiceEtapaAtual ? "stepper__etapa--concluida" : indice === indiceEtapaAtual ? "stepper__etapa--atual" : "";
              const marcador = indice < indiceEtapaAtual ? "✓" : indice + 1;
              return `
                <div class="stepper__etapa ${classe}">
                  <div class="stepper__marcador">${marcador}</div>
                  <div class="stepper__conteudo">
                    <h3>${etapa.titulo}</h3>
                    <p>${etapa.descricao}</p>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
        ${indiceEtapaAtual === ETAPAS.length - 1 ? `
          <button type="button" class="botao botao--primario botao--bloco" data-papel="fidelidade">Ver pontos ganhos</button>
        ` : `
          <p class="campo__ajuda centralizado">Atualização automática a cada instante (simulação).</p>
        `}
      </section>
    `;

    const botaoFidelidade = container.querySelector('[data-papel="fidelidade"]');
    if (botaoFidelidade) botaoFidelidade.addEventListener("click", () => navegarPara("#/fidelidade"));

    const botaoConfirmarPagamento = container.querySelector('[data-papel="confirmar-pagamento"]');
    if (botaoConfirmarPagamento) {
      botaoConfirmarPagamento.addEventListener("click", () => {
        // só a partir daqui o pagamento é considerado concluído e os pontos de fidelidade entram no extrato do cliente.
        pedido.statusPagamento = "pago";
        definirPedidoAtual(pedido);
        render();
      });
    }
  }

  render();

  intervaloAtivo = setInterval(() => {
    if (indiceEtapaAtual < ETAPAS.length - 1) {
      indiceEtapaAtual++;
      pedido.status = ETAPAS[indiceEtapaAtual].chave;
      render();
    } else {
      clearInterval(intervaloAtivo);
      intervaloAtivo = null;
    }
  }, INTERVALO_SIMULADO_MS);
}
