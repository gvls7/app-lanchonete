/*
  Modal genérico reaproveitado por várias telas (consentimento LGPD, confirmações, detalhes rápidos). Recebe HTML já pronto e cuida de
  abrir/fechar, clique fora e tecla Esc (não funcionou ---- TENHO QUE REVISAR).
*/

let aoFecharAtual = null;

export function abrirModal({ titulo, corpoHTML, aoMontar, fecharPeloFundo = true }) {
  const raiz = document.getElementById("modal-root");
  raiz.innerHTML = `
    <div class="modal-fundo" data-papel="fundo">
      <div class="modal-caixa" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div class="modal-caixa__cabecalho">
          <h2 id="modal-titulo">${titulo}</h2>
          <button type="button" class="modal-caixa__fechar" data-papel="fechar" aria-label="Fechar">✕</button>
        </div>
        <div class="modal-caixa__corpo">${corpoHTML}</div>
      </div>
    </div>
  `;

  const fundo = raiz.querySelector('[data-papel="fundo"]');
  const botaoFechar = raiz.querySelector('[data-papel="fechar"]');

  function fechar() {
    raiz.innerHTML = "";
    document.removeEventListener("keydown", aoTeclarEsc);
    aoFecharAtual = null;
  }

  function aoTeclarEsc(evento) {
    if (evento.key === "Escape") fechar();
  }

  botaoFechar.addEventListener("click", fechar);
  if (fecharPeloFundo) {
    fundo.addEventListener("click", (evento) => {
      if (evento.target === fundo) fechar();
    });
  }
  document.addEventListener("keydown", aoTeclarEsc);

  aoFecharAtual = fechar;

  if (aoMontar) aoMontar(raiz, fechar);

  // move o foco para dentro do modal (acessibilidade)
  raiz.querySelector(".modal-caixa").focus?.();

  return fechar;
}

export function fecharModal() {
  if (aoFecharAtual) aoFecharAtual();
}
