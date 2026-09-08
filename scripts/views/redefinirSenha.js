/*
 Em uma integração real, esta tela validaria um token recebido por e-mail;
 aqui o token é apenas conceitual (a navegação já garante que só se chega
 aqui depois da etapa de envio).
*/

import { navegarPara } from "../app.js";

function obterEmailDaQuery() {
  const [, query] = location.hash.split("?");
  if (!query) return "";
  return new URLSearchParams(query).get("email") || "";
}

export function renderRedefinirSenha(container) {
  let etapa = "formulario"; // "formulario" | "sucesso"
  const email = obterEmailDaQuery();

  function render() {
    container.innerHTML = `
      <section class="tela" style="max-width:420px; margin:0 auto;">
        ${etapa === "formulario" ? `
          <div class="tela-cabecalho centralizado">
            <h1>Definir nova senha</h1>
            <p>${email ? `Conta: ${email}` : "Escolha uma nova senha para sua conta."}</p>
          </div>

          <form id="form-redefinir" class="cartao" novalidate>
            <div class="campo">
              <label for="nova-senha">Nova senha</label>
              <input type="password" id="nova-senha" name="novaSenha" required autocomplete="new-password" minlength="6" />
              <span class="campo__ajuda">Mínimo de 6 caracteres.</span>
            </div>
            <div class="campo">
              <label for="confirmar-senha">Confirmar nova senha</label>
              <input type="password" id="confirmar-senha" name="confirmarSenha" required autocomplete="new-password" minlength="6" />
              <span id="erro-confirmar" class="campo__erro" hidden>As senhas não coincidem.</span>
            </div>
            <button type="submit" class="botao botao--primario botao--bloco">Redefinir senha</button>
          </form>
        ` : `
          <div class="tela estado-central">
            <div style="font-size:3rem;" aria-hidden="true">✅</div>
            <h1>Senha redefinida!</h1>
            <p>Sua senha foi alterada com sucesso. Você já pode entrar com a nova senha.</p>
            <button type="button" class="botao botao--primario" data-papel="ir-login">Ir para o login</button>
          </div>
        `}
      </section>
    `;

    const form = container.querySelector("#form-redefinir");
    if (form) {
      const campoNova = container.querySelector("#nova-senha");
      const campoConfirmar = container.querySelector("#confirmar-senha");
      const erroEl = container.querySelector("#erro-confirmar");

      form.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const coincidem = campoNova.value === campoConfirmar.value && campoNova.value.length >= 6;
        campoConfirmar.classList.toggle("campo--invalido", !coincidem);
        erroEl.hidden = coincidem;
        if (!coincidem) {
          campoConfirmar.focus();
          return;
        }
        etapa = "sucesso";
        render();
      });
    }

    const botaoIrLogin = container.querySelector('[data-papel="ir-login"]');
    if (botaoIrLogin) {
      botaoIrLogin.addEventListener("click", () => navegarPara("#/login"));
    }
  }

  render();
}
