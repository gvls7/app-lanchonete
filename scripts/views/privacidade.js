/*
  Política de Privacidade e Termo de Consentimento (LGPD) - tela de apoio
  referenciada pelo banner de cookies ("saiba mais") e pelo modal de consentimento exibido no cadastro ("Termos de Privacidade"). Conteúdo conceitual/institucional para fins do protótipo: consentimento, cookies, finalidade, minimização, acesso, exclusão, dados de pagamento e geolocalização.
*/

import { navegarPara } from "../app.js";

export function renderPrivacidade(container) {
  container.innerHTML = `
    <section class="tela" style="max-width:720px; margin:0 auto;">
      <button type="button" class="botao botao--texto" data-papel="voltar" style="align-self:flex-start;">← Voltar</button>

      <div class="tela-cabecalho">
        <h1>Política de Privacidade e Termo de Consentimento</h1>
        <p>Raízes do Nordeste — última atualização: setembro de 2026</p>
      </div>

      <div class="cartao documento-legal">
        <span class="selo selo--sucesso">Protótipo acadêmico — nenhum dado real é coletado ou processado</span>
        <p>
          Este documento explica quais dados a Raízes do Nordeste coletaria em um sistema real de pedidos multicanal (App, Totem e Web), para quê, e quais direitos você teria sobre eles, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei n° 13.709/2018). Como este projeto é um protótipo de interface com dados mockados, nenhuma informação preenchida aqui é armazenada em um servidor real.
        </p>

        <h2>1. Termo de consentimento</h2>
        <p>
          Ao marcar a caixa de consentimento na tela de cadastro, você concorda que o Raízes do Nordeste colete e utilize os dados abaixo, exclusivamente para as finalidades aqui descritas:
        </p>
        <ul>
          <li><strong>Nome</strong> - identificação da conta e do pedido junto à unidade.</li>
          <li><strong>E-mail</strong> - login, recuperação de senha e comunicações sobre o status do pedido.</li>
          <li><strong>Telefone</strong> - contato em caso de problema com o pedido (ex: item indisponível, atraso).</li>
          <li><strong>Senha</strong> - autenticação da conta (armazenada de forma protegida, nunca em texto puro, em um sistema real).</li>
        </ul>
        <p>
          Este consentimento é a base legal do tratamento (LGPD, Art. 7°, I) e pode ser revogado a qualquer momento pelo encerramento da conta (ver seção 5).
        </p>

        <h2>2. Quais dados coletamos e por quê</h2>
        <ul>
          <li><strong>Dados de cadastro</strong> (nome, e-mail, telefone, senha) - autenticação e comunicação sobre pedidos. Finalidade declarada no ato do cadastro (Art. 6°, I).</li>
          <li><strong>Dados do pedido</strong> (itens escolhidos, observações, unidade selecionada) - processar e entregar o pedido corretamente.</li>
          <li><strong>Programa de fidelidade</strong> (pontos, nível, histórico de resgates) - calcular benefícios e recompensas da sua conta.</li>
          <li><strong>Cookies e preferências de navegação</strong> (unidade favorita, itens no carrinho) - manter sua experiência entre visitas, com aviso e opção de recusa (ver seção 3).</li>
        </ul>
        <p>
          Coletamos apenas o que é necessário para essas finalidades (princípio da minimização de dados, Art. 6°, III) - por isso o cadastro pede só nome,
          e-mail, telefone e senha, nada além disso.
        </p>

        <h2>3. Cookies</h2>
        <p>
          Na primeira visita, um aviso pergunta se você aceita cookies não essenciais (usados para lembrar sua unidade e seu carrinho). Cookies estritamente necessários ao funcionamento básico do site continuam ativos mesmo se você recusar, pois sem eles a navegação não funcionaria. Você pode alterar sua escolha limpando os dados de navegação do seu navegador.
        </p>

        <h2>4. Compartilhamento com terceiros</h2>
        <p>
          Dados de pagamento (número de cartão, dados do PIX etc.) não são coletados nem armazenados por este sistema em nenhum momento - o envio do pagamento é apenas simulado nesta interface (Art. 46°). Em uma integração real, esses dados seriam tratados diretamente pelo sistema de pagamento externo (gateway), sob a política de privacidade dele. Não vendemos nem compartilhamos seus dados de cadastro com terceiros para fins de marketing
          sem uma autorização adicional e específica sua.
        </p>

        <h2>5. Seus direitos como titular dos dados</h2>
        <ul>
          <li><strong>Acesso</strong> - solicitar uma cópia dos dados que temos sobre você (Art. 18°, II).</li>
          <li><strong>Correção</strong> - atualizar dados de cadastro incorretos ou desatualizados.</li>
          <li><strong>Exclusão</strong> - encerrar sua conta e apagar seus dados pessoais a qualquer momento (Art. 18°, VI), exceto informações que a lei exija manter (ex: histórico fiscal de pedidos, quando aplicável).</li>
          <li><strong>Revogação do consentimento</strong> - parar de usar o serviço e retirar sua autorização a qualquer momento, sem afetar tratamentos já realizados antes da revogação.</li>
        </ul>

        <h2>6. Geolocalização</h2>
        <p>
          A seleção de unidade nesta interface é feita manualmente pelo cliente. Caso uma futura versão utilize a localização do dispositivo para sugerir a unidade mais próxima, isso seria informado de forma clara antes de qualquer acesso à sua localização, com opção de recusa (Art. 6°, VI).
        </p>

        <h2>7. Retenção dos dados</h2>
        <p>
          Os dados de cadastro seriam mantidos enquanto sua conta estiver ativa. Após a exclusão da conta, os dados pessoais seriam removidos, exceto quando a
          legislação exigir sua manutenção por prazo determinado.
        </p>

        <h2>8. Alterações desta política</h2>
        <p>
          Esta política pode ser atualizada para refletir mudanças no serviço ou na legislação. A data no topo desta página indica a versão mais recente.
        </p>

        <h2>9. Contato</h2>
        <p>
          Dúvidas sobre o uso dos seus dados podem ser enviadas ao encarregado de proteção de dados (DPO) fictício deste protótipo:
          <strong>privacidade@raizesdonordeste.exemplo</strong>.
        </p>
      </div>
    </section>
  `;

  container.querySelector('[data-papel="voltar"]').addEventListener("click", () => {
    if (history.length > 1) {
      history.back();
    } else {
      navegarPara("#/boas-vindas");
    }
  });
}
