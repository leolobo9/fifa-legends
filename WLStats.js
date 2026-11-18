(function(){
  const STORAGE_KEY = 'fifa_wl_all';
  let wls = [];
  let viewMode = 'player';
  let sortKey = 'partidas';
  let sortDir = -1;
  const PAGE_SIZE = 35;
  const STATS_MIN_MATCHES = 5; /* mínimo de partidas pra aparecer na tabela de estatísticas */
  let visibleCount = PAGE_SIZE;
  let expandedRowIds = new Set();
  let compareIds = [];
  let compareChartInstance = null;

  const EDITION_LABEL_WL = { fifa22:'FIFA 22', fifa23:'FIFA 23', fc26:'EA FC 26', fc27:'EA FC 27' };

  const POSITIONS_META = {
    GOL:{label:'Goleiro',cat:'def'}, ZAG:{label:'Zagueiro',cat:'def'}, LE:{label:'Lateral Esquerdo',cat:'def'}, LD:{label:'Lateral Direito',cat:'def'},
    VOL:{label:'Volante',cat:'mei'}, MC:{label:'Meio Central',cat:'mei'}, MCA:{label:'Meio Avançado',cat:'mei'},
    ATA:{label:'Atacante',cat:'ata'}, PE:{label:'Ponta Esquerda',cat:'ata'}, PD:{label:'Ponta Direita',cat:'ata'}
  };

  const AWARD_META = {
    artilheiro: {icon:'⚽', label:'Artilheiro'},
    assistente: {icon:'🎯', label:'Assistente'},
    motor: {icon:'🔥', label:'Motor (G+A)'},
    melhor: {icon:'⭐', label:'Melhor da WL'},
    decisivo: {icon:'🏅', label:'Mais Decisivo'}
  };

  const FORMATIONS = {
    '433-4': [
      {code:'ATA', label:'Atacante'},{code:'PE', label:'Ponta Esquerda'},{code:'PD', label:'Ponta Direita'},
      {code:'MCA', label:'Meio Avançado'},{code:'MC', label:'Meio Central'},{code:'MC', label:'Meio Central'},
      {code:'LD', label:'Lateral Direito'},{code:'LE', label:'Lateral Esquerdo'},
      {code:'ZAG', label:'Zagueiro'},{code:'ZAG', label:'Zagueiro'},{code:'GOL', label:'Goleiro'}
    ],
    '41212-2': [
      {code:'ATA', label:'Atacante'},{code:'ATA', label:'Atacante'},{code:'MCA', label:'Meia'},
      {code:'MC', label:'Meio Central'},{code:'MC', label:'Meio Central'},{code:'VOL', label:'Volante'},
      {code:'LD', label:'Lateral Direito'},{code:'LE', label:'Lateral Esquerdo'},
      {code:'ZAG', label:'Zagueiro'},{code:'ZAG', label:'Zagueiro'},{code:'GOL', label:'Goleiro'}
    ],
    '442': [
      {code:'ATA', label:'Atacante'},{code:'ATA', label:'Atacante'},{code:'PE', label:'Ponta Esquerda'},
      {code:'MC', label:'Meio Central'},{code:'MC', label:'Meio Central'},{code:'PD', label:'Ponta Direita'},
      {code:'LE', label:'Lateral Esquerdo'},{code:'ZAG', label:'Zagueiro'},{code:'ZAG', label:'Zagueiro'},
      {code:'LD', label:'Lateral Direito'},{code:'GOL', label:'Goleiro'}
    ]
  };

  const FORMATION_COORDS = {
    '433-4': [
      {top:8,left:50},{top:18,left:12},{top:18,left:88},
      {top:40,left:72},{top:40,left:28},{top:54,left:50},
      {top:66,left:90},{top:66,left:10},
      {top:78,left:35},{top:78,left:65},{top:92,left:50}
    ],
    '41212-2': [
      {top:8,left:35},{top:8,left:65},{top:28,left:50},
      {top:46,left:28},{top:46,left:72},{top:58,left:50},
      {top:66,left:90},{top:66,left:10},
      {top:78,left:35},{top:78,left:65},{top:92,left:50}
    ],
    '442': [
      {top:8,left:35},{top:8,left:65},{top:30,left:12},
      {top:46,left:35},{top:46,left:65},{top:30,left:88},
      {top:66,left:10},{top:78,left:35},{top:78,left:65},
      {top:66,left:90},{top:92,left:50}
    ]
  };

  const statsFilterEdition = document.getElementById('statsFilterEdition');
  const viewByPlayerBtn = document.getElementById('viewByPlayerBtn');
  const viewByCardBtn = document.getElementById('viewByCardBtn');
  const statsTableHead = document.getElementById('statsTableHead');
  const statsTbody = document.getElementById('statsTbody');
  const loadMoreStatsWrap = document.getElementById('loadMoreStatsWrap');
  const loadMoreStatsBtn = document.getElementById('loadMoreStatsBtn');
  const idealEdition = document.getElementById('idealEdition');
  const idealFormation = document.getElementById('idealFormation');
  const idealCriterio = document.getElementById('idealCriterio');
  const idealMinMatches = document.getElementById('idealMinMatches');
  const idealTeamResult = document.getElementById('idealTeamResult');
  const compareSelect = document.getElementById('compareSelect');
  const compareAddBtn = document.getElementById('compareAddBtn');
  const compareClearBtn = document.getElementById('compareClearBtn');
  const compareChips = document.getElementById('compareChips');
  const rankGolsBody = document.getElementById('rankGols');
  const rankAssistBody = document.getElementById('rankAssist');
  const rankGABody = document.getElementById('rankGA');
  const rankMediaBody = document.getElementById('rankMedia');
  const rankMVPBody = document.getElementById('rankMVP');
  const rankGolsTopN = document.getElementById('rankGolsTopN');
  const rankAssistTopN = document.getElementById('rankAssistTopN');
  const rankGATopN = document.getElementById('rankGATopN');
  const rankMediaTopN = document.getElementById('rankMediaTopN');
  const rankPosition = document.getElementById('rankPosition');
  const rankMVPTopN = document.getElementById('rankMVPTopN');

  /* ---------- LIGAÇÃO SEGURA DE EVENTOS ----------
     Se algum elemento do HTML estiver faltando (ex: um <select> que ainda
     não foi colado na página), isso NUNCA deve travar o script inteiro.
     Em vez de "elemento.addEventListener(...)" direto, usamos on(...),
     que avisa no console mas deixa o resto da página funcionando. */
  function on(el, evt, fn){
    if(el && typeof el.addEventListener === 'function'){
      el.addEventListener(evt, fn);
    } else {
      console.warn('[WLStats] elemento não encontrado para o evento "' + evt + '" — verifique se o HTML está completo.');
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

  function loadAll(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      wls = raw ? JSON.parse(raw) : [];
    } catch(e){ wls = []; }
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

  function applyCloudWLSt(data, ts){
    wls = data || [];
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wls));
      localStorage.setItem(STORAGE_KEY + '__ts', String(ts));
    } catch(e){}
    renderAll();
  }

  function syncFromCloudOnLoad(){
    whenFifaSyncReadySt(async (FifaSync) => {
      const cloud = await FifaSync.load(FifaSync.KEYS.WL);
      const localTs = Number(localStorage.getItem(STORAGE_KEY + '__ts') || 0);
      if(cloud && cloud.updatedAt > localTs){
        applyCloudWLSt(cloud.data, cloud.updatedAt);
      }
      FifaSync.watch(FifaSync.KEYS.WL, (data, ts) => {
        const lts = Number(localStorage.getItem(STORAGE_KEY + '__ts') || 0);
        if(ts > lts){ applyCloudWLSt(data, ts); }
      });
    });
  }

  function getFilteredWLs(){
    const f = statsFilterEdition ? statsFilterEdition.value : '';
    return f ? wls.filter(w => getEffectiveEdition(w) === f) : wls;
  }

  /* ---------- EDIÇÃO EXCLUSIVA DO TIME IDEAL ----------
     A seção "Time Ideal" tem seu próprio seletor de edição (#idealEdition),
     separado do filtro geral do topo da página. Antes esse seletor não
     fazia nada — o JS nunca lia o valor dele, então o Time Ideal usava o
     filtro do topo (ou todas as WLs, se vazio), por isso apareciam
     jogadores da edição errada. Agora o Time Ideal usa SEMPRE o valor
     de #idealEdition. */
  function getIdealWLs(){
    const f = idealEdition ? idealEdition.value : '';
    return f ? wls.filter(w => getEffectiveEdition(w) === f) : wls;
  }

  function resetPageAndRender(){
    visibleCount = PAGE_SIZE;
    renderAll();
  }

  on(statsFilterEdition, 'change', resetPageAndRender);
  on(viewByPlayerBtn, 'click', () => {
    viewMode='player'; viewByPlayerBtn.classList.add('active'); viewByCardBtn.classList.remove('active');
    sortKey='partidas'; sortDir=-1; expandedRowIds = new Set();
    resetPageAndRender();
  });
  on(viewByCardBtn, 'click', () => {
    viewMode='card'; viewByCardBtn.classList.add('active'); viewByPlayerBtn.classList.remove('active');
    sortKey='partidas'; sortDir=-1; expandedRowIds = new Set();
    resetPageAndRender();
  });

  /* ---------- POSIÇÕES (todas as já jogadas) ---------- */
  function getSquadPositionsForCard(nameKey, edition, event){
    let found = null;
    getFilteredWLs().some(wl => {
      found = wl.squad.find(p => normalizeName(p.nome) === nameKey && p.edition === edition && normalizeName(p.event||'') === normalizeName(event||''));
      return !!found;
    });
    return found ? (found.positions||[]) : [];
  }
  function getPositionCounts(nameKey){
    const counts = {};
    getFilteredWLs().forEach(wl => wl.matches.forEach(m => m.playerStats.forEach(p => {
      if(normalizeName(p.nome) !== nameKey) return;
      if(p.positions && p.positions.length) p.positions.forEach(pos => { counts[pos] = (counts[pos]||0) + 1; });
    })));
    if(Object.keys(counts).length === 0){
      getFilteredWLs().forEach(wl => wl.squad.forEach(sq => {
        if(normalizeName(sq.nome) === nameKey && sq.positions && sq.positions.length){
          sq.positions.forEach(pos => { counts[pos] = (counts[pos]||0) + 1; });
        }
      }));
    }
    return counts;
  }
  function renderPositionsSection(nameKey){
    const counts = getPositionCounts(nameKey);
    const entries = Object.entries(counts);
    if(entries.length === 0) return '<span style="color:var(--muted); font-size:13px;">Nenhum registro de posição ainda.</span>';
    entries.sort((a,b) => b[1]-a[1]);
    const maxCount = entries[0][1];
    return entries.map(([code,count]) => {
      const meta = POSITIONS_META[code];
      if(!meta) return '';
      return `<span class="pos-badge badge-${meta.cat}">${code} · ${meta.label}${count===maxCount ? ' ⭐ Favorita' : ''}</span>`;
    }).join('');
  }
  function getCardWLBreakdown(nameKey, edition, event){
    const rows = [];
    getFilteredWLs().forEach(wl => {
      let partidas=0, gols=0, assistencias=0, notaSoma=0;
      wl.matches.forEach(m => m.playerStats.forEach(p => {
        if(normalizeName(p.nome) === nameKey && p.edition === edition && normalizeName(p.event||'') === normalizeName(event||'')){
          partidas++; gols += p.gols; assistencias += p.assistencias; notaSoma += p.nota;
        }
      }));
      if(partidas > 0) rows.push({ wlName: wl.name, partidas, gols, assistencias, media: notaSoma/partidas });
    });
    return rows;
  }

  /* ---------- HISTÓRICO DE PRÊMIOS (dentro das WLs filtradas) ---------- */
  function aggregateSingleWL(wl){
    const byPlayer = {}, mvpCount = {};
    wl.matches.forEach(m => {
      const mvp = getMatchMVP(m);
      if(mvp){ const key = normalizeName(mvp.nome); mvpCount[key] = (mvpCount[key]||0) + 1; }
      m.playerStats.forEach(p => {
        const nameKey = normalizeName(p.nome);
        if(!byPlayer[nameKey]) byPlayer[nameKey] = { nome:p.nome, gols:0, assistencias:0, notaSoma:0, partidas:0 };
        const pp = byPlayer[nameKey];
        pp.partidas++; pp.gols+=p.gols; pp.assistencias+=p.assistencias; pp.notaSoma+=p.nota;
      });
    });
    return { byPlayer, mvpCount };
  }
  function computeAwardsHistory(){
    const history = {};
    getFilteredWLs().forEach(wl => {
      const agg = aggregateSingleWL(wl);
      const arr = Object.entries(agg.byPlayer).map(([id,p]) => ({
        id, nome:p.nome, gols:p.gols, assistencias:p.assistencias, ga:p.gols+p.assistencias,
        media:p.notaSoma/p.partidas, mvps: agg.mvpCount[id]||0
      }));
      if(arr.length === 0) return;
      function top(metric){ return arr.slice().sort((a,b) => b[metric]-a[metric])[0]; }
      const winners = [
        {key:'artilheiro', w:top('gols')},
        {key:'assistente', w:top('assistencias')},
        {key:'motor', w:top('ga')},
        {key:'melhor', w:top('media')},
        {key:'decisivo', w:top('mvps')}
      ];
      winners.forEach(({key,w}) => {
        if(!history[w.id]) history[w.id] = { nome:w.nome, artilheiro:0, assistente:0, motor:0, melhor:0, decisivo:0 };
        history[w.id][key]++;
      });
    });
    return history;
  }

  /* ---------- AGREGAÇÃO GERAL ---------- */
  function aggregate(positionFilter){
    const byPlayer = {}, byCard = {}, mvpCount = {}, cardMvpCount = {};
    let totalMatches=0, totalV=0, totalD=0, totalGF=0, totalGS=0;
    const list = getFilteredWLs();

    list.forEach(wl => {
      wl.matches.forEach(m => {
        totalMatches++;
        if(m.resultado==='V') totalV++; else totalD++;
        totalGF += m.golsFeitos; totalGS += m.golsSofridos;

        const mvp = getMatchMVP(m);
        if(mvp && (!positionFilter || (mvp.positions||[]).includes(positionFilter))){
          const key = normalizeName(mvp.nome);
          mvpCount[key] = (mvpCount[key]||0) + 1;
          const mvpCardKey = `${key}|${mvp.edition||''}|${normalizeName(mvp.event||'')}`;
          cardMvpCount[mvpCardKey] = (cardMvpCount[mvpCardKey]||0) + 1;
        }

        m.playerStats.forEach(p => {
          if(positionFilter && !(p.positions||[]).includes(positionFilter)) return;
          const nameKey = normalizeName(p.nome);
          if(!byPlayer[nameKey]) byPlayer[nameKey] = { nome:p.nome, partidas:0, gols:0, assistencias:0, notaSoma:0, cardKeys:new Set() };
          const pp = byPlayer[nameKey];
          pp.partidas++; pp.gols+=p.gols; pp.assistencias+=p.assistencias; pp.notaSoma+=p.nota;
          const cardKey = `${nameKey}|${p.edition||''}|${normalizeName(p.event||'')}`;
          pp.cardKeys.add(cardKey);

          if(!byCard[cardKey]) byCard[cardKey] = { nome:p.nome, edition:p.edition, event:p.event, partidas:0, gols:0, assistencias:0, notaSoma:0 };
          const pc = byCard[cardKey];
          pc.partidas++; pc.gols+=p.gols; pc.assistencias+=p.assistencias; pc.notaSoma+=p.nota;
        });
      });
    });

    return { byPlayer, byCard, mvpCount, cardMvpCount, totalMatches, totalV, totalD, totalGF, totalGS, wlCount: list.length };
  }

  /* ---------- TABELA ÚNICA (ordenável + expansível) ---------- */
  const PLAYER_COLUMNS = [
    {key:'nome', label:'Jogador', left:true},
    {key:'partidas', label:'Partidas'},
    {key:'gols', label:'Gols'},
    {key:'assistencias', label:'Assistências'},
    {key:'ga', label:'G+A'},
    {key:'mvps', label:'MVPs'},
    {key:'media', label:'Média Nota'},
    {key:null, label:'Detalhes'}
  ];
  const CARD_COLUMNS = [
    {key:'nome', label:'Jogador', left:true},
    {key:'edition', label:'Edição'},
    {key:'event', label:'Evento'},
    {key:'partidas', label:'Partidas'},
    {key:'gols', label:'Gols'},
    {key:'assistencias', label:'Assistências'},
    {key:'ga', label:'G+A'},
    {key:'media', label:'Média Nota'},
    {key:null, label:'Detalhes'}
  ];

  function renderTableHead(){
    const columns = viewMode === 'player' ? PLAYER_COLUMNS : CARD_COLUMNS;
    statsTableHead.innerHTML = `<tr>${columns.map(col => {
      if(!col.key) return `<th>${col.label}</th>`;
      const sortedClass = col.key === sortKey ? ' sorted' : '';
      const alignAttr = col.left ? ' style="text-align:left;"' : '';
      return `<th data-key="${col.key}" class="${sortedClass}"${alignAttr}>${col.label} <span class="arrow">▲▼</span></th>`;
    }).join('')}</tr>`;
    updateStatsMobileSortChips();
  }
  on(statsTableHead, 'click', (e) => {
    const th = e.target.closest('th[data-key]');
    if(!th) return;
    const key = th.dataset.key;
    if(sortKey === key){ sortDir *= -1; } else { sortKey = key; sortDir = -1; }
    renderAll();
  });

  /* ---------- CELULAR/APP: barra de ordenar (chips) ----------
     No PC a ordenação é feita clicando no cabeçalho da tabela, mas esse
     cabeçalho fica escondido no celular (lista em cards). Esses chips
     substituem o cabeçalho só no celular; no PC nem são criados. As
     opções mudam dependendo do modo (por jogador / por carta), por isso
     o conteúdo dos chips é reconstruído a cada atualização. */
  function isMobile(){
    return window.matchMedia('(max-width:760px)').matches;
  }
  function statsSortChipOptions(){
    return viewMode === 'player'
      ? [
          {key:'partidas', label:'Partidas'},
          {key:'gols', label:'Gols'},
          {key:'assistencias', label:'Assistências'},
          {key:'ga', label:'G+A'},
          {key:'media', label:'Média'},
          {key:'nome', label:'Nome'}
        ]
      : [
          {key:'partidas', label:'Partidas'},
          {key:'gols', label:'Gols'},
          {key:'assistencias', label:'Assistências'},
          {key:'ga', label:'G+A'},
          {key:'media', label:'Média'},
          {key:'edition', label:'Edição'},
          {key:'nome', label:'Nome'}
        ];
  }
  let statsMobileSortChips = null;
  if(isMobile()){
    const tableShell = statsTableHead.closest('.table-shell');
    if(tableShell){
      const bar = document.createElement('div');
      bar.className = 'mobile-sort-bar';
      bar.innerHTML = '<div class="mobile-sort-label">Ordenar por</div><div class="mobile-sort-chips" id="statsMobileSortChips"></div>';
      tableShell.parentNode.insertBefore(bar, tableShell);
      statsMobileSortChips = bar.querySelector('#statsMobileSortChips');
      statsMobileSortChips.addEventListener('click', (e) => {
        const btn = e.target.closest('.sort-chip');
        if(!btn) return;
        const key = btn.dataset.sortKey;
        if(sortKey === key){ sortDir *= -1; } else { sortKey = key; sortDir = -1; }
        renderAll();
      });
    }
  }
  function updateStatsMobileSortChips(){
    if(!statsMobileSortChips) return;
    const opts = statsSortChipOptions();
    statsMobileSortChips.innerHTML = opts.map(o => {
      const active = o.key === sortKey;
      const label = active ? `${o.label} ${sortDir === -1 ? '⬇️' : '⬆️'}` : o.label;
      return `<button type="button" class="sort-chip${active ? ' active' : ''}" data-sort-key="${o.key}">${label}</button>`;
    }).join('');
  }

  /* Uma linha de estatísticas por WL, no mesmo estilo de "pílulas"
     (Jogos/Gols/Assist/G+A) usado no resto do site — só que repetido
     para cada WL separadamente, em vez de somado. */
  function renderWLBreakdownRow(r){
    const ga = r.gols + r.assistencias;
    return `<div class="wl-breakdown-row">
      <span class="wl-breakdown-name">${escapeHtml(r.wlName)}</span>
      <div class="card-stats-readonly">
        <div class="card-stat-pill"><span class="stat-value">${r.partidas}</span><span class="stat-label">Jogos</span></div>
        <div class="card-stat-pill"><span class="stat-value">${r.gols}</span><span class="stat-label">Gols</span></div>
        <div class="card-stat-pill"><span class="stat-value">${r.assistencias}</span><span class="stat-label">Assist</span></div>
        <div class="card-stat-pill ga"><span class="stat-value">${ga}</span><span class="stat-label">G+A</span></div>
        <div class="card-stat-pill"><span class="stat-value">${r.media.toFixed(1)}</span><span class="stat-label">Média</span></div>
      </div>
    </div>`;
  }

  function buildPlayerExpandBox(id){
    const awardsHistory = computeAwardsHistory()[id];
    const awardsHtml = awardsHistory
      ? Object.keys(AWARD_META).filter(k => awardsHistory[k] > 0).map(k => `<span class="mvp-badge">${AWARD_META[k].icon} ${awardsHistory[k]}x ${AWARD_META[k].label}</span>`).join(' ')
      : '';

    const agg = aggregate();
    const cardsOfPlayer = Object.values(agg.byCard).filter(c => normalizeName(c.nome) === id);
    const cardsHtml = cardsOfPlayer.length
      ? cardsOfPlayer.map(c => {
          const swatch = getCardSwatch(c.event, c.edition);
          const cardPos = getSquadPositionsForCard(id, c.edition, c.event);
          const cardPosHtml = cardPos.length ? cardPos.map(code => `<span class="pos-badge badge-${(POSITIONS_META[code]||{}).cat||'none'}">${code}</span>`).join('') : '';
          const wlBreakdown = getCardWLBreakdown(id, c.edition, c.event);
          const wlBreakdownHtml = wlBreakdown.length
            ? `<div class="wl-breakdown">${wlBreakdown.map(r => renderWLBreakdownRow(r)).join('')}</div>`
            : '<div class="wl-breakdown"><div class="wl-breakdown-empty">Sem partidas registradas com esta carta.</div></div>';
          return `<div class="card-row-wrap">
            <div class="card-row">
              <span class="card-swatch" style="background:${swatch};"></span>
              <span class="card-readonly-text"><strong>${EDITION_LABEL_WL[c.edition]||c.edition}</strong> · ${escapeHtml(c.event||'—')}</span>
              ${cardPosHtml}
            </div>
            ${wlBreakdownHtml}
          </div>`;
        }).join('')
      : '<div style="color:var(--muted); font-size:13px;">Nenhuma carta registrada.</div>';

    return `<div class="expand-box">
      ${awardsHtml ? `<div class="expand-section">
        <div class="expand-title">🏆 Prêmios conquistados</div>
        <div class="view-badges">${awardsHtml}</div>
      </div>` : ''}
      <div class="expand-section">
        <div class="expand-title">Posições jogadas</div>
        <div class="view-badges">${renderPositionsSection(id)}</div>
      </div>
      <div class="expand-section">
        <div class="expand-title">Cartas utilizadas (${cardsOfPlayer.length})</div>
        <div class="cards-list">${cardsHtml}</div>
      </div>
    </div>`;
  }

  function buildCardExpandBox(c, nameKey){
    const cardPos = getSquadPositionsForCard(nameKey, c.edition, c.event);
    const posHtml = cardPos.length
      ? cardPos.map(code => {
          const meta = POSITIONS_META[code];
          return meta ? `<span class="pos-badge badge-${meta.cat}">${code} · ${meta.label}</span>` : '';
        }).join('')
      : '<span style="color:var(--muted); font-size:13px;">Nenhuma posição registrada no time atual.</span>';
    const wlBreakdown = getCardWLBreakdown(nameKey, c.edition, c.event);
    const wlBreakdownHtml = wlBreakdown.length
      ? `<div class="wl-breakdown">${wlBreakdown.map(r => renderWLBreakdownRow(r)).join('')}</div>`
      : '';
    return `<div class="expand-box">
      <div class="expand-section">
        <div class="expand-title">Posição atual desta carta</div>
        <div class="view-badges">${posHtml}</div>
      </div>
      ${wlBreakdownHtml ? `<div class="expand-section"><div class="expand-title">Por WL</div>${wlBreakdownHtml}</div>` : ''}
    </div>`;
  }

  function renderAll(){
    const agg = aggregate();

    renderTableHead();

    /* A tabela principal exige um mínimo fixo de STATS_MIN_MATCHES partidas
       pra aparecer (filtro aplicado abaixo, em cada modo). O filtro
       AJUSTÁVEL de mínimo de partidas (0/15/30/45...) é só do Time Ideal
       — ver renderIdealTeam. */
    let fullList, renderRow, colspan;

    if(viewMode === 'player'){
      colspan = PLAYER_COLUMNS.length;
      fullList = Object.entries(agg.byPlayer).map(([id, p]) => ({
        id, nome: p.nome, partidas: p.partidas, gols: p.gols, assistencias: p.assistencias,
        ga: p.gols + p.assistencias, media: p.notaSoma / p.partidas,
        mvps: agg.mvpCount[id] || 0
      }));
      fullList = fullList.filter(row => row.partidas >= STATS_MIN_MATCHES);
      fullList.sort((a,b) => {
        const va = sortKey === 'nome' ? a.nome.toLowerCase() : a[sortKey];
        const vb = sortKey === 'nome' ? b.nome.toLowerCase() : b[sortKey];
        if(va < vb) return -1*sortDir;
        if(va > vb) return 1*sortDir;
        return 0;
      });
      renderRow = (row) => {
        const isOpen = expandedRowIds.has(row.id);
        const mainRow = `<tr>
          <td class="nome" data-id="${row.id}">${escapeHtml(row.nome)}</td>
          <td>${row.partidas}</td><td>${row.gols}</td><td>${row.assistencias}</td>
          <td class="ga">${row.ga}</td><td>${row.mvps}</td><td>${row.media.toFixed(1)}</td>
          <td><button class="detail-btn-wl ${isOpen?'active':''}" data-id="${row.id}">${isOpen?'Fechar ▲':'Ver detalhes ▾'}</button></td>
        </tr>`;
        const expandRow = isOpen ? `<tr class="expand-row-wl"><td colspan="${colspan}">${buildPlayerExpandBox(row.id)}</td></tr>` : '';
        return mainRow + expandRow;
      };
    } else {
      colspan = CARD_COLUMNS.length;
      fullList = Object.entries(agg.byCard).map(([id, c]) => ({
        id, nome: c.nome, edition: c.edition, event: c.event, partidas: c.partidas, gols: c.gols,
        assistencias: c.assistencias, ga: c.gols + c.assistencias, media: c.notaSoma / c.partidas, _nameKey: normalizeName(c.nome)
      }));
      fullList = fullList.filter(row => row.partidas >= STATS_MIN_MATCHES);
      fullList.sort((a,b) => {
        let va = sortKey === 'nome' ? a.nome.toLowerCase() : sortKey === 'edition' ? (a.edition||'') : sortKey === 'event' ? (a.event||'') : a[sortKey];
        let vb = sortKey === 'nome' ? b.nome.toLowerCase() : sortKey === 'edition' ? (b.edition||'') : sortKey === 'event' ? (b.event||'') : b[sortKey];
        if(va < vb) return -1*sortDir;
        if(va > vb) return 1*sortDir;
        return 0;
      });
      renderRow = (row) => {
        const isOpen = expandedRowIds.has(row.id);
        const swatch = getCardSwatch(row.event, row.edition);
        const mainRow = `<tr>
          <td class="nome"><span class="card-swatch" style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:8px;background:${swatch};"></span>${escapeHtml(row.nome)}</td>
          <td>${EDITION_LABEL_WL[row.edition]||row.edition||'—'}</td>
          <td>${escapeHtml(row.event||'—')}</td>
          <td>${row.partidas}</td><td>${row.gols}</td><td>${row.assistencias}</td>
          <td class="ga">${row.ga}</td><td>${row.media.toFixed(1)}</td>
          <td><button class="detail-btn-wl ${isOpen?'active':''}" data-id="${row.id}">${isOpen?'Fechar ▲':'Ver detalhes ▾'}</button></td>
        </tr>`;
        const expandRow = isOpen ? `<tr class="expand-row-wl"><td colspan="${colspan}">${buildCardExpandBox(row, row._nameKey)}</td></tr>` : '';
        return mainRow + expandRow;
      };
    }

    if(fullList.length === 0){
      statsTbody.innerHTML = `<tr class="empty-row"><td colspan="${colspan}">Nenhum dado registrado com esses filtros.</td></tr>`;
      loadMoreStatsWrap.style.display = 'none';
    } else {
      const list = fullList.slice(0, visibleCount);
      statsTbody.innerHTML = list.map(renderRow).join('');
      if(fullList.length > visibleCount){
        loadMoreStatsWrap.style.display = 'flex';
        loadMoreStatsBtn.textContent = `Ler mais (+${fullList.length - visibleCount})`;
      } else {
        loadMoreStatsWrap.style.display = 'none';
      }
    }

    renderCompareSelect();
    renderIdealTeam();
    renderCompareChart();
    renderRankings();
  }

  on(statsTbody, 'click', (e) => {
    const nomeCell = e.target.closest('td.nome');
    const btn = e.target.closest('.detail-btn-wl');
    const id = (nomeCell && nomeCell.dataset.id) || (btn && btn.dataset.id);
    if(!id) return;
    if(expandedRowIds.has(id)) expandedRowIds.delete(id); else expandedRowIds.add(id);
    renderAll();
  });

  on(loadMoreStatsBtn, 'click', () => {
    visibleCount += PAGE_SIZE;
    renderAll();
  });

  /* ---------- TIME IDEAL (visual de campo) ---------- */
  const idealTooltipEl = document.createElement('div');
  idealTooltipEl.className = 'team-tooltip';
  document.body.appendChild(idealTooltipEl);
  function showIdealTooltip(html, x, y){
    idealTooltipEl.innerHTML = html;
    idealTooltipEl.style.display = 'block';
    idealTooltipEl.style.left = (x + 16) + 'px';
    idealTooltipEl.style.top = (y + 16) + 'px';
  }
  function hideIdealTooltip(){ idealTooltipEl.style.display = 'none'; }

  function buildPositionStats(){
    const map = {};
    const fallbackCache = {};
    function getFallbackPositions(nameKey){
      if(fallbackCache[nameKey]) return fallbackCache[nameKey];
      const set = new Set();
      getIdealWLs().forEach(wl => wl.squad.forEach(sq => {
        if(normalizeName(sq.nome) === nameKey && sq.positions && sq.positions.length) sq.positions.forEach(p => set.add(p));
      }));
      const arr = Array.from(set);
      fallbackCache[nameKey] = arr;
      return arr;
    }
    getIdealWLs().forEach(wl => wl.matches.forEach(m => m.playerStats.forEach(p => {
      const nameKey = normalizeName(p.nome);
      let positions = (p.positions && p.positions.length) ? p.positions : getFallbackPositions(nameKey);
      if(!positions.length) positions = ['?'];
      positions.forEach(pos => {
        const key = nameKey + '|' + pos;
        if(!map[key]) map[key] = { nome: p.nome, pos, partidas:0, gols:0, assistencias:0, notaSoma:0, cardTally:{} };
        const o = map[key];
        o.partidas++; o.gols += p.gols; o.assistencias += p.assistencias; o.notaSoma += p.nota;
        const cardKey = (p.edition||'') + '|' + (p.event||'');
        o.cardTally[cardKey] = (o.cardTally[cardKey]||0) + 1;
      });
    })));
    return Object.values(map).map(o => {
      let bestKey = null, bestCount = -1;
      Object.entries(o.cardTally).forEach(([k,c]) => { if(c > bestCount){ bestCount = c; bestKey = k; } });
      const [edition, event] = bestKey ? bestKey.split('|') : ['',''];
      return { ...o, media: o.notaSoma/o.partidas, ga: o.gols+o.assistencias, edition, event };
    });
  }

  function renderIdealTeam(){
    const formationKey = idealFormation.value;
    const criterio = idealCriterio.value;
    const minMatches = Number(idealMinMatches ? idealMinMatches.value : 0) || 0;
    const slots = FORMATIONS[formationKey];
    const coords = FORMATION_COORDS[formationKey];
    /* Filtro de "mínimo de partidas": só entra como candidato a uma vaga
       do Time Ideal quem tiver pelo menos esse número de partidas NAQUELA
       posição. Não afeta a tabela principal de estatísticas. */
    const posStats = buildPositionStats().filter(o => o.pos !== '?' && o.partidas >= minMatches);

    const metricKey = criterio === 'media' ? 'media' : criterio === 'gols' ? 'gols' : criterio === 'assist' ? 'assistencias' : 'ga';
    const used = new Set();

    const result = slots.map(slot => {
      const candidates = posStats.filter(o => o.pos === slot.code && !used.has(normalizeName(o.nome))).sort((a,b) => b[metricKey]-a[metricKey]);
      const chosen = candidates[0] || null;
      if(chosen) used.add(normalizeName(chosen.nome));
      return { slot, chosen };
    });

    idealTeamResult.innerHTML = `<div class="pitch-wrap" id="idealPitch"></div>`;
    const pitch = document.getElementById('idealPitch');

    pitch.innerHTML = result.map(({slot, chosen}, idx) => {
      const coord = coords[idx];
      if(!chosen){
        return `<div class="player-chip empty" style="top:${coord.top}%; left:${coord.left}%;">${slot.code}<span class="chip-stat">vago</span></div>`;
      }
      const bg = getCardSwatch(chosen.event, chosen.edition);
      return `<div class="player-chip" data-idx="${idx}" style="top:${coord.top}%; left:${coord.left}%; background:${bg};">${escapeHtml(chosen.nome)}<span class="chip-stat">${slot.code}</span></div>`;
    }).join('');

    pitch.querySelectorAll('.player-chip').forEach((chip, idx) => {
      const chosen = result[idx] && result[idx].chosen;
      if(!chosen) return;
      chip.addEventListener('mouseover', (e) => {
        const html = `<strong>${escapeHtml(chosen.nome)}</strong>
          <div class="tt-row"><span><span class="tt-swatch" style="background:${getCardSwatch(chosen.event, chosen.edition)};"></span>${EDITION_LABEL_WL[chosen.edition]||'—'}</span><span></span></div>
          <div class="tt-row"><span>Evento</span><span>${escapeHtml(chosen.event||'—')}</span></div>
          <div class="tt-row"><span>Partidas</span><span>${chosen.partidas}</span></div>
          <div class="tt-row"><span>Gols</span><span>${chosen.gols}</span></div>
          <div class="tt-row"><span>Assistências</span><span>${chosen.assistencias}</span></div>
          <div class="tt-row"><span>Média</span><span>${chosen.media.toFixed(1)}</span></div>`;
        showIdealTooltip(html, e.clientX, e.clientY);
      });
      chip.addEventListener('mousemove', (e) => {
        idealTooltipEl.style.left = (e.clientX + 16) + 'px';
        idealTooltipEl.style.top = (e.clientY + 16) + 'px';
      });
      chip.addEventListener('mouseout', hideIdealTooltip);
    });
  }
  on(idealEdition, 'change', renderIdealTeam);
  on(idealFormation, 'change', renderIdealTeam);
  on(idealCriterio, 'change', renderIdealTeam);
  on(idealMinMatches, 'change', renderIdealTeam);

  /* ---------- COMPARAÇÃO ---------- */
  function renderCompareSelect(){
    const agg = aggregate();
    const arr = Object.values(agg.byPlayer).sort((a,b) => a.nome.localeCompare(b.nome));
    compareSelect.innerHTML = arr.length
      ? arr.map(p => `<option value="${normalizeName(p.nome)}">${escapeHtml(p.nome)}</option>`).join('')
      : '<option value="">Nenhum jogador encontrado</option>';
  }

  on(compareAddBtn, 'click', () => {
    const id = compareSelect.value;
    if(!id || compareIds.includes(id)) return;
    if(compareIds.length >= 5){ alert('Você já selecionou 5 jogadores. Remova um antes de adicionar outro.'); return; }
    compareIds.push(id);
    renderCompareChips();
    renderCompareChart();
  });
  on(compareClearBtn, 'click', () => { compareIds = []; renderCompareChips(); renderCompareChart(); });

  const compareColors = ['#d4af37', '#8fd0ff', '#e0555f', '#7ed957', '#c792ea'];

  function renderCompareChips(){
    const agg = aggregate();
    compareChips.innerHTML = compareIds.map((id,i) => {
      const p = agg.byPlayer[id];
      return `<span class="squad-chip" style="border-color:${compareColors[i]}; color:${compareColors[i]};">${p ? escapeHtml(p.nome) : id}<button data-id="${id}">&times;</button></span>`;
    }).join('');
  }
  on(compareChips, 'click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    compareIds = compareIds.filter(id => id !== btn.dataset.id);
    renderCompareChips();
    renderCompareChart();
  });

  function renderCompareChart(){
    const agg = aggregate();
    const labels = ['Partidas','Gols','Assistências','G+A','Média Nota x10'];
    const datasets = compareIds.map((id,i) => {
      const p = agg.byPlayer[id];
      const media = p ? p.notaSoma/p.partidas : 0;
      return {
        label: p ? p.nome : id,
        data: p ? [p.partidas, p.gols, p.assistencias, p.gols+p.assistencias, Math.round(media*10)] : [0,0,0,0,0],
        backgroundColor: compareColors[i],
        borderRadius: 6
      };
    });

    const ctx = document.getElementById('compareChart').getContext('2d');
    if(compareChartInstance) compareChartInstance.destroy();
    compareChartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: compareIds.length > 0, labels: { color: '#f5ede0', font: { family: 'Inter' } } },
          tooltip: { backgroundColor: '#2a0808', titleColor: '#f7e6a8', bodyColor: '#f5ede0', borderColor: '#d4af37', borderWidth: 1 }
        },
        scales: {
          x: { ticks: { color: '#c9a98a', font: { family: 'JetBrains Mono' } }, grid: { color: 'rgba(212,175,55,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#c9a98a', font: { family: 'JetBrains Mono' } }, grid: { color: 'rgba(212,175,55,0.1)' } }
        }
      }
    });
  }

  /* ---------- RANKINGS (por carta) ---------- */
  const RANK_MIN_MATCHES = STATS_MIN_MATCHES;

  function renderRankRow(c, i, statValue, media){
    const ed = c.edition ? (EDITION_LABEL_WL[c.edition] || c.edition) : 'Não informado';
    const ev = c.event ? escapeHtml(c.event) : 'Não informado';
    const swatch = getCardSwatch(c.event, c.edition);
    const mediaCell = media === null ? '' : `<td>${media.toFixed(2)}</td>`;
    return `<tr>
      <td>${i+1}</td>
      <td class="rank-nome"><span class="card-swatch" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:6px; background:${swatch};"></span>${escapeHtml(c.nome)} <span style="color:var(--muted); font-size:11px;">(${ed} · ${ev})</span></td>
      <td>${c.partidas}</td>
      <td>${statValue}</td>
      ${mediaCell}
    </tr>`;
  }

  function renderRankRowPlayer(p, i, statValue, media){
    const mediaCell = media === null ? '' : `<td>${media.toFixed(2)}</td>`;
    return `<tr>
      <td>${i+1}</td>
      <td class="rank-nome">${escapeHtml(p.nome)}</td>
      <td>${p.partidas}</td>
      <td>${statValue}</td>
      ${mediaCell}
    </tr>`;
  }

  function updateRankHeaders(){
    const label = viewMode === 'player' ? 'Jogador' : 'Jogador · Carta';
    document.querySelectorAll('.rank-table thead th.rank-nome').forEach(th => { th.textContent = label; });
  }

  function renderRankings(){
    const posFilter = rankPosition ? rankPosition.value : '';
    const agg = aggregate(posFilter);
    updateRankHeaders();

    const isPlayerMode = viewMode === 'player';
    const items = isPlayerMode
      ? Object.entries(agg.byPlayer).map(([id, p]) => ({ id, ...p })).filter(p => p.partidas >= RANK_MIN_MATCHES)
      : Object.values(agg.byCard).filter(c => c.partidas >= RANK_MIN_MATCHES);

    function buildList(statFn){
      return items.map(c => ({ c, stat: statFn(c) })).sort((a,b) => b.stat - a.stat);
    }
    function applyTopN(list, select){
      if(!select || select.value === 'all') return list;
      return list.slice(0, Number(select.value));
    }
    function renderRow(x, i, statValue, media){
      return isPlayerMode ? renderRankRowPlayer(x.c, i, statValue, media) : renderRankRow(x.c, i, statValue, media);
    }
    function paint(tbody, list, getStatValue, getMedia, emptyColspan){
      tbody.innerHTML = list.length
        ? list.map((x,i) => renderRow(x, i, getStatValue(x), getMedia ? getMedia(x) : null)).join('')
        : `<tr><td colspan="${emptyColspan}">Sem dados suficientes (mínimo de 5 partidas).</td></tr>`;
    }

    if(rankGolsBody){
      let byGols = applyTopN(buildList(c => c.gols), rankGolsTopN);
      paint(rankGolsBody, byGols, x => x.c.gols, x => x.c.gols / x.c.partidas, 5);
    }
    if(rankAssistBody){
      let byAssist = applyTopN(buildList(c => c.assistencias), rankAssistTopN);
      paint(rankAssistBody, byAssist, x => x.c.assistencias, x => x.c.assistencias / x.c.partidas, 5);
    }
    if(rankGABody){
      let byGA = applyTopN(buildList(c => c.gols + c.assistencias), rankGATopN);
      paint(rankGABody, byGA, x => x.c.gols + x.c.assistencias, x => (x.c.gols + x.c.assistencias) / x.c.partidas, 5);
    }
    if(rankMediaBody){
      let byMedia = applyTopN(buildList(c => c.notaSoma / c.partidas), rankMediaTopN);
      rankMediaBody.innerHTML = byMedia.length
        ? byMedia.map((x,i) => {
            const c = x.c;
            const media = (c.notaSoma/c.partidas).toFixed(2);
            if(isPlayerMode){
              return `<tr>
                <td>${i+1}</td>
                <td class="rank-nome">${escapeHtml(c.nome)}</td>
                <td>${c.partidas}</td>
                <td>${media}</td>
              </tr>`;
            }
            const ed = c.edition ? (EDITION_LABEL_WL[c.edition] || c.edition) : 'Não informado';
            const ev = c.event ? escapeHtml(c.event) : 'Não informado';
            const swatch = getCardSwatch(c.event, c.edition);
            return `<tr>
              <td>${i+1}</td>
              <td class="rank-nome"><span class="card-swatch" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:6px; background:${swatch};"></span>${escapeHtml(c.nome)} <span style="color:var(--muted); font-size:11px;">(${ed} · ${ev})</span></td>
              <td>${c.partidas}</td>
              <td>${media}</td>
            </tr>`;
          }).join('')
        : '<tr><td colspan="4">Sem dados suficientes (mínimo de 5 partidas).</td></tr>';
    }
    if(rankMVPBody){
      const itemsWithMvp = items.map(c => {
        const key = isPlayerMode
          ? normalizeName(c.nome)
          : `${normalizeName(c.nome)}|${c.edition||''}|${normalizeName(c.event||'')}`;
        const mvps = isPlayerMode ? (agg.mvpCount[key] || 0) : (agg.cardMvpCount[key] || 0);
        return { c, mvps };
      }).filter(x => x.mvps > 0).sort((a,b) => b.mvps - a.mvps);
      const byMVP = applyTopN(itemsWithMvp, rankMVPTopN);
      rankMVPBody.innerHTML = byMVP.length
        ? byMVP.map((x,i) => renderRow(x, i, x.mvps, x.mvps / x.c.partidas)).join('')
        : '<tr><td colspan="5">Nenhum MVP registrado ainda com esses filtros.</td></tr>';
    }
  }

  on(rankGolsTopN, 'change', renderRankings);
  on(rankAssistTopN, 'change', renderRankings);
  on(rankGATopN, 'change', renderRankings);
  on(rankMediaTopN, 'change', renderRankings);
  on(rankMVPTopN, 'change', renderRankings);
  on(rankPosition, 'change', renderRankings);

  loadAll();
  renderAll();
  syncFromCloudOnLoad();
})();
