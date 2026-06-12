
// ╔══════════════════════════════════════════════════════════╗
//  shared.js v2  —  MyWorld Core Engine
//  Systems: Bad-Word Filter · Username · Leaderboard
//           30 Stickers · XP/Levels · Game Scores · Toasts
// ╚══════════════════════════════════════════════════════════╝

// ── 1. BAD-WORD FILTER ──────────────────────────────────────
// Normalises leetspeak before checking (0→o, 3→e, $→s …)
const BAD_WORDS = [
  'ass','arse','bastard','bitch','bollocks','bullshit','cock','crap',
  'cunt','damn','dick','douche','dumbass','fag','faggot','frick',
  'fuck','hell','idiot','jerk','moron','nigga','nigger','piss',
  'prick','pussy','retard','shit','slut','twat','whore','wtf',
  'kys','rape','porn','nude','naked','weed','drugs','stfu','gtfo',
];
function _norm(s){
  return s.toLowerCase()
    .replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e')
    .replace(/4/g,'a').replace(/5/g,'s').replace(/7/g,'t')
    .replace(/@/g,'a').replace(/\$/g,'s').replace(/!/g,'i')
    .replace(/[^a-z]/g,'');
}
function containsBadWord(text){ const n=_norm(text); return BAD_WORDS.some(w=>n.includes(_norm(w))); }
function censorText(text){
  let out=text;
  BAD_WORDS.forEach(w=>{ out=out.replace(new RegExp(w,'gi'),m=>m[0]+'*'.repeat(m.length-1)); });
  return out;
}

// ── 2. STICKERS (30 total) ──────────────────────────────────
const STICKERS = [
  // Explorer
  {id:'first_visit',   emoji:'⭐', name:'First Star',    desc:'Visit for the first time',            cat:'Explorer'},
  {id:'gamer',         emoji:'🎮', name:'Gamer',         desc:'Visit the Games page',                cat:'Explorer'},
  {id:'chess_player',  emoji:'♟️', name:'Chess Player',  desc:'Visit the Chess page',                cat:'Explorer'},
  {id:'scholar',       emoji:'📚', name:'Scholar',       desc:'Visit School Life',                   cat:'Explorer'},
  {id:'fun_seeker',    emoji:'🎉', name:'Fun Seeker',    desc:'Visit the Fun Zone',                  cat:'Explorer'},
  {id:'friendly',      emoji:'👋', name:'Friendly',      desc:'Visit About Me',                      cat:'Explorer'},
  {id:'explorer',      emoji:'🚀', name:'Explorer',      desc:'Visit every page at least once',      cat:'Explorer'},
  // Level
  {id:'level5',        emoji:'🏆', name:'Level 5!',      desc:'Reach Level 5',                       cat:'Level'},
  {id:'level10',       emoji:'💎', name:'Diamond',       desc:'Reach Level 10',                      cat:'Level'},
  {id:'level20',       emoji:'👑', name:'Royalty',       desc:'Reach Level 20',                      cat:'Level'},
  {id:'level30',       emoji:'🌠', name:'Legend',        desc:'Reach Level 30',                      cat:'Level'},
  // Collection
  {id:'rainbow',       emoji:'🌈', name:'Rainbow',       desc:'Collect 5 stickers',                  cat:'Collection'},
  {id:'super_star',    emoji:'🌟', name:'Super Star',    desc:'Collect every sticker!',              cat:'Collection'},
  // Original Games
  {id:'math_whiz',     emoji:'🎯', name:'Math Whiz',     desc:'Score 5+ correct on Math Quiz',       cat:'Games'},
  {id:'memory_master', emoji:'🃏', name:'Memory Master', desc:'Win Memory Match',                    cat:'Games'},
  {id:'rps_champ',     emoji:'✂️', name:'Rock Star',     desc:'Win RPS 3 times',                     cat:'Games'},
  {id:'chess_champ',   emoji:'🥇', name:'Chess Champ',   desc:'Win a Chess game',                    cat:'Games'},
  // New Games
  {id:'snake_charmer', emoji:'🐍', name:'Snake Charmer', desc:'Score 50+ on Snake',                  cat:'Games'},
  {id:'typing_speed',  emoji:'⌨️', name:'Speed Typist',  desc:'Type at 35+ WPM',                     cat:'Games'},
  {id:'click_king',    emoji:'👆', name:'Click King',    desc:'Reach 200 clicks in Clicker',         cat:'Games'},
  {id:'simon_master',  emoji:'🎨', name:'Simon Master',  desc:'Complete 8 rounds in Simon Says',     cat:'Games'},
  {id:'hangman_hero',  emoji:'🎪', name:'Word Wizard',   desc:'Win 5 Hangman games',                 cat:'Games'},
  // Time
  {id:'night_owl',     emoji:'🦉', name:'Night Owl',     desc:'Visit the site after 9 PM',           cat:'Time'},
  {id:'early_bird',    emoji:'☀️', name:'Early Bird',    desc:'Visit the site before 9 AM',          cat:'Time'},
  // Content
  {id:'storyteller',   emoji:'📝', name:'Storyteller',   desc:'Add a memory to School Life',         cat:'Content'},
  {id:'fact_fan',      emoji:'🦋', name:'Butterfly',     desc:'Read 5 fun facts',                    cat:'Content'},
  // Identity
  {id:'username_set',  emoji:'🎭', name:'Identity',      desc:'Create your username',                cat:'Identity'},
  {id:'welcome_bonus', emoji:'🎁', name:'Welcome Gift',  desc:'Join MyWorld for the first time',     cat:'Identity'},
  // Leaderboard
  {id:'chart_climber', emoji:'📊', name:'Chart Climber', desc:'Reach Top 10 on the Leaderboard',    cat:'Leaderboard'},
  {id:'podium',        emoji:'🥈', name:'Podium!',       desc:'Reach Top 3 on the Leaderboard',     cat:'Leaderboard'},
  {id:'top_1',         emoji:'🎖️', name:'Champion!',     desc:'Claim #1 on the Leaderboard',        cat:'Leaderboard'},
];

