(function(){
  const STORAGE_KEY = 'fifa_lost_media_cards';
  let entries = [];

  const POSITIONS = [
    {code:'GOL', label:'Goleiro'}, {code:'ZAG', label:'Zagueiro'},
    {code:'LE', label:'Lateral Esq.'}, {code:'LD', label:'Lateral Dir.'},
    {code:'VOL', label:'Volante'}, {code:'MC', label:'Meio Central'},
    {code:'MCA', label:'Meio Avançado'}, {code:'ATA', label:'Atacante'},
    {code:'PE', label:'Ponta Esq.'}, {code:'PD', label:'Ponta Dir.'}
  ];

    const EDITION_LABEL = {fifa19:'FIFA 19', fifa20:'FIFA 20', fifa21:'FIFA 21', fifa22:'FIFA 22', fifa23:'FIFA 23', fc24:'EA FC 24', fc25:'EA FC 25', fc26:'EA FC 26'};
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
    fc26: [...BASE_RARITIES, ...COMMON_EVENTS, 'Ones to Watch','TOTW','TOTY','TOTY Icon Swaps','Knockout Royalty','Fantasy FC','Fantasy FUT Hero','Thunderstruck','UT Birthday','Trophy Titans','Road to the Finals','Road to the Knockouts','TOTS','Time Warp','Royalty Knockout','Pro Live','Black Friday','Joga Bonito','Unbreakables','Winter Wildcards','Winter Wildcards Hero','Future Stars','Icon Future Stars','Grassroots Greats','Icon Grassroots Greats','World Cup Path to Glory','World Cup Phenoms','Summer Stars','Glory Hunters','Greats of the Game','Festival of Football Captains','World Tour Silver Star Icon','Icon Festival of Football','Icon FUT Birthday','Icon Thunderstruck','Icon TOTY','Icon Winter Wildcards','FUT Birthday Hero','Ratings Reload','TOTY Hero','Squad Foundations','World Tour','Ultimate Scream','Ultimate Scream Hero','Icons','Champions League Icon','FC Champions Icon','Flashback','Festival of Football Prodigies','Heroes','FUTTIES','FUTTIES Hero','Showdown','FC Pro Open']
  };

  const lostForm = document.getElementById('lostForm');
  const lostTbody = document.getElementById('lostTbody');
  const lostErrorMsg = document.getElementById('lostErrorMsg');
  const lostSearchInput = document.getElementById('lostSearchInput');
  let searchTerm = '';

  function nextId(){ return 'l_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); }
  function ga(e){ return (Number(e.gols)||0) + (Number(e.assistencias)||0); }
  function normalize(str){ return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function loadEntries(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      entries = raw ? JSON.parse(raw) : [];
    } catch(e){
      console.error('Erro ao carregar arquivo perdido', e);
      entries = [];
    }
    render();
  }

  function saveEntries(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
    catch(e){ console.error('Erro ao salvar', e); }
  }

  function render(){
    let list = entries.slice();
    if(searchTerm){
      list = list.filter(e => normalize(e.nome).includes(normalize(searchTerm)));
    }

    if(list.length === 0){
      lostTbody.innerHTML = `<tr class="empty-row"><td colspan="9">${searchTerm ? 'Nenhuma memória encontrada.' : 'Arquivo vazio. Registre a primeira carta perdida acima.'}</td></tr>`;
      return;
    }

    lostTbody.innerHTML = list.map(e => {
      const posHtml = (e.positions||[]).map(code => `<span class="pos-mini">${code}</span>`).join('');
      const notesTitle = e.notes ? escapeHtml(e.notes) : '';
      return `<tr>
        <td class="nome">${escapeHtml(e.nome)} ${e.notes ? `<span class="notes-icon" title="${notesTitle}">📝</span>` : ''}</td>
        <td>${EDITION_LABEL[e.edition] || e.edition}</td>
        <td>${e.event ? escapeHtml(e.event) : '—'}</td>
        <td>${posHtml || '—'}</td>
        <td>${e.partidas}</td>
        <td>${e.gols}</td>
        <td>${e.assistencias}</td>
        <td>${ga(e)}</td>
        <td><button class="del-btn-lost" data-id="${e.id}" title="Remover">&times;</button></td>
      </tr>`;
    }).join('');
  }

  /* ---------- MODAL DE CARTA (edição + evento + posições + observação) ---------- */
  const lostModalOverlay = document.getElementById('lostModalOverlay');
  const lostModalTitle = document.getElementById('lostModalTitle');
  const lostModalEdition = document.getElementById('lostModalEdition');
  const lostModalEvent = document.getElementById('lostModalEvent');
  const lostModalPositions = document.getElementById('lostModalPositions');
  const lostModalNotes = document.getElementById('lostModalNotes');
  const lostModalConfirmBtn = document.getElementById('lostModalConfirmBtn');
  const lostModalCancelBtn = document.getElementById('lostModalCancelBtn');

  lostModalPositions.innerHTML = POSITIONS.map(pos => `
    <label class="position-item">
      <input type="checkbox" class="lost-modal-pos-checkbox" value="${pos.code}">
      ${pos.code} · ${pos.label}
    </label>
  `).join('');

    lostModalEdition.addEventListener('change', () => {
    const opts = EVENTS_BY_EDITION[lostModalEdition.value] || [];
    document.getElementById('lostEventList').innerHTML = opts.map(ev => `<option value="${ev}"></option>`).join('');
  });

  function askLostCardDetails(nome){
    return new Promise(resolve => {
      lostModalTitle.textContent = `Registrar carta — ${nome}`;
      lostModalEdition.value = '';
      lostModalEvent.value = '';
            document.getElementById('lostEventList').innerHTML = '';
      lostModalNotes.value = '';
      document.querySelectorAll('.lost-modal-pos-checkbox').forEach(cb => cb.checked = false);

      lostModalOverlay.style.display = 'flex';

      function cleanup(){
        lostModalOverlay.style.display = 'none';
        lostModalConfirmBtn.removeEventListener('click', onConfirm);
        lostModalCancelBtn.removeEventListener('click', onCancel);
      }
      function onConfirm(){
        const edition = lostModalEdition.value;
        if(!edition){ alert('Selecione a edição.'); return; }
        const event = lostModalEvent.value.trim();
        const notes = lostModalNotes.value.trim();
        const positions = Array.from(document.querySelectorAll('.lost-modal-pos-checkbox:checked')).map(cb => cb.value);
        if(positions.length === 0){ alert('Selecione pelo menos uma posição.'); return; }
        cleanup();
        resolve({ edition, event, positions, notes });
      }
      function onCancel(){
        cleanup();
        resolve(null);
      }
      lostModalConfirmBtn.addEventListener('click', onConfirm);
      lostModalCancelBtn.addEventListener('click', onCancel);
    });
  }

  /* ---------- FORMULÁRIO ---------- */
  lostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    lostErrorMsg.textContent = '';

    const nome = document.getElementById('lostNome').value.trim();
    const partidas = document.getElementById('lostPartidas').value;
    const gols = document.getElementById('lostGols').value;
    const assistencias = document.getElementById('lostAssist').value;

    if(!nome){ lostErrorMsg.textContent = 'Informe o nome do jogador.'; return; }
    if([partidas,gols,assistencias].some(v => v === '' || Number(v) < 0)){
      lostErrorMsg.textContent = 'Preencha as estimativas com valores válidos (0 ou mais).';
      return;
    }

    const cardInfo = await askLostCardDetails(nome);
    if(!cardInfo){
      lostErrorMsg.textContent = 'Registro cancelado.';
      return;
    }

    entries.push({
      id: nextId(),
      nome,
      edition: cardInfo.edition,
      event: cardInfo.event,
      partidas: Number(partidas), gols: Number(gols), assistencias: Number(assistencias),
      positions: cardInfo.positions,
      notes: cardInfo.notes
    });

    render();
    lostForm.reset();
    document.getElementById('lostNome').focus();
    saveEntries();
  });

  lostTbody.addEventListener('click', (e) => {
    const btn = e.target.closest('.del-btn-lost');
    if(!btn) return;
    const entry = entries.find(x => x.id === btn.dataset.id);
    if(entry && !confirm(`Apagar a memória de "${entry.nome}"?`)) return;
    entries = entries.filter(x => x.id !== btn.dataset.id);
    render();
    saveEntries();
  });

  lostSearchInput.addEventListener('input', () => {
    searchTerm = lostSearchInput.value.trim();
    render();
  });

  loadEntries();
})();