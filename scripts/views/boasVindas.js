/*
  Boas-vindas / Seleção de Unidade.
  Primeiro contato do cliente com o sistema (App/Totem/Web), cardápio por unidade, que depende da unidade ser escolhida antes e serve de ponto de partida da rota que será seguida pelo usuário.
*/

import { listarUnidades } from "../data.js";
import { estado, definirUnidade, ehTotem } from "../state.js";
import { navegarPara } from "../app.js";

function escolherUnidade(unidade) {
  definirUnidade(unidade);
  navegarPara("#/cardapio");
}

export async function renderBoasVindas(container) {
  const totem = ehTotem();
  container.innerHTML = `
    <section class="tela">
      <div class="tela-cabecalho centralizado">
        <h1>Bem-vindo(a) à Raízes do Nordeste</h1>
        <p>${totem ? "Toque em uma unidade para começar seu pedido." : "Escolha a unidade em que você está para ver o cardápio e fazer seu pedido."}</p>
      </div>
      ${totem ? '<div class="banner-totem">Modo totem — atendimento como convidado, sem necessidade de login.</div>' : ""}
      <div id="lista-unidades" class="grade grade--2" aria-live="polite">
        <p>Carregando unidades...</p>
      </div>
    </section>
  `;

  try {
    const unidades = await listarUnidades();
    const listaEl = container.querySelector("#lista-unidades");
    listaEl.innerHTML = unidades
      .map(
        (u) => `
        <button type="button" class="cartao" data-unidade-id="${u.id}" style="text-align:left; cursor:pointer;">
          <strong>${u.nome}</strong>
          <p style="color:var(--cor-texto-secundario); font-size:0.85rem; margin-top:4px;">${u.endereco}</p>
          <p style="font-size:0.8rem; margin-top:8px;">
            ${u.aceitaPedidoOnline ? '<span class="selo selo--sucesso">Pedido online</span>' : ""}
            ${u.aceitaDriveThru ? '<span class="selo">Drive-thru</span>' : ""}
          </p>
        </button>
      `
      )
      .join("");

    listaEl.querySelectorAll("[data-unidade-id]").forEach((botao) => {
      botao.addEventListener("click", () => {
        const unidade = unidades.find((u) => u.id === botao.dataset.unidadeId);
        escolherUnidade(unidade);
      });
    });

    if (estado.unidadeSelecionada) {
      const continuar = document.createElement("div");
      continuar.className = "centralizado";
      continuar.innerHTML = `<button type="button" class="botao botao--texto" data-papel="continuar">Continuar em ${estado.unidadeSelecionada.nome} →</button>`;
      container.querySelector(".tela").appendChild(continuar);
      continuar.querySelector("[data-papel=continuar]").addEventListener("click", () => navegarPara("#/cardapio"));
    }
  } catch (erro) {
    container.querySelector("#lista-unidades").innerHTML = `<p class="selo selo--indisponivel">Não foi possível carregar as unidades. Tente novamente.</p>`;
    console.error(erro);
  }
}
