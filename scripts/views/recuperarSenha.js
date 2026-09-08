/*
Cliente informa o e-mail da conta e, em uma integração real, receberia um link por e-mail
para redefinir a senha. Por segurança, a mensagem de confirmação é sempre a mesma, exista ou não uma conta com aquele e-mail. O sistema não informa se um e-mail está ou não cadastrado.
*/

import { emailValido } from "./login.js";
import { navegarPara } from "../app.js";

export function renderRecuperarSenha(container) {
  let etapa = "formulario"; // "formulario" | "enviado"
  let emailInformado = "";

  function render() {
    container.innerHTML = `
      <section class="tela" style="max-width:420px; margin:0 auto;">
        <button type="button" class="botao botao--texto" data-papel="voltar" style="align-self:flex-start;">← Voltar ao login</button>

        ${etapa === "formulario" ? `
          <div class="tela-cabecalho centralizado">
            <h1>Recuperar senha</h1>
            <p>Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.</p>
          </div>

          <form id="form-recuperar" class="cartao" novalidate>
            <div class="campo">
              <label for="email-recuperar">E-mail</label>
              <input type="email" id="email-recuperar" name="email" required autocomplete="email" placeholder="seu@email.com" />
              <span id="erro-email-recuperar" class="campo__erro" hidden>Insira um e-mail válido.</span>
            </div>
            <button type="submit" class="botao botao--primario botao--bloco">Enviar link de recuperação</button>
          </form>
        ` : `
          <div class="tela estado-central">
            <div style="font-size:3rem;" aria-hidden="true">📧</div>
            <h1>Verifique seu e-mail</h1>
            <p>
              Se houver uma conta cadastrada com o e-mail <strong>${emailInformado}</strong>,
              enviamos um link para redefinir sua senha.
            </p>
            <p class="campo__ajuda">
              Protótipo: não existe envio de e-mail real. Use o botão abaixo para simular a
              abertura do link que seria recebido.
            </p>
            <button type="button" class="botao botao--primario" data-papel="simular-link">
              Simular abertura do link recebido por e-mail
            </button>
          </div>
        `}
      </section>
    `;

    container.querySelector('[data-papel="voltar"]').addEventListener("click", () => navegarPara("#/login"));

    const form = container.querySelector("#form-recuperar");
    if (form) {
      const campoEmail = container.querySelector("#email-recuperar");
      const erroEl = container.querySelector("#erro-email-recuperar");

      form.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const valido = emailValido(campoEmail.value);
        campoEmail.classList.toggle("campo--invalido", !valido);
        erroEl.hidden = valido;
        if (!valido) {
          campoEmail.focus();
          return;
        }
        emailInformado = campoEmail.value.trim();
        etapa = "enviado";
        render();
      });
    }

    const botaoSimularLink = container.querySelector('[data-papel="simular-link"]');
    if (botaoSimularLink) {
      botaoSimularLink.addEventListener("click", () => {
        navegarPara(`#/redefinir-senha?email=${encodeURIComponent(emailInformado)}`);
      });
    }
  }

  render();
}
