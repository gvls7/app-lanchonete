/*
  Detalhamento de item - personalização de item: adicionais, remoção de ingredientes,
  observações e quantidade e alimenta o carrinho.
*/

import { buscarItemPorId } from "../data.js";
import { estado, adicionarAoCarrinho } from "../state.js";
import { navegarPara } from "../app.js";
import { formatarPreco } from "../components/productCard.js";

export async function renderItemDetalhe(container, params) {
  if (!estado.unidadeSelecionada) {
    navegarPara("#/boas-vindas");
    return;
  }

  const resultado = await buscarItemPorId(estado.unidadeSelecionada.id, params.id);
  if (!resultado) {
    container.innerHTML = `<p class="selo selo--indisponivel">Item não encontrado.</p>`;
    return;
  }

  const { item } = resultado;
  let quantidade = 1;
  const adicionaisSelecionados = new Set();
  const removiveisMarcados = new Set();

  function precoTotal() {
    const precoAdicionais = item.adicionais
      .filter((a) => adicionaisSelecionados.has(a.id))
      .reduce((soma, a) => soma + a.preco, 0);
    return (item.preco + precoAdicionais) * quantidade;
  }

  function render() {
    container.innerHTML = `
      <section class="tela" style="max-width:640px; margin:0 auto;">
        <button type="button" class="botao botao--texto" data-papel="voltar" style="align-self:flex-start;">← Voltar ao cardápio</button>

        <div class="cartao-produto__imagem" style="width:100%; height:200px; border-radius:var(--raio-lg);" aria-hidden="true">foto do item</div>

        <div class="tela-cabecalho">
          <h1>${item.nome}</h1>
          <p>${item.descricao}</p>
          <p style="font-size:0.8rem; color:var(--cor-texto-secundario);">${item.calorias} kcal ${item.alergenicos.length ? `• Contém: ${item.alergenicos.join(", ")}` : ""}</p>
        </div>

        ${item.disponivel === false ? '<p class="selo selo--indisponivel">Item indisponível no momento nesta unidade</p>' : ""}

        ${item.removiveis.length ? `
          <div class="cartao">
            <h2 style="font-size:1rem; margin-bottom:var(--espaco-2);">Remover ingredientes</h2>
            ${item.removiveis.map((r) => `
              <label class="campo-checkbox">
                <input type="checkbox" data-removivel="${r}" />
                <span>Sem ${r}</span>
              </label>
            `).join("")}
          </div>
        ` : ""}

        ${item.adicionais.length ? `
          <div class="cartao">
            <h2 style="font-size:1rem; margin-bottom:var(--espaco-2);">Adicionais</h2>
            ${item.adicionais.map((a) => `
              <label class="campo-checkbox flex-espacado">
                <span><input type="checkbox" data-adicional="${a.id}" /> ${a.nome}</span>
                <span>+ ${formatarPreco(a.preco)}</span>
              </label>
            `).join("")}
          </div>
        ` : ""}

        <div class="campo">
          <label for="observacao">Observações (opcional)</label>
          <textarea id="observacao" rows="2" placeholder="Ex: sem cebola, ponto da carne, etc."></textarea>
        </div>

        <div class="flex-espacado">
          <div class="flex-linha">
            <button type="button" class="botao botao--secundario" data-papel="diminuir" aria-label="Diminuir quantidade">−</button>
            <span id="quantidade-atual" style="min-width:24px; text-align:center; font-weight:700;">${quantidade}</span>
            <button type="button" class="botao botao--secundario" data-papel="aumentar" aria-label="Aumentar quantidade">+</button>
          </div>
          <strong id="preco-total">${formatarPreco(precoTotal())}</strong>
        </div>

        <button type="button" class="botao botao--primario botao--bloco" data-papel="adicionar" ${item.disponivel === false ? "disabled" : ""}>
          Adicionar ao carrinho
        </button>
      </section>
    `;

    container.querySelector('[data-papel="voltar"]').addEventListener("click", () => navegarPara("#/cardapio"));

    container.querySelectorAll("[data-adicional]").forEach((chk) => {
      chk.addEventListener("change", () => {
        chk.checked ? adicionaisSelecionados.add(chk.dataset.adicional) : adicionaisSelecionados.delete(chk.dataset.adicional);
        atualizarPreco();
      });
    });

    container.querySelectorAll("[data-removivel]").forEach((chk) => {
      chk.addEventListener("change", () => {
        chk.checked ? removiveisMarcados.add(chk.dataset.removivel) : removiveisMarcados.delete(chk.dataset.removivel);
      });
    });

    container.querySelector('[data-papel="diminuir"]').addEventListener("click", () => {
      if (quantidade > 1) quantidade--;
      container.querySelector("#quantidade-atual").textContent = quantidade;
      atualizarPreco();
    });

    container.querySelector('[data-papel="aumentar"]').addEventListener("click", () => {
      quantidade++;
      container.querySelector("#quantidade-atual").textContent = quantidade;
      atualizarPreco();
    });

    container.querySelector('[data-papel="adicionar"]').addEventListener("click", () => {
      const adicionais = item.adicionais.filter((a) => adicionaisSelecionados.has(a.id));
      adicionarAoCarrinho({
        itemId: item.id,
        nome: item.nome,
        unidadeId: estado.unidadeSelecionada.id,
        quantidade,
        precoUnitario: item.preco,
        adicionais,
        removidos: Array.from(removiveisMarcados),
        observacao: container.querySelector("#observacao").value.trim(),
      });
      navegarPara("#/carrinho");
    });

    function atualizarPreco() {
      container.querySelector("#preco-total").textContent = formatarPreco(precoTotal());
    }
  }

  render();
}
