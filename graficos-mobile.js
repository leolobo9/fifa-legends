/* Camada só para a versão mobile/app da tela de Gráficos & Análise.
   Reorganiza em abas (Gráfico / Comparar / Rankings / Time Ideal), junta os painéis de
   "melhor média" num só com um seletor de estatística, e deixa a aba Comparar mais arrumada.
   Roda igual tanto na visão "Por jogador" quanto na visão "Por carta".
   No PC (telas acima de 760px) esta função nem roda — a tela continua exatamente como era. */
(function(){
  function isMobile(){
    return window.matchMedia('(max-width: 760px)').matches;
  }

  function setupSection(cfg){
    var statsChart = document.getElementById(cfg.statsChart);
    var compareChart = document.getElementById(cfg.compareChart);
    var teamMetric = document.getElementById(cfg.teamMetric);
    var ranks = cfg.ranks.map(function(r){
      return {
        key: r.key, label: r.label, icon: r.icon,
        body: document.getElementById(r.body),
        modeToggle: document.getElementById(r.modeToggle)
      };
    });
    if(!statsChart || !compareChart || !teamMetric) return;
    if(ranks.some(function(r){ return !r.body; })) return;

    var grafico = statsChart.closest('.panel');
    var comparar = compareChart.closest('.panel');
    var timeIdeal = teamMetric.closest('.panel');
    var rankPanels = ranks.map(function(r){ return r.body.closest('.panel'); });
    if(!grafico || !comparar || !timeIdeal) return;
    if(rankPanels.some(function(p){ return !p; })) return;

    /* ---------- 1) Abas (Gráfico / Comparar / Rankings / Time Ideal) ---------- */
    var nav = document.createElement('div');
    nav.className = 'gx-subtab-nav';
    nav.innerHTML =
      '<button type="button" class="gx-subtab-btn active" data-gx="grafico">📈 Gráfico</button>' +
      '<button type="button" class="gx-subtab-btn" data-gx="comparar">⚖️ Comparar</button>' +
      '<button type="button" class="gx-subtab-btn" data-gx="rankings">🏅 Rankings</button>' +
      '<button type="button" class="gx-subtab-btn" data-gx="time">🧩 Time Ideal</button>';
    grafico.parentNode.insertBefore(nav, grafico);

    var groups = {
      grafico: [grafico],
      comparar: [comparar],
      rankings: rankPanels.slice(),
      time: [timeIdeal]
    };
    function showGroup(key){
      Object.keys(groups).forEach(function(k){
        groups[k].forEach(function(el){ el.style.display = (k === key) ? '' : 'none'; });
      });
      Array.prototype.forEach.call(nav.querySelectorAll('.gx-subtab-btn'), function(b){
        b.classList.toggle('active', b.getAttribute('data-gx') === key);
      });
    }
    nav.addEventListener('click', function(e){
      var btn = e.target.closest('.gx-subtab-btn');
      if(!btn) return;
      showGroup(btn.getAttribute('data-gx'));
    });
    showGroup('grafico');

    /* ---------- 2) Rankings: junta os painéis num só com seletor de estatística ---------- */
    var firstRankPanel = rankPanels[0];
    var rkTitle = document.createElement('h2');
    rkTitle.className = 'gx-rk-title';
    rkTitle.textContent = 'Rankings';
    firstRankPanel.parentNode.insertBefore(rkTitle, firstRankPanel);

    var rkHint = document.createElement('div');
    rkHint.className = 'hint';
    rkHint.textContent = cfg.minPartidasText;
    firstRankPanel.parentNode.insertBefore(rkHint, firstRankPanel);

    var rkWrap = document.createElement('div');
    rkWrap.className = 'gx-rk-switch';
    rkWrap.innerHTML = ranks.map(function(r, i){
      return '<button type="button" class="gx-rk-btn' + (i === 0 ? ' active' : '') + '" data-rk="' + r.key + '">' + r.icon + ' ' + r.label + '</button>';
    }).join('');
    firstRankPanel.parentNode.insertBefore(rkWrap, firstRankPanel);

    /* título/hint/seletor de estatística pertencem ao grupo "rankings" da aba principal:
       precisam somem junto quando o usuário troca para Gráfico/Comparar/Time Ideal */
    groups.rankings.push(rkTitle, rkHint, rkWrap);
    rkTitle.style.display = 'none';
    rkHint.style.display = 'none';
    rkWrap.style.display = 'none';

    rankPanels.forEach(function(p){
      var h2 = p.querySelector('h2'); if(h2) h2.style.display = 'none';
      var hint = p.querySelector('.hint'); if(hint) hint.style.display = 'none';
      p.classList.add('gx-rk-panel');
    });

    var rkPanelsByKey = {};
    ranks.forEach(function(r, i){ rkPanelsByKey[r.key] = rankPanels[i]; });
    function showRk(key){
      Object.keys(rkPanelsByKey).forEach(function(k){ rkPanelsByKey[k].style.display = (k === key) ? '' : 'none'; });
      Array.prototype.forEach.call(rkWrap.querySelectorAll('.gx-rk-btn'), function(b){
        b.classList.toggle('active', b.getAttribute('data-rk') === key);
      });
    }
    rkWrap.addEventListener('click', function(e){
      var btn = e.target.closest('.gx-rk-btn');
      if(!btn) return;
      showRk(btn.getAttribute('data-rk'));
    });
    showRk(ranks[0].key);

    function addLeaderboard(panel, tbody, modeToggle){
      var table = panel.querySelector('.rank-table');
      if(!table || !tbody) return;
      var lb = document.createElement('div');
      lb.className = 'leaderboard';
      table.parentNode.insertBefore(lb, table);
      table.style.display = 'none';
      function currentMode(){
        if(!modeToggle) return 'total';
        var active = modeToggle.querySelector('.stat-mode-btn.active');
        return active ? active.getAttribute('data-mode') : 'total';
      }
      function sync(){
        var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
        if(!rows.length || !rows[0].children.length || rows[0].classList.contains('empty-row')){
          lb.innerHTML = '<div class="gx-lb-empty">Sem dados suficientes ainda.</div>';
          return;
        }
        /* coluna 3 = total (ex: gols), coluna 4 = média — qual delas vira o número grande
           e o tamanho da barra depende de qual modo (Total/Média) está ativo no botão */
        var colIdx = currentMode() === 'media' ? 4 : 3;
        var values = rows.map(function(r){ return parseFloat(r.children[colIdx] ? r.children[colIdx].textContent : 0) || 0; });
        var maxValue = Math.max.apply(null, values);
        lb.innerHTML = rows.map(function(r, i){
          var rank = r.children[0].textContent;
          var nome = r.children[1].textContent;
          var partidas = r.children[2].textContent;
          var mainStat = r.children[colIdx].textContent;
          var pct = maxValue > 0 ? Math.max(6, (values[i] / maxValue) * 100) : 0;
          return '<div class="lb-row">' +
            '<div class="lb-rank">' + rank + '</div>' +
            '<div class="lb-main"><div class="lb-name">' + nome + '</div>' +
              '<div class="lb-bar-track"><div class="lb-bar-fill" style="width:' + pct + '%"></div></div></div>' +
            '<div class="lb-stats"><div class="lb-media">' + mainStat + '</div><div class="lb-partidas">' + partidas + ' partidas</div></div>' +
          '</div>';
        }).join('');
      }
      sync();
      new MutationObserver(sync).observe(tbody, { childList: true });
    }
    ranks.forEach(function(r, i){
      addLeaderboard(rankPanels[i], r.body, r.modeToggle);
    });

    /* ---------- 3) Comparar: busca com ícone + estado vazio explicativo ---------- */
    var compareSearch = document.getElementById(cfg.compareSearch);
    var compareChips = document.getElementById(cfg.compareChips);
    var compareClearBtn = document.getElementById(cfg.compareClearBtn);
    var compareChartWrap = compareChart.closest('.chart-wrap');

    if(compareSearch && compareSearch.parentNode){
      var box = document.createElement('div');
      box.className = 'gx-search-box';
      compareSearch.parentNode.insertBefore(box, compareSearch);
      var ic = document.createElement('span');
      ic.className = 'gx-search-ic';
      ic.textContent = '🔎';
      box.appendChild(ic);
      box.appendChild(compareSearch);
    }

    if(compareChips){
      var emptyState = document.createElement('div');
      emptyState.className = 'gx-compare-empty';
      emptyState.innerHTML =
        '<div class="gx-empty-ic">⚖️</div>' +
        '<div class="gx-empty-title">Monte sua comparação</div>' +
        '<div class="gx-empty-sub">' + cfg.compareEmptyHint + '</div>';
      compareChips.parentNode.insertBefore(emptyState, compareChips.nextSibling);

      function syncCompareState(){
        var hasChips = compareChips.children.length > 0;
        emptyState.style.display = hasChips ? 'none' : '';
        if(compareChartWrap) compareChartWrap.style.display = hasChips ? '' : 'none';
        if(compareClearBtn) compareClearBtn.style.display = hasChips ? '' : 'none';
      }
      syncCompareState();
      new MutationObserver(syncCompareState).observe(compareChips, { childList: true });
    }
  }

  function run(){
    if(!isMobile()) return;

    /* Visão "Por jogador" */
    setupSection({
      statsChart: 'statsChart', compareChart: 'compareChart', teamMetric: 'teamMetric',
      compareSearch: 'compareSearch', compareChips: 'compareChips', compareClearBtn: 'compareClearBtn',
      minPartidasText: 'Considera apenas jogadores com pelo menos 200 partidas registradas.',
      compareEmptyHint: 'Busque um jogador acima e clique em "+ Adicionar". Você pode comparar até 5 de uma vez.',
      ranks: [
        {key:'gols', label:'Gols', icon:'⚽', body:'rankGols', modeToggle:'rankGolsModeToggle'},
        {key:'assist', label:'Assistências', icon:'🅰️', body:'rankAssist', modeToggle:'rankAssistModeToggle'},
        {key:'ga', label:'G+A', icon:'🎯', body:'rankGA', modeToggle:'rankGAModeToggle'}
      ]
    });

    /* Visão "Por carta" */
    setupSection({
      statsChart: 'cardsChart', compareChart: 'cardsCompareChart', teamMetric: 'cardTeamMetric',
      compareSearch: 'cardCompareSearch', compareChips: 'cardCompareChips', compareClearBtn: 'cardCompareClearBtn',
      minPartidasText: 'Considera apenas cartas com pelo menos 120 partidas.',
      compareEmptyHint: 'Busque um jogador acima e clique em "+ Adicionar". Pode ser do mesmo jogador ou de jogadores diferentes, até 5 cartas.',
      ranks: [
        {key:'gols', label:'Gols', icon:'⚽', body:'rankCardGols', modeToggle:'rankCardGolsModeToggle'},
        {key:'assist', label:'Assistências', icon:'🅰️', body:'rankCardAssist', modeToggle:'rankCardAssistModeToggle'},
        {key:'ga', label:'G+A', icon:'🎯', body:'rankCardGA', modeToggle:'rankCardGAModeToggle'}
      ]
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