// ── 3. STORAGE ──────────────────────────────────────────────
const MW = {
  get(k,d=null){ try{ const v=localStorage.getItem('mw_'+k); return v!==null?JSON.parse(v):d; }catch{return d;} },
  set(k,v){ try{ localStorage.setItem('mw_'+k,JSON.stringify(v)); }catch{} },
};

// ── 4. XP & LEVELS ─────────────────────────────────────────
function getLevelInfo(xp){
  let level=1,required=0;
  while(true){
    const needed=level*80;
    if(xp<required+needed) return {level,required,nextRequired:required+needed,progress:xp-required,needed};
    required+=needed; level++;
    if(level>50) return {level:50,required,nextRequired:required+4000,progress:xp-required,needed:4000};
  }
}
function getXP(){ return MW.get('xp',0); }
function addXP(amount,reason){
  const prev=getXP(),next=prev+amount; MW.set('xp',next);
  showToast(`+${amount} XP — ${reason||'Keep going!'}`, '⚡');
  const b=getLevelInfo(prev),a=getLevelInfo(next);
  if(a.level>b.level) setTimeout(()=>{ showToast(`🎉 LEVEL UP! Now Level ${a.level}!`,'🏆'); _checkLevelStickers(a.level); },700);
  updateSidebarLevel(); _checkLeaderboardStickers();
  if(typeof renderLeaderboard==='function') setTimeout(renderLeaderboard,200);
  return next;
}

