/* Camada só para a versão mobile/app da tela de Gráficos & Análise (visão "Por jogador").
   Reorganiza em abas (Gráfico / Comparar / Rankings / Time Ideal), junta os 3 painéis de
   "melhor média" num só com um seletor de estatística, e deixa a aba Comparar mais arrumada.
   No PC (telas acima de 760px) esta função nem roda — a tela continua exatamente como era. */
(function(){
  function isMobile(){
    return window.matchMedia('(max-width: 760px)').matches;
  }

  function run(){
    if(!isMobile()) return;

    var statsChart = document.getElementById('statsChart');
    var compareChart = document.getElementById('compareChart');
    var rankGolsBody = document.getElementById('rankGols');
    var rankAssistBody = document.getElementById('rankAssist');
    var rankGABody = document.getElementById('rankGA');
    var teamMetric = document.getElementById('teamMetric');
    if(!statsChart || !compareChart || !rankGolsBody || !rankAssistBody || !rankGABody || !teamMetric) return;

    var grafico = statsChart.closest('.panel');
    var comparar = compareChart.closest('.panel');
    var rankGolsPanel = rankGolsBody.closest('.panel');
    var rankAssistPanel = rankAssistBody.closest('.panel');
    var rankGAPanel = rankGABody.closest('.panel');
    var timeIdeal = teamMetric.closest('.panel');
    if(!grafico || !comparar || !rankGolsPanel || !rankAssistPanel || !rankGAPanel || !timeIdeal) return;

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
      rankings: [rankGolsPanel, rankAssistPanel, rankGAPanel],
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

    /* ---------- 2) Rankings: junta os 3 painéis num só com seletor de estatística ---------- */
    var rkTitle = document.createElement('h2');
    rkTitle.className = 'gx-rk-title';
    rkTitle.textContent = 'Melhor média por partida';
    rankGolsPanel.parentNode.insertBefore(rkTitle, rankGolsPanel);

    var rkHint = document.createElement('div');
    rkHint.className = 'hint';
    rkHint.textContent = 'Considera apenas jogadores com pelo menos 200 partidas registradas.';
    rankGolsPanel.parentNode.insertBefore(rkHint, rankGolsPanel);

    var rkWrap = document.createElement('div');
    rkWrap.className = 'gx-rk-switch';
    rkWrap.innerHTML =
      '<button type="button" class="gx-rk-btn active" data-rk="gols">⚽ Gols</button>' +
      '<button type="button" class="gx-rk-btn" data-rk="assist">🅰️ Assistências</button>' +
      '<button type="button" class="gx-rk-btn" data-rk="ga">🎯 G+A</button>';
    rankGolsPanel.parentNode.insertBefore(rkWrap, rankGolsPanel);

    /* título/hint/seletor de estatística pertencem ao grupo "rankings" da aba principal:
       precisam somem junto quando o usuário troca para Gráfico/Comparar/Time Ideal */
    groups.rankings.push(rkTitle, rkHint, rkWrap);
    rkTitle.style.display = 'none';
    rkHint.style.display = 'none';
    rkWrap.style.display = 'none';

    [rankGolsPanel, rankAssistPanel, rankGAPanel].forEach(function(p){
      var h2 = p.querySelector('h2'); if(h2) h2.style.display = 'none';
      var hint = p.querySelector('.hint'); if(hint) hint.style.display = 'none';
      p.classList.add('gx-rk-panel');
    });

    var rkPanels = { gols: rankGolsPanel, assist: rankAssistPanel, ga: rankGAPanel };
    function showRk(key){
      Object.keys(rkPanels).forEach(function(k){ rkPanels[k].style.display = (k === key) ? '' : 'none'; });
      Array.prototype.forEach.call(rkWrap.querySelectorAll('.gx-rk-btn'), function(b){
        b.classList.toggle('active', b.getAttribute('data-rk') === key);
      });
    }
    rkWrap.addEventListener('click', function(e){
      var btn = e.target.closest('.gx-rk-btn');
      if(!btn) return;
      showRk(btn.getAttribute('data-rk'));
    });
    showRk('gols');

    function addLeaderboard(panel, tbody){
      var table = panel.querySelector('.rank-table');
      if(!table || !tbody) return;
      var lb = document.createElement('div');
      lb.className = 'leaderboard';
      table.parentNode.insertBefore(lb, table);
      table.style.display = 'none';
      function sync(){
        var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
        if(!rows.length || !rows[0].children.length || rows[0].classList.contains('empty-row')){
          lb.innerHTML = '<div class="gx-lb-empty">Sem dados suficientes ainda (mínimo de 200 partidas).</div>';
          return;
        }
        var medias = rows.map(function(r){ return parseFloat(r.children[4] ? r.children[4].textContent : 0) || 0; });
        var maxMedia = Math.max.apply(null, medias);
        lb.innerHTML = rows.map(function(r, i){
          var rank = r.children[0].textContent;
          var nome = r.children[1].textContent;
          var partidas = r.children[2].textContent;
          var media = r.children[4].textContent;
          var pct = maxMedia > 0 ? Math.max(6, (medias[i] / maxMedia) * 100) : 0;
          return '<div class="lb-row">' +
            '<div class="lb-rank">' + rank + '</div>' +
            '<div class="lb-main"><div class="lb-name">' + nome + '</div>' +
              '<div class="lb-bar-track"><div class="lb-bar-fill" style="width:' + pct + '%"></div></div></div>' +
            '<div class="lb-stats"><div class="lb-media">' + media + '</div><div class="lb-partidas">' + partidas + ' partidas</div></div>' +
          '</div>';
        }).join('');
      }
      sync();
      new MutationObserver(sync).observe(tbody, { childList: true });
    }
    addLeaderboard(rankGolsPanel, rankGolsBody);
    addLeaderboard(rankAssistPanel, rankAssistBody);
    addLeaderboard(rankGAPanel, rankGABody);

    /* ---------- 3) Comparar: busca com ícone + estado vazio explicativo ---------- */
    var compareSearch = document.getElementById('compareSearch');
    var compareChips = document.getElementById('compareChips');
    var compareClearBtn = document.getElementById('compareClearBtn');
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
        '<div class="gx-empty-sub">Busque um jogador acima e clique em "+ Adicionar". Você pode comparar até 5 de uma vez.</div>';
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

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
