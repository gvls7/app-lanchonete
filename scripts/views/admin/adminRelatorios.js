
import { buscarCardapio, listarTodaFidelidade, listarUsuarios, listarPromocoes, listarHistoricoPedidos } from "../../data.js";
import { renderAdminShell } from "../../components/adminShell.js";
import { formatarPreco } from "../../components/productCard.js";

const ROTULO_FORMA_PAGAMENTO = {
  cartao: "Cartão de crédito/débito",
  pix: "PIX",
  dinheiro: "Dinheiro na retirada",
};

function calcularEstatisticasDeVendas(historico) {
  const totalPedidos = historico.length;
  const receitaTotal = historico.reduce((soma, p) => soma + p.total, 0);
  const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0;

  const porFormaPagamento = {};
  const porUnidade = {};
  const porItem = {};

  historico.forEach((pedido) => {
    // Forma de pagamento
    const formaChave = pedido.formaPagamento || "outro";
    if (!porFormaPagamento[formaChave]) porFormaPagamento[formaChave] = { pedidos: 0, receita: 0 };
    porFormaPagamento[formaChave].pedidos += 1;
    porFormaPagamento[formaChave].receita += pedido.total;

    // Unidade
    const unidadeChave = pedido.unidadeNome || "Unidade não informada";
    if (!porUnidade[unidadeChave]) porUnidade[unidadeChave] = { pedidos: 0, receita: 0 };
    porUnidade[unidadeChave].pedidos += 1;
    porUnidade[unidadeChave].receita += pedido.total;

    // Itens mais vendidos
    (pedido.itens || []).forEach((item) => {
      if (!porItem[item.nome]) porItem[item.nome] = 0;
      porItem[item.nome] += item.quantidade;
    });
  });

  const itensMaisVendidos = Object.entries(porItem)
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  return { totalPedidos, receitaTotal, ticketMedio, porFormaPagamento, porUnidade, itensMaisVendidos };
}

const INTERVALO_ATUALIZACAO_MS = 5000;
let intervaloAtivo = null;

let tokenAtual = 0;

function renderErroRelatorios(corpo, container, meuToken) {
  if (meuToken !== tokenAtual) return;
  corpo.innerHTML = `
    <p class="selo selo--indisponivel">Não foi possível carregar os relatórios. Tente novamente.</p>
    <button type="button" class="botao botao--primario" data-papel="tentar-novamente">Tentar novamente</button>
  `;
  corpo.querySelector('[data-papel="tentar-novamente"]').addEventListener("click", () => renderAdminRelatorios(container));
}