// ── 5. STICKER SYSTEM ──────────────────────────────────────
function getUnlocked()  { return MW.get('stickers',[]); }
function isUnlocked(id) { return getUnlocked().includes(id); }
function unlockSticker(id){
  const arr=getUnlocked(); if(arr.includes(id)) return false;
  arr.push(id); MW.set('stickers',arr);
  const s=STICKERS.find(x=>x.id===id); if(s) showToast(`New Sticker! ${s.emoji} ${s.name}`,'🎊');
  if(arr.length>=5  && !arr.includes('rainbow'))    setTimeout(()=>unlockSticker('rainbow'),800);
  if(arr.length>=29 && !arr.includes('super_star')) setTimeout(()=>unlockSticker('super_star'),1200);
  if(typeof renderStickerGrid==='function') setTimeout(renderStickerGrid,300);
  return true;
}
function _checkLevelStickers(level){
  if(level>=5)  unlockSticker('level5');
  if(level>=10) unlockSticker('level10');
  if(level>=20) unlockSticker('level20');
  if(level>=30) unlockSticker('level30');
}
function _checkLeaderboardStickers(){
  const r=getUserRank(); if(!r) return;
  if(r<=10) unlockSticker('chart_climber');
  if(r<=3)  unlockSticker('podium');
  if(r===1) unlockSticker('top_1');
}

// ── 6. LEADERBOARD ─────────────────────────────────────────
const LB_SEED=[
  {username:'ChessKing99',   xp:2840,avatar:'♟️'},
  {username:'StarGazer_Mia', xp:2450,avatar:'🌟'},
  {username:'GameMasterX',   xp:2100,avatar:'🎮'},
  {username:'MathWizKid',    xp:1820,avatar:'🧮'},
  {username:'DragonRider77', xp:1650,avatar:'🐲'},
  {username:'PuzzlePro',     xp:1480,avatar:'🧩'},
  {username:'NinjaCoderZ',   xp:1290,avatar:'🥷'},
  {username:'CuriousCat7',   xp:1080,avatar:'🐱'},
  {username:'SpeedRunner',   xp: 890,avatar:'⚡'},
  {username:'BrainiacZ',     xp: 720,avatar:'🧠'},
  {username:'LuckyStar101',  xp: 540,avatar:'🌈'},
  {username:'ExplorerAlex',  xp: 380,avatar:'🚀'},
  {username:'NewbieChamp',   xp: 210,avatar:'🦊'},
  {username:'JustStarted',   xp: 100,avatar:'🌱'},
];
function getLeaderboardData(){
  const username=getUsername(),xp=getXP();
  const serverData=(typeof window._mwLeaderboard!=='undefined'&&window._mwLeaderboard.length>0)
    ?window._mwLeaderboard:null;
  const users=serverData
    ?serverData.map(u=>({username:u.username,xp:u.xp,avatar:u.avatar||'🦊'}))
    :LB_SEED.map(u=>({...u}));
  if(username){
    const clash=users.findIndex(u=>u.username===username);
    if(clash>-1) users.splice(clash,1);
    users.push({username,xp,avatar:MW.get('avatar','🦊'),isYou:true});
  }
  return users.sort((a,b)=>b.xp-a.xp);
}
function getUserRank(){
  const username=getUsername(); if(!username) return null;
  const idx=getLeaderboardData().findIndex(u=>u.username===username);
  return idx===-1?null:idx+1;
}

// ── 7. GAME SCORE TRACKING ─────────────────────────────────
function submitGameScore(gameId,score,xpReward,onScore){
  const hs=MW.get('highscores',{}),prev=hs[gameId]||0;
  if(score>prev){
    hs[gameId]=score; MW.set('highscores',hs);
    if(prev>0) showToast(`🏅 New ${gameId} high score: ${score}!`,'🎉');
    // Notify parent frame — listener saves score + XP to Google Sheets
    try{ window.parent.postMessage({type:'mw_score',game:gameId,score:score,xp:getXP()},'*'); }catch(e){}
  }
  if(xpReward>0) addXP(xpReward,`${gameId} game`);
  if(typeof onScore==='function') onScore(score);
  _checkLeaderboardStickers();
}
function getHighScore(gameId){ return (MW.get('highscores',{}))[gameId]||0; }

// ── 8. USERNAME SYSTEM ─────────────────────────────────────
function getUsername()      { return MW.get('username',null); }
function _setUsername(name) { MW.set('username',name); }

