/*
  Promoções e Campanhas - exibição de promoções e campanhas segmentadas - aqui, a promoção "Combo Fidelidade Ouro" só aparece destacada para quem
  tem nível compatível.
*/

import { listarPromocoes } from "../data.js";
import { estado } from "../state.js";
import { navegarPara } from "../app.js";

const ORDEM_NIVEIS = ["Bronze", "Prata", "Ouro", "Diamante"];

function usuarioElegivel(promocao) {
  if (!promocao.codigo) return true; // promoção geral, sem segmentação
  if (!estado.usuario) return false;
  // Segmentação simples: cupons com "OURO" no código exigem nível Ouro ou superior.
  if (promocao.codigo.includes("OURO")) {
    return ORDEM_NIVEIS.indexOf(estado.usuario.nivelFidelidade || "Bronze") >= ORDEM_NIVEIS.indexOf("Ouro");
  }
  return true;
}

export async function renderPromocoes(container) {
  container.innerHTML = `<section class="tela"><p>Carregando promoções...</p></section>`;
  const promocoes = (await listarPromocoes()).filter((p) => p.ativa);

  container.innerHTML = `
    <section class="tela">
      <div class="tela-cabecalho">
        <h1>Promoções e campanhas</h1>
        <p>Ofertas válidas em todas as unidades participantes.</p>
      </div>
      <div class="grade grade--2">
        ${promocoes
          .map((promo) => {
            const elegivel = usuarioElegivel(promo);
            return `
            <div class="cartao">
              <div class="flex-espacado">
                <strong>${promo.titulo}</strong>
                ${promo.codigo ? `<span class="selo ${elegivel ? "selo--sucesso" : ""}">${promo.codigo}</span>` : ""}
              </div>
              <p style="font-size:0.9rem; color:var(--cor-texto-secundario); margin-top:var(--espaco-2);">${promo.descricao}</p>
              ${!elegivel ? `<p class="selo selo--alerta" style="margin-top:var(--espaco-2);">Disponível para clientes nível Ouro ou Diamante</p>` : ""}
              <button type="button" class="botao botao--secundario botao--bloco" style="margin-top:var(--espaco-3);" data-papel="usar" ${elegivel ? "" : "disabled"}>
                Usar no carrinho
              </button>
            </div>
          `;
          })
          .join("")}
      </div>
    </section>
  `;

  container.querySelectorAll('[data-papel="usar"]:not([disabled])').forEach((botao) => {
    botao.addEventListener("click", () => navegarPara("#/carrinho"));
  });
}