export async function renderAdminRelatorios(container) {
  const meuToken = ++tokenAtual;
  if (intervaloAtivo) {
    clearInterval(intervaloAtivo);
    intervaloAtivo = null;
  }
  const corpo = renderAdminShell(container, "#/admin/relatorios", "Relatórios");
  corpo.innerHTML = `<p>Carregando relatórios...</p>`;

  let cardapio, fidelidadeRegistros, usuarios, promocoes, historicoPedidos;
  try {
    [cardapio, fidelidadeRegistros, usuarios, promocoes, historicoPedidos] = await Promise.all([
      buscarCardapio("un01"),
      listarTodaFidelidade(),
      listarUsuarios(),
      listarPromocoes(),
      listarHistoricoPedidos(),
    ]);
  } catch (erro) {
    console.error(erro);
    renderErroRelatorios(corpo, container, meuToken);
    return;
  }

  if (meuToken !== tokenAtual) return;

  const todosItens = cardapio.categorias.flatMap((c) => c.itens);
  const itensDisponiveis = todosItens.filter((i) => i.disponivel !== false).length;
  const itensIndisponiveis = todosItens.length - itensDisponiveis;

  const totalPontosDistribuidos = fidelidadeRegistros.reduce((soma, f) => soma + f.pontosAtuais, 0);
  const niveisContagem = usuarios.reduce((mapa, u) => {
    const nivel = u.nivelFidelidade || "Bronze";
    mapa[nivel] = (mapa[nivel] || 0) + 1;
    return mapa;
  }, {});

  const promocoesAtivas = promocoes.filter((p) => p.ativa).length;
  const promocoesComCupom = promocoes.filter((p) => p.codigo).length;
  const vendas = calcularEstatisticasDeVendas(historicoPedidos);

  corpo.innerHTML = `
    <div class="admin-secao">
      <p class="campo__ajuda">
        Relatórios calculados a partir dos dados mockados do protótipo (histórico de pedidos, cardápio-base, fidelidade e promoções). O histórico de pedidos combina alguns pedidos de exemplo com qualquer pedido pago durante esta sessão do navegador (ver "Vendas e pedidos" abaixo).
      </p>

      <div>
        <h2>Vendas e pedidos</h2>
        <div class="grade grade--3">
          <div class="stat-cartao">
            <span class="stat-cartao__valor">${vendas.totalPedidos}</span>
            <span class="stat-cartao__rotulo">Pedidos concluídos no histórico</span>
          </div>
          <div class="stat-cartao">
            <span class="stat-cartao__valor">${formatarPreco(vendas.receitaTotal)}</span>
            <span class="stat-cartao__rotulo">Receita total</span>
          </div>
          <div class="stat-cartao">
            <span class="stat-cartao__valor">${formatarPreco(vendas.ticketMedio)}</span>
            <span class="stat-cartao__rotulo">Ticket médio por pedido</span>
          </div>
        </div>

        <div class="grade grade--2" style="margin-top:var(--espaco-4);">
          <div>
            <h3 style="font-size:0.95rem; margin-bottom:var(--espaco-2);">Pedidos por forma de pagamento</h3>
            <div class="admin-tabela-wrap">
              <table class="admin-tabela">
                <thead>
                  <tr>
                    <th>Forma de pagamento</th>
                    <th>Pedidos</th>
                    <th>Receita</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(vendas.porFormaPagamento)
                    .sort(([, a], [, b]) => b.receita - a.receita)
                    .map(
                      ([forma, dados]) => `
                    <tr>
                      <td>${ROTULO_FORMA_PAGAMENTO[forma] || forma}</td>
                      <td>${dados.pedidos}</td>
                      <td>${formatarPreco(dados.receita)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                  ${vendas.totalPedidos === 0 ? `<tr><td colspan="3" class="centralizado">Nenhum pedido concluído ainda.</td></tr>` : ""}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style="font-size:0.95rem; margin-bottom:var(--espaco-2);">Pedidos por unidade</h3>
            <div class="admin-tabela-wrap">
              <table class="admin-tabela">
                <thead>
                  <tr>
                    <th>Unidade</th>
                    <th>Pedidos</th>
                    <th>Receita</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(vendas.porUnidade)
                    .sort(([, a], [, b]) => b.receita - a.receita)
                    .map(
                      ([unidade, dados]) => `
                    <tr>
                      <td>${unidade}</td>
                      <td>${dados.pedidos}</td>
                      <td>${formatarPreco(dados.receita)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                  ${vendas.totalPedidos === 0 ? `<tr><td colspan="3" class="centralizado">Nenhum pedido concluído ainda.</td></tr>` : ""}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style="margin-top:var(--espaco-4);">
          <h3 style="font-size:0.95rem; margin-bottom:var(--espaco-2);">Itens mais vendidos</h3>
          <div class="admin-tabela-wrap">
            <table class="admin-tabela">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantidade vendida</th>
                </tr>
              </thead>
              <tbody>
                ${vendas.itensMaisVendidos
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.nome}</td>
                    <td>${item.quantidade}</td>
                  </tr>
                `
                  )
                  .join("")}
                ${vendas.itensMaisVendidos.length === 0 ? `<tr><td colspan="2" class="centralizado">Nenhum pedido concluído ainda.</td></tr>` : ""}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2>Cardápio (cardápio-base, unidade de referência)</h2>
        <div class="grade grade--3">
          <div class="stat-cartao">
            <span class="stat-cartao__valor">${todosItens.length}</span>
            <span class="stat-cartao__rotulo">Itens cadastrados em ${cardapio.categorias.length} categorias</span>
          </div>
          <div class="stat-cartao">
            <span class="stat-cartao__valor">${itensDisponiveis}</span>
            <span class="stat-cartao__rotulo">Itens disponíveis</span>
          </div>
          <div class="stat-cartao">
            <span class="stat-cartao__valor">${itensIndisponiveis}</span>
            <span class="stat-cartao__rotulo">Itens indisponíveis</span>
          </div>
        </div>
      </div>

      <div>
        <h2>Fidelidade</h2>
        <div class="grade grade--3">
          <div class="stat-cartao">
            <span class="stat-cartao__valor">${totalPontosDistribuidos}</span>
            <span class="stat-cartao__rotulo">Pontos ativos distribuídos entre os clientes</span>
          </div>
          ${Object.entries(niveisContagem)
            .map(
              ([nivel, quantidade]) => `
            <div class="stat-cartao">
              <span class="stat-cartao__valor">${quantidade}</span>
              <span class="stat-cartao__rotulo">Cliente(s) no nível ${nivel}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <div>
        <h2>Promoções</h2>
        <div class="grade grade--3">
          <div class="stat-cartao">
            <span class="stat-cartao__valor">${promocoes.length}</span>
            <span class="stat-cartao__rotulo">Promoções cadastradas</span>
          </div>
          <div class="stat-cartao">
            <span class="stat-cartao__valor">${promocoesAtivas}</span>
            <span class="stat-cartao__rotulo">Promoções ativas</span>
          </div>
          <div class="stat-cartao">
            <span class="stat-cartao__valor">${promocoesComCupom}</span>
            <span class="stat-cartao__rotulo">Promoções com cupom (exigem código)</span>
          </div>
        </div>
      </div>
    </div>
  `;
  // Atualização periódica simulando "tempo real": enquanto esta tela continuar aberta, recalcula os relatórios a cada alguns segundos, para que um pedido concluído em outra aba apareça mesmo sem depender só do evento de sincronização entre abas. Para asssim que a aba do gerente for fechada
  intervaloAtivo = setInterval(() => {
    if (location.hash !== "#/admin/relatorios") {
      clearInterval(intervaloAtivo);
      intervaloAtivo = null;
      return;
    }
    renderAdminRelatorios(container);
  }, INTERVALO_ATUALIZACAO_MS);
}
