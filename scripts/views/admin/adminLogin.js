/*
  Login do Painel Administrativo (ator Gerente/Administrador).
  Sessão própria, separada da sessão do Cliente e mantém os dois fluxos isolados (um Gerente autenticado aqui não afeta a sessão de Cliente e vice-versa).
*/

import { autenticarAdmin } from "../../data.js";
import { definirAdmin } from "../../state.js";
import { navegarPara } from "../../app.js";

const CONTA_ADMIN_TESTE = { email: "fernando.souza@raizesdonordeste.adm", senha: "admin123" };

export function renderAdminLogin(container) {
  container.innerHTML = `
    <div class="admin-login">
      <section class="tela" style="max-width:420px; width:100%;">
        <div class="tela-cabecalho centralizado">
          <span aria-hidden="true" style="font-size:2rem;">🌵</span>
          <h1>Painel Administrativo</h1>
          <p>Área restrita a Gerentes/Administradores da Raízes do Nordeste.</p>
        </div>

        <div class="cartao" style="background:var(--cor-superficie-alt); font-size:0.85rem;">
          <strong>Conta de teste (protótipo, dados mockados)</strong>
          <div class="flex-espacado" style="flex-wrap:wrap; gap:var(--espaco-2); margin-top:var(--espaco-2);">
            <span>${CONTA_ADMIN_TESTE.email} — senha: ${CONTA_ADMIN_TESTE.senha}</span>
            <button type="button" class="botao botao--texto" style="min-height:auto; padding:var(--espaco-1) var(--espaco-2);" data-papel="usar-conta">
              Usar esta conta
            </button>
          </div>
        </div>

        <form id="form-admin-login" class="cartao" novalidate>
          <div class="campo">
            <label for="admin-email">E-mail</label>
            <input type="email" id="admin-email" name="email" required autocomplete="email" />
          </div>
          <div class="campo">
            <label for="admin-senha">Senha</label>
            <input type="password" id="admin-senha" name="senha" required autocomplete="current-password" />
          </div>

          <p id="admin-erro" class="selo selo--indisponivel" hidden></p>

          <button type="submit" class="botao botao--primario botao--bloco">Entrar no painel</button>
        </form>

        <p class="centralizado">
          <a class="botao--texto" href="#/boas-vindas">← Voltar ao site do Cliente</a>
        </p>
      </section>
    </div>
  `;

  container.querySelector('[data-papel="usar-conta"]').addEventListener("click", () => {
    container.querySelector("#admin-email").value = CONTA_ADMIN_TESTE.email;
    container.querySelector("#admin-senha").value = CONTA_ADMIN_TESTE.senha;
  });

  container.querySelector("#form-admin-login").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const dados = new FormData(evento.target);
    const erroEl = container.querySelector("#admin-erro");
    erroEl.hidden = true;

    const admin = await autenticarAdmin(dados.get("email"), dados.get("senha"));
    if (!admin) {
      erroEl.textContent = "E-mail ou senha inválidos.";
      erroEl.hidden = false;
      return;
    }
    definirAdmin(admin);
    navegarPara("#/admin/cardapio");
  });
}
