(function(){
  const STORAGE_KEY = 'fifa_legends_players';
  const PAGE_SIZE = 35;

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

  const ICON_TIERS = ['Icon (Baby)','Icon (Mid)','Icon (Prime)','Prime Icon Moments'];
  const BASE_RARITIES = ['Gold','Silver','Bronze'];
  const COMMON_EVENTS = ['TOTY Honourable Mentions','TOTS Honourable Mentions','Player of the Month (Top 5 Leagues)','FUT Birthday','Man of the Match','End of an Era','Champions League Group Stage Team','Moments'];

  const EVENTS_BY_EDITION = {
    fifa19: [...BASE_RARITIES, ...ICON_TIERS, ...COMMON_EVENTS, 'Ones to Watch','Ultimate Scream','Black Friday','19 Days of FIFA','FUTMAS','TOTY','Future Stars','Headliners','Lunar New Year','Winter Refresh','FUT Player Days','Carniball',"St. Patrick's Day",'TOTS','FUTTIES','TOTW'],
    fifa20: [...BASE_RARITIES, ...ICON_TIERS, ...COMMON_EVENTS, 'Ones to Watch','Ultimate Scream','Black Friday','FUTMAS','TOTY','Future Stars','Headliners','TOTS','FUTTIES','TOTW','Team of the Knockout Stage','Team of the Week Moments','Pre-Season','Road to the Final','Marquee Matchups','Summer Heat','Icons'],
    fifa21: [...BASE_RARITIES, ...ICON_TIERS, ...COMMON_EVENTS, 'Ones to Watch','Summer Ones to Watch','Ultimate Scream','Black Friday','FUTMAS','TOTY','Future Stars','Headliners','TOTS','FUTTIES','TOTW','Road to the Final','Shapeshifters','Flashback','RTTF','Player of the Month','Team of the Group Stage','Festival of FUTball','Winter Refresh','Silver Stars','Summer Stars','FUT Player Days','What If'],
    fifa22: [...BASE_RARITIES, ...ICON_TIERS, ...COMMON_EVENTS, 'Ones to Watch','TOTW','FUT Heroes','Showdown','Showdown Series','Winter Wildcards','TOTY','Future Stars','Headliners','TOTS','FUTTIES','Road to the Final','Ultimate Scream','Black Friday','Centurions','Flashback','RTTF','Pre-Season','Silver Stars','Shapeshifters','Shapeshifters Heroes','RTTK','Versus Fire/Ice','Fantasy FUT','Fantasy FUT Hero','FUTTIES Hero','FUT Captains','FUT Captains Hero','TOTY Hero'],
    fifa23: [...BASE_RARITIES, ...ICON_TIERS, ...COMMON_EVENTS, 'Ones to Watch','TOTY','TOTS','World Cup','World Cup Path to Glory','Centurions','Marquee Matchups','Future Stars','Ultimate Scream','Black Friday','RTTF','FUT Ballers','Winter Wildcards','Shapeshifters','Ultimate TOTS','Heroes','Icons','Flashback','Path to Glory','FUTTIES','TOTW','World Cup Hero','FUTTIES Hero','Icon World Cup','Icon FUT Birthday','Icon Shapeshifters','Icon TOTY','Icon End of an Era','Out of Position','Trophy Titans','Icon Trophy Titans','Fantasy FUT','Fantasy FUT Hero','TOTY Hero'],
    fc24: [...BASE_RARITIES, ...COMMON_EVENTS, 'Ones to Watch','TOTW','TOTY','TOTS','Winter Wildcards','Centurions','RTTF','RTTK','Heroes','Icons','Black Friday','Ultimate Scream','Pre-Season','Marquee Matchups','Showdown','Thunderstruck','Icon Thunderstruck','Icon Euro/Copa America','FUTTIES','Icon FUTTIES','Icon TOTY','Euro Path to Glory','Copa America Path to Glory','Team of the Tournament (Euro/Copa America)','Leave Your Mark (Euro/Copa America)','UEFA Euro International Stars','Triple Threat Hero','FUTTIES Hero','Future Stars','Icon Future Stars','Greats of the Game','Icon Greats of the Game','Golazo','Fantasy FUT','Nike Pro','Icon Golazo','Hero Golazo','Fantasy FUT Hero','Winter Wildcards Hero','Icon Winter Wildcards','Flashback','FUT Birthday Hero','Icon FUT Birthday','Vanguard','TOTY Hero'],
    fc25: [...BASE_RARITIES, ...COMMON_EVENTS, 'Road to the Knockouts','TOTW','Pundit Picks','Thunderstruck','RTTF','Ultimate Birthday','TOTS','Ones to Watch','TOTY','Future Stars','Winter Wildcards','Numero FUT','Fantasy FC','Track Stars','Pro Live','Ultimate Succession','Centurions','Shapeshifters','Path to Glory','Heroes','Icons','Total Rush','Icon Winter Wildcards','FUTTIES','Icon FUTTIES','FUT Immortals Icon','Vanguard','Icon Future Stars','FUT Birthday Hero',"Ballon d'Or",'Icon Champions League','Icon Centurions','Icon Thunderstruck','Icon TOTY','Winter Wildcards Hero','Icon Shapeshifters','Shapeshifters Hero','FUTTIES Hero','TOTY Eras Icon','Icon Ultimate Succession','UCL Dreamchasers','World Tour','Grassroots Greats','Icon Grassroots Greats','Fantasy FUT Hero','Squad Foundations','FC Pro Open','Flashback','Ultimate Cover Star','Icon FUT Birthday','TOTY Hero'],
    fc26: [...BASE_RARITIES, ...COMMON_EVENTS, 'Ones to Watch','TOTW','TOTY','TOTY Icon Swaps','Knockout Royalty','Fantasy FC','Fantasy FUT Hero','Thunderstruck','UT Birthday','Trophy Titans','Road to the Finals','Road to the Knockouts','TOTS','Time Warp','Royalty Knockout','Pro Live','Black Friday','Joga Bonito','Unbreakables','Winter Wildcards','Winter Wildcards Hero','Future Stars','Icon Future Stars','Grassroots Greats','Icon Grassroots Greats','World Cup Path to Glory','World Cup Phenoms','Summer Stars','Glory Hunters','Greats of the Game','Icon Greats of the Game','Festival of Football Captains','World Tour Silver Star Icon','Icon Festival of Football','Icon FUT Birthday','Icon Thunderstruck','Icon TOTY','Icon Winter Wildcards','FUT Birthday Hero','Ratings Reload','TOTY Hero','Squad Foundations','World Tour','Ultimate Scream','Ultimate Scream Hero','Icons','Champions League Icon','FC Champions Icon','Flashback','Festival of Football Prodigies','Heroes','FUTTIES','FUTTIES Hero','Showdown','FC Pro Open','Nike Pro','Icon FUTTIES','Festival of Football Summer Stars','Festival of Football Journey of Nations'],
    fc27: [...BASE_RARITIES, ...ICON_TIERS, ...COMMON_EVENTS, 'Ones to Watch', 'TOTW', 'TOTY', 'TOTS', 'FUTTIES', 'Future Stars', 'Headliners', 'Winter Wildcards', 'Black Friday', 'Ultimate Scream', 'RTTF', 'Shapeshifters', 'Heroes', 'Icons', 'Flashback', 'Showdown', 'Centurions', 'Fantasy FUT', 'FUT Birthday', 'Pre-Season']
  };

  const POSITIONS = [
    {code:'GOL', label:'Goleiro', cat:'def'},
    {code:'ZAG', label:'Zagueiro', cat:'def'},
    {code:'LE', label:'Lateral Esquerdo', cat:'def'},
    {code:'LD', label:'Lateral Direito', cat:'def'},
    {code:'VOL', label:'Volante', cat:'mei'},
    {code:'MC', label:'Meio Campo Central', cat:'mei'},
    {code:'MCA', label:'Meio Campo Avançado', cat:'mei'},
    {code:'ATA', label:'Atacante', cat:'ata'},
    {code:'PE', label:'Ponta Esquerda', cat:'ata'},
    {code:'PD', label:'Ponta Direita', cat:'ata'}
  ];
  const CATEGORY_LABEL = {def:'Defensor', mei:'Meio-campista', ata:'Ataque'};
  const CATEGORY_BADGE = {def:'DEF', mei:'MEI', ata:'ATA'};

  function migratePositionCode(code){
    if(code === 'LAT') return ['LE','LD'];
    if(code === 'PT') return ['PE','PD'];
    return [code];
  }
  function migratePositionsArray(arr){
    const set = new Set();
    (arr||[]).forEach(code => migratePositionCode(code).forEach(c => set.add(c)));
    return Array.from(set);
  }
  function computePlayerPositions(p){
    const set = new Set();
    (p.cards||[]).forEach(c => (c.positions||[]).forEach(code => set.add(code)));
    return Array.from(set);
  }

  const seedData = [
    {nome:"Messi", partidas:2323, gols:1457, assistencias:1107, cartoes:6},
    {nome:"Hakimi", partidas:2161, gols:43, assistencias:216, cartoes:2},
    {nome:"Dalglish", partidas:1729, gols:1353, assistencias:765, cartoes:3},
    {nome:"Walker", partidas:1440, gols:14, assistencias:50, cartoes:5},
    {nome:"LLorente", partidas:1395, gols:68, assistencias:151, cartoes:5},
    {nome:"Cech", partidas:1368, gols:0, assistencias:1, cartoes:4},
    {nome:"Militao", partidas:1352, gols:13, assistencias:17, cartoes:6},
    {nome:"Ribery", partidas:1351, gols:860, assistencias:617, cartoes:5},
    {nome:"Vini Jr", partidas:1181, gols:577, assistencias:424, cartoes:3},
    {nome:"Maldini", partidas:1143, gols:58, assistencias:14, cartoes:4},
    {nome:"Mbappe", partidas:1132, gols:725, assistencias:400, cartoes:3},
    {nome:"Kimpembe", partidas:1130, gols:9, assistencias:12, cartoes:1},
    {nome:"Capdevila", partidas:1126, gols:10, assistencias:38, cartoes:4},
    {nome:"Araujo", partidas:1123, gols:10, assistencias:13, cartoes:4},
    {nome:"Havertz", partidas:1106, gols:457, assistencias:327, cartoes:3},
    {nome:"Pele", partidas:1088, gols:827, assistencias:406, cartoes:4},
    {nome:"Son", partidas:1087, gols:875, assistencias:431, cartoes:5},
    {nome:"Kaka", partidas:1064, gols:447, assistencias:313, cartoes:5},
    {nome:"Cancelo", partidas:1060, gols:6, assistencias:71, cartoes:3},
    {nome:"Varane", partidas:1052, gols:23, assistencias:13, cartoes:2},
    {nome:"Aouar", partidas:1037, gols:126, assistencias:313, cartoes:2},
    {nome:"Rashford", partidas:980, gols:433, assistencias:305, cartoes:4},
    {nome:"Jairzinho", partidas:870, gols:467, assistencias:375, cartoes:1},
    {nome:"Cantona", partidas:821, gols:680, assistencias:286, cartoes:3},
    {nome:"Capita", partidas:812, gols:21, assistencias:34, cartoes:4},
    {nome:"Atal", partidas:774, gols:5, assistencias:37, cartoes:3},
    {nome:"Blanc", partidas:772, gols:34, assistencias:8, cartoes:2}
  ];

  let players = [];
  let sortKey = 'partidas';
  let sortDir = -1;
  let expandedIds = new Set();
  let expandedCardIds = new Set();
  let visibleCount = PAGE_SIZE;
  let positionsEditMode = false;
  let mainViewMode = 'player';

  const tbody = document.getElementById('tbody');
  const form = document.getElementById('playerForm');
  const errorMsg = document.getElementById('errorMsg');
  const statusText = document.getElementById('statusText');

  const searchInput = document.getElementById('searchInput');
  let searchTerm = '';

  function normalize(str){
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  const toggleFilters = document.getElementById('toggleFilters');
  const filtersBody = document.getElementById('filtersBody');
  const clearFiltersBtn = document.getElementById('clearFilters');
  const filterRows = document.querySelectorAll('.filter-row[data-stat]');
  const filterPosition = document.getElementById('filterPosition');
  const filterEdition = document.getElementById('filterEdition');
  const filterEvent = document.getElementById('filterEvent');
  const filterGender = document.getElementById('filterGender');

  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const togglePosEdit = document.getElementById('togglePosEdit');

  const loadMoreWrap = document.getElementById('loadMoreWrap');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  function nextId(){
    return 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
  }

  function normalizePlayer(raw){
    const migratedAggregate = migratePositionsArray(raw.positions);
    const player = {
      id: raw.id || nextId(),
      nome: raw.nome || '',
      partidas: Number(raw.partidas)||0,
      gols: Number(raw.gols)||0,
      assistencias: Number(raw.assistencias)||0,
      genero: (raw.genero === 'M' || raw.genero === 'F') ? raw.genero : '',
      positions: [],
      cards: []
    };
    if(Array.isArray(raw.cards) && raw.cards.length){
      player.cards = raw.cards.map(c => ({
        id: c.id || nextId(),
        edition: c.edition || '',
        event: c.event || '',
        partidas: Number(c.partidas) || 0,
        gols: Number(c.gols) || 0,
        assistencias: Number(c.assistencias) || 0,
        positions: Array.isArray(c.positions) ? migratePositionsArray(c.positions) : migratedAggregate.slice()
      }));
    } else {
      const n = Number(raw.cartoes) || 0;
      player.cards = Array.from({length:n}, () => ({id:nextId(), edition:'', event:'', partidas:0, gols:0, assistencias:0, positions: migratedAggregate.slice()}));
    }
    player.positions = computePlayerPositions(player);
    return player;
  }

  function cardCount(p){ return p.cards.length; }
  function cardGA(c){ return (Number(c.gols)||0) + (Number(c.assistencias)||0); }

  function predominantCategory(p){
    const counts = {def:0, mei:0, ata:0};
    (p.positions||[]).forEach(code => {
      const pos = POSITIONS.find(x => x.code === code);
      if(pos) counts[pos.cat]++;
    });
    const order = ['def','mei','ata'];
    let best = null, bestCount = 0;
    order.forEach(cat => {
      if(counts[cat] > bestCount){ bestCount = counts[cat]; best = cat; }
    });
    if(!best) return { code:null, label:'—', badge:'—', order:-1 };
    return { code:best, label:CATEGORY_LABEL[best], badge:CATEGORY_BADGE[best], order: order.indexOf(best) };
  }

  function genderBadge(g){
    if(g === 'M') return '<span class="gender-symbol male" title="Masculino">♂</span>';
    if(g === 'F') return '<span class="gender-symbol female" title="Feminino">♀</span>';
    return '<span class="gender-symbol none" title="Não informado">—</span>';
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
    if(e === 'gold') return 'linear-gradient(135deg,#ffd700,#c9a400)';
    if(e === 'ouro') return 'linear-gradient(135deg,#ffd700,#c9a400)';
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

  function loadPlayers(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        players = JSON.parse(raw).map(normalizePlayer);
      } else {
        players = seedData.map(normalizePlayer);
      }
    } catch(e){
      console.error('Erro ao carregar dados, usando lista inicial', e);
      players = seedData.map(normalizePlayer);
    }

    players.forEach(p => {
      if(p.cards.length === 1){
        const c = p.cards[0];
        if(!c.partidas && !c.gols && !c.assistencias){
          c.partidas = p.partidas; c.gols = p.gols; c.assistencias = p.assistencias;
        }
      }
    });
    savePlayers();

    render();
  }

  function savePlayers(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
      statusText.textContent = 'salvo localmente';
    } catch(e){
      console.error('Erro ao salvar dados', e);
      statusText.textContent = 'erro ao salvar';
    }
  }

  function ga(p){ return (Number(p.gols)||0) + (Number(p.assistencias)||0); }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function statValueForSort(p, key){
    if(key === 'ga') return ga(p);
    if(key === 'nome') return p.nome.toLowerCase();
    if(key === 'cartoes') return cardCount(p);
    if(key === 'categoria') return predominantCategory(p).order;
    if(key === 'genero') return p.genero || 'zzz';
    return Number(p[key]) || 0;
  }

  function sortedPlayers(){
    let arr = players.slice();

    if(searchTerm){
      arr = arr.filter(p => normalize(p.nome).includes(normalize(searchTerm)));
    }

    filterRows.forEach(row => {
      const stat = row.dataset.stat;
      const minInput = row.querySelector('.filter-min');
      const maxInput = row.querySelector('.filter-max');
      const min = minInput.value !== '' ? Number(minInput.value) : null;
      const max = maxInput.value !== '' ? Number(maxInput.value) : null;

      if(min !== null || max !== null){
        arr = arr.filter(p => {
          const valor = stat === 'ga' ? ga(p) : (stat === 'cartoes' ? cardCount(p) : Number(p[stat]) || 0);
          if(min !== null && valor < min) return false;
          if(max !== null && valor > max) return false;
          return true;
        });
      }
    });

    if(filterPosition.value){
      arr = arr.filter(p => p.positions.includes(filterPosition.value));
    }
    if(filterEdition.value){
      arr = arr.filter(p => p.cards.some(c => c.edition === filterEdition.value));
    }
    if(filterEvent.value.trim()){
      const term = normalize(filterEvent.value.trim());
      arr = arr.filter(p => p.cards.some(c => normalize(c.event||'').includes(term)));
    }
    if(filterGender.value){
      arr = arr.filter(p => p.genero === filterGender.value);
    }

    arr.sort((a,b) => {
      const va = statValueForSort(a, sortKey);
      const vb = statValueForSort(b, sortKey);
      if(va < vb) return -1 * sortDir;
      if(va > vb) return 1 * sortDir;
      return 0;
    });
    return arr;
  }

  function anyAdvancedFilterActive(){
    return searchTerm
      || Array.from(document.querySelectorAll('.filter-min, .filter-max')).some(el => el.value !== '')
      || filterPosition.value
      || filterEdition.value
      || filterEvent.value.trim()
      || filterGender.value;
  }

  function resetPageAndRender(){
    visibleCount = PAGE_SIZE;
    render();
  }

  /* ---------- CARTAS INDIVIDUAIS (achatadas) ---------- */
  function flattenCards(){
    const list = [];
    players.forEach(p => {
      (p.cards||[]).forEach(c => {
        list.push({
          cardId: c.id,
          playerId: p.id,
          playerName: p.nome,
          genero: p.genero,
          positions: c.positions || [],
          edition: c.edition || '',
          event: c.event || '',
          partidas: Number(c.partidas)||0,
          gols: Number(c.gols)||0,
          assistencias: Number(c.assistencias)||0
        });
      });
    });
    return list;
  }

  function cardCategory(card){
    return predominantCategory({positions: card.positions});
  }

  function cardStatValueForSort(c, key){
    if(key === 'ga') return (c.gols||0) + (c.assistencias||0);
    if(key === 'nome') return c.playerName.toLowerCase();
    if(key === 'genero') return c.genero || 'zzz';
    return Number(c[key]) || 0;
  }

  function sortedCards(){
    let arr = flattenCards();

    if(searchTerm){
      arr = arr.filter(c => normalize(c.playerName).includes(normalize(searchTerm)));
    }

    filterRows.forEach(row => {
      const stat = row.dataset.stat;
      if(stat === 'cartoes') return;
      const minInput = row.querySelector('.filter-min');
      const maxInput = row.querySelector('.filter-max');
      const min = minInput.value !== '' ? Number(minInput.value) : null;
      const max = maxInput.value !== '' ? Number(maxInput.value) : null;
      if(min !== null || max !== null){
        arr = arr.filter(c => {
          const valor = stat === 'ga' ? (c.gols+c.assistencias) : Number(c[stat]) || 0;
          if(min !== null && valor < min) return false;
          if(max !== null && valor > max) return false;
          return true;
        });
      }
    });

    if(filterPosition.value) arr = arr.filter(c => c.positions.includes(filterPosition.value));
    if(filterEdition.value) arr = arr.filter(c => c.edition === filterEdition.value);
    if(filterEvent.value.trim()){
      const term = normalize(filterEvent.value.trim());
      arr = arr.filter(c => normalize(c.event||'').includes(term));
    }
    if(filterGender.value) arr = arr.filter(c => c.genero === filterGender.value);

    arr.sort((a,b) => {
      const va = cardStatValueForSort(a, sortKey);
      const vb = cardStatValueForSort(b, sortKey);
      if(va < vb) return -1 * sortDir;
      if(va > vb) return 1 * sortDir;
      return 0;
    });
    return arr;
  }

  /* ---------- DETALHES (LEITURA + MODO EDIÇÃO DE POSIÇÕES) — VISÃO JOGADOR ---------- */
  function renderExpandBox(p){
    const positionsHtml = p.positions && p.positions.length
      ? p.positions.map(code => {
          const pos = POSITIONS.find(x => x.code === code);
          if(!pos) return '';
          return `<span class="pos-badge badge-${pos.cat}">${pos.code} · ${pos.label}</span>`;
        }).join('')
      : '<span class="compare-empty">Nenhuma posição registrada.</span>';

    const cardsHtml = p.cards.length
      ? p.cards.map((c, idx) => {
          const found = EDITIONS.find(e => e.value === c.edition);
          const edLabel = c.edition ? (found ? found.label : c.edition) : 'Não informado';
          const evLabel = c.event ? escapeHtml(c.event) : 'Não informado';
          const swatch = getCardSwatch(c.event, c.edition);

          const posEditHtml = positionsEditMode
            ? `<div class="card-pos-edit">${POSITIONS.map(pos => `
                <label class="position-item">
                  <input type="checkbox" class="card-pos-checkbox" data-player="${p.id}" data-card="${c.id}" data-code="${pos.code}" ${c.positions.includes(pos.code) ? 'checked' : ''}>
                  ${pos.code}
                </label>
              `).join('')}</div>`
            : '';

          const cardPosHtml = (c.positions && c.positions.length)
            ? c.positions.map(code => {
                const pos = POSITIONS.find(x => x.code === code);
                return pos ? `<span class="pos-badge badge-${pos.cat}">${pos.code}</span>` : '';
              }).join('')
            : '<span class="pos-badge badge-none">—</span>';

          return `<div class="card-row card-row-readonly">
            <span class="card-index">#${idx+1}</span>
            <div class="card-info">
              <span class="card-swatch" style="background:${swatch};" title="${evLabel}"></span>
              <span class="card-readonly-text"><strong>${edLabel}</strong> · ${evLabel}</span>
            </div>
            <div class="card-position-badges">${cardPosHtml}</div>
            <div class="card-stats-readonly">
              <div class="card-stat-pill"><span class="stat-value">${c.partidas}</span><span class="stat-label">Jogos</span></div>
              <div class="card-stat-pill"><span class="stat-value">${c.gols}</span><span class="stat-label">Gols</span></div>
              <div class="card-stat-pill"><span class="stat-value">${c.assistencias}</span><span class="stat-label">Assist</span></div>
              <div class="card-stat-pill ga"><span class="stat-value">${cardGA(c)}</span><span class="stat-label">G+A</span></div>
            </div>
            ${posEditHtml}
          </div>`;
        }).join('')
      : '<div class="compare-empty">Nenhuma carta registrada.</div>';

    return `
      <div class="expand-box">
        <div class="expand-section">
          <div class="expand-title">Posições jogadas (todas as cartas)</div>
          <div class="view-badges">${positionsHtml}</div>
        </div>
        <div class="expand-section">
          <div class="expand-title">Cartas registradas (${p.cards.length})</div>
          <div class="cards-list">${cardsHtml}</div>
        </div>
      </div>
    `;
  }

  /* ---------- DETALHES — VISÃO CARTA INDIVIDUAL ---------- */
  function renderCardDetailsBox(c){
    const posHtml = c.positions.length
      ? c.positions.map(code => {
          const pos = POSITIONS.find(x => x.code === code);
          return pos ? `<span class="pos-badge badge-${pos.cat}">${pos.code} · ${pos.label}</span>` : '';
        }).join('')
      : '<span class="compare-empty">Nenhuma posição registrada.</span>';

    return `<div class="expand-box">
      <div class="expand-section">
        <div class="expand-title">Gênero</div>
        <div class="view-badges">${genderBadge(c.genero)}</div>
      </div>
      <div class="expand-section">
        <div class="expand-title">Posições jogadas nesta carta</div>
        <div class="view-badges">${posHtml}</div>
      </div>
    </div>`;
  }

  /* ---------- CABEÇALHO DINÂMICO ---------- */
  const tableHead = document.getElementById('tableHead');
  tableHead.addEventListener('click', (e) => {
    const th = e.target.closest('th[data-key]');
    if(!th) return;
    const key = th.dataset.key;
    if(sortKey === key){ sortDir *= -1; }
    else { sortKey = key; sortDir = -1; }
    resetPageAndRender();
  });

  const PLAYER_HEAD_COLUMNS = [
    {key:'nome', label:'Jogador', left:true},
    {key:'partidas', label:'Partidas'},
    {key:'gols', label:'Gols'},
    {key:'assistencias', label:'Assistências'},
    {key:'ga', label:'G+A'},
    {key:'categoria', label:'Posição'},
    {key:'genero', label:'Gênero'},
    {key:'cartoes', label:'Cartinhas'},
    {key:null, label:'Detalhes'},
    {key:null, label:''}
  ];
  const CARD_HEAD_COLUMNS = [
    {key:'nome', label:'Jogador', left:true},
    {key:'partidas', label:'Partidas'},
    {key:'gols', label:'Gols'},
    {key:'assistencias', label:'Assistências'},
    {key:'ga', label:'G+A'},
    {key:null, label:'Edição'},
    {key:null, label:'Evento'},
    {key:null, label:'Detalhes'}
  ];

  function renderTableHead(){
    const columns = mainViewMode === 'player' ? PLAYER_HEAD_COLUMNS : CARD_HEAD_COLUMNS;
    tableHead.innerHTML = `<tr>${columns.map(col => {
      if(!col.key) return `<th>${col.label}</th>`;
      const sortedClass = col.key === sortKey ? ' sorted' : '';
      const alignAttr = col.left ? ' style="text-align:left;"' : '';
      return `<th data-key="${col.key}" class="${sortedClass}"${alignAttr}>${col.label} <span class="arrow">▲▼</span></th>`;
    }).join('')}</tr>`;
  }

  const mainViewPlayerBtn = document.getElementById('mainViewPlayerBtn');
  const mainViewCardBtn = document.getElementById('mainViewCardBtn');
  mainViewPlayerBtn.addEventListener('click', () => {
    mainViewMode = 'player';
    mainViewPlayerBtn.classList.add('active');
    mainViewCardBtn.classList.remove('active');
    sortKey = 'partidas'; sortDir = -1;
    resetPageAndRender();
  });
  mainViewCardBtn.addEventListener('click', () => {
    mainViewMode = 'card';
    mainViewCardBtn.classList.add('active');
    mainViewPlayerBtn.classList.remove('active');
    sortKey = 'partidas'; sortDir = -1;
    resetPageAndRender();
  });

  function render(){
    renderTableHead();
    if(mainViewMode === 'player') renderPlayerRows(); else renderCardRows();
  }

  function renderPlayerRows(){
    const fullList = sortedPlayers();

    if(fullList.length === 0){
      const msg = anyAdvancedFilterActive()
        ? 'Nenhum jogador encontrado com esses critérios.'
        : 'Nenhum jogador ainda. Adicione o primeiro acima.';
      tbody.innerHTML = `<tr class="empty-row"><td colspan="10">${msg}</td></tr>`;
      loadMoreWrap.style.display = 'none';
      return;
    }

    const list = fullList.slice(0, visibleCount);
    const byGA = players.slice().sort((a,b) => ga(b) - ga(a));
    const podiumIds = [byGA[0] && byGA[0].id, byGA[1] && byGA[1].id, byGA[2] && byGA[2].id];

    tbody.innerHTML = list.map(p => {
      const podiumIdx = podiumIds.indexOf(p.id);
      const podiumClass = podiumIdx === 0 ? 'top1' : podiumIdx === 1 ? 'top2' : podiumIdx === 2 ? 'top3' : '';
      const cat = predominantCategory(p);
      const isOpen = expandedIds.has(p.id);

      const mainRow = `<tr class="${podiumClass} row-player" data-id="${p.id}">
        <td class="nome" data-id="${p.id}">${escapeHtml(p.nome)}</td>
        <td data-label="Partidas">${p.partidas}</td>
        <td data-label="Gols">${p.gols}</td>
        <td data-label="Assistências">${p.assistencias}</td>
        <td class="ga" data-label="G+A">${ga(p)}</td>
        <td data-label="Posição"><span class="pos-badge badge-${cat.code || 'none'}">${cat.badge}</span></td>
        <td data-label="Gênero">${genderBadge(p.genero)}</td>
        <td class="cartoes" data-label="Cartinhas"><span class="cardstack-ic" aria-hidden="true"></span>${cardCount(p)}</td>
        <td><button class="detail-btn ${isOpen ? 'active' : ''}" data-id="${p.id}">${isOpen ? 'Fechar ▲' : 'Ver cartas ▾'}</button></td>
        <td>
          <button class="inc-btn" title="Registrar mais um uso" data-id="${p.id}">+</button>
          <button class="del-btn" title="Remover" data-id="${p.id}">&times;</button>
        </td>
      </tr>`;

      const expandRow = isOpen
        ? `<tr class="expand-row" data-expand-for="${p.id}"><td colspan="10">${renderExpandBox(p)}</td></tr>`
        : '';

      return mainRow + expandRow;
    }).join('');

    if(fullList.length > visibleCount){
      loadMoreWrap.style.display = 'flex';
      loadMoreBtn.textContent = `Ler mais (+${fullList.length - visibleCount})`;
    } else {
      loadMoreWrap.style.display = 'none';
    }
  }

  function renderCardRows(){
    const fullList = sortedCards();

    if(fullList.length === 0){
      tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Nenhuma carta encontrada com esses critérios.</td></tr>`;
      loadMoreWrap.style.display = 'none';
      return;
    }

    const list = fullList.slice(0, visibleCount);

    tbody.innerHTML = list.map(c => {
      const found = EDITIONS.find(e => e.value === c.edition);
      const edLabel = c.edition ? (found ? found.label : c.edition) : 'Não informado';
      const evLabel = c.event ? escapeHtml(c.event) : 'Não informado';
      const swatch = getCardSwatch(c.event, c.edition);
      const isOpen = expandedCardIds.has(c.cardId);

      const mainRow = `<tr class="row-card" data-card-id="${c.cardId}">
        <td class="nome"><span class="card-swatch" style="width:18px;height:18px;display:inline-block;vertical-align:middle;margin-right:8px;background:${swatch};"></span>${escapeHtml(c.playerName)}</td>
        <td data-label="Partidas">${c.partidas}</td>
        <td data-label="Gols">${c.gols}</td>
        <td data-label="Assistências">${c.assistencias}</td>
        <td class="ga" data-label="G+A">${c.gols + c.assistencias}</td>
        <td data-label="Edição">${edLabel}</td>
        <td data-label="Evento">${evLabel}</td>
        <td><button class="detail-btn card-detail-btn ${isOpen ? 'active' : ''}" data-card-id="${c.cardId}">${isOpen ? 'Fechar ▲' : 'Ver detalhes ▾'}</button></td>
      </tr>`;

      const expandRow = isOpen
        ? `<tr class="expand-row"><td colspan="8">${renderCardDetailsBox(c)}</td></tr>`
        : '';

      return mainRow + expandRow;
    }).join('');

    if(fullList.length > visibleCount){
      loadMoreWrap.style.display = 'flex';
      loadMoreBtn.textContent = `Ler mais (+${fullList.length - visibleCount})`;
    } else {
      loadMoreWrap.style.display = 'none';
    }
  }

  loadMoreBtn.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    render();
  });

  togglePosEdit.addEventListener('click', () => {
    positionsEditMode = !positionsEditMode;
    togglePosEdit.classList.toggle('active', positionsEditMode);
    togglePosEdit.textContent = positionsEditMode ? '✔️ Concluir edição' : '✏️ Editar posições';
    render();
  });

  /* ---------- MODAL DE CARTA (gênero + edição + evento + posições) ---------- */
  const cardModalOverlay = document.getElementById('cardModalOverlay');
  const cardModalTitle = document.getElementById('cardModalTitle');
  const modalEdition = document.getElementById('modalEdition');
  const modalEvent = document.getElementById('modalEvent');
  const modalEventList = document.getElementById('modalEventList');
  const modalPositions = document.getElementById('modalPositions');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');

  function updateModalEventList(){
    const opts = EVENTS_BY_EDITION[modalEdition.value] || [];
    modalEventList.innerHTML = opts.map(ev => `<option value="${escapeHtml(ev)}"></option>`).join('');
  }
  modalEdition.addEventListener('change', updateModalEventList);

  function askCardDetails(nome, existingPositions, existingGender){
    return new Promise(resolve => {
      cardModalTitle.textContent = `Registrar carta — ${nome}`;
      modalEdition.value = '';
      modalEvent.value = '';
      updateModalEventList();
      modalPositions.innerHTML = POSITIONS.map(pos => `
        <label class="position-item">
          <input type="checkbox" class="modal-pos-checkbox" value="${pos.code}" ${existingPositions.includes(pos.code) ? 'checked' : ''}>
          ${pos.code} · ${pos.label}
        </label>
      `).join('');

      document.querySelectorAll('.modal-gender-radio').forEach(radio => {
        radio.checked = (radio.value === existingGender);
      });

      cardModalOverlay.style.display = 'flex';

      function cleanup(){
        cardModalOverlay.style.display = 'none';
        modalConfirmBtn.removeEventListener('click', onConfirm);
        modalCancelBtn.removeEventListener('click', onCancel);
      }
      function onConfirm(){
        const genderRadio = document.querySelector('.modal-gender-radio:checked');
        if(!genderRadio){
          alert('Selecione o gênero.');
          return;
        }
        const edition = modalEdition.value;
        const event = modalEvent.value.trim();
        const checked = Array.from(modalPositions.querySelectorAll('.modal-pos-checkbox:checked')).map(cb => cb.value);
        if(checked.length === 0){
          alert('Selecione pelo menos uma posição.');
          return;
        }
        cleanup();
        resolve({ edition, event, positions: checked, gender: genderRadio.value });
      }
      function onCancel(){
        cleanup();
        resolve(null);
      }
      modalConfirmBtn.addEventListener('click', onConfirm);
      modalCancelBtn.addEventListener('click', onCancel);
    });
  }

  /* ---------- FORMULÁRIO: JOGADOR NOVO ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const nome = document.getElementById('nome').value.trim();
    const partidas = document.getElementById('partidas').value;
    const gols = document.getElementById('gols').value;
    const assistencias = document.getElementById('assistencias').value;

    if(!nome){
      errorMsg.textContent = 'Informe o nome do jogador.';
      return;
    }
    if([partidas,gols,assistencias].some(v => v === '' || Number(v) < 0)){
      errorMsg.textContent = 'Preencha todos os números com valores válidos (0 ou mais).';
      return;
    }

    const existente = players.find(p => normalize(p.nome) === normalize(nome));
    if(existente){
      errorMsg.textContent = `"${nome}" já existe na lista. Use o botão "+" na tabela para registrar mais um uso dele.`;
      return;
    }

    const cardInfo = await askCardDetails(nome, [], '');
    if(!cardInfo){
      errorMsg.textContent = 'Cadastro cancelado.';
      return;
    }

    players.push({
      id: nextId(),
      nome,
      partidas: Number(partidas),
      gols: Number(gols),
      assistencias: Number(assistencias),
      genero: cardInfo.gender,
      positions: cardInfo.positions.slice(),
      cards: [{ id: nextId(), edition: cardInfo.edition, event: cardInfo.event, partidas: Number(partidas), gols: Number(gols), assistencias: Number(assistencias), positions: cardInfo.positions.slice() }]
    });

    render();
    form.reset();
    document.getElementById('nome').focus();
    savePlayers();
  });

  /* ---------- REGISTRAR USO (JOGADOR EXISTENTE) ---------- */
  function askNumber(mensagem){
    const valor = prompt(mensagem);
    if(valor === null) return null;
    const num = Number(valor);
    if(valor.trim() === '' || isNaN(num) || num < 0) return undefined;
    return num;
  }

  async function registrarUso(id){
    const player = players.find(p => p.id === id);
    if(!player) return;

    const partidas = askNumber(`Quantas PARTIDAS nesse uso de "${player.nome}"?`);
    if(partidas === null) return;
    if(partidas === undefined){ alert('Valor inválido. Operação cancelada.'); return; }

    const gols = askNumber(`Quantos GOLS nesse uso de "${player.nome}"?`);
    if(gols === null) return;
    if(gols === undefined){ alert('Valor inválido. Operação cancelada.'); return; }

    const assistencias = askNumber(`Quantas ASSISTÊNCIAS nesse uso de "${player.nome}"?`);
    if(assistencias === null) return;
    if(assistencias === undefined){ alert('Valor inválido. Operação cancelada.'); return; }

    const cardInfo = await askCardDetails(player.nome, player.positions, player.genero);
    if(!cardInfo){
      alert('Registro cancelado.');
      return;
    }

    player.partidas += partidas;
    player.gols += gols;
    player.assistencias += assistencias;
    player.genero = cardInfo.gender;
    player.cards.push({ id: nextId(), edition: cardInfo.edition, event: cardInfo.event, partidas, gols, assistencias, positions: cardInfo.positions.slice() });
    player.positions = computePlayerPositions(player);

    render();
    savePlayers();
  }

  /* ---------- EVENTOS DA TABELA (clique) ---------- */
  tbody.addEventListener('click', (e) => {
    const cardDetailBtn = e.target.closest('.card-detail-btn');
    if(cardDetailBtn){
      const id = cardDetailBtn.dataset.cardId;
      if(expandedCardIds.has(id)) expandedCardIds.delete(id); else expandedCardIds.add(id);
      render();
      return;
    }

    const nomeCell = e.target.closest('td.nome');
    if(nomeCell && nomeCell.dataset.id){
      const id = nomeCell.dataset.id;
      if(expandedIds.has(id)) expandedIds.delete(id); else expandedIds.add(id);
      render();
      return;
    }

    const detailBtn = e.target.closest('.detail-btn');
    if(detailBtn){
      const id = detailBtn.dataset.id;
      if(expandedIds.has(id)) expandedIds.delete(id); else expandedIds.add(id);
      render();
      return;
    }

    const incBtn = e.target.closest('.inc-btn');
    if(incBtn){ registrarUso(incBtn.dataset.id); return; }

    const delBtn = e.target.closest('.del-btn');
    if(delBtn){
      const id = delBtn.dataset.id;
      const player = players.find(p => p.id === id);
      if(player && !confirm(`Remover "${player.nome}" da lista?`)) return;
      players = players.filter(p => p.id !== id);
      expandedIds.delete(id);
      render();
      savePlayers();
    }
  });

  /* ---------- EVENTOS DA TABELA (mudança — edição de posição por carta) ---------- */
  tbody.addEventListener('change', (e) => {
    const posCheckbox = e.target.closest('.card-pos-checkbox');
    if(!posCheckbox) return;
    const player = players.find(p => p.id === posCheckbox.dataset.player);
    if(!player) return;
    const card = player.cards.find(c => c.id === posCheckbox.dataset.card);
    if(!card) return;

    const code = posCheckbox.dataset.code;
    if(posCheckbox.checked){
      if(!card.positions.includes(code)) card.positions.push(code);
    } else {
      card.positions = card.positions.filter(c => c !== code);
    }
    player.positions = computePlayerPositions(player);
    render();
    savePlayers();
  });

  /* ---------- BUSCA E FILTROS ---------- */
  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value.trim();
    resetPageAndRender();
  });

  toggleFilters.addEventListener('click', () => {
    const isOpen = filtersBody.style.display !== 'none';
    filtersBody.style.display = isOpen ? 'none' : 'flex';
    toggleFilters.classList.toggle('open', !isOpen);
  });

  document.querySelectorAll('.filter-min, .filter-max').forEach(el => {
    el.addEventListener('input', () => resetPageAndRender());
  });
  filterPosition.addEventListener('change', resetPageAndRender);
  filterEdition.addEventListener('change', resetPageAndRender);
  filterEvent.addEventListener('input', resetPageAndRender);
  filterGender.addEventListener('change', resetPageAndRender);

  clearFiltersBtn.addEventListener('click', () => {
    document.querySelectorAll('.filter-min, .filter-max').forEach(el => el.value = '');
    filterPosition.value = '';
    filterEdition.value = '';
    filterEvent.value = '';
    filterGender.value = '';
    resetPageAndRender();
  });

  /* ---------- BACKUP ---------- */
  exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(players, null, 2);
    const blob = new Blob([dataStr], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dataAtual = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `fifa_legends_backup_${dataAtual}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener('click', () => {
    importFile.value = '';
    importFile.click();
  });

  importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    try{
      const text = await file.text();
      const importados = JSON.parse(text);

      if(!Array.isArray(importados)){
        alert('Arquivo inválido: esperava uma lista de jogadores.');
        return;
      }

      let adicionados = 0;
      let atualizados = 0;

      importados.forEach(p => {
        if(!p || typeof p.nome !== 'string') return;
        const idx = players.findIndex(existing => normalize(existing.nome) === normalize(p.nome));
        if(idx !== -1){
          const existingId = players[idx].id;
          const atualizado = normalizePlayer(p);
          atualizado.id = existingId;
          players[idx] = atualizado;
          atualizados++;
        } else {
          players.push(normalizePlayer(p));
          adicionados++;
        }
      });

      render();
      savePlayers();
      alert(`Importação concluída: ${adicionados} jogador(es) novo(s) adicionado(s), ${atualizados} já existente(s) atualizado(s) com os dados do backup.`);
    } catch(err){
      console.error('Erro ao importar arquivo', err);
      alert('Não foi possível ler esse arquivo. Verifique se é um .json válido exportado por este mesmo sistema.');
    }
  });

  loadPlayers();
})();