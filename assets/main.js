(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // Keep navigation instant for normal browser behavior. The curtain is now purely visual.
  document.querySelectorAll('[data-transition]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.href;
      if (!href || new URL(href, location.href).origin !== location.origin || reduceMotion) return;
      event.preventDefault();
      const curtain = document.querySelector('.curtain');
      if (curtain) {
        curtain.classList.remove('leave');
        void curtain.offsetWidth;
        curtain.classList.add('leave');
      }
      window.setTimeout(() => { window.location.href = href; }, 280);
    });
  });

  // Mobile navigation.
  const menu = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menu && navLinks) {
    menu.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    }));
  }

  // Scroll progress indicator.
  const progress = document.querySelector('.scroll-progress span');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  // Reveal on scroll.
  const revealNodes = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealNodes.forEach(node => revealObserver.observe(node));
  } else {
    revealNodes.forEach(node => node.classList.add('in-view'));
  }

  // Timeline rail.
  const timeline = document.querySelector('.timeline-wrap');
  const fill = document.querySelector('.timeline-fill');
  if (timeline && fill) {
    const updateTimeline = () => {
      const rect = timeline.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight * 0.55, 1);
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.55 - rect.top) / total));
      fill.style.height = `${progress * 100}%`;
    };
    updateTimeline();
    window.addEventListener('scroll', updateTimeline, { passive: true });
    document.querySelectorAll('.timeline-item').forEach(item => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting && item.classList.add('is-visible'));
      }, { threshold: 0.25 });
      observer.observe(item);
    });
  }

  // Animated skill bars.
  document.querySelectorAll('.skill-row').forEach(row => {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = row.querySelector('.bar i');
      if (bar) bar.style.width = `${row.dataset.level || 70}%`;
      io.unobserve(row);
    }), { threshold: 0.35 });
    io.observe(row);
  });

  // Client-side portfolio index / lightweight retrieval demo.
  const data = [
    { label: 'AutoML App', tags: ['automl','python','machine learning','fastapi','flask','training','inference'], desc: 'Automatic preprocessing, feature engineering, model training, comparison, inference, and result delivery.' },
    { label: 'MCP Project — Dot Fit Desk', tags: ['mcp','genai','ai workflow','rest api','react','frontend'], desc: 'Modular AI workflow components with REST APIs and frontend integration.' },
    { label: 'Horseless Carriage Spares', tags: ['java','jsp','servlets','mysql','jdbc','ecommerce','inventory'], desc: 'Role-based automotive spare-parts commerce platform with ordering and tracking.' },
    { label: 'CNN-based Skin Detection', tags: ['cnn','deep learning','tensorflow','keras','opencv','flask','images'], desc: 'Dermoscopic image classification with normalization, augmentation, transfer learning, and a Flask UI.' },
    { label: 'Core Stack', tags: ['python','sql','pytorch','fastapi','flask','aws','power bi','tableau','ui ux'], desc: 'Practical stack spanning ML, APIs, cloud, analytics, and product-facing UI work.' }
  ];

  const escapeHTML = value => value.replace(/[&<>'"]/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
  const rank = query => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return data.map(item => {
      let points = 0;
      terms.forEach(term => {
        item.tags.forEach(tag => {
          if (tag === term) points += 5;
          else if (tag.includes(term) || term.includes(tag)) points += 2;
        });
        if (item.label.toLowerCase().includes(term)) points += 3;
        if (item.desc.toLowerCase().includes(term)) points += 1;
      });
      return { ...item, points };
    }).filter(item => item.points > 0).sort((a,b) => b.points - a.points).slice(0, 4);
  };

  const searchForm = document.querySelector('#search-form');
  const searchInput = document.querySelector('#search-input');
  const results = document.querySelector('#search-results');
  const renderSearch = query => {
    if (!results) return;
    const ranked = rank(query);
    if (!ranked.length) {
      results.innerHTML = '<div class="result-placeholder mono">No strong match. Try a core skill or project keyword.</div>';
      return;
    }
    const max = Math.max(...ranked.map(item => item.points));
    results.innerHTML = ranked.map(item => {
      const score = Math.min(0.99, 0.72 + item.points / max * 0.25).toFixed(2);
      return `<article class="result"><div><div class="result-title">${escapeHTML(item.label)}</div><div class="result-desc">${escapeHTML(item.desc)}</div></div><div class="score">${score} similarity</div></article>`;
    }).join('');
  };
  if (searchForm && searchInput && results) {
    searchForm.addEventListener('submit', e => { e.preventDefault(); renderSearch(searchInput.value); });
    document.querySelectorAll('.try-chip').forEach(btn => btn.addEventListener('click', () => {
      searchInput.value = btn.textContent.trim();
      renderSearch(searchInput.value);
      searchInput.focus();
    }));
  }

  // Contact terminal.
  const output = document.querySelector('#shell-output');
  const commandForm = document.querySelector('#terminal-form');
  const commandInput = document.querySelector('#terminal-command');
  const commands = {
    help: '<div>help · email · call · linkedin · resume · location</div>',
    email: '<div>email → <a class="success" href="mailto:yatheshkumar8@gmail.com">yatheshkumar8@gmail.com</a></div>',
    call: '<div>call → <a class="success" href="tel:+919566517450">+91 95665 17450</a></div>',
    linkedin: '<div>linkedin → <a class="success" href="https://www.linkedin.com/in/yathesh-kumar-p-937830291/" target="_blank" rel="noopener">open profile ↗</a></div>',
    resume: '<div>resume → <a class="success" href="assets/resume.pdf">download PDF ↗</a></div>',
    location: '<div>location → Chennai, Tamil Nadu · India</div>'
  };
  function runCommand(command) {
    if (!output) return;
    const key = command.trim().toLowerCase();
    if (!key) return;
    const response = commands[key] || `<div class="dim">command not found: ${escapeHTML(key)}. Try <b>help</b>.</div>`;
    output.insertAdjacentHTML('beforeend', `<div class="prompt">$ ${escapeHTML(key)}</div>${response}`);
    output.scrollTop = output.scrollHeight;
  }
  document.querySelectorAll('.command-chip').forEach(btn => btn.addEventListener('click', () => runCommand(btn.dataset.command || '')));
  if (commandForm && commandInput) commandForm.addEventListener('submit', e => {
    e.preventDefault();
    runCommand(commandInput.value);
    commandInput.value = '';
  });

  // Safer custom pointer: it enhances the mouse but NEVER disables the real browser pointer.
  if (finePointer && !reduceMotion) {
    document.documentElement.classList.add('enhanced-pointer');
    const canvas = document.querySelector('#sparkle-canvas');
    const pointerGlow = document.querySelector('#pointer-glow');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const particles = [];
      let dpr = 1;
      let lastX = -999, lastY = -999;
      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(innerWidth * dpr);
        canvas.height = Math.floor(innerHeight * dpr);
        canvas.style.width = `${innerWidth}px`;
        canvas.style.height = `${innerHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      const spawn = (x, y) => {
        for (let i = 0; i < 2; i++) particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vy: -0.3 - Math.random() * 0.8,
          life: 1,
          size: 1 + Math.random() * 2
        });
      };
      const draw = () => {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.y += p.vy;
          p.life -= 0.03;
          if (p.life <= 0) { particles.splice(i, 1); continue; }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = p.life * 0.8;
          ctx.fillStyle = Math.random() > 0.5 ? '#F7CD79' : '#9CA2FF';
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        requestAnimationFrame(draw);
      };
      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('mousemove', e => {
        if (pointerGlow) {
          pointerGlow.style.left = `${e.clientX}px`;
          pointerGlow.style.top = `${e.clientY}px`;
          pointerGlow.classList.add('active');
        }
        if (Math.hypot(e.clientX - lastX, e.clientY - lastY) > 16) {
          spawn(e.clientX, e.clientY);
          lastX = e.clientX; lastY = e.clientY;
        }
      }, { passive: true });
      draw();
    }
  }

  // Tiny accessibility/professionalism details.
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (link.target === '_blank') link.rel = 'noopener noreferrer';
  });
  document.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('focus', () => field.closest('form')?.classList.add('is-focused'));
    field.addEventListener('blur', () => field.closest('form')?.classList.remove('is-focused'));
  });
})();


// ===== Advanced portfolio interactions =====
const AI_ENDPOINT = ''; // Optional backend endpoint: POST {message} -> {answer}.

(() => {
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  // Command palette: Ctrl/Cmd + K, searchable navigation, project and contact actions.
  const palette = document.querySelector('#command-palette');
  const paletteToggle = document.querySelector('#palette-toggle');
  const paletteInput = document.querySelector('#palette-input');
  const paletteResults = document.querySelector('#palette-results');
  const paletteItems = [
    ['Home','Landing page and portfolio index','index.html'],
    ['Experience','Career timeline and current direction','experience.html'],
    ['Projects','Engineering build log and case studies','projects.html'],
    ['Architecture','Interactive AI/RAG system map','architecture.html'],
    ['Skills','Technical stack and proficiency map','skills.html'],
    ['Contact','Terminal, form, and direct contact','contact.html'],
    ['Résumé','Open résumé PDF','assets/resume.pdf'],
    ['Query the index','Search portfolio projects','index.html#query'],
    ['Open AI copilot','Launch the portfolio assistant','__copilot__'],
  ];
  let activePalette = 0;
  const renderPalette = q => {
    if (!paletteResults) return;
    const query = (q || '').toLowerCase().trim();
    const rows = paletteItems.filter(x => !query || x[0].toLowerCase().includes(query) || x[1].toLowerCase().includes(query));
    paletteResults.innerHTML = rows.map((x,i) => `<button class="palette-item ${i===0?'active':''}" data-palette-target="${esc(x[2])}"><div><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div><kbd>${i===0?'↵':''}</kbd></button>`).join('') || '<div class="result-placeholder mono">No command found.</div>';
    activePalette = 0;
  };
  const openPalette = () => { if (!palette) return; palette.classList.add('open'); palette.setAttribute('aria-hidden','false'); renderPalette(''); setTimeout(()=>paletteInput?.focus(),0); };
  const closePalette = () => { if (!palette) return; palette.classList.remove('open'); palette.setAttribute('aria-hidden','true'); };
  const executePalette = target => {
    if (target === '__copilot__') { closePalette(); document.querySelector('#copilot-toggle')?.click(); return; }
    if (target) window.location.href = target;
  };
  paletteToggle?.addEventListener('click', openPalette);
  palette?.querySelectorAll('[data-palette-close]').forEach(b => b.addEventListener('click', closePalette));
  paletteInput?.addEventListener('input', e => renderPalette(e.target.value));
  paletteResults?.addEventListener('click', e => { const item=e.target.closest('[data-palette-target]'); if(item) executePalette(item.dataset.paletteTarget); });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='k') { e.preventDefault(); palette?.classList.contains('open') ? closePalette() : openPalette(); }
    if (palette?.classList.contains('open') && e.key==='Escape') closePalette();
    if (palette?.classList.contains('open') && e.key==='ArrowDown') { e.preventDefault(); const rows=[...document.querySelectorAll('.palette-item')]; if(!rows.length)return; activePalette=(activePalette+1)%rows.length; rows.forEach((r,i)=>r.classList.toggle('active',i===activePalette)); }
    if (palette?.classList.contains('open') && e.key==='ArrowUp') { e.preventDefault(); const rows=[...document.querySelectorAll('.palette-item')]; if(!rows.length)return; activePalette=(activePalette-1+rows.length)%rows.length; rows.forEach((r,i)=>r.classList.toggle('active',i===activePalette)); }
    if (palette?.classList.contains('open') && e.key==='Enter') { const row=document.querySelectorAll('.palette-item')[activePalette]; if(row) executePalette(row.dataset.paletteTarget); }
  });

  // AI copilot. Works immediately with a deterministic local knowledge base and can be switched to a real endpoint later.
  const copilot = document.querySelector('#copilot'); const copilotToggle=document.querySelector('#copilot-toggle'); const copilotForm=document.querySelector('#copilot-form'); const copilotInput=document.querySelector('#copilot-query'); const copilotLog=document.querySelector('#copilot-log');
  const openCopilot=()=>{copilot?.classList.add('open');copilot?.setAttribute('aria-hidden','false');setTimeout(()=>copilotInput?.focus(),50)}; const closeCopilot=()=>{copilot?.classList.remove('open');copilot?.setAttribute('aria-hidden','true')};
  copilotToggle?.addEventListener('click',()=>copilot?.classList.contains('open')?closeCopilot():openCopilot()); document.querySelector('[data-copilot-close]')?.addEventListener('click',closeCopilot); document.querySelector('#hero-copilot')?.addEventListener('click',openCopilot);
  const answerLocal = q => { const x=q.toLowerCase(); if(x.includes('contact')||x.includes('email')||x.includes('reach')) return 'You can reach Yathesh at yatheshkumar8@gmail.com, call +91 95665 17450, or use the Contact page terminal/form.'; if(x.includes('rag')||x.includes('retrieval')) return 'The portfolio highlights retrieval-first AI work: query handling → dense/sparse retrieval → reranking → context assembly → grounded LLM generation → API/UI delivery. Qdrant is the featured vector-search layer.'; if(x.includes('project')) return 'Featured work includes an AutoML application, MCP-based AI workflows, a Java e-commerce system, and a CNN-based skin detection application.'; if(x.includes('skill')||x.includes('stack')||x.includes('technology')) return 'Core technologies shown across the portfolio include Python, machine learning, PyTorch, TensorFlow/Keras, FastAPI, Flask, SQL, AWS, React, and retrieval/LLM tooling.'; if(x.includes('experience')) return 'Yathesh is presented as a Junior AI/ML Engineer, with hands-on work across ML, GenAI workflows, APIs, and application integration.'; return 'I can help with projects, RAG/LLM architecture, the technical stack, experience, or contact details. Try one of those topics.'; };
  async function answer(q){ if(!AI_ENDPOINT) return answerLocal(q); try{ const r=await fetch(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q})}); if(!r.ok) throw new Error('AI endpoint failed'); const d=await r.json(); return d.answer||answerLocal(q); } catch { return answerLocal(q); } }
  const pushMsg=(text,who)=>{ if(!copilotLog)return; const d=document.createElement('div'); d.className=`copilot-msg ${who}`; d.textContent=text; copilotLog.appendChild(d); copilotLog.scrollTop=copilotLog.scrollHeight; };
  async function ask(q){ const query=q.trim(); if(!query)return; pushMsg(query,'user'); if(copilotInput)copilotInput.value=''; const a=await answer(query); pushMsg(a,'bot'); }
  copilotForm?.addEventListener('submit',e=>{e.preventDefault();ask(copilotInput?.value||'')}); document.querySelectorAll('[data-copilot-q]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.copilotQ||'')));

  // Home architecture teaser.
  const archDetail=document.querySelector('#arch-detail'); const archCopy={query:['Query understanding','Translate a raw user request into searchable intent, useful filters, and the context needed downstream.'],retrieve:['Hybrid retrieval','Combine semantic and lexical signals so the candidate pool balances meaning with exact terms.'],rerank:['Reranking','Score the candidate set again with query-aware relevance so the most useful passages rise to the top.'],generate:['Grounded generation','Give the LLM curated evidence and clear response constraints instead of asking it to invent context.'],ship:['Product delivery','Expose the system through APIs and interfaces that people can actually use and evaluate.']};
  document.querySelectorAll('[data-arch-node]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-arch-node]').forEach(x=>x.classList.remove('active'));btn.classList.add('active'); const d=archCopy[btn.dataset.archNode]||archCopy.query; if(archDetail)archDetail.innerHTML=`<div class="mono">ACTIVE LAYER</div><strong>${esc(d[0])}</strong><p>${esc(d[1])}</p>`;}));

  // Project filters and expandable case studies.
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;document.querySelectorAll('[data-project-tags]').forEach(card=>card.classList.toggle('is-hidden',f!=='all'&&!card.dataset.projectTags.split(' ').includes(f)));}));
  document.querySelectorAll('[data-case]').forEach(btn=>btn.addEventListener('click',()=>{const p=document.querySelector(`[data-case-panel="${btn.dataset.case}"]`);if(!p)return;const open=p.classList.toggle('is-open');btn.setAttribute('aria-expanded',String(open));btn.textContent=open?'Close case study −':'Inspect case study +';}));

  // Skills map.
  const skillMap={ai:['AI / ML','Model layer','Python, PyTorch, TensorFlow, Keras, scikit-learn, training workflows, evaluation, and inference.',['Python','PyTorch','TensorFlow','scikit-learn']],rag:['RAG / LLM','Retrieval layer','Qdrant, hybrid retrieval, reranking, grounding, context assembly, and LLM-facing application patterns.',['Qdrant','RAG','LLMs','Reranking']],backend:['Backend','Service layer','FastAPI, Flask, REST APIs, request validation, inference services, and application integration.',['FastAPI','Flask','REST APIs','Inference']],product:['Product','Experience layer','React-facing integration, UI/UX thinking, analytics, and turning technical capabilities into usable workflows.',['React','UI/UX','Power BI','Tableau']]};
  const renderSkillMap=key=>{const d=skillMap[key];const el=document.querySelector('#skill-map-detail');if(!el||!d)return;el.innerHTML=`<span class="mono">${esc(d[0])}</span><h3>${esc(d[1])}</h3><p>${esc(d[2])}</p><div class="chip-row">${d[3].map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`;};
  document.querySelectorAll('[data-skill-domain]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-skill-domain]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderSkillMap(b.dataset.skillDomain);}));

  // Architecture page inspector.
  const pipeline={query:['Query processing','Normalize user intent, preserve important entities, and route the request into a retrieval strategy.','Raw user request','Search-ready representation','Precision + context'],retrieve:['Candidate retrieval','Pull relevant documents or chunks using vector and lexical signals.','Search-ready representation','Candidate set','Recall'],rerank:['Relevance ranking','Re-score candidates with query-aware signals before assembling the final evidence set.','Candidate set','Ranked evidence','Precision'],context:['Context assembly','Build a compact evidence window that fits the model and keeps sources useful.','Ranked evidence','Prompt context','Coverage + budget'],llm:['Grounded generation','Generate a response from curated evidence with explicit instructions and guardrails.','Prompt context','Answer draft','Grounding'],ship:['Delivery','Return the result through the application/API layer and keep latency and failure modes visible.','Answer draft','User response','Reliability']};
  const setPipeline=key=>{const d=pipeline[key];if(!d)return;document.querySelector('#pipeline-title')?.replaceChildren(document.createTextNode(d[0]));document.querySelector('#pipeline-description')?.replaceChildren(document.createTextNode(d[1]));const a=document.querySelector('#pipeline-input');const b=document.querySelector('#pipeline-output');const c=document.querySelector('#pipeline-focus');if(a)a.textContent=d[2];if(b)b.textContent=d[3];if(c)c.textContent=d[4];};
  document.querySelectorAll('[data-pipeline]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-pipeline]').forEach(x=>x.classList.remove('active'));b.classList.add('active');setPipeline(b.dataset.pipeline);}));


})();
