/*
  Painel Administrativo: cabeçalho com identificação do Gerente logado, sub-navegação entre as 3 áreas (Cardápio, promoções, relatórios) e "Sair" (encerra a sessão de admin, distinta da sessão de Cliente). Cada tela do admin (scripts/views/admin/*.js) chama renderAdminShell() e recebe um elemento vazio para preencher com o seu próprio conteúdo.
*/

import { estado, encerrarSessaoAdmin } from "../state.js";
import { navegarPara } from "../app.js";

const ABAS = [
  { rota: "#/admin/cardapio", rotulo: "Cardápio", icone: "🍽️" },
  { rota: "#/admin/promocoes", rotulo: "Promoções", icone: "🏷️" },
  { rota: "#/admin/relatorios", rotulo: "Relatórios", icone: "📊" },
];

/**
 * @param {HTMLElement} container - elemento principal da rota
 * @param {string} abaAtiva - rota da aba atual, para destacar no menu
 * @param {string} tituloTela - título da área exibido no cabeçalho de conteúdo
 * @returns {HTMLElement} elemento vazio para a tela preencher
 */
export function renderAdminShell(container, abaAtiva, tituloTela) {
  const admin = estado.admin;

  container.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-menu" aria-label="Áreas do painel administrativo">
        <div class="admin-menu__marca">
          <span aria-hidden="true">🌵</span>
          <span>Painel Admin</span>
        </div>
        <nav class="admin-menu__abas">
          ${ABAS.map(
            (aba) => `
            <a class="admin-menu__aba" href="${aba.rota}" ${aba.rota === abaAtiva ? 'aria-current="page"' : ""}>
              <span aria-hidden="true">${aba.icone}</span>
              <span>${aba.rotulo}</span>
            </a>
          `
          ).join("")}
        </nav>
        <div class="admin-menu__conta">
          <p class="admin-menu__conta-nome">${admin ? admin.nome : ""}</p>
          <p class="admin-menu__conta-cargo">${admin ? admin.cargo : ""}</p>
          <button type="button" class="botao botao--secundario botao--bloco" data-papel="sair-admin">Sair</button>
        </div>
      </aside>

      <main class="admin-conteudo">
        <div class="tela-cabecalho">
          <h1>${tituloTela}</h1>
        </div>
        <div data-papel="admin-corpo"></div>
      </main>
    </div>
  `;

  container.querySelector('[data-papel="sair-admin"]').addEventListener("click", () => {
    encerrarSessaoAdmin();
    navegarPara("#/admin/login");
  });

  return container.querySelector('[data-papel="admin-corpo"]');
}