const _PFX=['Cool','Super','Mega','Ultra','Pro','Epic','Cosmic','Ninja','Turbo','Star','Wild','Flash','Pixel','Storm','Blaze'];
const _SFX=['Kid','Player','Gamer','Hero','Star','Master','Wizard','Ninja','Champ','Racer','Coder','Builder'];
function _genSuggestions(n=4){
  const out=new Set(); let t=0;
  while(out.size<n && t++<80){
    const name=_PFX[Math.floor(Math.random()*_PFX.length)]+_SFX[Math.floor(Math.random()*_SFX.length)]+(Math.floor(Math.random()*99)+1);
    if(!containsBadWord(name)) out.add(name);
  }
  return [...out];
}
function validateUsername(name){
  if(!name||!name.trim()) return {valid:false,error:'Please enter a username.'};
  name=name.trim();
  if(name.length<3)  return {valid:false,error:'Must be at least 3 characters long.'};
  if(name.length>20) return {valid:false,error:'Must be 20 characters or less.'};
  if(!/^[a-zA-Z0-9_]+$/.test(name)) return {valid:false,error:'Only letters, numbers and underscores allowed.'};
  if(containsBadWord(name)) return {valid:false,error:'🚫 Username contains blocked content. Please try another!'};
  return {valid:true,error:''};
}
function submitUsername(){
  const input=document.getElementById('mw-un-input'); if(!input) return;
  const name=input.value.trim(),result=validateUsername(name);
  const errEl=document.getElementById('mw-un-error');
  if(!result.valid){ if(errEl){errEl.textContent=result.error;errEl.style.display='block';} input.focus(); return; }
  _setUsername(name);
  const modal=document.getElementById('mw-username-modal');
  if(modal){ modal.style.opacity='0'; modal.style.transition='opacity .3s ease'; setTimeout(()=>modal.remove(),320); }
  unlockSticker('username_set'); unlockSticker('welcome_bonus');
  setTimeout(()=>addXP(50,'Welcome to MyWorld!'),500);
  updateUsernameDisplay();
  if(typeof renderLeaderboard==='function') setTimeout(renderLeaderboard,700);
}
function _pickAvatar(btn,avatar){
  document.querySelectorAll('.mw-av-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected'); MW.set('avatar',avatar);
}
function _showUsernameModal(){
  if(document.getElementById('mw-username-modal')) return;
  const sugs=_genSuggestions(4);
  const chips=sugs.map(s=>`<button class="mw-sug-chip" onclick="document.getElementById('mw-un-input').value='${s}';document.getElementById('mw-un-error').style.display='none'">${s}</button>`).join('');
  const avEmojis=['🦊','🐺','🐻','🦁','🐸','🐙','🦋','🐧','🦄','🐲','🤖','🧙'];
  const avBtns=avEmojis.map((a,i)=>`<button class="mw-av-btn${i===0?' selected':''}" onclick="_pickAvatar(this,'${a}')">${a}</button>`).join('');
  const m=document.createElement('div'); m.id='mw-username-modal';
  m.innerHTML=`
    <div class="mw-modal-card">
      <span class="mw-float" style="left:7%;top:10%;animation-delay:.1s">🌟</span>
      <span class="mw-float" style="right:9%;top:14%;animation-delay:.5s">🎮</span>
      <span class="mw-float" style="left:13%;bottom:12%;animation-delay:.3s">🦋</span>
      <span class="mw-float" style="right:7%;bottom:10%;animation-delay:.7s">🚀</span>
      <div class="mw-modal-logo">🌟 MyWorld</div>
      <h2 class="mw-modal-title">Welcome, Explorer!</h2>
      <p class="mw-modal-sub">Pick an avatar &amp; create your username to earn stickers and climb the Leaderboard!</p>
      <div class="mw-av-row">${avBtns}</div>
      <div class="mw-input-wrap">
        <input id="mw-un-input" type="text" maxlength="20" autocomplete="off"
          placeholder="e.g. CoolKid99 or StarPlayer"
          oninput="document.getElementById('mw-un-error').style.display='none'"
          onkeydown="if(event.key==='Enter')submitUsername()">
        <div class="mw-input-hint">3–20 chars · letters, numbers, underscores only</div>
        <div class="mw-input-error" id="mw-un-error"></div>
      </div>
      <div class="mw-sug-row"><span class="mw-sug-label">Quick picks:</span>${chips}</div>
      <button class="mw-modal-btn" onclick="submitUsername()">🚀 Start My Adventure!</button>
      <div class="mw-modal-footer">Your username appears on the public Leaderboard.</div>
    </div>`;
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('mw-un-input')?.focus(),400);
}
function updateUsernameDisplay(){
  const name=getUsername()||'Explorer';
  document.querySelectorAll('[data-username]').forEach(el=>el.textContent=name);
  document.querySelectorAll('[data-username-greeting]').forEach(el=>el.textContent=`Hey, ${name}! 👋`);
}

