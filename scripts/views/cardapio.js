/*
  Cardápio por unidade - cardápio dinâmico por unidade, categorias, filtro simples por categoria e indicação de item indisponível.
*/

import { buscarCardapio } from "../data.js";
import { estado, ehTotem } from "../state.js";
import { navegarPara } from "../app.js";
import { renderCartaoProduto } from "../components/productCard.js";

export async function renderCardapio(container) {
  if (!estado.unidadeSelecionada) {
    navegarPara("#/boas-vindas");
    return;
  }

  container.innerHTML = `
    <section class="tela">
      <div class="tela-cabecalho">
        <h1>Cardápio</h1>
        <p>${estado.unidadeSelecionada.nome}</p>
      </div>
      ${ehTotem() ? '<div class="banner-totem">Modo totem — toque nos itens para personalizar e adicionar ao pedido.</div>' : ""}
      <div id="filtros-categoria" class="flex-linha" style="flex-wrap:wrap;" role="tablist" aria-label="Filtrar por categoria"></div>
      <div id="lista-categorias" aria-live="polite">
        <p>Carregando cardápio...</p>
      </div>
    </section>
  `;

  const cardapio = await buscarCardapio(estado.unidadeSelecionada.id);
  let categoriaAtiva = "todas";

  function renderLista() {
    const listaEl = container.querySelector("#lista-categorias");
    const categoriasParaExibir =
      categoriaAtiva === "todas"
        ? cardapio.categorias
        : cardapio.categorias.filter((c) => c.id === categoriaAtiva);

    listaEl.innerHTML = categoriasParaExibir
      .map(
        (categoria) => `
        <div class="tela" style="gap:var(--espaco-3); margin-bottom:var(--espaco-5);">
          <h2 style="font-size:1.1rem;">${categoria.nome}</h2>
          <div class="grade grade--2">
            ${categoria.itens.map((item) => renderCartaoProduto(item)).join("")}
          </div>
        </div>
      `
      )
      .join("");

    listaEl.querySelectorAll("[data-item-id]:not([disabled])").forEach((botao) => {
      botao.addEventListener("click", () => {
        navegarPara(`#/item/${botao.dataset.itemId}`);
      });
    });
  }

  const filtrosEl = container.querySelector("#filtros-categoria");
  const categorias = [{ id: "todas", nome: "Todas" }, ...cardapio.categorias];
  filtrosEl.innerHTML = categorias
    .map(
      (c) => `<button type="button" class="botao ${c.id === categoriaAtiva ? "botao--primario" : "botao--secundario"}" data-categoria="${c.id}" role="tab" aria-selected="${c.id === categoriaAtiva}">${c.nome}</button>`
    )
    .join("");

  filtrosEl.querySelectorAll("[data-categoria]").forEach((botao) => {
    botao.addEventListener("click", () => {
      categoriaAtiva = botao.dataset.categoria;
      filtrosEl.querySelectorAll("[data-categoria]").forEach((b) => {
        const ativo = b.dataset.categoria === categoriaAtiva;
        b.classList.toggle("botao--primario", ativo);
        b.classList.toggle("botao--secundario", !ativo);
        b.setAttribute("aria-selected", String(ativo));
      });
      renderLista();
    });
  });

  renderLista();
}
