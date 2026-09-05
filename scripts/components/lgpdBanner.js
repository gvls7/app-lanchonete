/*
  Aviso de cookies exibido na primeira visita (LGPD -aviso de cookies).
  Ficará escondido nas visitas seguintes assim que o usuário escolher uma das opções, com a escolha registrada em state.js + localStorage.
*/

import { estado, registrarConsentimento } from "../state.js";

export function iniciarBannerCookies() {
  const banner = document.getElementById("cookie-banner");
  if (!banner) return;

  const jaRespondeu = estado.consentimentoLGPD && "aceitouCookies" in estado.consentimentoLGPD;
  if (jaRespondeu) {
    banner.hidden = true;
    document.body.classList.remove("tem-aviso-cookies");
    return;
  }

  banner.hidden = false;
  // Reserva espaço na parte inferior da tela enquanto o banner estiver
  // visível, para que ele nunca sobreponha botões de ação das telas
  // (ex: "Adicionar ao carrinho" no fim da tela de Detalhamento de Item).
  document.body.classList.add("tem-aviso-cookies");
  banner.innerHTML = `
    <p>
      Usamos cookies e dados de navegação para lembrar sua unidade favorita, seu
      carrinho e melhorar sua experiência. Você pode aceitar ou recusar os
      cookies não essenciais a qualquer momento.
      (<a class="botao--texto" href="#/privacidade" data-papel="saiba-mais">saiba mais sobre o uso dos seus dados</a>)
    </p>
    <div class="cookie-banner__acoes">
      <button type="button" class="botao botao--secundario" data-papel="recusar">Recusar</button>
      <button type="button" class="botao botao--primario" data-papel="aceitar">Aceitar cookies</button>
    </div>
  `;

  banner.querySelector('[data-papel="aceitar"]').addEventListener("click", () => {
    registrarConsentimento({ aceitouCookies: true });
    banner.hidden = true;
    document.body.classList.remove("tem-aviso-cookies");
  });

  banner.querySelector('[data-papel="recusar"]').addEventListener("click", () => {
    registrarConsentimento({ aceitouCookies: false });
    banner.hidden = true;
    document.body.classList.remove("tem-aviso-cookies");
  });
}
