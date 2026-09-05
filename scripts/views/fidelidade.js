/*
  Área de Fidelidade / Pontos - acúmulo de pontos, resgate de recompensas e extrato de pontos.
*/

import { buscarFidelidade } from "../data.js";
import { estado } from "../state.js";
import { navegarPara } from "../app.js";
import { renderBadgeFidelidade } from "../components/loyaltyBadge.js";

export async function renderFidelidade(container) {
  if (!estado.usuario) {
    container.innerHTML = `
      <section class="tela estado-central">
        <h1>Programa de Fidelidade</h1>
        <p>Entre na sua conta para ver seus pontos, nível e recompensas disponíveis.</p>
        <button type="button" class="botao botao--primario" data-papel="login">Entrar</button>
      </section>
    `;
    container.querySelector('[data-papel="login"]').addEventListener("click", () => navegarPara("#/login"));
    return;
  }

  container.innerHTML = `<section class="tela"><p>Carregando fidelidade...</p></section>`;

  // Usuários recém-cadastrados no protótipo (mock) ainda não têm registro em
  // fidelidade.json — usamos o registro de exemplo (usr01) como referência.
  const fidelidade = (await buscarFidelidade(estado.usuario.id)) || (await buscarFidelidade("usr01"));

  container.innerHTML = `
    <section class="tela" style="max-width:560px; margin:0 auto;">
      <div class="tela-cabecalho">
        <h1>Fidelidade</h1>
        <p>Olá, ${estado.usuario.nome}</p>
      </div>

      ${renderBadgeFidelidade(fidelidade)}

      <div>
        <h2 style="font-size:1rem; margin-bottom:var(--espaco-3);">Recompensas disponíveis</h2>
        <div style="display:flex; flex-direction:column; gap:var(--espaco-2);">
          ${fidelidade.recompensasDisponiveis
            .map(
              (r) => `
            <div class="cartao flex-espacado">
              <div>
                <strong>${r.nome}</strong>
                <p style="font-size:0.8rem; color:var(--cor-texto-secundario);">${r.pontosNecessarios} pontos</p>
              </div>
              <button type="button" class="botao ${r.disponivel && fidelidade.pontosAtuais >= r.pontosNecessarios ? "botao--primario" : "botao--secundario"}"
                data-recompensa="${r.id}"
                ${r.disponivel && fidelidade.pontosAtuais >= r.pontosNecessarios ? "" : "disabled"}>
                Resgatar
              </button>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <div>
        <h2 style="font-size:1rem; margin-bottom:var(--espaco-3);">Extrato de pontos</h2>
        <div style="display:flex; flex-direction:column; gap:var(--espaco-1);">
          ${fidelidade.historico
            .map(
              (h) => `
            <div class="resumo-linha">
              <span>${h.descricao} <br><small style="color:var(--cor-texto-secundario);">${new Date(h.data).toLocaleDateString("pt-BR")}</small></span>
              <span class="${h.pontos > 0 ? "resumo-linha--desconto" : ""}">${h.pontos > 0 ? "+" : ""}${h.pontos}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;

  container.querySelectorAll("[data-recompensa]:not([disabled])").forEach((botao) => {
    botao.addEventListener("click", () => {
      alert("Resgate simulado! Em uma integração real, os pontos seriam debitados e um cupom seria gerado.");
    });
  });
}
