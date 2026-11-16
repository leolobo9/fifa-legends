(function(){
  const STORAGE_KEY = 'fifa_wl_all';
  let wls = [];
  let currentWLId = null;
  let expandedMatchIds = new Set();
  let matchExtraIds = [];
  let editingMatchId = null;
  let avulsosExpanded = false;

  const EDITION_LABEL_WL = { fifa22:'FIFA 22', fifa23:'FIFA 23', fc26:'EA FC 26', fc27:'EA FC 27' };

  const EVENTS_BY_EDITION_WL = {
    fifa22: ['Gold','Silver','Bronze','Icon (Baby)','Icon (Mid)','Icon (Prime)','Prime Icon Moments','TOTY Honourable Mentions','TOTS Honourable Mentions','Player of the Month (Top 5 Leagues)','FUT Birthday','Man of the Match','End of an Era','Champions League Group Stage Team','Moments','Ones to Watch','TOTW','FUT Heroes','Showdown','Showdown Series','Winter Wildcards','TOTY','Future Stars','Headliners','TOTS','FUTTIES','Road to the Final','Ultimate Scream','Black Friday','Centurions','Flashback','RTTF','Pre-Season','Silver Stars','Shapeshifters','Shapeshifters Heroes','RTTK','Versus Fire/Ice','Fantasy FUT','Fantasy FUT Hero','FUTTIES Hero','FUT Captains','FUT Captains Hero','TOTY Hero'],
    fifa23: ['Gold','Silver','Bronze','Icon (Baby)','Icon (Mid)','Icon (Prime)','Prime Icon Moments','TOTY Honourable Mentions','TOTS Honourable Mentions','Player of the Month (Top 5 Leagues)','FUT Birthday','Man of the Match','End of an Era','Champions League Group Stage Team','Moments','Ones to Watch','TOTY','TOTS','World Cup','World Cup Path to Glory','Centurions','Marquee Matchups','Future Stars','Ultimate Scream','Black Friday','RTTF','FUT Ballers','Winter Wildcards','Shapeshifters','Ultimate TOTS','Heroes','Icons','Flashback','Path to Glory','FUTTIES','TOTW','World Cup Hero','FUTTIES Hero','Icon World Cup','Icon FUT Birthday','Icon Shapeshifters','Icon TOTY','Icon End of an Era','Out of Position','Trophy Titans','Icon Trophy Titans','Fantasy FUT','Fantasy FUT Hero','TOTY Hero'],
    fc26: ['Gold','Silver','Bronze','TOTY Honourable Mentions','TOTS Honourable Mentions','Player of the Month (Top 5 Leagues)','FUT Birthday','Man of the Match','End of an Era','Champions League Group Stage Team','Moments','Ones to Watch','TOTW','TOTY','TOTY Icon Swaps','Knockout Royalty','Fantasy FC','Fantasy FUT Hero','Thunderstruck','UT Birthday','Trophy Titans','Road to the Finals','Road to the Knockouts','TOTS','Time Warp','Royalty Knockout','Pro Live','Black Friday','Joga Bonito','Unbreakables','Winter Wildcards','Winter Wildcards Hero','Future Stars','Icon Future Stars','Grassroots Greats','Icon Grassroots Greats','World Cup Path to Glory','World Cup Phenoms','Summer Stars','Glory Hunters','Greats of the Game','Icon Greats of the Game','Festival of Football Captains','World Tour Silver Star Icon','Icon Festival of Football','Icon FUT Birthday','Icon Thunderstruck','Icon TOTY','Icon Winter Wildcards','FUT Birthday Hero','Ratings Reload','TOTY Hero','Squad Foundations','World Tour','Ultimate Scream','Ultimate Scream Hero','Icons','Champions League Icon','FC Champions Icon','Flashback','Festival of Football Prodigies','Heroes','FUTTIES','FUTTIES Hero','Showdown','FC Pro Open','Nike Pro','Icon FUTTIES','Festival of Football Summer Stars','Festival of Football Journey of Nations'],
    fc27: ['Gold','Silver','Bronze','Icon (Baby)','Icon (Mid)','Icon (Prime)','Prime Icon Moments','TOTY Honourable Mentions','TOTS Honourable Mentions','Player of the Month (Top 5 Leagues)','FUT Birthday','Man of the Match','End of an Era','Champions League Group Stage Team','Moments','Ones to Watch','TOTW','FUT Heroes','Showdown','Showdown Series','Winter Wildcards','TOTY','Future Stars','Headliners','TOTS','FUTTIES','Road to the Final','Ultimate Scream','Black Friday','Centurions','Flashback','RTTF','Pre-Season','Silver Stars','Shapeshifters','Shapeshifters Heroes','RTTK','Versus Fire/Ice','Fantasy FUT','Fantasy FUT Hero','FUTTIES Hero','FUT Captains','FUT Captains Hero','TOTY Hero','World Cup','World Cup Path to Glory','Marquee Matchups','FUT Ballers','Ultimate TOTS','Heroes','Icons','Path to Glory','World Cup Hero','Icon World Cup','Icon FUT Birthday','Icon Shapeshifters','Icon TOTY','Icon End of an Era','Out of Position','Trophy Titans','Icon Trophy Titans','TOTY Icon Swaps','Knockout Royalty','Fantasy FC','Thunderstruck','UT Birthday','Road to the Finals','Road to the Knockouts','Time Warp','Royalty Knockout','Pro Live','Joga Bonito','Unbreakables','Winter Wildcards Hero','Icon Future Stars','Grassroots Greats','Icon Grassroots Greats','World Cup Phenoms','Summer Stars','Glory Hunters','Greats of the Game','Icon Greats of the Game','Festival of Football Captains','World Tour Silver Star Icon','Icon Festival of Football','Icon Thunderstruck','Icon Winter Wildcards','FUT Birthday Hero','Ratings Reload','Squad Foundations','World Tour','Ultimate Scream Hero','Champions League Icon','FC Champions Icon','Festival of Football Prodigies','FC Pro Open']
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

  const CATEGORY_OF = {ATA:'ata', PE:'ata', PD:'ata', VOL:'mei', MC:'mei', MCA:'mei', ZAG:'def', LD:'def', LE:'def', GOL:'gol'};

  const POSITIONS_META = {
    GOL:{label:'Goleiro',cat:'def'}, ZAG:{label:'Zagueiro',cat:'def'}, LE:{label:'Lateral Esquerdo',cat:'def'}, LD:{label:'Lateral Direito',cat:'def'},
    VOL:{label:'Volante',cat:'mei'}, MC:{label:'Meio Central',cat:'mei'}, MCA:{label:'Meio Avançado',cat:'mei'},
    ATA:{label:'Atacante',cat:'ata'}, PE:{label:'Ponta Esquerda',cat:'ata'}, PD:{label:'Ponta Direita',cat:'ata'}
  };

  const wlSelect = document.getElementById('wlSelect');
  const newWLBtn = document.getElementById('newWLBtn');
  const deleteWLBtn = document.getElementById('deleteWLBtn');
  const wlContent = document.getElementById('wlContent');
  const exportWLBtn = document.getElementById('exportWLBtn');
  const importWLBtn = document.getElementById('importWLBtn');
  const importWLFile = document.getElementById('importWLFile');

  const squadBuildEdition = document.getElementById('squadBuildEdition');
  const squadBuildFormation = document.getElementById('squadBuildFormation');
  const buildFormationBtn = document.getElementById('buildFormationBtn');
  const formationRows = document.getElementById('formationRows');
  const saveSquadBtn = document.getElementById('saveSquadBtn');
  const squadErrorMsg = document.getElementById('squadErrorMsg');
  const clearSquadBtn = document.getElementById('clearSquadBtn');

  const squadForm = document.getElementById('squadForm');
  const squadChips = document.getElementById('squadChips');

  const matchForm = document.getElementById('matchForm');
  const squadStatsTable = document.getElementById('squadStatsTable');
  const matchErrorMsg = document.getElementById('matchErrorMsg');
  const progressText = document.getElementById('progressText');
  const matchesTbody = document.getElementById('matchesTbody');
  const summaryGrid = document.getElementById('summaryGrid');
  const wlAwardsGrid = document.getElementById('wlAwardsGrid');
  const statsTableHead = document.getElementById('statsTableHead');
  const statsTbody = document.getElementById('statsTbody');

  let statsSortKey = 'partidas', statsSortDir = -1;
  let expandedStatsIds = new Set();

  const STATS_COLUMNS = [
    {key:'nome', label:'Jogador', left:true},
    {key:'partidas', label:'Partidas'},
    {key:'gols', label:'Gols'},
    {key:'assistencias', label:'Assistências'},
    {key:'ga', label:'G+A'},
    {key:'mvps', label:'MVPs'},
    {key:'media', label:'Média Nota'},
    {key:null, label:'Detalhes'}
  ];

  const AWARD_META = {
    artilheiro: {icon:'⚽', label:'Artilheiro'},
    assistente: {icon:'🎯', label:'Assistente'},
    motor: {icon:'🔥', label:'Motor (G+A)'},
    melhor: {icon:'⭐', label:'Melhor da WL'},
    decisivo: {icon:'🏅', label:'Mais Decisivo'}
  };

  function nextId(prefix){ return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); }
  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function normalizeName(str){
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
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

  /* ---------- CORES DE CARTA (sincronizadas com a página principal) ---------- */
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

  function cloneSquadForNewWL(squad){
    return squad.map(p => ({
      id: nextId('sq'), nome: p.nome, edition: p.edition, event: p.event,
      positions: (p.positions || []).slice()
    }));
  }

  function smartAssignSlots(slots, squad){
    const pool = squad.map(p => ({
      player: p,
      code: (p.positions && p.positions[0]) || null,
      cat: (p.positions && p.positions[0]) ? CATEGORY_OF[p.positions[0]] : null
    }));
    const used = new Set();
    const assignment = new Array(slots.length).fill(null);

    slots.forEach((slot, idx) => {
      const found = pool.find(item => !used.has(item.player.id) && item.code === slot.code);
      if(found){ assignment[idx] = found.player; used.add(found.player.id); }
    });
    slots.forEach((slot, idx) => {
      if(assignment[idx]) return;
      const slotCat = CATEGORY_OF[slot.code];
      const found = pool.find(item => !used.has(item.player.id) && item.cat === slotCat);
      if(found){ assignment[idx] = found.player; used.add(found.player.id); }
    });
    slots.forEach((slot, idx) => {
      if(assignment[idx]) return;
      if(slot.code === 'GOL') return;
      const found = pool.find(item => !used.has(item.player.id));
      if(found){ assignment[idx] = found.player; used.add(found.player.id); }
    });
    return assignment;
  }

  function loadAll(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      wls = raw ? JSON.parse(raw) : [];
    } catch(e){
      console.error('Erro ao carregar', e);
      wls = [];
    }
    wls.forEach(w => { if(!w.edition) w.edition = 'fifa23'; });
    if(wls.length > 0) currentWLId = wls[0].id;
    renderWLSelect();
    renderCurrentWL();
    renderNameSuggestions();
    persistLocalWL();
    syncFromCloudOnLoad();
  }

  function persistLocalWL(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(wls)); } catch(e){}
  }

  function saveAll(){
    try{
      persistLocalWL();
      setLocalTsWL(Date.now());
      pushToCloudWL();
    }
    catch(e){ console.error('Erro ao salvar', e); }
    renderNameSuggestions();
  }

  /* ---------- SINCRONIZAÇÃO COM A NUVEM (Firebase) ---------- */
  const TS_KEY_WL = STORAGE_KEY + '__ts';
  function getLocalTsWL(){ return Number(localStorage.getItem(TS_KEY_WL) || 0); }
  function setLocalTsWL(ts){ try{ localStorage.setItem(TS_KEY_WL, String(ts)); } catch(e){} }

  function whenFifaSyncReadyWL(cb){
    if(window.FifaSync){ cb(window.FifaSync); return; }
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if(window.FifaSync){ clearInterval(t); cb(window.FifaSync); }
      else if(tries > 100){ clearInterval(t); }
    }, 100);
  }

  function pushToCloudWL(){
    whenFifaSyncReadyWL((FifaSync) => {
      FifaSync.save(FifaSync.KEYS.WL, wls, getLocalTsWL());
    });
  }

  function applyCloudWL(data, ts){
    wls = data || [];
    wls.forEach(w => { if(!w.edition) w.edition = 'fifa23'; });
    persistLocalWL();
    setLocalTsWL(ts);
    if(wls.length > 0 && !wls.find(w => w.id === currentWLId)) currentWLId = wls[0].id;
    renderWLSelect();
    renderCurrentWL();
    renderNameSuggestions();
  }

  function syncFromCloudOnLoad(){
    whenFifaSyncReadyWL(async (FifaSync) => {
      const cloud = await FifaSync.load(FifaSync.KEYS.WL);
      let localTs = getLocalTsWL();
      if(cloud && cloud.updatedAt > localTs){
        applyCloudWL(cloud.data, cloud.updatedAt);
      } else {
        if(localTs === 0){ localTs = Date.now(); setLocalTsWL(localTs); }
        pushToCloudWL();
      }
      FifaSync.watch(FifaSync.KEYS.WL, (data, ts) => {
        if(ts > getLocalTsWL()){
          applyCloudWL(data, ts);
        }
      });
    });
  }

  /* ---------- SUGESTÕES DE NOME (autocomplete) ---------- */
  function getAllKnownPlayerNames(){
    const seen = new Map(); // nameKey normalizado -> nome como foi digitado

    /* Jogadores já cadastrados na página principal (Jogadores) */
    try{
      const raw = localStorage.getItem('fifa_legends_players');
      const mainPlayers = raw ? JSON.parse(raw) : [];
      (mainPlayers||[]).forEach(p => { const k = normalizeName(p.nome||''); if(p.nome && !seen.has(k)) seen.set(k, p.nome); });
    } catch(e){}

    /* Jogadores já usados em alguma WL anterior */
    wls.forEach(wl => {
      (wl.squad||[]).forEach(p => { const k = normalizeName(p.nome); if(p.nome && !seen.has(k)) seen.set(k, p.nome); });
      (wl.matches||[]).forEach(m => (m.playerStats||[]).forEach(p => { const k = normalizeName(p.nome); if(p.nome && !seen.has(k)) seen.set(k, p.nome); }));
    });
    return Array.from(seen.values()).sort((a,b) => a.localeCompare(b, 'pt-BR'));
  }

  function renderNameSuggestions(){
    const list = document.getElementById('allPlayerNamesList');
    if(list) list.innerHTML = getAllKnownPlayerNames().map(n => `<option value="${escapeHtml(n)}"></option>`).join('');
  }

  /* ---------- DROPDOWN PRÓPRIO DE SUGESTÕES ----------
     O <datalist> nativo não abre de forma confiável no app instalado (PWA) no
     celular, então aqui a gente desenha a própria lista por baixo do campo. */
  function setupNameAutocomplete(){
    const dropdown = document.createElement('div');
    dropdown.className = 'name-ac-dropdown';
    dropdown.style.display = 'none';
    document.body.appendChild(dropdown);
    let activeInput = null;

    function hideDropdown(){
      dropdown.style.display = 'none';
      activeInput = null;
    }

    function positionDropdown(input){
      const rect = input.getBoundingClientRect();
      dropdown.style.left = Math.max(8, rect.left) + 'px';
      dropdown.style.top = (rect.bottom + 4) + 'px';
      dropdown.style.width = rect.width + 'px';
    }

    function showSuggestionsFor(input){
      const q = normalizeName(input.value || '');
      const names = getAllKnownPlayerNames();
      const matches = (q ? names.filter(n => normalizeName(n).includes(q)) : names).slice(0, 8);
      if(!matches.length){ hideDropdown(); return; }
      activeInput = input;
      dropdown.innerHTML = matches.map(n => `<div class="name-ac-item">${escapeHtml(n)}</div>`).join('');
      positionDropdown(input);
      dropdown.style.display = 'block';
    }

    dropdown.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.name-ac-item');
      if(!item || !activeInput) return;
      e.preventDefault();
      const input = activeInput;
      input.value = item.textContent;
      input.dispatchEvent(new Event('input', { bubbles:true }));
      input.dispatchEvent(new Event('change', { bubbles:true }));
      hideDropdown();
    });

    document.addEventListener('focusin', (e) => {
      if(e.target.matches && e.target.matches('.name-ac-input')) showSuggestionsFor(e.target);
    });
    document.addEventListener('input', (e) => {
      if(e.target.matches && e.target.matches('.name-ac-input')) showSuggestionsFor(e.target);
    });
    document.addEventListener('click', (e) => {
      if(activeInput && e.target !== activeInput && !dropdown.contains(e.target)) hideDropdown();
    });
    window.addEventListener('resize', hideDropdown);
    window.addEventListener('scroll', () => { if(activeInput) positionDropdown(activeInput); }, true);
  }

  function getCurrentWL(){
    return wls.find(w => w.id === currentWLId) || null;
  }

  function renderWLSelect(){
    wlSelect.innerHTML = wls.length
      ? wls.map(w => `<option value="${w.id}" ${w.id === currentWLId ? 'selected' : ''}>${escapeHtml(w.name)} (${w.matches.length}/15) · ${EDITION_LABEL_WL[w.edition] || w.edition}</option>`).join('')
      : '<option value="">Nenhuma WL criada ainda</option>';
  }

  wlSelect.addEventListener('change', () => {
    currentWLId = wlSelect.value;
    matchExtraIds = [];
    renderCurrentWL();
  });

  const newWLModalOverlay = document.getElementById('newWLModalOverlay');
  const newWLName = document.getElementById('newWLName');
  const newWLEdition = document.getElementById('newWLEdition');
  const newWLConfirmBtn = document.getElementById('newWLConfirmBtn');
  const newWLCancelBtn = document.getElementById('newWLCancelBtn');

  newWLBtn.addEventListener('click', () => {
    newWLName.value = '';
    newWLEdition.value = wls.length ? wls[0].edition : 'fifa23';
    newWLModalOverlay.style.display = 'flex';
    newWLName.focus();
  });
  newWLCancelBtn.addEventListener('click', () => { newWLModalOverlay.style.display = 'none'; });

  newWLConfirmBtn.addEventListener('click', () => {
    const name = newWLName.value.trim();
    if(!name){ alert('Informe um nome para a WL.'); return; }
    const edition = newWLEdition.value;
    const previousWL = wls[0] || null;
    const mesmaEdicao = previousWL && previousWL.edition === edition;
    const inheritedSquad = mesmaEdicao ? cloneSquadForNewWL(previousWL.squad) : [];

    const newWL = {
      id: nextId('wl'), name, createdAt: Date.now(),
      squad: inheritedSquad, matches: [],
      edition,
      lastEdition: mesmaEdicao ? previousWL.lastEdition : '',
      lastFormationKey: mesmaEdicao ? previousWL.lastFormationKey : ''
    };
    wls.unshift(newWL);
    currentWLId = newWL.id;
    matchExtraIds = [];
    newWLModalOverlay.style.display = 'none';
    renderWLSelect();
    renderCurrentWL();
    saveAll();
  });
  newWLName.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ e.preventDefault(); newWLConfirmBtn.click(); } });

  /* ---------- RENOMEAR WL ---------- */
  const renameWLBtn = document.getElementById('renameWLBtn');
  const renameWLModalOverlay = document.getElementById('renameWLModalOverlay');
  const renameWLInput = document.getElementById('renameWLInput');
  const renameWLConfirmBtn = document.getElementById('renameWLConfirmBtn');
  const renameWLCancelBtn = document.getElementById('renameWLCancelBtn');

  renameWLBtn.addEventListener('click', () => {
    const wl = getCurrentWL();
    if(!wl){ alert('Selecione uma WL primeiro.'); return; }
    renameWLInput.value = wl.name;
    renameWLModalOverlay.style.display = 'flex';
    renameWLInput.focus();
    renameWLInput.select();
  });
  renameWLCancelBtn.addEventListener('click', () => { renameWLModalOverlay.style.display = 'none'; });
  renameWLConfirmBtn.addEventListener('click', () => {
    const wl = getCurrentWL();
    if(!wl) return;
    const newName = renameWLInput.value.trim();
    if(!newName){ alert('Informe um nome para a WL.'); return; }
    wl.name = newName;
    renameWLModalOverlay.style.display = 'none';
    renderWLSelect();
    saveAll();
  });
  renameWLInput.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ e.preventDefault(); renameWLConfirmBtn.click(); } });

  /* ---------- BACKUP (exportar/importar arquivo .json com todas as WLs) ---------- */
  exportWLBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(wls, null, 2);
    const blob = new Blob([dataStr], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dataAtual = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `wl_backup_${dataAtual}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  importWLBtn.addEventListener('click', () => {
    importWLFile.value = '';
    importWLFile.click();
  });

  importWLFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    try{
      const text = await file.text();
      const importados = JSON.parse(text);
      if(!Array.isArray(importados)){ alert('Arquivo inválido: esperava um backup de WLs.'); return; }
      if(!confirm(`Isso vai SUBSTITUIR as ${wls.length} WL(s) atuais por ${importados.length} WL(s) do arquivo. Quer continuar?`)) return;
      wls = importados;
      currentWLId = wls.length ? wls[0].id : null;
      renderWLSelect();
      renderCurrentWL();
      saveAll();
      alert('Backup importado com sucesso!');
    } catch(err){
      alert('Erro ao ler o arquivo: ' + err.message);
    }
  });

  deleteWLBtn.addEventListener('click', () => {
    const wl = getCurrentWL();
    if(!wl) return;
    if(!confirm(`Apagar a WL "${wl.name}" e todas as partidas dela? Isso não pode ser desfeito.`)) return;
    wls = wls.filter(w => w.id !== wl.id);
    currentWLId = wls.length ? wls[0].id : null;
    renderWLSelect();
    renderCurrentWL();
    saveAll();
  });

  function buildFormationRows(edition, formationKey){
    const wl = getCurrentWL();
    if(!wl) return;
    const slots = FORMATIONS[formationKey];
    const eventOptions = EVENTS_BY_EDITION_WL[edition] || [];
    const datalistId = 'formationEventList';
    const assignment = smartAssignSlots(slots, wl.squad);

    formationRows.innerHTML = `<datalist id="${datalistId}">${eventOptions.map(ev => `<option value="${ev}"></option>`).join('')}</datalist>` +
      slots.map((slot, idx) => {
        const matched = assignment[idx];
        return `
        <div class="formation-row">
          <span class="pos-tag">${slot.code}</span>
          <input type="text" class="fr-nome name-ac-input" data-idx="${idx}" placeholder="Nome do jogador (${slot.label})" value="${matched ? escapeHtml(matched.nome) : ''}" autocomplete="off">
          <input type="text" class="fr-event" data-idx="${idx}" list="${datalistId}" placeholder="Evento/Raridade" value="${matched ? escapeHtml(matched.event||'') : ''}" autocomplete="off">
          <button type="button" class="clear-row-btn" data-idx="${idx}" title="Limpar esta vaga">&times;</button>
        </div>`;
      }).join('');

    saveSquadBtn.style.display = 'inline-block';
  }

  buildFormationBtn.addEventListener('click', () => {
    squadErrorMsg.textContent = '';
    const edition = squadBuildEdition.value;
    const formationKey = squadBuildFormation.value;
    if(!edition){ squadErrorMsg.textContent = 'Selecione a edição antes de montar a formação.'; return; }
    buildFormationRows(edition, formationKey);
  });

  formationRows.addEventListener('keydown', (e) => {
    if(e.key !== 'Enter') return;
    const t = e.target;
    if(!t.classList || !(t.classList.contains('fr-nome') || t.classList.contains('fr-event'))) return;
    e.preventDefault();
    const idx = Number(t.dataset.idx);
    const rows = Array.from(document.querySelectorAll('.formation-row'));
    if(t.classList.contains('fr-nome')){ rows[idx].querySelector('.fr-event').focus(); }
    else { const nextRow = rows[idx + 1]; if(nextRow) nextRow.querySelector('.fr-nome').focus(); }
  });

  formationRows.addEventListener('click', (e) => {
    const btn = e.target.closest('.clear-row-btn');
    if(!btn) return;
    const idx = Number(btn.dataset.idx);
    const rows = Array.from(document.querySelectorAll('.formation-row'));
    rows[idx].querySelector('.fr-nome').value = '';
    rows[idx].querySelector('.fr-event').value = '';
    rows[idx].querySelector('.fr-nome').focus();
  });

  saveSquadBtn.addEventListener('click', () => {
    squadErrorMsg.textContent = '';
    const wl = getCurrentWL();
    if(!wl) return;
    const edition = squadBuildEdition.value;
    const formationKey = squadBuildFormation.value;
    const slots = FORMATIONS[formationKey];
    const nomeInputs = Array.from(document.querySelectorAll('.fr-nome'));
    const eventInputs = Array.from(document.querySelectorAll('.fr-event'));
    const usedExistingIds = new Set();
    const finalSquad = [];
    let algumIncompleto = false;

    nomeInputs.forEach((nomeInput, idx) => {
      const nome = nomeInput.value.trim();
      const event = eventInputs[idx].value.trim();
      if(!nome && !event) return;
      if(!nome || !event){ algumIncompleto = true; return; }
      const existente = wl.squad.find(p => !usedExistingIds.has(p.id) && normalizeName(p.nome) === normalizeName(nome));
      if(existente){
        existente.edition = edition; existente.event = event; existente.positions = [slots[idx].code];
        usedExistingIds.add(existente.id);
        finalSquad.push(existente);
      } else {
        finalSquad.push({ id: nextId('sq'), nome, edition, event, positions: [slots[idx].code] });
      }
    });

    if(algumIncompleto){ squadErrorMsg.textContent = 'Preencha nome e evento juntos em cada posição usada (ou deixe as duas vazias pra pular a vaga).'; return; }
    if(finalSquad.length === 0){ squadErrorMsg.textContent = 'Preencha pelo menos um jogador da formação.'; return; }

    const naoUsados = wl.squad.filter(p => !usedExistingIds.has(p.id) && !finalSquad.includes(p));
    naoUsados.forEach(p => { p.positions = []; });
    wl.squad = [...finalSquad, ...naoUsados];
    wl.lastEdition = edition;
    wl.lastFormationKey = formationKey;

    renderSquadChips();
    renderSquadStatsTable();
    saveAll();
    buildFormationRows(edition, formationKey);
  });

  clearSquadBtn.addEventListener('click', () => {
    const wl = getCurrentWL();
    if(!wl || wl.squad.length === 0) return;
    if(!confirm('Limpar o time inteiro desta WL? Isso não apaga o histórico de partidas já registradas.')) return;
    wl.squad = []; wl.lastFormationKey = ''; wl.lastEdition = '';
    formationRows.innerHTML = '';
    saveSquadBtn.style.display = 'none';
    matchExtraIds = [];
    renderSquadChips();
    renderSquadStatsTable();
    saveAll();
  });

  const squadModalOverlay = document.getElementById('squadModalOverlay');
  const squadModalTitle = document.getElementById('squadModalTitle');
  const squadModalEdition = document.getElementById('squadModalEdition');
  const squadModalEvent = document.getElementById('squadModalEvent');
  const squadEventList = document.getElementById('squadEventList');
  const squadModalConfirmBtn = document.getElementById('squadModalConfirmBtn');
  const squadModalCancelBtn = document.getElementById('squadModalCancelBtn');

  squadModalEdition.addEventListener('change', () => {
    const opts = EVENTS_BY_EDITION_WL[squadModalEdition.value] || [];
    squadEventList.innerHTML = opts.map(ev => `<option value="${ev}"></option>`).join('');
  });

  function askCardInfo(nome){
    return new Promise(resolve => {
      squadModalTitle.textContent = `Carta de ${nome}`;
      squadModalEdition.value = ''; squadModalEvent.value = ''; squadEventList.innerHTML = '';
      squadModalOverlay.style.display = 'flex';
      function cleanup(){
        squadModalOverlay.style.display = 'none';
        squadModalConfirmBtn.removeEventListener('click', onConfirm);
        squadModalCancelBtn.removeEventListener('click', onCancel);
      }
      function onConfirm(){
        const edition = squadModalEdition.value;
        if(!edition){ alert('Selecione a edição.'); return; }
        const event = squadModalEvent.value.trim();
        if(!event){ alert('Informe o evento/raridade.'); return; }
        cleanup(); resolve({ edition, event });
      }
      function onCancel(){ cleanup(); resolve(null); }
      squadModalConfirmBtn.addEventListener('click', onConfirm);
      squadModalCancelBtn.addEventListener('click', onCancel);
    });
  }

  squadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const wl = getCurrentWL();
    if(!wl) return;
    const input = document.getElementById('squadPlayerName');
    const nome = input.value.trim();
    if(!nome) return;
    const cardInfo = await askCardInfo(nome);
    if(!cardInfo) return;
    wl.squad.push({ id: nextId('sq'), nome, edition: cardInfo.edition, event: cardInfo.event, positions: [] });
    input.value = ''; input.focus();
    renderSquadChips(); renderSquadStatsTable(); saveAll();
  });

  squadChips.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('#toggleAvulsosBtn');
    if(toggleBtn){ avulsosExpanded = !avulsosExpanded; renderSquadChips(); return; }
    const editBtn = e.target.closest('.edit-player-btn');
    if(editBtn){ openEditPlayerModal(editBtn.dataset.id); return; }
    const btn = e.target.closest('.remove-player-btn');
    if(!btn) return;
    const wl = getCurrentWL();
    if(!wl) return;
    const playerId = btn.dataset.id;
    const player = wl.squad.find(p => p.id === playerId);
    if(player && !confirm(`Remover "${player.nome}" do time? O histórico de partidas dele continua salvo.`)) return;
    wl.squad = wl.squad.filter(p => p.id !== playerId);
    matchExtraIds = matchExtraIds.filter(id => id !== playerId);
    renderSquadChips(); renderSquadStatsTable(); saveAll();
  });

  /* ---------- EDITAR JOGADOR (corrige nome/carta e propaga pro histórico) ---------- */
  const editPlayerModalOverlay = document.getElementById('editPlayerModalOverlay');
  const editPlayerName = document.getElementById('editPlayerName');
  const editPlayerEdition = document.getElementById('editPlayerEdition');
  const editPlayerEvent = document.getElementById('editPlayerEvent');
  const editPlayerEventList = document.getElementById('editPlayerEventList');
  const editPlayerConfirmBtn = document.getElementById('editPlayerConfirmBtn');
  const editPlayerCancelBtn = document.getElementById('editPlayerCancelBtn');
  let editingPlayerId = null;

  function fillEditPlayerEventOptions(){
    const opts = EVENTS_BY_EDITION_WL[editPlayerEdition.value] || [];
    editPlayerEventList.innerHTML = opts.map(ev => `<option value="${ev}"></option>`).join('');
  }
  editPlayerEdition.addEventListener('change', fillEditPlayerEventOptions);

  function openEditPlayerModal(playerId){
    const wl = getCurrentWL();
    if(!wl) return;
    const player = wl.squad.find(p => p.id === playerId);
    if(!player) return;
    editingPlayerId = playerId;
    editPlayerName.value = player.nome;
    editPlayerEdition.value = player.edition || '';
    fillEditPlayerEventOptions();
    editPlayerEvent.value = player.event || '';
    editPlayerModalOverlay.style.display = 'flex';
    editPlayerName.focus();
  }

  function closeEditPlayerModal(){
    editPlayerModalOverlay.style.display = 'none';
    editingPlayerId = null;
  }

  editPlayerCancelBtn.addEventListener('click', closeEditPlayerModal);

  editPlayerConfirmBtn.addEventListener('click', () => {
    const wl = getCurrentWL();
    if(!wl || !editingPlayerId) return;
    const player = wl.squad.find(p => p.id === editingPlayerId);
    if(!player) return;

    const novoNome = editPlayerName.value.trim();
    const novaEdicao = editPlayerEdition.value;
    const novoEvento = editPlayerEvent.value.trim();
    if(!novoNome || !novaEdicao || !novoEvento){ alert('Preencha nome, edição e evento.'); return; }

    const nomeMudou = normalizeName(novoNome) !== normalizeName(player.nome);
    const cartaMudou = nomeMudou || novaEdicao !== player.edition || normalizeName(novoEvento) !== normalizeName(player.event||'');

    if(cartaMudou){
      // Checa se já existe outro jogador igual (mesmo nome, mesma edição/evento) no elenco
      const jaExiste = wl.squad.find(p => p.id !== player.id
        && normalizeName(p.nome) === normalizeName(novoNome)
        && p.edition === novaEdicao
        && normalizeName(p.event||'') === normalizeName(novoEvento));

      player.nome = novoNome;
      player.edition = novaEdicao;
      player.event = novoEvento;

      // Propaga a correção pro histórico de partidas desta WL (mesma identidade = mesmo playerId)
      wl.matches.forEach(m => {
        m.playerStats.forEach(p => {
          if(p.playerId === player.id){ p.nome = novoNome; p.edition = novaEdicao; p.event = novoEvento; }
        });
      });

      closeEditPlayerModal();
      renderSquadChips(); renderSquadStatsTable(); renderMatchesTable(); renderSummary(); saveAll();

      if(jaExiste){
        alert(`Pronto! Como "${novoNome}" (${EDITION_LABEL_WL[novaEdicao]||novaEdicao} · ${novoEvento}) já existia no time, as estatísticas das duas entradas vão aparecer juntas automaticamente nas páginas de Estatísticas.`);
      } else if(nomeMudou){
        alert(`Nome corrigido para "${novoNome}". O histórico de partidas desta WL foi atualizado — as Estatísticas já vão juntar tudo sob o nome certo.`);
      }
    } else {
      closeEditPlayerModal();
    }
  });
  editPlayerName.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ e.preventDefault(); editPlayerConfirmBtn.click(); } });
  editPlayerEvent.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ e.preventDefault(); editPlayerConfirmBtn.click(); } });

  const openSubBtn = document.getElementById('openSubBtn');
  const subModalOverlay = document.getElementById('subModalOverlay');
  const subOutSelect = document.getElementById('subOutSelect');
  const subInSelect = document.getElementById('subInSelect');
  const subConfirmBtn = document.getElementById('subConfirmBtn');
  const subCancelBtn = document.getElementById('subCancelBtn');

  openSubBtn.addEventListener('click', () => {
    const wl = getCurrentWL();
    if(!wl){ alert('Selecione uma WL primeiro.'); return; }
    const titulares = wl.squad.filter(p => p.positions && p.positions.length > 0);
    const avulsos = wl.squad.filter(p => !p.positions || p.positions.length === 0);
    if(titulares.length === 0){ alert('Não há titulares no time pra substituir.'); return; }
    if(avulsos.length === 0){ alert('Não há jogadores avulsos disponíveis. Adicione um jogador avulso primeiro.'); return; }
    subOutSelect.innerHTML = titulares.map(p => `<option value="${p.id}">${escapeHtml(p.nome)} (${p.positions.join('/')})</option>`).join('');
    subInSelect.innerHTML = avulsos.map(p => `<option value="${p.id}">${escapeHtml(p.nome)}</option>`).join('');
    subModalOverlay.style.display = 'flex';
  });
  subCancelBtn.addEventListener('click', () => { subModalOverlay.style.display = 'none'; });
  subConfirmBtn.addEventListener('click', () => {
    const wl = getCurrentWL();
    if(!wl) return;
    const outId = subOutSelect.value, inId = subInSelect.value;
    if(!outId || !inId) return;
    const outPlayer = wl.squad.find(p => p.id === outId);
    const inPlayer = wl.squad.find(p => p.id === inId);
    if(!outPlayer || !inPlayer) return;
    const posicoesLiberadas = outPlayer.positions.slice();
    inPlayer.positions = posicoesLiberadas;
    outPlayer.positions = [];
    subModalOverlay.style.display = 'none';
    renderSquadChips(); renderSquadStatsTable(); saveAll();
    alert(`${inPlayer.nome} entrou no lugar de ${outPlayer.nome}! Ele agora é titular na posição ${posicoesLiberadas.join('/')}.`);
  });

  const openBenchBtn = document.getElementById('openBenchBtn');
  const benchModalOverlay = document.getElementById('benchModalOverlay');
  const benchSelect = document.getElementById('benchSelect');
  const benchAddBtn = document.getElementById('benchAddBtn');
  const benchAddedList = document.getElementById('benchAddedList');
  const benchCloseBtn = document.getElementById('benchCloseBtn');

  function renderBenchModal(){
    const wl = getCurrentWL();
    if(!wl) return;
    const avulsos = wl.squad.filter(p => (!p.positions || p.positions.length === 0) && !matchExtraIds.includes(p.id));
    benchSelect.innerHTML = avulsos.length ? avulsos.map(p => `<option value="${p.id}">${escapeHtml(p.nome)}</option>`).join('') : '<option value="">Nenhum avulso disponível</option>';
    const trazidos = wl.squad.filter(p => matchExtraIds.includes(p.id));
    benchAddedList.innerHTML = trazidos.length
      ? trazidos.map(p => `<div class="bench-row"><span class="bench-name">${escapeHtml(p.nome)} <span class="bench-tag">(${EDITION_LABEL_WL[p.edition]||p.edition} · ${escapeHtml(p.event)})</span></span><button class="remove-extra-btn" data-id="${p.id}" title="Remover">&times;</button></div>`).join('')
      : '<div class="empty-players">Nenhum jogador trazido do banco ainda.</div>';
  }
  openBenchBtn.addEventListener('click', () => {
    const wl = getCurrentWL();
    if(!wl){ alert('Selecione uma WL primeiro.'); return; }
    renderBenchModal(); benchModalOverlay.style.display = 'flex';
  });
  benchAddBtn.addEventListener('click', () => {
    const id = benchSelect.value;
    if(!id) return;
    if(matchExtraIds.length >= 3){ alert('Você já trouxe 3 jogadores do banco pra essa partida.'); return; }
    matchExtraIds.push(id);
    renderBenchModal(); renderSquadStatsTable();
  });
  benchAddedList.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-extra-btn');
    if(!btn) return;
    matchExtraIds = matchExtraIds.filter(id => id !== btn.dataset.id);
    renderBenchModal(); renderSquadStatsTable();
  });
  benchCloseBtn.addEventListener('click', () => { benchModalOverlay.style.display = 'none'; });

  function formatNotaInput(el){
    let raw = el.value.replace(/[^\d]/g, '').slice(-3);
    if(raw === ''){ el.value = ''; return; }
    let num = parseInt(raw, 10);
    if(num > 100) num = 100;
    el.value = `${Math.floor(num/10)}.${num%10}`;
  }
  matchForm.addEventListener('input', (e) => { if(e.target.classList && e.target.classList.contains('stat-nota')) formatNotaInput(e.target); });

  matchForm.addEventListener('keydown', (e) => {
    if(e.key !== 'Enter') return;
    const t = e.target;
    if(!t.tagName || t.tagName !== 'INPUT') return;
    const isStatField = t.classList.contains('stat-gols') || t.classList.contains('stat-assist') || t.classList.contains('stat-nota');
    const isPlacarField = t.id === 'golsFeitos' || t.id === 'golsSofridos';
    if(!isStatField && !isPlacarField) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if(t.id === 'golsFeitos'){ document.getElementById('golsSofridos').focus(); return; }
    if(t.id === 'golsSofridos'){ const firstRow = document.querySelector('.squad-stat-row'); if(firstRow) firstRow.querySelector('.stat-gols').focus(); return; }
    const idx = Number(t.dataset.idx);
    const rows = Array.from(document.querySelectorAll('.squad-stat-row'));
    if(t.classList.contains('stat-gols')){ rows[idx].querySelector('.stat-assist').focus(); }
    else if(t.classList.contains('stat-assist')){ rows[idx].querySelector('.stat-nota').focus(); }
    else if(t.classList.contains('stat-nota')){ const nextRow = rows[idx+1]; if(nextRow) nextRow.querySelector('.stat-gols').focus(); }
  }, true);

  matchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    matchErrorMsg.textContent = '';
    const wl = getCurrentWL();
    if(!wl) return;
    if(wl.matches.length >= 15){ matchErrorMsg.textContent = 'Você já registrou as 15 partidas dessa WL.'; return; }

    const golsFeitos = document.getElementById('golsFeitos').value;
    const golsSofridos = document.getElementById('golsSofridos').value;
    if(golsFeitos === '' || golsSofridos === '' || Number(golsFeitos) < 0 || Number(golsSofridos) < 0){ matchErrorMsg.textContent = 'Preencha o placar corretamente.'; return; }

    const jogadoresDaPartida = getPlayersForMatch(wl);
    if(jogadoresDaPartida.length === 0){ matchErrorMsg.textContent = 'Monte o time titular (ou traga alguém do banco) antes de registrar a partida.'; return; }

    const gf = Number(golsFeitos), gs = Number(golsSofridos);
    let resultado;
    if(gf > gs){ resultado = 'V'; }
    else if(gf < gs){ resultado = 'D'; }
    else {
      const venceuPenaltis = confirm('Empate no tempo normal — foi pra pênaltis. Você venceu nos pênaltis?\n\nOK = Vitória nos pênaltis\nCancelar = Derrota nos pênaltis');
      resultado = venceuPenaltis ? 'V' : 'D';
    }

    const playerStats = [];
    let incompleto = false;

    jogadoresDaPartida.forEach(p => {
      const golsInput = document.querySelector(`.stat-gols[data-player="${p.id}"]`);
      const assistInput = document.querySelector(`.stat-assist[data-player="${p.id}"]`);
      const notaInput = document.querySelector(`.stat-nota[data-player="${p.id}"]`);
      const gols = golsInput.value, assist = assistInput.value, nota = notaInput.value;
      const tocouAlgo = gols !== '' || assist !== '' || nota !== '';
      const completo = gols !== '' && assist !== '' && nota !== '';
      if(!tocouAlgo) return;
      if(!completo){ incompleto = true; return; }
      playerStats.push({
        playerId: p.id, nome: p.nome, edition: p.edition, event: p.event,
        positions: (p.positions || []).slice(),
        gols: Number(gols) || 0, assistencias: Number(assist) || 0, nota: Number(nota)
      });
    });

    if(incompleto){ matchErrorMsg.textContent = 'Preencha Gols, Assistências e Nota dos jogadores que participaram (ou deixe os 3 vazios pra quem não jogou).'; return; }
    if(playerStats.length === 0){ matchErrorMsg.textContent = 'Preencha as estatísticas de pelo menos um jogador.'; return; }

    wl.matches.push({ id: nextId('m'), number: wl.matches.length + 1, resultado, golsFeitos: gf, golsSofridos: gs, playerStats });

    matchExtraIds = [];
    saveAll();
    renderWLSelect(); renderMatchesTable(); renderSummary();
    matchForm.reset(); renderSquadStatsTable();
  });

  matchesTbody.addEventListener('click', (e) => {
    const detailBtn = e.target.closest('.detail-btn-wl');
    if(detailBtn){
      const id = detailBtn.dataset.id;
      if(expandedMatchIds.has(id)) expandedMatchIds.delete(id); else expandedMatchIds.add(id);
      renderMatchesTable(); return;
    }
    const delBtn = e.target.closest('.del-match-btn');
    if(delBtn){
      const wl = getCurrentWL();
      if(!wl) return;
      if(!confirm('Remover essa partida?')) return;
      wl.matches = wl.matches.filter(m => m.id !== delBtn.dataset.id);
      wl.matches.forEach((m, idx) => m.number = idx + 1);
      saveAll(); renderWLSelect(); renderMatchesTable(); renderSummary();
      return;
    }
    const editBtn = e.target.closest('.edit-match-btn');
    if(editBtn){
      editingMatchId = editBtn.dataset.id;
      renderMatchesTable();
      return;
    }
    const cancelBtn = e.target.closest('.cancel-match-btn');
    if(cancelBtn){
      editingMatchId = null;
      renderMatchesTable();
      return;
    }
    const saveBtn = e.target.closest('.save-match-btn');
    if(saveBtn){
      const wl = getCurrentWL();
      if(!wl) return;
      const id = saveBtn.dataset.id;
      const match = wl.matches.find(m => m.id === id);
      if(!match) return;
      const gfInput = matchesTbody.querySelector(`.edit-gf[data-id="${id}"]`);
      const gsInput = matchesTbody.querySelector(`.edit-gs[data-id="${id}"]`);
      const gf = gfInput.value, gs = gsInput.value;
      if(gf === '' || gs === '' || Number(gf) < 0 || Number(gs) < 0){ alert('Preencha o placar corretamente.'); return; }
      const gfNum = Number(gf), gsNum = Number(gs);
      let resultado;
      if(gfNum > gsNum){ resultado = 'V'; }
      else if(gfNum < gsNum){ resultado = 'D'; }
      else {
        const venceuPenaltis = confirm('Empate no tempo normal — foi pra pênaltis. Você venceu nos pênaltis?\n\nOK = Vitória nos pênaltis\nCancelar = Derrota nos pênaltis');
        resultado = venceuPenaltis ? 'V' : 'D';
      }
      match.golsFeitos = gfNum; match.golsSofridos = gsNum; match.resultado = resultado;
      editingMatchId = null;
      saveAll(); renderWLSelect(); renderMatchesTable(); renderSummary();
    }
  });

  function getPlayersForMatch(wl){
    const titulares = wl.squad.filter(p => p.positions && p.positions.length > 0);
    const extras = wl.squad.filter(p => matchExtraIds.includes(p.id));
    return [...titulares, ...extras];
  }

  function squadChipHtml(p){
    return `<span class="squad-chip">${escapeHtml(p.nome)} <span class="chip-tag">(${EDITION_LABEL_WL[p.edition]||p.edition} · ${escapeHtml(p.event)}${p.positions && p.positions.length ? ' · ' + p.positions.join('/') : ' · avulso'})</span><button class="edit-player-btn" data-id="${p.id}" title="Editar nome/carta">✏️</button><button class="remove-player-btn" data-id="${p.id}" title="Remover este jogador">&times;</button></span>`;
  }

  function renderSquadChips(){
    const wl = getCurrentWL();
    if(!wl) return;

    if(wl.squad.length === 0){
      squadChips.innerHTML = '<span style="color:var(--muted); font-size:13px;">Nenhum jogador no time ainda.</span>';
      return;
    }

    const titulares = wl.squad.filter(p => p.positions && p.positions.length > 0);
    const avulsos = wl.squad.filter(p => !p.positions || p.positions.length === 0)
      .slice().sort((a,b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    let html = titulares.length
      ? titulares.map(squadChipHtml).join('')
      : '<span style="color:var(--muted); font-size:13px;">Nenhum titular definido ainda.</span>';

    if(avulsos.length){
      html += `<button type="button" id="toggleAvulsosBtn" class="add-btn-wl">${avulsosExpanded ? 'Ver menos ▲' : `Ler mais (+${avulsos.length} avulsos) ▾`}</button>`;
      if(avulsosExpanded){
        html += `<div class="squad-chips-avulsos">${avulsos.map(squadChipHtml).join('')}</div>`;
      }
    }

    squadChips.innerHTML = html;
  }

  function renderSquadStatsTable(){
    const wl = getCurrentWL();
    if(!wl) return;
    const jogadores = getPlayersForMatch(wl);
    squadStatsTable.innerHTML = jogadores.length
      ? jogadores.map((p, idx) => `
        <div class="squad-stat-row">
          <span class="p-name">${escapeHtml(p.nome)} <span class="chip-tag">(${EDITION_LABEL_WL[p.edition]||p.edition} · ${escapeHtml(p.event)})</span>${matchExtraIds.includes(p.id) ? '<span class="extra-badge">BANCO</span>' : ''}</span>
          <div class="mini-field"><label>Gols</label><input type="number" min="0" class="stat-gols" data-player="${p.id}" data-idx="${idx}" placeholder="0"></div>
          <div class="mini-field"><label>Assist</label><input type="number" min="0" class="stat-assist" data-player="${p.id}" data-idx="${idx}" placeholder="0"></div>
          <div class="mini-field"><label>Nota</label><input type="text" inputmode="numeric" class="stat-nota" data-player="${p.id}" data-idx="${idx}" placeholder="—" maxlength="4"></div>
        </div>
      `).join('')
      : '<div class="empty-players">Monte o time titular acima (ou traga alguém do banco) antes de registrar uma partida.</div>';
  }

  function renderMatchesTable(){
    const wl = getCurrentWL();
    if(!wl) return;
    progressText.textContent = `(${wl.matches.length} / 15)`;
    if(wl.matches.length === 0){
      matchesTbody.innerHTML = `<tr class="empty-row"><td colspan="8">Nenhuma partida registrada ainda.</td></tr>`;
      return;
    }
    const resultLabel = { V:'✅ Vitória', D:'❌ Derrota' };
    matchesTbody.innerHTML = wl.matches.map(m => {
      const isOpen = expandedMatchIds.has(m.id);
      const isEditing = editingMatchId === m.id;
      const mediaNota = m.playerStats.length ? (m.playerStats.reduce((s,p) => s+p.nota,0)/m.playerStats.length).toFixed(1) : '—';
      const mvp = getMatchMVP(m);

      if(isEditing){
        return `<tr class="editing-row-wl">
          <td>${m.number}</td>
          <td><span class="result-badge result-${m.resultado.toLowerCase()}">${resultLabel[m.resultado]}</span></td>
          <td>
            <input type="number" min="0" class="edit-placar-input edit-gf" data-id="${m.id}" value="${m.golsFeitos}" style="width:48px;">
            <span style="margin:0 4px;">-</span>
            <input type="number" min="0" class="edit-placar-input edit-gs" data-id="${m.id}" value="${m.golsSofridos}" style="width:48px;">
          </td>
          <td>${mediaNota}</td>
          <td>${mvp ? `<span class="mvp-badge">⭐ ${escapeHtml(mvp.nome)} (${mvp.nota.toFixed(1)})</span>` : '—'}</td>
          <td colspan="3" style="text-align:right; white-space:nowrap;">
            <button class="save-match-btn add-btn-wl" data-id="${m.id}" style="padding:6px 12px; font-size:12px;">💾 Salvar</button>
            <button class="cancel-match-btn cancel-btn-wl" data-id="${m.id}" style="padding:6px 12px; font-size:12px;">Cancelar</button>
          </td>
        </tr>`;
      }

      const mainRow = `<tr>
        <td>${m.number}</td>
        <td><span class="result-badge result-${m.resultado.toLowerCase()}">${resultLabel[m.resultado]}</span></td>
        <td>${m.golsFeitos} - ${m.golsSofridos}</td>
        <td>${mediaNota}</td>
        <td>${mvp ? `<span class="mvp-badge">⭐ ${escapeHtml(mvp.nome)} (${mvp.nota.toFixed(1)})</span>` : '—'}</td>
        <td><button class="detail-btn-wl ${isOpen ? 'active' : ''}" data-id="${m.id}">${isOpen ? 'Fechar ▲' : 'Detalhes ▾'}</button></td>
        <td><button class="edit-match-btn" data-id="${m.id}" title="Editar placar">✏️</button></td>
        <td><button class="del-match-btn" data-id="${m.id}" title="Remover">&times;</button></td>
      </tr>`;
      const expandRow = isOpen ? `<tr class="expand-row-wl"><td colspan="8"><div class="expand-box-wl">${
        m.playerStats.length
          ? m.playerStats.map(p => `<div class="player-row-wl"><span class="p-nome">${escapeHtml(p.nome)}</span><span class="p-stat"><strong>${p.gols}</strong> gols</span><span class="p-stat"><strong>${p.assistencias}</strong> assist</span><span class="p-stat"><strong>${p.nota.toFixed(1)}</strong> nota</span></div>`).join('')
          : '<div class="empty-players">Nenhum jogador com estatísticas nessa partida.</div>'
      }</div></td></tr>` : '';
      return mainRow + expandRow;
    }).join('');
  }

  function aggregateCurrentWL(wl){
    const byPlayer = {}, byCard = {}, mvpCount = {};
    wl.matches.forEach(m => {
      const mvp = getMatchMVP(m);
      if(mvp){ const key = normalizeName(mvp.nome); mvpCount[key] = (mvpCount[key]||0) + 1; }
      m.playerStats.forEach(p => {
        const nameKey = normalizeName(p.nome);
        if(!byPlayer[nameKey]) byPlayer[nameKey] = { nome:p.nome, partidas:0, gols:0, assistencias:0, notaSoma:0 };
        const pp = byPlayer[nameKey];
        pp.partidas++; pp.gols+=p.gols; pp.assistencias+=p.assistencias; pp.notaSoma+=p.nota;
        const cardKey = `${nameKey}|${p.edition||''}|${normalizeName(p.event||'')}`;
        if(!byCard[cardKey]) byCard[cardKey] = { nome:p.nome, edition:p.edition, event:p.event, partidas:0, gols:0, assistencias:0, notaSoma:0 };
        const pc = byCard[cardKey];
        pc.partidas++; pc.gols+=p.gols; pc.assistencias+=p.assistencias; pc.notaSoma+=p.nota;
      });
    });
    return { byPlayer, byCard, mvpCount };
  }

  /* ---------- POSIÇÕES: ATUAL (do time montado) + HISTÓRICO (de todas as partidas, todas as WLs) ---------- */
  function getSquadPositionsByName(wl){
    const map = {};
    wl.squad.forEach(p => {
      const key = normalizeName(p.nome);
      if(!map[key]) map[key] = new Set();
      (p.positions||[]).forEach(code => map[key].add(code));
    });
    return map;
  }
  function getSquadPositionsForCard(wl, nameKey, edition, event){
    const found = wl.squad.find(p => normalizeName(p.nome) === nameKey && p.edition === edition && normalizeName(p.event||'') === normalizeName(event||''));
    return found ? (found.positions||[]) : [];
  }
  function getAllPositionsEverPlayed(nameKey){
    const set = new Set();
    wls.forEach(wl => wl.matches.forEach(m => m.playerStats.forEach(p => {
      if(normalizeName(p.nome) === nameKey) (p.positions||[]).forEach(code => set.add(code));
    })));
    return set;
  }

  /* ---------- HISTÓRICO DE PRÊMIOS (todas as WLs) ---------- */
  function computeAwardsHistory(){
    const history = {};
    wls.forEach(wl => {
      const agg = aggregateCurrentWL(wl);
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

  function buildPlayerExpandBoxWL(id, agg, wl){
    const squadPos = getSquadPositionsByName(wl);
    const currentPosSet = squadPos[id] || new Set();
    const currentPosHtml = currentPosSet.size
      ? Array.from(currentPosSet).map(code => {
          const meta = POSITIONS_META[code];
          return meta ? `<span class="pos-badge badge-${meta.cat}">${code} · ${meta.label}</span>` : '';
        }).join('')
      : '<span style="color:var(--muted); font-size:13px;">Não está no time titular atual.</span>';

    const allPosSet = getAllPositionsEverPlayed(id);
    const allPosHtml = allPosSet.size
      ? Array.from(allPosSet).map(code => {
          const meta = POSITIONS_META[code];
          return meta ? `<span class="pos-badge badge-${meta.cat}">${code} · ${meta.label}</span>` : '';
        }).join('')
      : '<span style="color:var(--muted); font-size:13px;">Nenhum registro de partida ainda.</span>';

    const awardsHistory = computeAwardsHistory()[id];
    const awardsHtml = awardsHistory
      ? Object.keys(AWARD_META).filter(k => awardsHistory[k] > 0).map(k => `<span class="mvp-badge">${AWARD_META[k].icon} ${awardsHistory[k]}x ${AWARD_META[k].label}</span>`).join(' ')
      : '';

    const cardsOfPlayer = Object.values(agg.byCard).filter(c => normalizeName(c.nome) === id);
    const cardsHtml = cardsOfPlayer.length
      ? cardsOfPlayer.map(c => {
          const swatch = getCardSwatch(c.event, c.edition);
          const media = c.notaSoma / c.partidas;
          const cardPos = getSquadPositionsForCard(wl, id, c.edition, c.event);
          const cardPosHtml = cardPos.length ? cardPos.map(code => `<span class="pos-badge badge-${(POSITIONS_META[code]||{}).cat||'none'}">${code}</span>`).join('') : '';
          return `<div class="card-row">
            <span class="card-swatch" style="background:${swatch};"></span>
            <span class="card-readonly-text"><strong>${EDITION_LABEL_WL[c.edition]||c.edition}</strong> · ${escapeHtml(c.event||'—')}</span>
            ${cardPosHtml}
            <div class="card-stats-readonly">
              <div class="card-stat-pill"><span class="stat-value">${c.partidas}</span><span class="stat-label">Jogos</span></div>
              <div class="card-stat-pill"><span class="stat-value">${c.gols}</span><span class="stat-label">Gols</span></div>
              <div class="card-stat-pill"><span class="stat-value">${c.assistencias}</span><span class="stat-label">Assist</span></div>
              <div class="card-stat-pill ga"><span class="stat-value">${c.gols+c.assistencias}</span><span class="stat-label">G+A</span></div>
              <div class="card-stat-pill"><span class="stat-value">${media.toFixed(1)}</span><span class="stat-label">Média</span></div>
            </div>
          </div>`;
        }).join('')
      : '<div style="color:var(--muted); font-size:13px;">Nenhuma carta registrada.</div>';

    return `<div class="expand-box">
      ${awardsHtml ? `<div class="expand-section">
        <div class="expand-title">🏆 Prêmios conquistados (histórico geral)</div>
        <div class="view-badges">${awardsHtml}</div>
      </div>` : ''}
      <div class="expand-section">
        <div class="expand-title">Posição atual no time</div>
        <div class="view-badges">${currentPosHtml}</div>
      </div>
      <div class="expand-section">
        <div class="expand-title">Todas as posições já jogadas (histórico geral)</div>
        <div class="view-badges">${allPosHtml}</div>
      </div>
      <div class="expand-section">
        <div class="expand-title">Cartas utilizadas (${cardsOfPlayer.length})</div>
        <div class="cards-list">${cardsHtml}</div>
      </div>
    </div>`;
  }

  function renderStatsTableHead(){
    statsTableHead.innerHTML = `<tr>${STATS_COLUMNS.map(col => {
      if(!col.key) return `<th>${col.label}</th>`;
      const sortedClass = col.key === statsSortKey ? ' sorted' : '';
      const alignAttr = col.left ? ' style="text-align:left;"' : '';
      return `<th data-key="${col.key}" class="${sortedClass}"${alignAttr}>${col.label} <span class="arrow">▲▼</span></th>`;
    }).join('')}</tr>`;
  }
  statsTableHead.addEventListener('click', (e) => {
    const th = e.target.closest('th[data-key]');
    if(!th) return;
    const key = th.dataset.key;
    if(statsSortKey === key){ statsSortDir *= -1; } else { statsSortKey = key; statsSortDir = -1; }
    renderStatsTable();
  });

  statsTbody.addEventListener('click', (e) => {
    const nomeCell = e.target.closest('td.nome');
    const btn = e.target.closest('.detail-btn-wl');
    const id = (nomeCell && nomeCell.dataset.id) || (btn && btn.dataset.id);
    if(!id) return;
    if(expandedStatsIds.has(id)) expandedStatsIds.delete(id); else expandedStatsIds.add(id);
    renderStatsTable();
  });

  function renderStatsTable(){
    const wl = getCurrentWL();
    if(!wl) return;
    renderStatsTableHead();

    const agg = aggregateCurrentWL(wl);
    let fullList = Object.entries(agg.byPlayer).map(([id, p]) => ({
      id, nome: p.nome, partidas: p.partidas, gols: p.gols, assistencias: p.assistencias,
      ga: p.gols + p.assistencias, media: p.notaSoma / p.partidas,
      mvps: agg.mvpCount[id] || 0
    }));

    fullList.sort((a,b) => {
      const va = statsSortKey === 'nome' ? a.nome.toLowerCase() : a[statsSortKey];
      const vb = statsSortKey === 'nome' ? b.nome.toLowerCase() : b[statsSortKey];
      if(va < vb) return -1*statsSortDir;
      if(va > vb) return 1*statsSortDir;
      return 0;
    });

    if(fullList.length === 0){
      statsTbody.innerHTML = `<tr class="empty-row"><td colspan="${STATS_COLUMNS.length}">Sem dados ainda. Registre uma partida.</td></tr>`;
      return;
    }

    statsTbody.innerHTML = fullList.map(row => {
      const isOpen = expandedStatsIds.has(row.id);
      const mainRow = `<tr>
        <td class="nome" data-id="${row.id}">${escapeHtml(row.nome)}</td>
        <td>${row.partidas}</td><td>${row.gols}</td><td>${row.assistencias}</td>
        <td class="ga">${row.ga}</td><td>${row.mvps}</td><td>${row.media.toFixed(1)}</td>
        <td><button class="detail-btn-wl ${isOpen?'active':''}" data-id="${row.id}">${isOpen?'Fechar ▲':'Ver detalhes ▾'}</button></td>
      </tr>`;
      const expandRow = isOpen ? `<tr class="expand-row-wl"><td colspan="${STATS_COLUMNS.length}">${buildPlayerExpandBoxWL(row.id, agg, wl)}</td></tr>` : '';
      return mainRow + expandRow;
    }).join('');
  }

  function renderAwards(wl){
    const agg = aggregateCurrentWL(wl);
    const arr = Object.entries(agg.byPlayer).map(([id, p]) => ({
      id, nome: p.nome, partidas: p.partidas, gols: p.gols, assistencias: p.assistencias,
      ga: p.gols + p.assistencias, media: p.notaSoma / p.partidas, mvps: agg.mvpCount[id] || 0
    }));

    if(arr.length === 0){
      wlAwardsGrid.innerHTML = '<div style="color:var(--muted); font-size:13px; grid-column:1/-1; text-align:center;">Registre partidas para ver os prêmios da WL.</div>';
      return;
    }

    function top(metric){ return arr.slice().sort((a,b) => b[metric]-a[metric])[0]; }

    const artilheiro = top('gols');
    const assistente = top('assistencias');
    const motor = top('ga');
    const melhor = top('media');
    const decisivo = top('mvps');

    const cards = [
      { icon:'⚽', label:'Artilheiro', p:artilheiro, value:`${artilheiro.gols} gols` },
      { icon:'🎯', label:'Assistente', p:assistente, value:`${assistente.assistencias} assist` },
      { icon:'🔥', label:'Motor (G+A)', p:motor, value:`${motor.ga} G+A` },
      { icon:'⭐', label:'Melhor da WL', p:melhor, value:`média ${melhor.media.toFixed(1)}` },
      { icon:'🏅', label:'Mais Decisivo', p:decisivo, value:`${decisivo.mvps} MVPs` }
    ];

    wlAwardsGrid.innerHTML = cards.map(c => `
      <div class="award-card">
        <div class="award-icon">${c.icon}</div>
        <div class="award-name">${escapeHtml(c.p.nome)}</div>
        <div class="award-value">${c.value}</div>
        <div class="award-label">${c.label}</div>
      </div>
    `).join('');
  }

  function renderSummary(){
    const wl = getCurrentWL();
    if(!wl) return;

    const vitorias = wl.matches.filter(m => m.resultado === 'V').length;
    const derrotas = wl.matches.filter(m => m.resultado === 'D').length;
    const totalGolsFeitos = wl.matches.reduce((s,m) => s+m.golsFeitos, 0);
    const totalGolsSofridos = wl.matches.reduce((s,m) => s+m.golsSofridos, 0);

    summaryGrid.innerHTML = `
      <div class="summary-card"><div class="value">${vitorias}-${derrotas}</div><div class="label">Vitórias-Derrotas</div></div>
      <div class="summary-card"><div class="value">${totalGolsFeitos}</div><div class="label">Gols Feitos</div></div>
      <div class="summary-card"><div class="value">${totalGolsSofridos}</div><div class="label">Gols Sofridos</div></div>
      <div class="summary-card"><div class="value">${wl.matches.length}</div><div class="label">Partidas</div></div>
    `;

    renderAwards(wl);
    renderStatsTable();
  }

  function renderCurrentWL(){
    const wl = getCurrentWL();
    if(!wl){ wlContent.style.display = 'none'; return; }
    wlContent.style.display = 'block';
    matchExtraIds = [];
    expandedStatsIds = new Set();
    avulsosExpanded = false;
    if(wl.lastFormationKey && wl.lastEdition){
      squadBuildEdition.value = wl.lastEdition;
      squadBuildFormation.value = wl.lastFormationKey;
      buildFormationRows(wl.lastEdition, wl.lastFormationKey);
    } else {
      formationRows.innerHTML = '';
      saveSquadBtn.style.display = 'none';
      squadBuildEdition.value = wl.edition || '';
    }
    renderSquadChips(); renderSquadStatsTable(); renderMatchesTable(); renderSummary();
  }

  setupNameAutocomplete();
  loadAll();
})();