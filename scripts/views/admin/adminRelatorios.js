
import { buscarCardapio, listarTodaFidelidade, listarUsuarios, listarPromocoes } from "../../data.js";
import { renderAdminShell } from "../../components/adminShell.js";

export async function renderAdminRelatorios(container) {
  const corpo = renderAdminShell(container, "#/admin/relatorios", "Relatórios simples");
  corpo.innerHTML = `<p>Carregando relatórios...</p>`;

  const [cardapio, fidelidadeRegistros, usuarios, promocoes] = await Promise.all([
    buscarCardapio("un01"),
    listarTodaFidelidade(),
    listarUsuarios(),
    listarPromocoes(),
  ]);

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

  corpo.innerHTML = `
    <div class="admin-secao">
      <p class="campo__ajuda">
        Relatórios calculados a partir dos dados mockados do protótipo (cardápio-base, fidelidade e promoções) - não há um histórico de pedidos para relatórios de vendas/receita.
      </p>

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
}
