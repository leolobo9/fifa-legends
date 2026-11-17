(function(){
  const STORAGE_KEY = 'fifa_legends_players';
  let players = [];

  function loadPlayers(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      players = raw ? JSON.parse(raw) : [];
    } catch(e){
      console.error('Erro ao carregar dados', e);
      players = [];
    }
  }

  /* ---------- SINCRONIZAÇÃO COM A NUVEM (Firebase, somente leitura) ---------- */
  function whenFifaSyncReadySt(cb){
    if(window.FifaSync){ cb(window.FifaSync); return; }
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if(window.FifaSync){ clearInterval(t); cb(window.FifaSync); }
      else if(tries > 100){ clearInterval(t); }
    }, 100);
  }

  function renderEverything(){
    renderChart();
    populateCompareSelect();
    renderCompareChart();
    renderRankings();
    renderIdealTeams();
  }

  function applyCloudPlayersSt(data, ts){
    players = data || [];
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
      localStorage.setItem(STORAGE_KEY + '__ts', String(ts));
    } catch(e){}
    renderEverything();
  }

  function syncFromCloudOnLoad(){
    whenFifaSyncReadySt(async (FifaSync) => {
      const cloud = await FifaSync.load(FifaSync.KEYS.PLAYERS);
      const localTs = Number(localStorage.getItem(STORAGE_KEY + '__ts') || 0);
      if(cloud && cloud.updatedAt > localTs){
        applyCloudPlayersSt(cloud.data, cloud.updatedAt);
      }
      FifaSync.watch(FifaSync.KEYS.PLAYERS, (data, ts) => {
        const lts = Number(localStorage.getItem(STORAGE_KEY + '__ts') || 0);
        if(ts > lts){ applyCloudPlayersSt(data, ts); }
      });
    });
  }

  function ga(p){ return (Number(p.gols)||0) + (Number(p.assistencias)||0); }
  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function normalize(str){
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /* ---------- FILTRO DE POSIÇÃO (reutilizável) ---------- */
  const POSITION_FILTER_OPTIONS_HTML = `
    <option value="all">Todas</option>
    <optgroup label="Categoria">
      <option value="cat:ata">Ataque</option>
      <option value="cat:mei">Meio-campo</option>
      <option value="cat:def">Defesa</option>
    </optgroup>
    <optgroup label="Posição específica">
      <option value="pos:GOL">Goleiro</option>
      <option value="pos:ZAG">Zagueiro</option>
      <option value="pos:LAT">Lateral</option>
      <option value="pos:VOL">Volante</option>
      <option value="pos:MC">Meio Campo Central</option>
      <option value="pos:MCA">Meio Campo Avançado</option>
      <option value="pos:ATA">Atacante</option>
      <option value="pos:PT">Ponta</option>
    </optgroup>
  `;
  document.querySelectorAll('.position-filter-select').forEach(sel => {
    sel.innerHTML = POSITION_FILTER_OPTIONS_HTML;
  });

  const CATEGORY_POSITIONS = { ata:['ATA','PT'], mei:['VOL','MC','MCA'], def:['GOL','ZAG','LAT'] };

  function matchesPositionFilter(positions, filterValue){
    if(!filterValue || filterValue === 'all') return true;
    if(filterValue.startsWith('cat:')){
      const cat = filterValue.slice(4);
      return (positions||[]).some(p => (CATEGORY_POSITIONS[cat]||[]).includes(p));
    }
    if(filterValue.startsWith('pos:')){
      const code = filterValue.slice(4);
      return (positions||[]).includes(code);
    }
    return true;
  }

  /* ---------- FILTRO DE EDIÇÃO (reutilizável) ---------- */
  const EDITIONS = [
    {value:'fifa19', label:'FIFA 19'},
    {value:'fifa20', label:'FIFA 20'},
    {value:'fifa21', label:'FIFA 21'},
    {value:'fifa22', label:'FIFA 22'},
    {value:'fifa23', label:'FIFA 23'},
    {value:'fc24', label:'EA FC 24'},
    {value:'fc25', label:'EA FC 25'},
    {value:'fc26', label:'EA FC 26'},
    {value:'fc27', label:'EA FC 27'}
  ];
  const EDITION_FILTER_OPTIONS_HTML = `<option value="all">Todas</option>` +
    EDITIONS.map(ed => `<option value="${ed.value}">${ed.label}</option>`).join('');
  document.querySelectorAll('#rankGolsEdition, #rankAssistEdition, #rankGAEdition').forEach(sel => {
    sel.innerHTML = EDITION_FILTER_OPTIONS_HTML;
  });

  /* Jogador = total agregado de várias cartas (cada uma com sua edição).
     "Tem carta dessa edição" é o mesmo critério já usado no filtro de edição da página Jogadores. */
  function matchesEditionFilter(playerCards, filterValue){
    if(!filterValue || filterValue === 'all') return true;
    return (playerCards || []).some(c => c.edition === filterValue);
  }

  /* ---------- GRÁFICO 1: TOP N POR ESTATÍSTICA ---------- */
  const chartMetric = document.getElementById('chartMetric');
  const chartPosition = document.getElementById('chartPosition');
  const chartTopN = document.getElementById('chartTopN');
  let chartInstance = null;

  function metricLabel(key){
    return { gols:'Gols', assistencias:'Assistências', ga:'G+A', partidas:'Partidas' }[key];
  }

  function renderChart(){
    const metric = chartMetric.value;
    const topN = chartTopN.value;
    const posFilter = chartPosition.value;

    let sorted = players
      .filter(p => matchesPositionFilter(p.positions, posFilter))
      .sort((a,b) => {
        const va = metric === 'ga' ? ga(a) : Number(a[metric])||0;
        const vb = metric === 'ga' ? ga(b) : Number(b[metric])||0;
        return vb - va;
      });

    if(topN !== 'all') sorted = sorted.slice(0, Number(topN));

    const labels = sorted.map(p => p.nome);
    const data = sorted.map(p => metric === 'ga' ? ga(p) : Number(p[metric])||0);

    const ctx = document.getElementById('statsChart').getContext('2d');
    if(chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: metricLabel(metric), data, backgroundColor: 'rgba(212,175,55,0.75)', borderColor: '#f7e6a8', borderWidth: 1, borderRadius: 6 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#0b2c52', titleColor: '#f7e6a8', bodyColor: '#f2f0e6', borderColor: '#d4af37', borderWidth: 1 }
        },
        scales: {
          x: { ticks: { color: '#c3d3ef', font: { family: 'JetBrains Mono' } }, grid: { color: 'rgba(212,175,55,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#c3d3ef', font: { family: 'JetBrains Mono' } }, grid: { color: 'rgba(212,175,55,0.1)' } }
        }
      }
    });
  }
  chartMetric.addEventListener('change', renderChart);
  chartPosition.addEventListener('change', renderChart);
  chartTopN.addEventListener('change', renderChart);

  /* ---------- COMPARAÇÃO DE ATÉ 5 JOGADORES ---------- */
  const compareSelect = document.getElementById('compareSelect');
  const compareSearch = document.getElementById('compareSearch');
  const compareAddBtn = document.getElementById('compareAddBtn');
  const compareClearBtn = document.getElementById('compareClearBtn');
  const compareChips = document.getElementById('compareChips');
  let compareIds = [];
  let compareChartInstance = null;
  const compareColors = ['#d4af37', '#8fd0ff', '#e0555f', '#7ed957', '#c792ea'];

  function populateCompareSelect(filtro){
    const termo = filtro ? normalize(filtro) : '';
    const ordenados = players
      .filter(p => !termo || normalize(p.nome).includes(termo))
      .sort((a,b) => a.nome.localeCompare(b.nome));

    compareSelect.innerHTML = ordenados.length
      ? ordenados.map(p => `<option value="${p.id}">${escapeHtml(p.nome)}</option>`).join('')
      : '<option value="">Nenhum jogador encontrado</option>';
  }

  function renderChips(){
    const selecionados = compareIds.map(id => players.find(p => p.id === id)).filter(Boolean);
    compareChips.innerHTML = selecionados.map((p, i) => `
      <span class="compare-chip" style="border-color:${compareColors[i]}; color:${compareColors[i]};">
        ${escapeHtml(p.nome)}
        <button type="button" data-id="${p.id}" title="Remover">&times;</button>
      </span>
    `).join('');
  }

  function renderCompareChart(){
    const selecionados = compareIds.map(id => players.find(p => p.id === id)).filter(Boolean);
    const labels = ['Partidas', 'Gols', 'Assistências', 'G+A'];
    const datasets = selecionados.map((p, i) => ({
      label: p.nome,
      data: [Number(p.partidas)||0, Number(p.gols)||0, Number(p.assistencias)||0, ga(p)],
      backgroundColor: compareColors[i],
      borderRadius: 6
    }));

    const ctx = document.getElementById('compareChart').getContext('2d');
    if(compareChartInstance) compareChartInstance.destroy();

    compareChartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: selecionados.length > 0, labels: { color: '#f2f0e6', font: { family: 'Inter' } } },
          tooltip: { backgroundColor: '#0b2c52', titleColor: '#f7e6a8', bodyColor: '#f2f0e6', borderColor: '#d4af37', borderWidth: 1 }
        },
        scales: {
          x: { ticks: { color: '#c3d3ef', font: { family: 'JetBrains Mono' } }, grid: { color: 'rgba(212,175,55,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#c3d3ef', font: { family: 'JetBrains Mono' } }, grid: { color: 'rgba(212,175,55,0.1)' } }
        }
      }
    });
  }

  compareAddBtn.addEventListener('click', () => {
    const id = compareSelect.value;
    if(!id) return;
    if(compareIds.includes(id)) return;
    if(compareIds.length >= 5){ alert('Você já selecionou 5 jogadores. Remova um antes de adicionar outro.'); return; }
    compareIds.push(id);
    renderChips();
    renderCompareChart();
  });
  compareSearch.addEventListener('input', () => populateCompareSelect(compareSearch.value.trim()));
  compareChips.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    compareIds = compareIds.filter(id => id !== btn.dataset.id);
    renderChips();
    renderCompareChart();
  });
  compareClearBtn.addEventListener('click', () => {
    compareIds = [];
    renderChips();
    renderCompareChart();
  });

  /* ---------- RANKINGS: ARTILHEIROS (TOTAL) E MELHOR MÉDIA ---------- */
  const rankGolsBody = document.getElementById('rankGols');
  const rankAssistBody = document.getElementById('rankAssist');
  const rankGABody = document.getElementById('rankGA');
  const rankGolsTopN = document.getElementById('rankGolsTopN');
  const rankAssistTopN = document.getElementById('rankAssistTopN');
  const rankGATopN = document.getElementById('rankGATopN');
  const rankGolsPosition = document.getElementById('rankGolsPosition');
  const rankAssistPosition = document.getElementById('rankAssistPosition');
  const rankGAPosition = document.getElementById('rankGAPosition');
  const rankGolsEdition = document.getElementById('rankGolsEdition');
  const rankAssistEdition = document.getElementById('rankAssistEdition');
  const rankGAEdition = document.getElementById('rankGAEdition');

  const rankMode = { gols:'total', assist:'total', ga:'total' };
  function setupStatModeToggle(toggleId, key, onChange){
    const toggle = document.getElementById(toggleId);
    if(!toggle) return;
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.stat-mode-btn');
      if(!btn) return;
      rankMode[key] = btn.dataset.mode;
      toggle.querySelectorAll('.stat-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
      onChange();
    });
  }

  function buildRankRows(statKey, totalFn, editionSel, positionSel, topNSel){
    let rows = players
      .filter(p => Number(p.partidas) >= 200 && matchesPositionFilter(p.positions, positionSel.value) && matchesEditionFilter(p.cards, editionSel.value))
      .map(p => Object.assign({}, p, { total: totalFn(p), media: totalFn(p) / Number(p.partidas) }));
    rows.sort(rankMode[statKey] === 'media' ? (a,b) => b.media - a.media : (a,b) => b.total - a.total);
    if(topNSel.value !== 'all') rows = rows.slice(0, Number(topNSel.value));
    return rows;
  }

  function renderRankings(){
    const comGols = buildRankRows('gols', p => Number(p.gols)||0, rankGolsEdition, rankGolsPosition, rankGolsTopN);
    rankGolsBody.innerHTML = comGols.length ? comGols.map((p,i) => `
      <tr><td>${i+1}</td><td class="rank-nome">${escapeHtml(p.nome)}</td><td>${p.partidas}</td><td>${p.total}</td><td>${p.media.toFixed(2)}</td></tr>
    `).join('') : '<tr><td colspan="5">Sem dados suficientes.</td></tr>';

    const comAssist = buildRankRows('assist', p => Number(p.assistencias)||0, rankAssistEdition, rankAssistPosition, rankAssistTopN);
    rankAssistBody.innerHTML = comAssist.length ? comAssist.map((p,i) => `
      <tr><td>${i+1}</td><td class="rank-nome">${escapeHtml(p.nome)}</td><td>${p.partidas}</td><td>${p.total}</td><td>${p.media.toFixed(2)}</td></tr>
    `).join('') : '<tr><td colspan="5">Sem dados suficientes.</td></tr>';

    const comGA = buildRankRows('ga', p => ga(p), rankGAEdition, rankGAPosition, rankGATopN);
    rankGABody.innerHTML = comGA.length ? comGA.map((p,i) => `
      <tr><td>${i+1}</td><td class="rank-nome">${escapeHtml(p.nome)}</td><td>${p.partidas}</td><td>${p.total}</td><td>${p.media.toFixed(2)}</td></tr>
    `).join('') : '<tr><td colspan="5">Sem dados suficientes.</td></tr>';
  }
  rankGolsTopN.addEventListener('change', renderRankings);
  rankAssistTopN.addEventListener('change', renderRankings);
  rankGATopN.addEventListener('change', renderRankings);
  rankGolsPosition.addEventListener('change', renderRankings);
  rankAssistPosition.addEventListener('change', renderRankings);
  rankGAPosition.addEventListener('change', renderRankings);
  rankGolsEdition.addEventListener('change', renderRankings);
  rankAssistEdition.addEventListener('change', renderRankings);
  rankGAEdition.addEventListener('change', renderRankings);
  setupStatModeToggle('rankGolsModeToggle', 'gols', renderRankings);
  setupStatModeToggle('rankAssistModeToggle', 'assist', renderRankings);
  setupStatModeToggle('rankGAModeToggle', 'ga', renderRankings);

   /* ---------- TIMES IDEAIS (4-3-3) ---------- */
  const FORMATION_433 = [
    {code:'GOL', top:92, left:50},
    {code:'ZAG', top:78, left:35},
    {code:'ZAG', top:78, left:65},
    {code:'LE', top:66, left:10},
    {code:'LD', top:66, left:90},
    {code:'VOL', top:54, left:50},
    {code:'MC', top:40, left:28},
    {code:'MCA', top:40, left:72},
    {code:'PE', top:18, left:12},
    {code:'PD', top:18, left:88},
    {code:'ATA', top:8, left:50}
  ];

  const teamMetric = document.getElementById('teamMetric');
  let teamsState = { team1: [], team2: [], team3: [] };
  let selectedChip = null;

  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'team-tooltip';
  document.body.appendChild(tooltipEl);

  function showTooltip(html, x, y){
    tooltipEl.innerHTML = html;
    tooltipEl.style.display = 'block';
    tooltipEl.style.left = (x + 16) + 'px';
    tooltipEl.style.top = (y + 16) + 'px';
  }
  function hideTooltip(){ tooltipEl.style.display = 'none'; }

  function metricValueForTeam(p, metric){
    if(metric === 'ga') return ga(p);
    return Number(p[metric]) || 0;
  }

  function buildOneTeam(metric, usedSet){
    return FORMATION_433.map(slot => {
      const candidates = players
        .filter(p => Array.isArray(p.positions) && p.positions.includes(slot.code) && !usedSet.has(p.id))
        .sort((a,b) => metricValueForTeam(b, metric) - metricValueForTeam(a, metric));
      const chosen = candidates[0] || null;
      if(chosen) usedSet.add(chosen.id);
      return { slot, player: chosen };
    });
  }

  function renderPitch(containerId, teamKey){
    const container = document.getElementById(containerId);
    if(!container) return;
    const team = teamsState[teamKey];
    const metric = teamMetric.value;

    container.innerHTML = team.map(({slot, player}, idx) => {
      const isSelected = selectedChip && selectedChip.teamKey === teamKey && selectedChip.index === idx;
      const selClass = isSelected ? ' selected' : '';
      if(!player){
        return `<div class="player-chip empty${selClass}" data-team="${teamKey}" data-index="${idx}" style="top:${slot.top}%; left:${slot.left}%;">${slot.code}<span class="chip-stat">vago</span></div>`;
      }
      const statValue = metric === 'ga' ? ga(player) : (Number(player[metric])||0);
      return `<div class="player-chip${selClass}" data-team="${teamKey}" data-index="${idx}" style="top:${slot.top}%; left:${slot.left}%;">${escapeHtml(player.nome)}<span class="chip-stat">${slot.code} · ${statValue}</span></div>`;
    }).join('');
  }

  function renderAllPitches(){
    renderPitch('pitchTeam1', 'team1');
    renderPitch('pitchTeam2', 'team2');
    renderPitch('pitchTeam3', 'team3');
  }

  function renderIdealTeams(){
    const metric = teamMetric.value;
    const usedSet = new Set();
    teamsState.team1 = buildOneTeam(metric, usedSet);
    teamsState.team2 = buildOneTeam(metric, usedSet);
    teamsState.team3 = buildOneTeam(metric, usedSet);
    selectedChip = null;
    renderAllPitches();
  }

  function handleChipClick(teamKey, index){
    if(!selectedChip){
      selectedChip = { teamKey, index };
      renderAllPitches();
      return;
    }
    if(selectedChip.teamKey === teamKey && selectedChip.index === index){
      selectedChip = null;
      renderAllPitches();
      return;
    }
    if(selectedChip.teamKey !== teamKey){
      alert('Só é possível trocar jogadores dentro do mesmo time.');
      selectedChip = { teamKey, index };
      renderAllPitches();
      return;
    }
    const team = teamsState[teamKey];
    const temp = team[selectedChip.index].player;
    team[selectedChip.index].player = team[index].player;
    team[index].player = temp;
    selectedChip = null;
    renderAllPitches();
  }

  ['pitchTeam1','pitchTeam2','pitchTeam3'].forEach((containerId, i) => {
    const teamKey = 'team' + (i+1);
    const el = document.getElementById(containerId);
    el.addEventListener('click', (e) => {
      const chip = e.target.closest('.player-chip');
      if(!chip) return;
      handleChipClick(chip.dataset.team, Number(chip.dataset.index));
    });
    el.addEventListener('mouseover', (e) => {
      const chip = e.target.closest('.player-chip');
      if(!chip) return;
      const idx = Number(chip.dataset.index);
      const entry = teamsState[chip.dataset.team][idx];
      if(!entry || !entry.player) return;
      const p = entry.player;
      const html = `<strong>${escapeHtml(p.nome)}</strong>
        <div class="tt-row"><span>Posição</span><span>${entry.slot.code}</span></div>
        <div class="tt-row"><span>Partidas</span><span>${p.partidas}</span></div>
        <div class="tt-row"><span>Gols</span><span>${p.gols}</span></div>
        <div class="tt-row"><span>Assistências</span><span>${p.assistencias}</span></div>
        <div class="tt-row"><span>G+A</span><span>${ga(p)}</span></div>`;
      showTooltip(html, e.clientX, e.clientY);
    });
    el.addEventListener('mousemove', (e) => {
      const chip = e.target.closest('.player-chip');
      if(!chip) return;
      tooltipEl.style.left = (e.clientX + 16) + 'px';
      tooltipEl.style.top = (e.clientY + 16) + 'px';
    });
    el.addEventListener('mouseout', hideTooltip);
  });

  teamMetric.addEventListener('change', renderIdealTeams);
  /* ---------- INIT ---------- */
  loadPlayers();
  renderChart();
  populateCompareSelect();
  renderCompareChart();
  renderRankings();
  renderIdealTeams();
  syncFromCloudOnLoad();
})();