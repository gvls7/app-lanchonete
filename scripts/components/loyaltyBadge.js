/*
  Selo do nível de fidelidade do cliente, usado na tela de Fidelidade e pode ser reaproveitado em um cabeçalho de perfil no futuro.
*/

export function renderBadgeFidelidade(fidelidade) {
  const progresso = Math.min(
    100,
    Math.round((fidelidade.pontosAtuais / fidelidade.pontosProximoNivel) * 100)
  );

  return `
    <div class="badge-fidelidade">
      <div style="flex:1">
        <div class="badge-fidelidade__nivel">Nível ${fidelidade.nivelAtual}</div>
        <p>${fidelidade.pontosAtuais} pontos • faltam ${Math.max(0, fidelidade.pontosProximoNivel - fidelidade.pontosAtuais)} para ${fidelidade.proximoNivel}</p>
        <div class="barra-progresso" role="progressbar" aria-valuenow="${progresso}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso até o nível ${fidelidade.proximoNivel}">
          <div class="barra-progresso__preenchimento" style="width:${progresso}%"></div>
        </div>
      </div>
    </div>
  `;
}
