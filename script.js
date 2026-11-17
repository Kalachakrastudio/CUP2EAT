(() => {
 const cup = document.getElementById('travellingCup');
 const cupImg = document.getElementById('travellingCupImage');
 const scenes = [...document.querySelectorAll('.scene')];
 const header = document.getElementById('header');
 const progress = document.getElementById('progress');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const mobile = () => matchMedia('(max-width:650px)').matches;

 // Reveal content when it enters the viewport.
 const revealEls = document.querySelectorAll('.reveal');
 if ('IntersectionObserver' in window && !reduced) {
   const io = new IntersectionObserver((entries, obs) => {
     entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);} });
   }, {threshold:.12, rootMargin:'0px 0px -35px 0px'});
   revealEls.forEach(el => io.observe(el));
 } else revealEls.forEach(el => el.classList.add('visible'));

 // The same hero cup travels between scene anchor points.
 // Each scene supplies a target X/Y, size and rotation in data attributes.
 let ticking = false;
 const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
 const smooth = t=>t*t*(3-2*t);
 const readTarget = scene => {
   const r = scene.getBoundingClientRect();
   const vh = innerHeight, vw = innerWidth;
   const progressIn = clamp((vh-r.top)/(vh+r.height),0,1);
   const x = Number(scene.dataset.cupX || 70)/100*vw;
   let y = Number(scene.dataset.cupY || 50)/100*vh;
   let size = scene.dataset.cupSize || 'min(40vw,500px)';
   let rotate = Number(scene.dataset.cupRotate || 0);
   if (mobile()) {
     // On phones, keep the cup below the section heading and within the viewport.
     y = clamp(y, vh*.56, vh*.78);
     size = 'min(76vw,340px)';
   }
   return {x,y,size,rotate,progressIn};
 };
 const update = () => {
   const vh = innerHeight, vw = innerWidth;
   const activeIndex = Math.max(0, scenes.findIndex(s => {
     const r=s.getBoundingClientRect(); return r.top <= vh*.58 && r.bottom >= vh*.42;
   }));
   const current = scenes[activeIndex] || scenes[0];
   const next = scenes[Math.min(activeIndex+1,scenes.length-1)];
   const a = readTarget(current), b = readTarget(next);
   const rect = current.getBoundingClientRect();
   const blend = smooth(clamp((vh*.58-rect.top)/(rect.height*.72),0,1));
   const x = a.x + (b.x-a.x)*blend;
   const y = a.y + (b.y-a.y)*blend;
   const rot = a.rotate + (b.rotate-a.rotate)*blend;
   const size = mobile() ? 'min(76vw,340px)' : a.size;
   const w = mobile() ? Math.min(vw*.76,340) : Math.min(vw*.44,560);
   const h = w;
   cup.style.width = `${w}px`; cup.style.height = `${h}px`;
   cup.style.transform = `translate3d(${x-w/2}px,${y-h/2}px,0) rotate(${rot}deg)`;
   // Scale the cup shell subtly as it approaches the section's target.
   const shell = cup.querySelector('.cup-image-shell');
   shell.style.transform = `scale(${1 - .045*Math.sin(blend*Math.PI)})`;
   const total = document.documentElement.scrollHeight-innerHeight;
   progress.style.width = `${total>0 ? scrollY/total*100 : 0}%`;
   header.classList.toggle('compact',scrollY>25);
   ticking=false;
 };
 const requestUpdate=()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}};
 addEventListener('scroll',requestUpdate,{passive:true});
 addEventListener('resize',requestUpdate);
 update();

 // Mobile nav.
 const menu=document.getElementById('menu'), nav=document.getElementById('nav');
 menu.addEventListener('click',()=>nav.classList.toggle('open'));
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

 // A clean fallback if the chosen photo host blocks a request.
 const fallback='https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85';
 document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{
   if(img.dataset.fallback)return; img.dataset.fallback='1'; img.src=fallback;
 }));
 document.getElementById('year').textContent=new Date().getFullYear();
})();
