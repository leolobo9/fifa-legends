(function(){
  const STORAGE_KEY = 'fifa_wl_all';
  let wls = [];

  const EDITION_LABEL_WL = { fifa22:'FIFA 22', fifa23:'FIFA 23', fc26:'EA FC 26', fc27:'EA FC 27' };

  const historicoFilterEdition = document.getElementById('historicoFilterEdition');
  const summaryGrid = document.getElementById('summaryGrid');
  const wlPickerSelect = document.getElementById('wlPickerSelect');
  const wlPickerDetail = document.getElementById('wlPickerDetail');

  function on(el, evt, fn){
    if(el && typeof el.addEventListener === 'function'){
      el.addEventListener(evt, fn);
    } else {
      console.warn('[WLHistorico] elemento não encontrado para o evento "' + evt + '" — verifique se o HTML está completo.');
    }
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function normalizeName(str){
    return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  /* ---------- EDIÇÃO EFETIVA DA WL: DETECTADA PELO NOME, NÃO PELO CAMPO wl.edition ---------- */
  function getEffectiveEdition(wl){
    const name = (wl.name || '').toLowerCase();
    if(/\b27\b|fc\s*27/.test(name)) return 'fc27';
    if(/\b26\b|fc\s*26/.test(name)) return 'fc26';
    if(/\b23\b|fifa\s*23/.test(name)) return 'fifa23';
    if(/\b22\b|fifa\s*22/.test(name)) return 'fifa22';
    return wl.edition || 'fifa23';
  }

  function getMatchMVP(match){
    if(!match.playerStats.length) return null;
    const sorted = match.playerStats.slice().sort((a,b) => {
      if(b.nota !== a.nota) return b.nota - a.nota;
      const gaA = a.gols + a.assistencias, gaB = b.gols + b.assistencias;
      if(gaB !== gaA) return gaB - gaA;
      return b.gols - a.gols;
    });
    return sorted[0];
  }

  function loadAll(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      wls = raw ? JSON.parse(raw) : [];
    } catch(e){ wls = []; }
  }

  function getFilteredWLs(){
    const f = historicoFilterEdition ? historicoFilterEdition.value : '';
    return f ? wls.filter(w => getEffectiveEdition(w) === f) : wls;
  }

  /* ---------- RESUMO GERAL ---------- */
  function renderSummary(){
    const list = getFilteredWLs();
    let totalV=0, totalD=0, totalGF=0, totalGS=0, totalMatches=0;
    list.forEach(wl => wl.matches.forEach(m => {
      totalMatches++;
      if(m.resultado==='V') totalV++; else totalD++;
      totalGF += m.golsFeitos; totalGS += m.golsSofridos;
    }));

    summaryGrid.innerHTML = `
      <div class="summary-card"><div class="value">${list.length}</div><div class="label">WLs</div></div>
      <div class="summary-card"><div class="value">${totalV}-${totalD}</div><div class="label">V-D total</div></div>
      <div class="summary-card"><div class="value">${totalGF}</div><div class="label">Gols Feitos</div></div>
      <div class="summary-card"><div class="value">${totalGS}</div><div class="label">Gols Sofridos</div></div>
      <div class="summary-card"><div class="value">${totalMatches}</div><div class="label">Partidas Totais</div></div>
    `;
  }

  /* ---------- WL PICKER ---------- */
  function renderWLPicker(){
    const list = getFilteredWLs();
    wlPickerSelect.innerHTML = list.length
      ? '<option value="">Selecione uma WL...</option>' + list.map(w => `<option value="${w.id}">${escapeHtml(w.name)} · ${EDITION_LABEL_WL[getEffectiveEdition(w)]||getEffectiveEdition(w)} (${w.matches.length}/15)</option>`).join('')
      : '<option value="">Nenhuma WL nessa edição</option>';
    wlPickerDetail.innerHTML = '';
  }

  /* ---------- AGREGADO DOS JOGADORES DENTRO DE UMA ÚNICA WL ---------- */
  function aggregateWL(wl){
    const byPlayer = {}, mvpCount = {};
    wl.matches.forEach(m => {
      const mvp = getMatchMVP(m);
      if(mvp){ const key = normalizeName(mvp.nome); mvpCount[key] = (mvpCount[key]||0) + 1; }
      m.playerStats.forEach(p => {
        const nameKey = normalizeName(p.nome);
        if(!byPlayer[nameKey]) byPlayer[nameKey] = { nome:p.nome, partidas:0, gols:0, assistencias:0, notaSoma:0 };
        const pp = byPlayer[nameKey];
        pp.partidas++; pp.gols+=p.gols; pp.assistencias+=p.assistencias; pp.notaSoma+=p.nota;
      });
    });
    return { byPlayer, mvpCount };
  }

  const WL_STATS_COLUMNS = [
    {key:'nome', label:'Jogador', left:true},
    {key:'partidas', label:'Partidas'},
    {key:'gols', label:'Gols'},
    {key:'assistencias', label:'Assistências'},
    {key:'ga', label:'G+A'},
    {key:'mvps', label:'MVPs'},
    {key:'media', label:'Média Nota'}
  ];
  let wlDetailSortKey = 'partidas';
  let wlDetailSortDir = -1;

  function renderWLAwardsGrid(agg){
    const arr = Object.entries(agg.byPlayer).map(([id, p]) => ({
      id, nome: p.nome, partidas: p.partidas, gols: p.gols, assistencias: p.assistencias,
      ga: p.gols + p.assistencias, media: p.notaSoma / p.partidas, mvps: agg.mvpCount[id] || 0
    }));
    if(arr.length === 0){
      return '<div style="color:var(--muted); font-size:13px; grid-column:1/-1; text-align:center;">Sem partidas registradas nessa WL.</div>';
    }
    function top(metric){ return arr.slice().sort((a,b) => b[metric]-a[metric])[0]; }
    const artilheiro = top('gols'), assistente = top('assistencias'), motor = top('ga'), melhor = top('media'), decisivo = top('mvps');
    const cards = [
      { icon:'⚽', label:'Artilheiro', p:artilheiro, value:`${artilheiro.gols} gols` },
      { icon:'🎯', label:'Assistente', p:assistente, value:`${assistente.assistencias} assist` },
      { icon:'🔥', label:'Motor (G+A)', p:motor, value:`${motor.ga} G+A` },
      { icon:'⭐', label:'Melhor da WL', p:melhor, value:`média ${melhor.media.toFixed(1)}` },
      { icon:'🏅', label:'Mais Decisivo', p:decisivo, value:`${decisivo.mvps} MVPs` }
    ];
    return cards.map(c => `
      <div class="award-card">
        <div class="award-icon">${c.icon}</div>
        <div class="award-name">${escapeHtml(c.p.nome)}</div>
        <div class="award-value">${c.value}</div>
        <div class="award-label">${c.label}</div>
      </div>
    `).join('');
  }

  function renderWLStatsTableHead(){
    return `<tr>${WL_STATS_COLUMNS.map(col => {
      const sortedClass = col.key === wlDetailSortKey ? ' sorted' : '';
      const alignAttr = col.left ? ' style="text-align:left;"' : '';
      return `<th data-key="${col.key}" class="${sortedClass}"${alignAttr}>${col.label} <span class="arrow">▲▼</span></th>`;
    }).join('')}</tr>`;
  }

  function renderWLStatsTableBody(agg){
    let fullList = Object.entries(agg.byPlayer).map(([id, p]) => ({
      id, nome: p.nome, partidas: p.partidas, gols: p.gols, assistencias: p.assistencias,
      ga: p.gols + p.assistencias, media: p.notaSoma / p.partidas, mvps: agg.mvpCount[id] || 0
    }));
    if(fullList.length === 0){
      return `<tr class="empty-row"><td colspan="${WL_STATS_COLUMNS.length}">Sem dados ainda.</td></tr>`;
    }
    fullList.sort((a,b) => {
      const va = wlDetailSortKey === 'nome' ? a.nome.toLowerCase() : a[wlDetailSortKey];
      const vb = wlDetailSortKey === 'nome' ? b.nome.toLowerCase() : b[wlDetailSortKey];
      if(va < vb) return -1*wlDetailSortDir;
      if(va > vb) return 1*wlDetailSortDir;
      return 0;
    });
    return fullList.map(row => `<tr>
      <td class="nome">${escapeHtml(row.nome)}</td>
      <td>${row.partidas}</td><td>${row.gols}</td><td>${row.assistencias}</td>
      <td class="ga">${row.ga}</td><td>${row.mvps}</td><td>${row.media.toFixed(1)}</td>
    </tr>`).join('');
  }

  function renderWLDetail(wl){
    const agg = aggregateWL(wl);
    const vitorias = wl.matches.filter(m => m.resultado === 'V').length;
    const derrotas = wl.matches.filter(m => m.resultado === 'D').length;
    const totalGolsFeitos = wl.matches.reduce((s,m) => s+m.golsFeitos, 0);
    const totalGolsSofridos = wl.matches.reduce((s,m) => s+m.golsSofridos, 0);
    const resultLabel = { V:'✅ Vitória', D:'❌ Derrota' };

    wlPickerDetail.innerHTML = `
      <h3 class="rank-subtitle">📊 Resumo desta WL</h3>
      <div class="summary-grid">
        <div class="summary-card"><div class="value">${vitorias}-${derrotas}</div><div class="label">Vitórias-Derrotas</div></div>
        <div class="summary-card"><div class="value">${totalGolsFeitos}</div><div class="label">Gols Feitos</div></div>
        <div class="summary-card"><div class="value">${totalGolsSofridos}</div><div class="label">Gols Sofridos</div></div>
        <div class="summary-card"><div class="value">${wl.matches.length}</div><div class="label">Partidas</div></div>
      </div>

      <h3 class="rank-subtitle">🏆 Prêmios da WL</h3>
      <div class="summary-grid">${renderWLAwardsGrid(agg)}</div>

      <h3 class="rank-subtitle">📋 Estatísticas do Time</h3>
      <div class="table-shell">
        <div class="table-scroll">
          <table>
            <thead id="wlDetailStatsHead">${renderWLStatsTableHead()}</thead>
            <tbody id="wlDetailStatsBody">${renderWLStatsTableBody(agg)}</tbody>
          </table>
        </div>
      </div>

      <h3 class="rank-subtitle">📼 Histórico de Partidas</h3>
      <div class="table-shell">
        <div class="table-scroll">
          <table>
            <thead><tr><th>#</th><th>Resultado</th><th>Placar</th><th>Média Nota</th><th>⭐ MVP</th></tr></thead>
            <tbody>
              ${wl.matches.length ? wl.matches.map(m => {
                const media = m.playerStats.length ? (m.playerStats.reduce((s,p)=>s+p.nota,0)/m.playerStats.length).toFixed(1) : '—';
                const mvp = getMatchMVP(m);
                return `<tr>
                  <td>${m.number}</td>
                  <td><span class="result-badge result-${m.resultado.toLowerCase()}">${resultLabel[m.resultado]}</span></td>
                  <td>${m.golsFeitos} - ${m.golsSofridos}</td>
                  <td>${media}</td>
                  <td>${mvp ? `<span class="mvp-badge">⭐ ${escapeHtml(mvp.nome)} (${mvp.nota.toFixed(1)})</span>` : '—'}</td>
                </tr>`;
              }).join('') : '<tr><td colspan="5">Nenhuma partida nessa WL.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  on(wlPickerSelect, 'change', () => {
    const wl = wls.find(w => w.id === wlPickerSelect.value);
    if(!wl){ wlPickerDetail.innerHTML = ''; return; }
    wlDetailSortKey = 'partidas';
    wlDetailSortDir = -1;
    renderWLDetail(wl);
  });

  /* Clique no cabeçalho da tabela "Estatísticas do Time" pra ordenar */
  on(wlPickerDetail, 'click', (e) => {
    const th = e.target.closest('#wlDetailStatsHead th[data-key]');
    if(!th) return;
    const wl = wls.find(w => w.id === wlPickerSelect.value);
    if(!wl) return;
    const key = th.dataset.key;
    if(wlDetailSortKey === key){ wlDetailSortDir *= -1; } else { wlDetailSortKey = key; wlDetailSortDir = -1; }
    renderWLDetail(wl);
  });

  function renderAll(){
    renderSummary();
    renderWLPicker();
  }

  on(historicoFilterEdition, 'change', renderAll);

  loadAll();
  renderAll();
})();
