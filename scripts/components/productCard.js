/*
  Card de produto usado na tela de Cardápio (lista) e podia ser reaproveitado em outras listagens futuras (ex: "peça de novo").
*/

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function renderCartaoProduto(item) {
  const indisponivel = item.disponivel === false;
  return `
    <button
      type="button"
      class="cartao-produto ${indisponivel ? "cartao-produto--indisponivel" : ""}"
      data-item-id="${item.id}"
      ${indisponivel ? "disabled" : ""}
      aria-label="${item.nome}, ${formatarPreco(item.preco)}${indisponivel ? ", indisponível" : ""}"
    >
      <div class="cartao-produto__imagem" aria-hidden="true">foto</div>
      <div class="cartao-produto__corpo">
        <span class="cartao-produto__nome">${item.nome}</span>
        <span class="cartao-produto__descricao">${item.descricao}</span>
        ${indisponivel ? '<span class="selo selo--indisponivel">Indisponível no momento</span>' : ""}
        <span class="cartao-produto__preco">${formatarPreco(item.preco)}</span>
      </div>
    </button>
  `;
}

export { formatarPreco };