// ── 9. TOAST ───────────────────────────────────────────────
function showToast(msg,icon='✨'){
  let wrap=document.getElementById('mw-toast-wrap');
  if(!wrap){ wrap=document.createElement('div'); wrap.id='mw-toast-wrap'; wrap.className='toast-container'; document.body.appendChild(wrap); }
  const t=document.createElement('div'); t.className='toast';
  t.innerHTML=`<span style="font-size:18px;flex-shrink:0">${icon}</span><span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(()=>{ t.style.cssText+='opacity:0;transform:translateX(115%);transition:all .35s ease;'; setTimeout(()=>t.remove(),360); },3400);
}

// ── 10. SIDEBAR UPDATER ────────────────────────────────────
function updateSidebarLevel(){
  const inf=getLevelInfo(getXP()),pct=Math.round((inf.progress/inf.needed)*100);
  const badge=document.querySelector('.level-badge'),bar=document.querySelector('.xp-bar'),text=document.querySelector('.xp-text');
  if(badge) badge.textContent=`⭐ Level ${inf.level}`;
  if(bar)   bar.style.width=pct+'%';
  if(text)  text.textContent=`${inf.progress} / ${inf.needed} XP`;
}

// ── 11. PAGE VISIT TRACKING ────────────────────────────────
function recordVisit(page){
  const visits=MW.get('visits',{}); visits[page]=(visits[page]||0)+1; MW.set('visits',visits);
  if(visits[page]<=5) setTimeout(()=>addXP(10,'Page visit'),700);
  const pageMap={home:'first_visit',games:'gamer',chess:'chess_player',school:'scholar',funzone:'fun_seeker',about:'friendly'};
  if(pageMap[page]) unlockSticker(pageMap[page]);
  if(['home','games','chess','school','funzone','about'].every(p=>visits[p]>0)) setTimeout(()=>unlockSticker('explorer'),1000);
  const h=new Date().getHours();
  if(h>=21) unlockSticker('night_owl');
  if(h<9)   unlockSticker('early_bird');
  return visits;
}
function getTotalVisits()  { return Object.values(MW.get('visits',{})).reduce((a,b)=>a+b,0); }
function getPagesVisited() { const v=MW.get('visits',{}); return Object.keys(v).filter(k=>v[k]>0).length; }

// ── 12. GLOBAL INIT ────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  updateSidebarLevel();
  document.querySelectorAll('.nav-link').forEach((el,i)=>{
    el.style.opacity='0'; el.style.transform='translateX(-14px)';
    setTimeout(()=>{ el.style.transition='all .4s ease'; el.style.opacity=''; el.style.transform=''; },120+i*55);
  });
  if(!getUsername()) setTimeout(_showUsernameModal,700);
  else updateUsernameDisplay();
});

// Canvas roundRect polyfill for older browsers
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    r=Math.min(r,w/2,h/2); this.beginPath();
    this.moveTo(x+r,y); this.lineTo(x+w-r,y); this.quadraticCurveTo(x+w,y,x+w,y+r);
    this.lineTo(x+w,y+h-r); this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    this.lineTo(x+r,y+h); this.quadraticCurveTo(x,y+h,x,y+h-r);
    this.lineTo(x,y+r); this.quadraticCurveTo(x,y,x+r,y); this.closePath();
  };
}
