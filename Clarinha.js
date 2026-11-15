(function(){
  /* ---------- GLITTER (mantido igual) ---------- */
  const canvas = document.getElementById('glitterCanvas');
  const ctx = canvas.getContext('2d');

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#ff8fc7', '#ffd166', '#ffe08a', '#ffb6d9', '#ffd700', '#ff6fb0'];

  function makeParticle(burst){
    return {
      x: Math.random() * canvas.width,
      y: burst ? Math.random() * -canvas.height : -20,
      size: Math.random() * 5 + 3,
      speedY: Math.random() * 2.5 + 1.5,
      speedX: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? 'circle' : 'star',
      opacity: Math.random() * 0.5 + 0.5
    };
  }

  let particles = Array.from({length: 220}, () => makeParticle(true));

  function drawStar(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.beginPath();
    for(let i = 0; i < 5; i++){
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * p.size, -Math.sin((18 + i * 72) * Math.PI / 180) * p.size);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * p.size * 0.5, -Math.sin((54 + i * 72) * Math.PI / 180) * p.size * 0.5);
    }
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.fill();
    ctx.restore();
  }

  function drawCircle(p){
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.fill();
  }

  let lastSprinkle = 0;

  function animateGlitter(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      if(p.shape === 'star') drawStar(p); else drawCircle(p);
    });
    particles = particles.filter(p => p.y < canvas.height + 20);
    if(!lastSprinkle || timestamp - lastSprinkle > 220){
      if(particles.length < 90) particles.push(makeParticle(false));
      lastSprinkle = timestamp;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animateGlitter);
  }
  requestAnimationFrame(animateGlitter);

  function burstConfetti(){
    for(let i = 0; i < 80; i++) particles.push(makeParticle(false));
  }

  /* ---------- JOGADORES FOFOS DA CLARINHA ---------- */
  const STORAGE_KEY = 'clarinha_favorite_players';
  let favorites = [];

  const favForm = document.getElementById('favForm');
  const favTbody = document.getElementById('favTbody');
  const favErrorMsg = document.getElementById('favErrorMsg');

  function nextId(){
    return 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
  }

  function ga(p){ return (Number(p.gols)||0) + (Number(p.assistencias)||0); }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function loadFavorites(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      favorites = raw ? JSON.parse(raw) : [];
    } catch(e){
      console.error('Erro ao carregar favoritos', e);
      favorites = [];
    }
    renderFavorites();
  }

  function saveFavorites(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch(e){
      console.error('Erro ao salvar favoritos', e);
    }
  }

  function renderFavorites(){
    if(favorites.length === 0){
      favTbody.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhum fofinho adicionado ainda! Adicione o primeiro acima 💖</td></tr>';
      return;
    }
    favTbody.innerHTML = favorites.map(p => `
      <tr>
        <td>${escapeHtml(p.nome)}</td>
        <td>${p.partidas}</td>
        <td>${p.gols}</td>
        <td>${p.assistencias}</td>
        <td class="ga">${ga(p)}</td>
        <td><button class="heart-btn" data-id="${p.id}" title="Remover">💔</button></td>
      </tr>
    `).join('');
  }

  favTbody.addEventListener('click', (e) => {
    const btn = e.target.closest('.heart-btn');
    if(!btn) return;
    const id = btn.dataset.id;
    const player = favorites.find(p => p.id === id);
    if(player && !confirm(`Remover "${player.nome}" do time dos fofinhos? 🥺`)) return;
    favorites = favorites.filter(p => p.id !== id);
    renderFavorites();
    saveFavorites();
  });

  /* ---------- MENSAGEM FOFA ---------- */
  const cuteMessages = [
    'Mais um craquinha entrou pro time da Clarinha! 🦄💖',
    'Ele agora mora no coraçãozinho dela! ✨',
    'Adicionado com todo o carinho do mundo! 🌈',
    'Um fofinho a mais na coleção mais linda! 💗',
    'Clarinha tem o melhor time de todos! 🥰',
    'Esse aí já é craque de coração! 💫',
    'Registrado com brilho e purpurina! ✨🦄',
    'Mais uma estrelinha no time dela! 🌟'
  ];

  const cuteModalOverlay = document.getElementById('cuteModalOverlay');
  const cuteModalMessage = document.getElementById('cuteModalMessage');
  const cuteModalClose = document.getElementById('cuteModalClose');

  function showCuteMessage(){
    const msg = cuteMessages[Math.floor(Math.random() * cuteMessages.length)];
    cuteModalMessage.textContent = msg;
    cuteModalOverlay.style.display = 'flex';
    burstConfetti();
  }

  cuteModalClose.addEventListener('click', () => {
    cuteModalOverlay.style.display = 'none';
  });

  /* ---------- FORMULÁRIO ---------- */
  favForm.addEventListener('submit', (e) => {
    e.preventDefault();
    favErrorMsg.textContent = '';

    const nome = document.getElementById('favNome').value.trim();
    const partidas = document.getElementById('favPartidas').value;
    const gols = document.getElementById('favGols').value;
    const assistencias = document.getElementById('favAssist').value;

    if(!nome){
      favErrorMsg.textContent = 'Coloca o nome do fofinho! 🥺';
      return;
    }
    if([partidas,gols,assistencias].some(v => v === '' || Number(v) < 0)){
      favErrorMsg.textContent = 'Preenche todos os números certinho! 💗';
      return;
    }

    favorites.push({
      id: nextId(),
      nome,
      partidas: Number(partidas),
      gols: Number(gols),
      assistencias: Number(assistencias)
    });

    renderFavorites();
    favForm.reset();
    document.getElementById('favNome').focus();
    saveFavorites();
    showCuteMessage();
  });

  loadFavorites();
})();