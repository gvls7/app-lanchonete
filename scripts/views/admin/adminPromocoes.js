/*
  Lista as promoções mockadas, permite ativar/desativar, criar uma nova promoção e excluir.
*/

import { listarPromocoes, persistirPromocoes } from "../../data.js";
import { renderAdminShell } from "../../components/adminShell.js";
import { formatarPreco } from "../../components/productCard.js";

let mensagem = "";
let formularioAberto = false;

export async function renderAdminPromocoes(container) {
  const corpo = renderAdminShell(container, "#/admin/promocoes", "Gestão de promoções e campanhas");
  corpo.innerHTML = `<p>Carregando promoções...</p>`;

  const promocoes = await listarPromocoes();

  function formatarValor(promo) {
    return promo.tipo === "percentual" ? `${promo.valorDesconto}%` : formatarPreco(promo.valorDesconto);
  }

  function render() {
    corpo.innerHTML = `
      <div class="admin-secao">
        ${mensagem ? `<p class="selo selo--sucesso">${mensagem}</p>` : ""}

        <div class="flex-espacado">
          <p class="campo__ajuda" style="margin:0;">${promocoes.length} promoção(ões) cadastrada(s)</p>
          <button type="button" class="botao botao--primario" data-papel="nova">
            ${formularioAberto ? "Cancelar" : "+ Nova promoção"}
          </button>
        </div>

        ${formularioAberto ? renderFormularioNovaPromocao() : ""}

        <div class="admin-tabela-wrap">
          <table class="admin-tabela">
            <thead>
              <tr>
                <th>Título</th>
                <th>Desconto</th>
                <th>Cupom</th>
                <th>Ativa</th>
                <th>Excluir</th>
              </tr>
            </thead>
            <tbody>
              ${promocoes
                .map(
                  (promo) => `
                <tr>
                  <td>
                    <strong>${promo.titulo}</strong>
                    <br />
                    <span style="font-size:0.8rem; color:var(--cor-texto-secundario);">${promo.descricao}</span>
                  </td>
                  <td>${formatarValor(promo)}</td>
                  <td>${promo.codigo ? `<span class="selo">${promo.codigo}</span>` : "—"}</td>
                  <td>
                    <label class="interruptor">
                      <input type="checkbox" data-ativa="${promo.id}" ${promo.ativa ? "checked" : ""} />
                      <span class="interruptor__trilho" aria-hidden="true"></span>
                      <span>${promo.ativa ? "Ativa" : "Inativa"}</span>
                    </label>
                  </td>
                  <td>
                    <button type="button" class="botao--texto" data-excluir="${promo.id}">Excluir</button>
                  </td>
                </tr>
              `
                )
                .join("")}
              ${promocoes.length === 0 ? `<tr><td colspan="5" class="centralizado">Nenhuma promoção cadastrada.</td></tr>` : ""}
            </tbody>
          </table>
        </div>
      </div>
    `;

    corpo.querySelector('[data-papel="nova"]').addEventListener("click", () => {
      formularioAberto = !formularioAberto;
      render();
    });

    const formNova = corpo.querySelector("#form-nova-promocao");
    if (formNova) {
      formNova.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const dados = new FormData(evento.target);
        const titulo = dados.get("titulo").trim();
        const valor = Number(dados.get("valor"));

        if (!titulo || Number.isNaN(valor) || valor <= 0) return;

        const agora = new Date();
        const daquiNoventaDias = new Date(agora.getTime() + 90 * 24 * 60 * 60 * 1000);

        promocoes.push({
          id: `promo-${Date.now()}`,
          titulo,
          descricao: dados.get("descricao").trim() || "Promoção cadastrada pelo painel administrativo.",
          tipo: dados.get("tipo"),
          valorDesconto: valor,
          diasSemana: null,
          dataInicio: agora.toISOString(),
          dataFim: daquiNoventaDias.toISOString(),
          ativa: true,
          codigo: dados.get("codigo").trim().toUpperCase() || null,
          usoMaximo: dados.get("codigo").trim() ? 1 : null,
        });
        persistirPromocoes();

        mensagem = `Promoção "${titulo}" criada com sucesso.`;
        formularioAberto = false;
        render();
      });
    }

    corpo.querySelectorAll("[data-ativa]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const promo = promocoes.find((p) => p.id === checkbox.dataset.ativa);
        if (!promo) return;
        promo.ativa = checkbox.checked;
        persistirPromocoes();
        mensagem = `Promoção "${promo.titulo}" agora está ${checkbox.checked ? "ativa" : "inativa"}.`;
        render();
      });
    });

    corpo.querySelectorAll("[data-excluir]").forEach((botao) => {
      botao.addEventListener("click", () => {
        const indice = promocoes.findIndex((p) => p.id === botao.dataset.excluir);
        if (indice === -1) return;
        const [removida] = promocoes.splice(indice, 1);
        persistirPromocoes();
        mensagem = `Promoção "${removida.titulo}" excluída.`;
        render();
      });
    });
  }

  function renderFormularioNovaPromocao() {
    return `
      <form id="form-nova-promocao" class="cartao" novalidate>
        <div class="campo">
          <label for="promo-titulo">Título</label>
          <input type="text" id="promo-titulo" name="titulo" required />
        </div>
        <div class="campo">
          <label for="promo-descricao">Descrição</label>
          <input type="text" id="promo-descricao" name="descricao" />
        </div>
        <div class="grade grade--2">
          <div class="campo" style="margin-bottom:0;">
            <label for="promo-tipo">Tipo de desconto</label>
            <select id="promo-tipo" name="tipo">
              <option value="percentual">Percentual (%)</option>
              <option value="valorFixo">Valor fixo (R$)</option>
            </select>
          </div>
          <div class="campo" style="margin-bottom:0;">
            <label for="promo-valor">Valor</label>
            <input type="number" id="promo-valor" name="valor" min="0.01" step="0.01" required />
          </div>
        </div>
        <div class="campo">
          <label for="promo-codigo">Código do cupom (opcional)</label>
          <input type="text" id="promo-codigo" name="codigo" placeholder="Ex: VERAO15" style="text-transform:uppercase;" />
          <span class="campo__ajuda">Deixe em branco para uma promoção automática, sem necessidade de cupom.</span>
        </div>
        <button type="submit" class="botao botao--primario botao--bloco">Salvar promoção</button>
      </form>
    `;
  }

  render();
}
