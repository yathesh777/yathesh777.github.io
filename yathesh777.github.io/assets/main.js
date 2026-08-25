(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  // Page transition navigation.
  document.querySelectorAll('[data-transition]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.href;
      if (!href || new URL(href, location.href).origin !== location.origin) return;
      if (reduce) return;
      e.preventDefault();
      const curtain = document.querySelector('.curtain');
      if (curtain) {
        curtain.style.animation = 'none';
        curtain.style.transform = 'scaleY(1)';
        curtain.offsetHeight;
        curtain.style.animation = 'curtainOut .34s cubic-bezier(.22,.68,0,1) forwards';
      }
      setTimeout(() => { location.href = href; }, 340);
    });
  });

  // Mobile nav.
  const menu = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menu && navLinks) {
    menu.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
  }

  // Reveal on scroll.
  const revealNodes = document.querySelectorAll('.reveal, .reveal-stagger');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .14 });
  revealNodes.forEach(n => revealObserver.observe(n));

  // Timeline rail.
  const timeline = document.querySelector('.timeline-wrap');
  const fill = document.querySelector('.timeline-fill');
  if (timeline && fill) {
    const update = () => {
      const r = timeline.getBoundingClientRect();
      const total = r.height - window.innerHeight * .55;
      const progress = Math.max(0, Math.min(1, (window.innerHeight * .55 - r.top) / Math.max(total, 1)));
      fill.style.height = `${progress * 100}%`;
    };
    window.addEventListener('scroll', update, { passive:true });
    update();
    document.querySelectorAll('.timeline-item').forEach(item => {
      const io = new IntersectionObserver(es => es.forEach(x => { if(x.isIntersecting) item.classList.add('is-visible'); }), {threshold:.3});
      io.observe(item);
    });
  }

  // Skill bars.
  document.querySelectorAll('.skill-row').forEach(row => {
    const io = new IntersectionObserver(es => es.forEach(x => {
      if (!x.isIntersecting) return;
      const level = row.dataset.level || 70;
      const bar = row.querySelector('.bar i');
      if (bar) bar.style.width = `${level}%`;
      io.unobserve(row);
    }), {threshold:.35});
    io.observe(row);
  });

  // Client-side portfolio index.
  const data = [
    {label:'AutoML App', tags:['automl','python','machine learning','fastapi','flask','training','inference'], desc:'Automatic preprocessing, feature engineering, training, model comparison, inference, and result delivery.'},
    {label:'MCP Project — Dot Fit Desk', tags:['mcp','genai','ai workflow','rest api','react','frontend'], desc:'Modular AI workflow components with REST APIs and frontend integration.'},
    {label:'Horseless Carriage Spares', tags:['java','jsp','servlets','mysql','jdbc','ecommerce','inventory'], desc:'Role-based automotive spare-parts commerce platform with ordering and tracking.'},
    {label:'CNN-based Skin Detection', tags:['cnn','deep learning','tensorflow','keras','opencv','flask','images'], desc:'Dermoscopic image classification with normalization, augmentation, transfer learning, and a Flask UI.'},
    {label:'Core stack', tags:['python','sql','pytorch','fastapi','flask','aws','power bi','tableau','ui ux'], desc:'Practical engineering stack spanning ML, APIs, cloud, data analytics, and UI/UX.'}
  ];
  function rank(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return data.map(item => {
      let points = 0;
      terms.forEach(t => {
        item.tags.forEach(tag => { if (tag === t) points += 4; else if (tag.includes(t) || t.includes(tag)) points += 2; });
        if (item.label.toLowerCase().includes(t)) points += 3;
        if (item.desc.toLowerCase().includes(t)) points += 1;
      });
      return {...item, points};
    }).filter(x => x.points > 0).sort((a,b) => b.points-a.points).slice(0,4);
  }
  const searchForm = document.querySelector('#search-form');
  const input = document.querySelector('#search-input');
  const results = document.querySelector('#search-results');
  function renderSearch(q) {
    const ranked = rank(q);
    if (!ranked.length) { results.innerHTML = '<div class="result-placeholder mono">No strong match. Try a core skill or project keyword.</div>'; return; }
    const max = Math.max(...ranked.map(x=>x.points));
    results.innerHTML = ranked.map(x => `<div class="result"><div><div class="result-title">${x.label}</div><div class="result-desc">${x.desc}</div></div><div class="score">${Math.min(.99,.72 + x.points/max*.25).toFixed(2)} similarity</div></div>`).join('');
  }
  if (searchForm && input && results) {
    searchForm.addEventListener('submit', e => { e.preventDefault(); renderSearch(input.value); });
    document.querySelectorAll('.try-chip').forEach(btn => btn.addEventListener('click', () => { input.value = btn.textContent.trim(); renderSearch(input.value); input.focus(); }));
  }

  // Interactive terminal.
  const output = document.querySelector('#shell-output');
  const commandForm = document.querySelector('#terminal-form');
  const commandInput = document.querySelector('#terminal-command');
  const commandButtons = document.querySelectorAll('.command-chip');
  const commands = {
    help: '<div>help · email · call · linkedin · resume · location</div>',
    email: '<div>email → <a class="success" href="mailto:yatheshkumar8@gmail.com">yatheshkumar8@gmail.com</a></div>',
    call: '<div>call → <a class="success" href="tel:+919566517450">+91 95665 17450</a></div>',
    linkedin: '<div>linkedin → <a class="success" href="https://www.linkedin.com/in/yathesh-kumar-p-937830291/" target="_blank" rel="noopener">open profile ↗</a></div>',
    resume: '<div>resume → <a class="success" href="assets/resume.pdf">download PDF ↗</a></div>',
    location: '<div>location → Chennai, Tamil Nadu · India</div>'
  };
  function runCommand(cmd){
    if(!output) return;
    const key = cmd.trim().toLowerCase();
    const response = commands[key] || `<div class="dim">command not found: ${key}. Try <b>help</b>.</div>`;
    output.insertAdjacentHTML('beforeend', `<div class="prompt">$ ${key}</div>${response}`);
    output.scrollTop = output.scrollHeight;
  }
  commandButtons.forEach(btn => btn.addEventListener('click', () => runCommand(btn.dataset.command)));
  if(commandForm && commandInput) commandForm.addEventListener('submit', e => { e.preventDefault(); runCommand(commandInput.value); commandInput.value=''; });

  // Sparkle cursor on fine pointers only.
  if (!coarse && !reduce) {
    document.documentElement.classList.add('has-cursor');
    const canvas = document.querySelector('#sparkle-canvas');
    const cursor = document.querySelector('#sparkle-cursor');
    if (canvas && cursor) {
      const ctx = canvas.getContext('2d'); let dpr = Math.min(window.devicePixelRatio || 1, 2); const particles=[]; let lastX=innerWidth/2,lastY=innerHeight/2;
      function resize(){dpr=Math.min(devicePixelRatio||1,2); canvas.width=innerWidth*dpr; canvas.height=innerHeight*dpr; canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px'; ctx.setTransform(dpr,0,0,dpr,0,0)}
      resize(); window.addEventListener('resize',resize);
      function spawn(x,y){for(let i=0;i<2;i++)particles.push({x:x+(Math.random()-.5)*9,y:y+(Math.random()-.5)*9,vy:-.35-Math.random()*.7,life:1,rot:Math.random()*Math.PI,size:1.2+Math.random()*2})}
      function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.y+=p.vy;p.life-=.025; if(p.life<=0){particles.splice(i,1);continue;} ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=p.life;ctx.shadowBlur=7;ctx.shadowColor=Math.random()>.5?'#F2B84B':'#7C83FD';ctx.fillStyle=Math.random()>.5?'#F7CD79':'#9CA2FF';ctx.beginPath();ctx.moveTo(0,-p.size*2);ctx.lineTo(p.size*.65,0);ctx.lineTo(0,p.size*2);ctx.lineTo(-p.size*.65,0);ctx.closePath();ctx.fill();ctx.restore()}requestAnimationFrame(draw)} draw();
      window.addEventListener('mousemove',e=>{cursor.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;if(Math.hypot(e.clientX-lastX,e.clientY-lastY)>14){spawn(e.clientX,e.clientY);lastX=e.clientX;lastY=e.clientY}});
      document.querySelectorAll('a,button,input,textarea,.chip').forEach(el=>{el.addEventListener('mouseenter',()=>{cursor.style.color='var(--violet)';cursor.style.transform += ' scale(1.35)'});el.addEventListener('mouseleave',()=>{cursor.style.color='var(--amber)';})});
    }
  }
})();
