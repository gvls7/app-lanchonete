/*
Permite ao Gerente escolher uma unidade, ver os itens do cardápio por categoria e alterar preço/disponibilidade.
*/

import { listarUnidades, buscarCardapio, persistirOverrideCardapio } from "../../data.js";
import { renderAdminShell } from "../../components/adminShell.js";
import { formatarPreco } from "../../components/productCard.js";

let unidadeSelecionadaId = null;
let mensagem = "";

export async function renderAdminCardapio(container) {
  const corpo = renderAdminShell(container, "#/admin/cardapio", "Gestão de cardápio por unidade");
  corpo.innerHTML = `<p>Carregando unidades...</p>`;

  const unidades = await listarUnidades();
  if (!unidadeSelecionadaId) unidadeSelecionadaId = unidades[0].id;

  async function render() {
    const cardapio = await buscarCardapio(unidadeSelecionadaId);
    const unidadeEscolhida = unidades.find((u) => u.id === unidadeSelecionadaId);
    const usandoFallback = cardapio.unidadeId !== unidadeSelecionadaId;

    corpo.innerHTML = `
      <div class="admin-secao">
        <div class="campo" style="max-width:360px;">
          <label for="admin-unidade">Unidade</label>
          <select id="admin-unidade">
            ${unidades.map((u) => `<option value="${u.id}" ${u.id === unidadeSelecionadaId ? "selected" : ""}>${u.nome}</option>`).join("")}
          </select>
        </div>

        ${usandoFallback ? `
          <p class="selo selo--alerta">
            ${unidadeEscolhida.nome} ainda não tem cardápio próprio cadastrado - exibindo o cardápio-base como referência.
          </p>
        ` : ""}

        ${mensagem ? `<p class="selo selo--sucesso">${mensagem}</p>` : ""}

        ${cardapio.categorias
          .map(
            (categoria) => `
          <div>
            <h2 style="font-size:1rem; margin-bottom:var(--espaco-2);">${categoria.nome}</h2>
            <div class="admin-tabela-wrap">
              <table class="admin-tabela">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Preço (R$)</th>
                    <th>Disponível</th>
                  </tr>
                </thead>
                <tbody>
                  ${categoria.itens
                    .map(
                      (item) => `
                    <tr>
                      <td>
                        <strong>${item.nome}</strong>
                        <br />
                        <span style="font-size:0.8rem; color:var(--cor-texto-secundario);">${formatarPreco(item.preco)} atual</span>
                      </td>
                      <td>
                        <input type="number" min="0" step="0.10" value="${item.preco.toFixed(2)}" data-preco="${item.id}" aria-label="Preço de ${item.nome}" />
                      </td>
                      <td>
                        <label class="interruptor">
                          <input type="checkbox" data-disponivel="${item.id}" ${item.disponivel !== false ? "checked" : ""} />
                          <span class="interruptor__trilho" aria-hidden="true"></span>
                          <span>${item.disponivel !== false ? "Disponível" : "Indisponível"}</span>
                        </label>
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    corpo.querySelector("#admin-unidade").addEventListener("change", (evento) => {
      unidadeSelecionadaId = evento.target.value;
      mensagem = "";
      render();
    });

    corpo.querySelectorAll("[data-preco]").forEach((input) => {
      input.addEventListener("change", () => {
        const item = encontrarItem(cardapio, input.dataset.preco);
        const novoValor = Number(input.value);
        if (!item || Number.isNaN(novoValor) || novoValor < 0) {
          input.value = item ? item.preco.toFixed(2) : "0.00";
          return;
        }
        item.preco = novoValor;
        persistirOverrideCardapio(item.id, { preco: novoValor });
        mensagem = `Preço de "${item.nome}" atualizado para ${formatarPreco(novoValor)}.`;
        render();
      });
    });

    corpo.querySelectorAll("[data-disponivel]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const item = encontrarItem(cardapio, checkbox.dataset.disponivel);
        if (!item) return;
        item.disponivel = checkbox.checked;
        persistirOverrideCardapio(item.id, { disponivel: checkbox.checked });
        mensagem = `"${item.nome}" agora está ${checkbox.checked ? "disponível" : "indisponível"}.`;
        render();
      });
    });
  }

  function encontrarItem(cardapio, itemId) {
    for (const categoria of cardapio.categorias) {
      const item = categoria.itens.find((i) => i.id === itemId);
      if (item) return item;
    }
    return null;
  }

  render();
}
