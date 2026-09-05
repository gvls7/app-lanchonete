/*
  Acompanhamento do status do pedido - exibe o progresso do pedido em "tempo real". Sem backend real, a progressão das etapas é simulada com setInterval, avançando automaticamente
  a cada poucos segundos para demonstrar a experiência.
*/

import { estado } from "../state.js";
import { navegarPara } from "../app.js";

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
    container.innerHTML = `
      <section class="tela" style="max-width:520px; margin:0 auto;">
        <div class="tela-cabecalho">
          <h1>Pedido ${pedido.numero}</h1>
          <p>${pedido.unidade.nome}</p>
        </div>
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
