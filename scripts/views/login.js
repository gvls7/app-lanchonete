/*
  Login / Cadastro com aviso de LGPD - cobre cadastro, login, recuperação de senha, link
  simulado e os pontos LGPD (consentimento explícito, checkbox obrigatório no cadastro, finalidade declarada e minimização de dados: só pedimos nome, e-mail, telefone e senha).
*/

import { autenticar } from "../data.js";
import { definirUsuario, registrarConsentimento } from "../state.js";
import { navegarPara } from "../app.js";
import { abrirModal } from "../components/modal.js";

// Contas mockadas em data/usuarios.json, expostas aqui para que quem estiver avaliando o protótipo consiga testar o login sem precisar abrir o JSON.
const CONTAS_TESTE = [
  { email: "gustavo.luiz@email.com", senha: "123456" },
  { email: "gabriel.silva@email.com", senha: "123456" },
];

function abrirConsentimentoCadastro(aoConsentir) {
  abrirModal({
    titulo: "Antes de continuar",
    fecharPeloFundo: false,
    corpoHTML: `
      <p style="font-size:0.9rem; color:var(--cor-texto-secundario);">
        Para criar sua conta, coletamos <strong>nome, e-mail, telefone e senha</strong> —
        apenas o necessário para autenticar você e enviar atualizações do seu pedido
        (finalidade declarada, LGPD Art. 6°, I). Seus dados não são compartilhados
        com terceiros para fins de marketing sem autorização adicional.
      </p>
      <label class="campo-checkbox">
        <input type="checkbox" id="consentimento-dados" required />
        <span>Li e concordo com o uso dos meus dados conforme descrito acima e com os
        <a href="#/privacidade">Termos de Privacidade</a>. (obrigatório para criar a conta)</span>
      </label>
      <button type="button" class="botao botao--primario botao--bloco" data-papel="confirmar" disabled>
        Confirmar e criar conta
      </button>
    `,
    aoMontar: (raiz, fechar) => {
      const checkbox = raiz.querySelector("#consentimento-dados");
      const botaoConfirmar = raiz.querySelector('[data-papel="confirmar"]');
      checkbox.addEventListener("change", () => {
        botaoConfirmar.disabled = !checkbox.checked;
      });
      botaoConfirmar.addEventListener("click", () => {
        registrarConsentimento({ aceitouCadastro: true });
        fechar();
        aoConsentir();
      });
    },
  });
}

export function renderLogin(container) {
  let modoCadastro = false;

  function montar() {
    container.innerHTML = `
      <section class="tela" style="max-width:420px; margin:0 auto;">
        <div class="tela-cabecalho centralizado">
          <h1>${modoCadastro ? "Criar conta" : "Entrar"}</h1>
          <p>${modoCadastro ? "Leva menos de um minuto." : "Acompanhe pedidos, pontos e promoções."}</p>
        </div>

        ${!modoCadastro ? `
          <div class="cartao" style="background:var(--cor-superficie-alt); font-size:0.85rem;">
            <strong>Contas de teste (protótipo, dados mockados)</strong>
            <div style="display:flex; flex-direction:column; gap:var(--espaco-2); margin-top:var(--espaco-2);">
              ${CONTAS_TESTE.map(
                (conta) => `
                <div class="flex-espacado" style="flex-wrap:wrap; gap:var(--espaco-2);">
                  <span>${conta.email} — senha: ${conta.senha}</span>
                  <button type="button" class="botao botao--texto" style="min-height:auto; padding:var(--espaco-1) var(--espaco-2);" data-preencher-email="${conta.email}" data-preencher-senha="${conta.senha}">
                    Usar esta conta
                  </button>
                </div>
              `
              ).join("")}
            </div>
          </div>
        ` : ""}

        <form id="form-auth" class="cartao" novalidate>
          ${modoCadastro ? `
            <div class="campo">
              <label for="nome">Nome completo</label>
              <input type="text" id="nome" name="nome" required autocomplete="name" />
            </div>
          ` : ""}
          <div class="campo">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" required autocomplete="email" value="gustavo.luiz@email.com" />
          </div>
          ${modoCadastro ? `
            <div class="campo">
              <label for="telefone">Telefone</label>
              <input type="tel" id="telefone" name="telefone" required autocomplete="tel" placeholder="(00) 00000-0000" />
            </div>
          ` : ""}
          <div class="campo">
            <label for="senha">Senha</label>
            <input type="password" id="senha" name="senha" required autocomplete="current-password" value="123456" />
            <span class="campo__ajuda">Dado de exemplo já preenchido — este é um protótipo com dados mockados.</span>
          </div>

          <p id="erro-auth" class="selo selo--indisponivel" hidden></p>

          <button type="submit" class="botao botao--primario botao--bloco">
            ${modoCadastro ? "Criar conta" : "Entrar"}
          </button>
          ${!modoCadastro ? `<button type="button" class="botao botao--texto" data-papel="esqueci">Esqueci minha senha</button>` : ""}
        </form>

        <p class="centralizado">
          ${modoCadastro ? "Já tem conta?" : "Ainda não tem conta?"}
          <button type="button" class="botao--texto" data-papel="alternar">${modoCadastro ? "Entrar" : "Criar conta"}</button>
        </p>

        <button type="button" class="botao botao--secundario botao--bloco" data-papel="continuar-visitante">
          Continuar como visitante
        </button>
      </section>
    `;

    container.querySelector('[data-papel="alternar"]').addEventListener("click", () => {
      modoCadastro = !modoCadastro;
      montar();
    });

    container.querySelectorAll("[data-preencher-email]").forEach((botao) => {
      botao.addEventListener("click", () => {
        container.querySelector("#email").value = botao.dataset.preencherEmail;
        container.querySelector("#senha").value = botao.dataset.preencherSenha;
      });
    });

    container.querySelector('[data-papel="continuar-visitante"]').addEventListener("click", () => {
      navegarPara("#/cardapio");
    });

    const botaoEsqueci = container.querySelector('[data-papel="esqueci"]');
    if (botaoEsqueci) {
      botaoEsqueci.addEventListener("click", () => {
        alert("Fluxo de recuperação de senha simulado: um link seria enviado ao e-mail informado.");
      });
    }

    container.querySelector("#form-auth").addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const dados = new FormData(evento.target);
      const email = dados.get("email");
      const senha = dados.get("senha");
      const erroEl = container.querySelector("#erro-auth");
      erroEl.hidden = true;

      if (modoCadastro) {
        abrirConsentimentoCadastro(() => {
          // Cadastro mockado: não persiste em usuarios.json (somente leitura),
          // mas já autentica a sessão com os dados informados no formulário.
          definirUsuario({
            id: "novo-usuario",
            nome: dados.get("nome"),
            email,
            pontosAcumulados: 0,
            nivelFidelidade: "Bronze",
          });
          navegarPara("#/cardapio");
        });
        return;
      }

      const usuario = await autenticar(email, senha);
      if (!usuario) {
        erroEl.textContent = "E-mail ou senha inválidos. Tente novamente.";
        erroEl.hidden = false;
        return;
      }
      definirUsuario(usuario);
      navegarPara("#/fidelidade");
    });
  }

  montar();
}
