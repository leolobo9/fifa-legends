(function(){
  const STORAGE_KEY = 'fifa_legends_players';
  let players = [];
  let cardsFlat = [];

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
  const EDITION_LABEL = Object.fromEntries(EDITIONS.map(e => [e.value, e.label]));
  const SHORT_EDITION = Object.fromEntries(EDITIONS.map(e => [e.value, e.value.replace(/[a-z]/gi,'')]));


  function normalize(str){
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function cardGA(c){ return (Number(c.gols)||0) + (Number(c.assistencias)||0); }
  function cardLabel(c){
    const ed = c.edition ? (EDITION_LABEL[c.edition] || c.edition) : 'Edição?';
    const ev = c.event ? c.event : 'Sem evento';
    return `${c.playerName} (${ed} · ${ev})`;
  }
    function cardShortLabel(c){
    return `${c.playerName} · ${SHORT_EDITION[c.edition] || '?'}`;
  }

  /* ---------- CORES DA CARTA (mesma lógica da página principal) ---------- */
    function getCardSwatch(eventName, edition){
    const e = (eventName || '').toLowerCase();
    if(e.includes('toty honourable mentions')) return 'linear-gradient(135deg,#0b2c52 0%,#0b2c52 55%,#c0c0c0 100%)';
    if(e.includes('toty eras icon')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#1f6fb8 100%)';
    if(e.includes('toty icon swaps')) return 'linear-gradient(45deg,#0b2c52 0%,#ffffff 45%,#ffffff 60%,#8a4fe0 100%)';
    if(e.includes('royalty knockout')) return 'linear-gradient(135deg,#5a6b7a 0%,#5a6b7a 60%,#c0392b 100%)';
    if(e.includes('fc pro open')) return 'linear-gradient(135deg,#3a1268 0%,#3a1268 60%,#a86bff 100%)';
    if(e.includes('track stars')) return 'linear-gradient(135deg,#6a1fb8 0%,#6a1fb8 60%,#ffe14d 100%)';
    if(e.includes('icon toty')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#0b2c52 100%)';
    if(e.includes('ones to watch')) return 'linear-gradient(135deg,#2d0a4e 0%,#2d0a4e 82%,#ffe14d 100%)';
    if(e.includes('toty')) return 'linear-gradient(135deg,#0b2c52 0%,#0b2c52 55%,#d4af37 100%)';
    if(e.includes('icon (baby)') || e.includes('icon (mid)') || e.includes('icon (prime)') || e.includes('prime icon moments') || e.includes('icons') || e.includes('fut immortals icon')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 75%,#d4af37 100%)';
    if(e.includes('ultimate succession')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 75%,#d4af37 100%)';
    if(e.includes('leave your mark')) return 'linear-gradient(135deg,#ffd700 0%,#ffd700 33%,#ffffff 33%,#ffffff 66%,#1a3fb8 66%,#1a3fb8 100%)';
    if(e.includes('world tour silver star icon')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#ff5c33 100%)';
    if(e.includes('world tour')) return 'linear-gradient(135deg,#1c1c1c 0%,#1c1c1c 50%,#5a5a5a 50%,#5a5a5a 75%,#c0392b 100%)';
    if(e.includes('tots honourable mentions')) return 'linear-gradient(135deg,#1f6fb8 0%,#1f6fb8 55%,#c0c0c0 100%)';
    if(e.includes('time warp')) return 'linear-gradient(135deg,#c724ff 0%,#c724ff 60%,#ff6fb0 100%)';
    if(e.includes('man of the match')) return 'linear-gradient(135deg,#ff8c1a,#e6690a)';
    if(e.includes('icon grassroots greats')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#6ee36e 100%)';
    if(e.includes('grassroots greats')) return 'linear-gradient(135deg,#145c2e 0%,#145c2e 60%,#6ee36e 100%)';
    if(e.includes('tots')) return 'linear-gradient(135deg,#1f6fb8 0%,#1f6fb8 55%,#d4af37 100%)';
    if(e === 'gold' || e === 'ouro') return 'linear-gradient(135deg,#ffd700,#c9a400)';
    if(e === 'silver') return 'linear-gradient(135deg,#eaeaea,#9aa0a6)';
    if(e === 'bronze') return 'linear-gradient(135deg,#d99a5b,#7a4a20)';
    if(e.includes('icon futties')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#ff6fb0 100%)';
    if(e.includes('futties hero')) return 'linear-gradient(135deg,#ff6fb0 0%,#ff6fb0 70%,#ffd700 100%)';
    if(e.includes('fut captains hero')) return 'linear-gradient(135deg,#5a6b7a 0%,#5a6b7a 60%,#ffd700 100%)';
    if(e.includes('fut captains')) return 'linear-gradient(135deg,#5a6b7a 0%,#5a6b7a 60%,#1a3fb8 100%)';
    if(e.includes('futties')) return 'linear-gradient(135deg,#ff6fb0 0%,#ff6fb0 90%,#ffd700 100%)';
    if(e.includes('icon winter wildcards')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#0f5c3c 100%)';
    if(e.includes('winter wildcards')) return 'linear-gradient(135deg,#0f5c3c 0%,#0f5c3c 70%,#d4af37 100%)';
    if(e.includes('totw')) return 'linear-gradient(135deg,#101010 0%,#101010 70%,#d4af37 100%)';
    if(e.includes('champions league icon') || e.includes('icon champions league')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#c724ff 100%)';
    if(e.includes('rttk') || e.includes('rttf') || e.includes('road to the knockouts') || e.includes('road to the final') || e.includes('ucl dreamchasers') || e.includes('champions league group stage team')) return 'linear-gradient(135deg,#1a3fb8 0%,#1a3fb8 70%,#c724ff 100%)';
    if(e.includes('euro path to glory')) return 'linear-gradient(135deg,#1a8f4a 0%,#1a8f4a 55%,#ffffff 70%,#1a3fb8 100%)';
    if(e.includes('team of the tournament')) return 'linear-gradient(135deg,#1a3fb8 0%,#1a3fb8 55%,#ffffff 70%,#1a8f4a 100%)';
    if(e.includes("ballon d'or")) return 'linear-gradient(135deg,#d4af37 0%,#d4af37 70%,#101010 100%)';
    if(e.includes('festival of football captains')) return 'linear-gradient(135deg,#c0392b 0%,#c0392b 60%,#2dd4bf 100%)';
    if(e.includes('player of the month')) return 'linear-gradient(135deg,#101010 0%,#101010 55%,#e02424 78%,#5fc9ff 100%)';
    if(e.includes('copa america path to glory')) return 'linear-gradient(135deg,#1a3fb8 0%,#1a3fb8 55%,#ffffff 70%,#c0392b 100%)';
    if(e.includes('fc champions icon')) return 'linear-gradient(135deg,#d4c19c 0%,#d4c19c 60%,#ffffff 100%)';
    if(e.includes('futmas')) return 'linear-gradient(135deg,#c0392b 0%,#c0392b 50%,#1a8f4a 50%,#1a8f4a 75%,#d4af37 100%)';
    if(e.includes('freeze')) return 'linear-gradient(135deg,#8fd0ff,#ffffff)';
    if(e.includes('versus fire/ice')) return 'linear-gradient(135deg,#9aabb0 0%,#9aabb0 45%,#1f9dae 45%,#1f9dae 70%,#ff4d1a 70%,#ff4d1a 100%)';
    if(e.includes('numero fut')) return 'linear-gradient(135deg,#6a1fb8 0%,#6a1fb8 65%,#ff6fb0 100%)';
    if(e.includes('icon golazo')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#ff5c33 100%)';
    if(e.includes('hero golazo')) return 'linear-gradient(135deg,#c0392b 0%,#c0392b 60%,#ffb020 100%)';
    if(e.includes('icon end of an era')) return 'linear-gradient(45deg,#8fd0ff 0%,#ffffff 45%,#ffffff 60%,#4a1a8f 100%)';
    if(e.includes('end of an era')) return 'linear-gradient(135deg,#8fd0ff 0%,#8fd0ff 60%,#4a1a8f 100%)';
    if(e.includes('trophy titans')){
      if(edition === 'fc26') return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#9a9a9a 100%)';
      return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#ff5c33 100%)';
    }
    if(e.includes('icon shapeshifter')) return 'linear-gradient(45deg,#39e600 0%,#ffffff 45%,#ffffff 60%,#8a1fd9 100%)';
    if(e.includes('shapeshifter hero')) return 'linear-gradient(135deg,#39e600 0%,#39e600 45%,#8a1fd9 100%)';
    if(e.includes('shapeshifter')) return 'linear-gradient(135deg,#39e600 0%,#39e600 70%,#8a1fd9 100%)';
    if(e.includes('icon world cup')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 55%,#c0392b 78%,#d4af37 100%)';
    if(e.includes('world cup hero')) return 'linear-gradient(135deg,#ff9d00 0%,#ff9d00 60%,#d4af37 100%)';
    if(e.includes('path to glory')) return 'linear-gradient(135deg,#c0392b 0%,#c0392b 60%,#2dd4bf 100%)';
    if(e.includes('world cup')) return 'linear-gradient(135deg,#0b3d2e,#ffd700)';
    if(e.includes('icon fut birthday')){
      if(edition === 'fifa23') return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#d4af37 80%,#2dd4bf 100%)';
      if(edition === 'fc24') return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#8a4fe0 100%)';
      if(edition === 'fc25') return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#ff2e88 100%)';
      if(edition === 'fc26') return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#ff2e88 80%,#8a4fe0 100%)';
      return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#d4af37 100%)';
    }
    if(e.includes('fut birthday hero')){
      if(edition === 'fc26') return 'linear-gradient(135deg,#ff2e88 0%,#ff2e88 60%,#8a4fe0 100%)';
      if(edition === 'fc25') return 'linear-gradient(135deg,#8a4fe0 0%,#8a4fe0 60%,#ff2e88 100%)';
      return 'linear-gradient(135deg,#ff6fb0,#8a4fe0)';
    }
    if(e.includes('festival of futball')) return 'linear-gradient(135deg,#6ee36e 0%,#6ee36e 70%,#ffe14d 100%)';
    if(e.includes('icon festival of football')) return 'linear-gradient(135deg,#c724ff 0%,#ffffff 45%,#ffffff 60%,#145c2e 100%)';
    if(e.includes('festival of football summer stars')) return 'linear-gradient(135deg,#3a0a5e 0%,#3a0a5e 60%,#39e600 100%)';
    if(e.includes('summer stars')) return 'linear-gradient(135deg,#8fd0ff 0%,#8fd0ff 60%,#6ee36e 100%)';
    if(e.includes('festival of football journey of nations')) return 'linear-gradient(135deg,#6ee36e 0%,#6ee36e 60%,#ffffff 100%)';
    if(e.includes('fut birthday') || e.includes('ut birthday')){
      if(edition === 'fifa21' || edition === 'fifa22') return 'linear-gradient(135deg,#b98fff 0%,#b98fff 40%,#ff6fb0 70%,#2dd4bf 100%)';
      if(edition === 'fifa23') return 'linear-gradient(135deg,#ff6fb0 0%,#ff6fb0 50%,#2dd4bf 100%)';
      if(edition === 'fc24' || edition === 'fc25') return 'linear-gradient(135deg,#ff6fb0 0%,#ff6fb0 60%,#8a4fe0 100%)';
      if(edition === 'fc26') return 'linear-gradient(135deg,#8a4fe0 0%,#8a4fe0 60%,#ff6fb0 100%)';
      return 'linear-gradient(135deg,#ff6fb0,#8a4fe0)';
    }
    if(e.includes('icon future stars')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 60%,#a86bff 100%)';
    if(e.includes('future stars hero')) return 'linear-gradient(135deg,#a86bff 0%,#a86bff 70%,#d4af37 100%)';
    if(e.includes('future stars')){
      if(edition === 'fifa21' || edition === 'fifa22') return 'linear-gradient(135deg,#2d0a5e 0%,#2d0a5e 70%,#00b4a6 100%)';
      if(edition === 'fifa23' || edition === 'fc26') return 'linear-gradient(135deg,#8a4fe0 0%,#8a4fe0 70%,#d4af37 100%)';
      if(edition === 'fc24') return 'linear-gradient(135deg,#b3ddff 0%,#b3ddff 70%,#6a1fb8 100%)';
      if(edition === 'fc25') return 'linear-gradient(135deg,#7a35c9 0%,#7a35c9 60%,#eaf4ff 100%)';
      return 'linear-gradient(135deg,#5f2aa0,#00e0ff)';
    }
    if(e.includes('icon thunderstruck')) return 'linear-gradient(45deg,#101010 0%,#ffffff 45%,#ffffff 60%,#d4af37 100%)';
    if(e.includes('icon greats of the game')) return 'linear-gradient(45deg,#c0392b 0%,#ffffff 45%,#ffffff 60%,#1f4fb8 100%)';
    if(e.includes('greats of the game')) return 'linear-gradient(45deg,#c0392b 0%,#ffffff 45%,#ffffff 60%,#1f4fb8 100%)';
    if(e.includes('thunderstruck')) return 'linear-gradient(45deg,#ffffff 0%,#101010 45%,#101010 60%,#d4af37 100%)';
    if(e.includes('icon centurion')) return 'linear-gradient(135deg,#ffffff 0%,#ffffff 55%,#d4af37 78%,#9a9a9a 100%)';
    if(e.includes('centurion')) return 'linear-gradient(135deg,#caa127 0%,#caa127 70%,#7a1414 100%)';
    if(e.includes('ratings reload')) return 'linear-gradient(135deg,#d4af37 0%,#d4af37 65%,#e8d5ad 100%)';
    if(e.includes('cover star')) return 'linear-gradient(135deg,#5a0f1f,#3a0812)';
    if(e.includes('moments')) return 'linear-gradient(135deg,#00b894 0%,#00b894 65%,#ffe14d 100%)';
    if(e.includes('what if')) return 'linear-gradient(135deg,#101010 0%,#101010 60%,#a86bff 100%)';
    if(e.includes('festival of football prodigies')) return 'linear-gradient(135deg,#6a1fb8 0%,#6a1fb8 60%,#1a8f4a 100%)';
    if(e.includes('out of position')) return 'linear-gradient(135deg,#101010 0%,#101010 55%,#8fd0ff 78%,#ff8c1a 100%)';
    if(e.includes('nike pro')) return 'linear-gradient(135deg,#39e600,#101010)';
    if(e.includes('uefa euro international stars')) return 'linear-gradient(135deg,#1a3fb8 0%,#1a3fb8 65%,#ffe14d 100%)';
    if(e.includes('triple threat hero')) return 'linear-gradient(135deg,#5a0f1f 0%,#5a0f1f 65%,#d4af37 100%)';
    if(e.includes('fantasy fut hero') || e.includes('fantasy fc hero')) return 'linear-gradient(135deg,#6a1fb8 0%,#6a1fb8 70%,#a86bff 100%)';
    if(e.includes('fantasy fut') || e.includes('fantasy fc')){
      if(edition === 'fc25' || edition === 'fc26') return 'linear-gradient(135deg,#a86bff 0%,#a86bff 65%,#ffd6ec 100%)';
      if(edition === 'fc24' || edition === 'fifa22') return 'linear-gradient(135deg,#8fd0ff 0%,#8fd0ff 65%,#ffffff 100%)';
      return 'linear-gradient(135deg,#6a1fb8 0%,#6a1fb8 70%,#a86bff 100%)';
    }
    if(e.includes('total rush')) return 'linear-gradient(135deg,#00c9b1 0%,#00c9b1 55%,#e02424 78%,#ffd23f 100%)';
    if(e.includes('vanguard')) return 'linear-gradient(135deg,#c0392b 0%,#c0392b 70%,#0b1f4a 100%)';
    if(e.includes('flashback')){
      if(edition === 'fifa21') return 'linear-gradient(135deg,#5a5a5a 0%,#5a5a5a 70%,#d4d4d4 100%)';
      if(edition === 'fifa22') return 'linear-gradient(135deg,#00b894 0%,#00b894 70%,#0d0d0d 100%)';
      return 'linear-gradient(135deg,#4a1a8f 0%,#4a1a8f 70%,#1e6fd9 100%)';
    }
    if(e.includes('hero')){
      if(edition === 'fifa22') return 'linear-gradient(135deg,#5a6b7a 0%,#5a6b7a 60%,#c0392b 100%)';
      if(edition === 'fifa23') return 'linear-gradient(135deg,#1f4f6b 0%,#1f4f6b 60%,#e67e22 100%)';
      if(edition === 'fc24') return 'linear-gradient(135deg,#e67e22 0%,#e67e22 60%,#2ecc71 100%)';
      if(edition === 'fc25') return 'linear-gradient(135deg,#e67e22 0%,#e67e22 45%,#ff2e88 100%)';
      if(edition === 'fc26') return 'linear-gradient(135deg,#3d1a5e 0%,#3d1a5e 60%,#ff6fb0 100%)';
      return 'linear-gradient(135deg,#7a3b12,#ffb64d)';
    }
    if(e.includes('showdown')) return 'linear-gradient(135deg,#4a4a4a 0%,#4a4a4a 70%,#e6ff00 100%)';
    if(e.includes('ultimate scream')) return 'linear-gradient(135deg,#1a1a1a,#ff7300)';
    if(!eventName) return 'linear-gradient(135deg,#555,#333)';
    return 'linear-gradient(135deg,#3c6a56,#d4af37)';
  }

  function getCardColorPair(eventName, edition){
    const swatch = getCardSwatch(eventName, edition);
    const hexColors = swatch.match(/#[0-9a-fA-F]{3,6}/g) || ['#3c6a56','#d4af37'];
    return [hexColors[0], hexColors[hexColors.length - 1]];
  }

  /* ---------- FILTRO DE EDIÇÃO ---------- */
  const EDITION_FILTER_OPTIONS_HTML = `<option value="all">Todas</option>` +
    EDITIONS.map(ed => `<option value="${ed.value}">${ed.label}</option>`).join('');
  document.querySelectorAll('.edition-filter-select').forEach(sel => {
    sel.innerHTML = EDITION_FILTER_OPTIONS_HTML;
  });
  function matchesEditionFilter(edition, filterValue){
    if(!filterValue || filterValue === 'all') return true;
    return edition === filterValue;
  }

  /* ---------- FILTRO DE POSIÇÃO ---------- */
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
      <option value="pos:LE">Lateral Esquerdo</option>
      <option value="pos:LD">Lateral Direito</option>
      <option value="pos:VOL">Volante</option>
      <option value="pos:MC">Meio Campo Central</option>
      <option value="pos:MCA">Meio Campo Avançado</option>
      <option value="pos:ATA">Atacante</option>
      <option value="pos:PE">Ponta Esquerda</option>
      <option value="pos:PD">Ponta Direita</option>
    </optgroup>
  `;
  document.querySelectorAll('.position-filter-select').forEach(sel => {
    sel.innerHTML = POSITION_FILTER_OPTIONS_HTML;
  });
  const CATEGORY_POSITIONS = { ata:['ATA','PE','PD'], mei:['VOL','MC','MCA'], def:['GOL','ZAG','LE','LD'] };
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

  function loadData(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      players = raw ? JSON.parse(raw) : [];
    } catch(e){
      console.error('Erro ao carregar dados', e);
      players = [];
    }

    cardsFlat = [];
    players.forEach(p => {
      (p.cards || []).forEach(c => {
        cardsFlat.push({
          cardId: c.id,
          playerId: p.id,
          playerName: p.nome,
          positions: c.positions || [],
          edition: c.edition || '',
          event: c.event || '',
          partidas: Number(c.partidas) || 0,
          gols: Number(c.gols) || 0,
          assistencias: Number(c.assistencias) || 0
        });
      });
    });
  }

  /* ---------- SINCRONIZAÇÃO COM A NUVEM (Firebase, somente leitura) ---------- */
  function whenFifaSyncReadyCd(cb){
    if(window.FifaSync){ cb(window.FifaSync); return; }
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if(window.FifaSync){ clearInterval(t); cb(window.FifaSync); }
      else if(tries > 100){ clearInterval(t); }
    }, 100);
  }

  function renderEverythingCards(){
    renderChart();
    populateCardCompareSelect();
    renderCardCompareChart();
    renderCardRankings();
    renderIdealCardTeams();
  }

  function applyCloudPlayersCd(data, ts){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || []));
      localStorage.setItem(STORAGE_KEY + '__ts', String(ts));
    } catch(e){}
    loadData();
    renderEverythingCards();
  }

  function syncFromCloudOnLoad(){
    whenFifaSyncReadyCd(async (FifaSync) => {
      const cloud = await FifaSync.load(FifaSync.KEYS.PLAYERS);
      const localTs = Number(localStorage.getItem(STORAGE_KEY + '__ts') || 0);
      if(cloud && cloud.updatedAt > localTs){
        applyCloudPlayersCd(cloud.data, cloud.updatedAt);
      }
      FifaSync.watch(FifaSync.KEYS.PLAYERS, (data, ts) => {
        const lts = Number(localStorage.getItem(STORAGE_KEY + '__ts') || 0);
        if(ts > lts){ applyCloudPlayersCd(data, ts); }
      });
    });
  }

  /* ---------- GRÁFICO 1: TOP N POR CARTA ---------- */
  const cardMetric = document.getElementById('cardMetric');
  const cardEdition = document.getElementById('cardEdition');
  const cardPosition = document.getElementById('cardPosition');
  const cardTopN = document.getElementById('cardTopN');
  let chartInstance = null;
  let currentSortedCards = [];

  function metricLabel(key){
    return { gols:'Gols', assistencias:'Assistências', ga:'G+A', partidas:'Partidas' }[key];
  }
  function cardMetricValue(c, metric){
    return metric === 'ga' ? cardGA(c) : (Number(c[metric]) || 0);
  }

  function renderChart(){
    const metric = cardMetric.value;
    const topN = cardTopN.value;
    const posFilter = cardPosition.value;
    const edFilter = cardEdition.value;

    let sorted = cardsFlat
      .filter(c => matchesPositionFilter(c.positions, posFilter) && matchesEditionFilter(c.edition, edFilter))
      .sort((a,b) => cardMetricValue(b, metric) - cardMetricValue(a, metric));
    if(topN !== 'all') sorted = sorted.slice(0, Number(topN));
    currentSortedCards = sorted;

    const labels = sorted.map(cardShortLabel);
    const data = sorted.map(c => cardMetricValue(c, metric));

    const ctx = document.getElementById('cardsChart').getContext('2d');
    if(chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: 'bar',
            data: {
        labels,
        datasets: [{
          label: metricLabel(metric),
          data,
          backgroundColor: 'rgba(212,175,55,0.75)',
          borderColor: '#f7e6a8',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
                    tooltip: {
            backgroundColor: '#0b2c52', titleColor: '#f7e6a8', bodyColor: '#f2f0e6', borderColor: '#d4af37', borderWidth: 1,
            callbacks: {
              title: (items) => cardLabel(currentSortedCards[items[0].dataIndex]),
              label: (item) => `${metricLabel(cardMetric.value)}: ${item.formattedValue}`,
              labelColor: (item) => {
                const card = currentSortedCards[item.dataIndex];
                const color = card ? getCardColorPair(card.event, card.edition)[0] : '#d4af37';
                return { borderColor: color, backgroundColor: color };
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: '#c3d3ef', font: { family: 'JetBrains Mono' }, maxRotation: 35, minRotation: 0, autoSkip: false }, grid: { color: 'rgba(212,175,55,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#c3d3ef', font: { family: 'JetBrains Mono' } }, grid: { color: 'rgba(212,175,55,0.1)' } }
        }
      }
    });
  }
  cardMetric.addEventListener('change', renderChart);
  cardEdition.addEventListener('change', renderChart);
  cardPosition.addEventListener('change', renderChart);
  cardTopN.addEventListener('change', renderChart);

  /* ---------- COMPARAÇÃO DE ATÉ 5 CARTAS ---------- */
  const cardCompareSelect = document.getElementById('cardCompareSelect');
  const cardCompareSearch = document.getElementById('cardCompareSearch');
  const cardCompareAddBtn = document.getElementById('cardCompareAddBtn');
  const cardCompareClearBtn = document.getElementById('cardCompareClearBtn');
  const cardCompareChips = document.getElementById('cardCompareChips');
  let compareIds = [];
  let compareChartInstance = null;
  const compareColors = ['#d4af37', '#8fd0ff', '#e0555f', '#7ed957', '#c792ea'];

  function populateCardCompareSelect(filtro){
    const termo = filtro ? normalize(filtro) : '';
    const list = cardsFlat
      .filter(c => !termo || normalize(c.playerName).includes(termo))
      .sort((a,b) => a.playerName.localeCompare(b.playerName));

    cardCompareSelect.innerHTML = list.length
      ? list.map(c => `<option value="${c.cardId}">${escapeHtml(cardLabel(c))}</option>`).join('')
      : '<option value="">Nenhuma carta encontrada</option>';
  }

  function renderCardChips(){
    const selecionadas = compareIds.map(id => cardsFlat.find(c => c.cardId === id)).filter(Boolean);
    cardCompareChips.innerHTML = selecionadas.map((c, i) => `
      <span class="compare-chip" style="border-color:${compareColors[i]}; color:${compareColors[i]};">
        ${escapeHtml(cardLabel(c))}
        <button type="button" data-id="${c.cardId}" title="Remover">&times;</button>
      </span>
    `).join('');
  }

  function renderCardCompareChart(){
    const selecionadas = compareIds.map(id => cardsFlat.find(c => c.cardId === id)).filter(Boolean);
    const labels = ['Partidas', 'Gols', 'Assistências', 'G+A'];
    const datasets = selecionadas.map((c, i) => ({
      label: cardLabel(c),
      data: [c.partidas, c.gols, c.assistencias, cardGA(c)],
      backgroundColor: compareColors[i],
      borderRadius: 6
    }));

    const ctx = document.getElementById('cardsCompareChart').getContext('2d');
    if(compareChartInstance) compareChartInstance.destroy();

    compareChartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: selecionadas.length > 0, labels: { color: '#f2f0e6', font: { family: 'Inter' } } },
          tooltip: { backgroundColor: '#0b2c52', titleColor: '#f7e6a8', bodyColor: '#f2f0e6', borderColor: '#d4af37', borderWidth: 1 }
        },
        scales: {
          x: { ticks: { color: '#c3d3ef', font: { family: 'JetBrains Mono' } }, grid: { color: 'rgba(212,175,55,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#c3d3ef', font: { family: 'JetBrains Mono' } }, grid: { color: 'rgba(212,175,55,0.1)' } }
        }
      }
    });
  }

  cardCompareAddBtn.addEventListener('click', () => {
    const id = cardCompareSelect.value;
    if(!id) return;
    if(compareIds.includes(id)) return;
    if(compareIds.length >= 5){ alert('Você já selecionou 5 cartas. Remova uma antes de adicionar outra.'); return; }
    compareIds.push(id);
    renderCardChips();
    renderCardCompareChart();
  });
  cardCompareSearch.addEventListener('input', () => populateCardCompareSelect(cardCompareSearch.value.trim()));
  cardCompareChips.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    compareIds = compareIds.filter(id => id !== btn.dataset.id);
    renderCardChips();
    renderCardCompareChart();
  });
  cardCompareClearBtn.addEventListener('click', () => {
    compareIds = [];
    renderCardChips();
    renderCardCompareChart();
  });

  /* ---------- RANKINGS POR CARTA ---------- */
  const rankCardGolsBody = document.getElementById('rankCardGols');
  const rankCardAssistBody = document.getElementById('rankCardAssist');
  const rankCardGABody = document.getElementById('rankCardGA');
  const rankCardGolsTopN = document.getElementById('rankCardGolsTopN');
  const rankCardAssistTopN = document.getElementById('rankCardAssistTopN');
  const rankCardGATopN = document.getElementById('rankCardGATopN');
  const rankCardGolsPosition = document.getElementById('rankCardGolsPosition');
  const rankCardAssistPosition = document.getElementById('rankCardAssistPosition');
  const rankCardGAPosition = document.getElementById('rankCardGAPosition');
  const rankCardGolsEdition = document.getElementById('rankCardGolsEdition');
  const rankCardAssistEdition = document.getElementById('rankCardAssistEdition');
  const rankCardGAEdition = document.getElementById('rankCardGAEdition');
  const MIN_PARTIDAS_CARTA = 10;
  const rankCardMode = { gols:'total', assist:'total', ga:'total' };
  function setupCardStatModeToggle(toggleId, key, onChange){
    const toggle = document.getElementById(toggleId);
    if(!toggle) return;
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.stat-mode-btn');
      if(!btn) return;
      rankCardMode[key] = btn.dataset.mode;
      toggle.querySelectorAll('.stat-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
      onChange();
    });
  }

  function renderCardRankRow(c, i, statValue, media){
    const ed = c.edition ? (EDITION_LABEL[c.edition] || c.edition) : 'Não informado';
    const ev = c.event ? escapeHtml(c.event) : 'Não informado';
    const swatch = getCardSwatch(c.event, c.edition);
    return `<tr>
      <td>${i+1}</td>
      <td class="rank-nome"><span class="card-swatch" style="background:${swatch}; width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:6px;"></span>${escapeHtml(c.playerName)} <span style="color:var(--muted); font-size:11px;">(${ed} · ${ev})</span></td>
      <td>${c.partidas}</td>
      <td>${statValue}</td>
      <td>${media.toFixed(2)}</td>
    </tr>`;
  }

  function buildCardRankRows(statKey, totalFn, editionSel, positionSel, topNSel){
    let rows = cardsFlat
      .filter(c => c.partidas >= MIN_PARTIDAS_CARTA && matchesPositionFilter(c.positions, positionSel.value) && matchesEditionFilter(c.edition, editionSel.value))
      .map(c => ({ c, total: totalFn(c), media: totalFn(c) / c.partidas }));
    rows.sort(rankCardMode[statKey] === 'media' ? (a,b) => b.media - a.media : (a,b) => b.total - a.total);
    if(topNSel.value !== 'all') rows = rows.slice(0, Number(topNSel.value));
    return rows;
  }

  function renderCardRankings(){
    const byGols = buildCardRankRows('gols', c => c.gols, rankCardGolsEdition, rankCardGolsPosition, rankCardGolsTopN);
    rankCardGolsBody.innerHTML = byGols.length
      ? byGols.map((x,i) => renderCardRankRow(x.c, i, x.total, x.media)).join('')
      : '<tr><td colspan="5">Sem dados suficientes.</td></tr>';

    const byAssist = buildCardRankRows('assist', c => c.assistencias, rankCardAssistEdition, rankCardAssistPosition, rankCardAssistTopN);
    rankCardAssistBody.innerHTML = byAssist.length
      ? byAssist.map((x,i) => renderCardRankRow(x.c, i, x.total, x.media)).join('')
      : '<tr><td colspan="5">Sem dados suficientes.</td></tr>';

    const byGA = buildCardRankRows('ga', c => cardGA(c), rankCardGAEdition, rankCardGAPosition, rankCardGATopN);
    rankCardGABody.innerHTML = byGA.length
      ? byGA.map((x,i) => renderCardRankRow(x.c, i, x.total, x.media)).join('')
      : '<tr><td colspan="5">Sem dados suficientes.</td></tr>';
  }
  rankCardGolsTopN.addEventListener('change', renderCardRankings);
  rankCardAssistTopN.addEventListener('change', renderCardRankings);
  rankCardGATopN.addEventListener('change', renderCardRankings);
  rankCardGolsPosition.addEventListener('change', renderCardRankings);
  rankCardAssistPosition.addEventListener('change', renderCardRankings);
  rankCardGAPosition.addEventListener('change', renderCardRankings);
  rankCardGolsEdition.addEventListener('change', renderCardRankings);
  rankCardAssistEdition.addEventListener('change', renderCardRankings);
  rankCardGAEdition.addEventListener('change', renderCardRankings);
  setupCardStatModeToggle('rankCardGolsModeToggle', 'gols', renderCardRankings);
  setupCardStatModeToggle('rankCardAssistModeToggle', 'assist', renderCardRankings);
  setupCardStatModeToggle('rankCardGAModeToggle', 'ga', renderCardRankings);

  /* ---------- TIMES IDEAIS POR EDIÇÃO ---------- */
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
  const cardTeamEdition = document.getElementById('cardTeamEdition');
  const cardTeamMetric = document.getElementById('cardTeamMetric');
  let cardTeamsState = { team1: [], team2: [], team3: [] };
  let cardSelectedChip = null;

  const cardTooltipEl = document.createElement('div');
  cardTooltipEl.className = 'team-tooltip';
  document.body.appendChild(cardTooltipEl);

  function placeCardTooltip(el, x, y){
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.display = 'block';
    var w = el.offsetWidth;
    var h = el.offsetHeight;
    var left = x + 16;
    var top = y + 16;
    if(left + w > window.innerWidth - 8) left = x - w - 16;
    if(left < 8) left = 8;
    if(top + h > window.innerHeight - 8) top = y - h - 16;
    if(top < 8) top = 8;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }
  function showCardTooltip(html, x, y){
    cardTooltipEl.innerHTML = html;
    placeCardTooltip(cardTooltipEl, x, y);
  }
  function hideCardTooltip(){ cardTooltipEl.style.display = 'none'; }

  function buildOneCardTeam(edition, metric, usedPlayerIds){
    return FORMATION_433.map(slot => {
      const candidates = cardsFlat
        .filter(c => c.edition === edition && c.positions.includes(slot.code) && !usedPlayerIds.has(c.playerId))
        .sort((a,b) => cardMetricValue(b, metric) - cardMetricValue(a, metric));
      const chosen = candidates[0] || null;
      if(chosen) usedPlayerIds.add(chosen.playerId);
      return { slot, card: chosen };
    });
  }

  function renderCardPitch(containerId, teamKey){
    const container = document.getElementById(containerId);
    if(!container) return;
    const team = cardTeamsState[teamKey];
    const metric = cardTeamMetric.value;

    container.innerHTML = team.map(({slot, card}, idx) => {
      const isSelected = cardSelectedChip && cardSelectedChip.teamKey === teamKey && cardSelectedChip.index === idx;
      const selClass = isSelected ? ' selected' : '';
      if(!card){
        return `<div class="player-chip empty${selClass}" data-team="${teamKey}" data-index="${idx}" style="top:${slot.top}%; left:${slot.left}%;">${slot.code}<span class="chip-stat">vago</span></div>`;
      }
      const statValue = cardMetricValue(card, metric);
      const bg = getCardSwatch(card.event, card.edition);
      return `<div class="player-chip card-bg${selClass}" data-team="${teamKey}" data-index="${idx}" style="top:${slot.top}%; left:${slot.left}%; background:${bg};">${escapeHtml(card.playerName)}<span class="chip-stat">${slot.code} · ${statValue}</span></div>`;
    }).join('');
  }

  function renderAllCardPitches(){
    renderCardPitch('pitchCardTeam1', 'team1');
    renderCardPitch('pitchCardTeam2', 'team2');
    renderCardPitch('pitchCardTeam3', 'team3');
  }

  function renderIdealCardTeams(){
    const edition = cardTeamEdition.value;
    const metric = cardTeamMetric.value;
    const usedPlayerIds = new Set();
    cardTeamsState.team1 = buildOneCardTeam(edition, metric, usedPlayerIds);
    cardTeamsState.team2 = buildOneCardTeam(edition, metric, usedPlayerIds);
    cardTeamsState.team3 = buildOneCardTeam(edition, metric, usedPlayerIds);
    cardSelectedChip = null;
    renderAllCardPitches();
  }

  function handleCardChipClick(teamKey, index){
    if(!cardSelectedChip){
      cardSelectedChip = { teamKey, index };
      renderAllCardPitches();
      return;
    }
    if(cardSelectedChip.teamKey === teamKey && cardSelectedChip.index === index){
      cardSelectedChip = null;
      renderAllCardPitches();
      return;
    }
    if(cardSelectedChip.teamKey !== teamKey){
      alert('Só é possível trocar cartas dentro do mesmo time.');
      cardSelectedChip = { teamKey, index };
      renderAllCardPitches();
      return;
    }
    const team = cardTeamsState[teamKey];
    const temp = team[cardSelectedChip.index].card;
    team[cardSelectedChip.index].card = team[index].card;
    team[index].card = temp;
    cardSelectedChip = null;
    renderAllCardPitches();
  }

  ['pitchCardTeam1','pitchCardTeam2','pitchCardTeam3'].forEach((containerId, i) => {
    const teamKey = 'team' + (i+1);
    const el = document.getElementById(containerId);
    el.addEventListener('click', (e) => {
      const chip = e.target.closest('.player-chip');
      if(!chip) return;
      handleCardChipClick(chip.dataset.team, Number(chip.dataset.index));
    });
    el.addEventListener('mouseover', (e) => {
      const chip = e.target.closest('.player-chip');
      if(!chip) return;
      const idx = Number(chip.dataset.index);
      const entry = cardTeamsState[chip.dataset.team][idx];
      if(!entry || !entry.card) return;
      const c = entry.card;
      const edLabel = c.edition ? (EDITION_LABEL[c.edition] || c.edition) : 'Não informado';
      const evLabel = c.event ? escapeHtml(c.event) : 'Não informado';
      const swatch = getCardSwatch(c.event, c.edition);
      const html = `<strong>${escapeHtml(c.playerName)}</strong>
        <div class="tt-row"><span><span class="tt-swatch" style="background:${swatch};"></span>${edLabel}</span><span></span></div>
        <div class="tt-row"><span>Evento</span><span>${evLabel}</span></div>
        <div class="tt-row"><span>Posição</span><span>${entry.slot.code}</span></div>
        <div class="tt-row"><span>Partidas</span><span>${c.partidas}</span></div>
        <div class="tt-row"><span>Gols</span><span>${c.gols}</span></div>
        <div class="tt-row"><span>Assistências</span><span>${c.assistencias}</span></div>
        <div class="tt-row"><span>G+A</span><span>${cardGA(c)}</span></div>`;
      showCardTooltip(html, e.clientX, e.clientY);
    });
    el.addEventListener('mousemove', (e) => {
      const chip = e.target.closest('.player-chip');
      if(!chip) return;
      placeCardTooltip(cardTooltipEl, e.clientX, e.clientY);
    });
    el.addEventListener('mouseout', hideCardTooltip);
  });

  cardTeamEdition.addEventListener('change', renderIdealCardTeams);
  cardTeamMetric.addEventListener('change', renderIdealCardTeams);

  /* ---------- INIT ---------- */
  loadData();
  renderChart();
  populateCardCompareSelect();
  renderCardCompareChart();
  renderCardRankings();
  renderIdealCardTeams();
  syncFromCloudOnLoad();
})();