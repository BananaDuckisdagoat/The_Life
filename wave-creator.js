// ═══════════════════════════════════════════════════════════════
//  wave-creator.js  —  Geometry Dash Wave Level Creator
//  Systems: Editor · Wave Physics · Community · XP · Ranks
// ═══════════════════════════════════════════════════════════════

'use strict';

// ── Storage helpers ──────────────────────────────────────────
const WC = {
  get(k,d=null){ try{ const v=localStorage.getItem('wc_'+k); return v!=null?JSON.parse(v):d; }catch{return d;} },
  set(k,v){ try{ localStorage.setItem('wc_'+k,JSON.stringify(v)); }catch{} },
};

// ── Object type definitions ──────────────────────────────────
const WC_OBJECTS = {
  // Blocks
  block:       { label:'Block',       icon:'🟦', cat:'blocks',   color:'#2563eb', solid:true  },
  slope_up:    { label:'Slope /',     icon:'◺',  cat:'blocks',   color:'#3b82f6', solid:true, slope:'up' },
  slope_down:  { label:'Slope \\',   icon:'◿',  cat:'blocks',   color:'#3b82f6', solid:true, slope:'down' },
  platform:    { label:'Platform',    icon:'▬',  cat:'blocks',   color:'#1d4ed8', solid:true, thin:true },
  // Hazards
  spike:       { label:'Spike',       icon:'🔺', cat:'hazards',  color:'#ef4444', kills:true  },
  spike_down:  { label:'Spike ↓',    icon:'🔻', cat:'hazards',  color:'#ef4444', kills:true  },
  saw:         { label:'Saw',         icon:'⚙️', cat:'hazards',  color:'#f97316', kills:true, spin:true },
  laser:       { label:'Laser',       icon:'💥', cat:'hazards',  color:'#ff0040', kills:true, laser:true },
  // Specials
  coin:        { label:'Coin',        icon:'🪙', cat:'specials', color:'#ffe66d', collectible:true },
  portal_speed:{ label:'Speed',       icon:'🌀', cat:'specials', color:'#00e5ff', portal:'speed', speed:1.5 },
  portal_grav: { label:'Gravity',     icon:'🔄', cat:'specials', color:'#a855f7', portal:'grav' },
  checkpoint:  { label:'Checkpoint',  icon:'🚩', cat:'specials', color:'#22c55e', checkpoint:true },
  pulse_light: { label:'Pulse Light', icon:'💡', cat:'specials', color:'#ffe66d', light:true  },
  jump_ring:   { label:'Jump Ring',   icon:'⭕', cat:'specials', color:'#fb923c', jumpring:true },
  // More blocks
  spike_left:   { label:'Spike ←',    icon:'◄',  cat:'blocks',   color:'#ef4444', kills:true, spikeLeft:true   },
  spike_right:  { label:'Spike →',    icon:'►',  cat:'blocks',   color:'#ef4444', kills:true, spikeRight:true  },
  half_block:   { label:'½ Block',    icon:'▪',  cat:'blocks',   color:'#2563eb', solid:true, halfH:true        },
  block_ice:    { label:'Ice Block',  icon:'🧊', cat:'blocks',   color:'#93c5fd', solid:true, iceBlock:true     },
  block_spiked: { label:'Spiked Blk', icon:'▲',  cat:'blocks',   color:'#1e40af', solid:true, spikedTop:true    },
  spike_tiny:   { label:'Mini Spike', icon:'△',  cat:'hazards',  color:'#ef4444', kills:true, spikeTiny:true    },
  // GD Orbs — one-shot launch effects (player must re-tap to use again)
  orb_yellow:   { label:'Yellow Orb', icon:'🟡', cat:'hazards',  color:'#ffe66d', orb:true, orbYellow:true    },
  orb_blue:     { label:'Blue Orb',   icon:'🔵', cat:'hazards',  color:'#3b82f6', orb:true, orbBlue:true      },
  orb_green:    { label:'Green Orb',  icon:'🟢', cat:'hazards',  color:'#22c55e', orb:true, orbGreen:true     },
  orb_red:      { label:'Red Orb',    icon:'🔴', cat:'hazards',  color:'#ef4444', orb:true, orbRed:true       },
  orb_black:    { label:'Black Orb',  icon:'⚫', cat:'hazards',  color:'#334155', orb:true, orbBlack:true     },
  orb_magenta:  { label:'Magenta Orb',icon:'🟣', cat:'hazards',  color:'#ec4899', orb:true, orbMagenta:true   },
  spider_orb:   { label:'Spider Orb', icon:'🕷️', cat:'hazards',  color:'#8b5cf6', orb:true, orbSpider:true    },
  gravity_ring: { label:'Grav Ring',  icon:'🟣', cat:'hazards',  color:'#a855f7', orb:true, orbBlue:true, ringGrav:true },
  dash_ring:    { label:'Dash Ring',  icon:'🟠', cat:'hazards',  color:'#fb923c', orb:true, ringDash:true     },
  // Pads
  pad_yellow:   { label:'Jump Pad',   icon:'🟡', cat:'specials', color:'#ffe66d', pad:true, padJump:true        },
  pad_blue:     { label:'Grav Pad',   icon:'🔵', cat:'specials', color:'#3b82f6', pad:true, padGrav:true        },
  pad_pink:     { label:'Pink Pad',   icon:'🩷', cat:'specials', color:'#ec4899', pad:true, padPink:true        },
  pad_red:      { label:'Red Pad',    icon:'🔴', cat:'specials', color:'#dc2626', pad:true, padRed:true         },
  // Speed portals
  portal_slow:  { label:'Slow',       icon:'🐢', cat:'specials', color:'#22c55e', portal:'speed', speed:0.6    },
  portal_fast:  { label:'Fast',       icon:'🔥', cat:'specials', color:'#f97316', portal:'speed', speed:2.2    },
  // Size portals (mini shrinks hitbox, normal restores it)
  portal_mini:  { label:'Mini',       icon:'🔽', cat:'specials', color:'#06b6d4', portal:'size', sizeMini:true  },
  portal_size:  { label:'Normal Size',icon:'🔼', cat:'specials', color:'#06b6d4', portal:'size', sizeNorm:true  },
  // Triggers
  move_trigger:   { label:'Move',     icon:'↔️', cat:'triggers', color:'#c084fc', trigger:true, triggerMove:true   },
  rotate_trigger: { label:'Rotate',   icon:'🔁', cat:'triggers', color:'#06b6d4', trigger:true, triggerRotate:true },
  color_trigger:  { label:'Color',    icon:'🎨', cat:'triggers', color:'#f43f5e', trigger:true, triggerColor:true  },
  alpha_trigger:  { label:'Alpha',    icon:'👁️', cat:'triggers', color:'#94a3b8', trigger:true, triggerAlpha:true  },
  stop_trigger:   { label:'Stop',     icon:'⏹️', cat:'triggers', color:'#dc2626', trigger:true, triggerStop:true   },
  // Decor — existing
  star:         { label:'Star',       icon:'⭐', cat:'decor',    color:'#ffe66d', decor:true  },
  glow_orb:     { label:'Glow Orb',   icon:'🔵', cat:'decor',    color:'#00e5ff', decor:true, glow:true },
  bg_grid:      { label:'BG Grid',    icon:'▦',  cat:'decor',    color:'#1e3a5f', decor:true, bg:true  },
  particle_src: { label:'Particles',  icon:'✨', cat:'decor',    color:'#a855f7', decor:true, particles:true },
  // Decor — new GD-style
  crystal:      { label:'Crystal',    icon:'💎', cat:'decor',    color:'#00e5ff', decor:true, dCrystal:true  },
  crystal_pink: { label:'Pink Crystal',icon:'🌸',cat:'decor',    color:'#ec4899', decor:true, dCrystal:true  },
  neon_ring:    { label:'Neon Ring',  icon:'⭕', cat:'decor',    color:'#a855f7', decor:true, dNeonRing:true },
  cloud_deco:   { label:'Cloud',      icon:'☁️', cat:'decor',    color:'#e2e8f0', decor:true, dCloud:true    },
  planet_deco:  { label:'Planet',     icon:'🪐', cat:'decor',    color:'#fb923c', decor:true, dPlanet:true   },
  debris_deco:  { label:'Debris',     icon:'🪨', cat:'decor',    color:'#64748b', decor:true, dDebris:true   },
  arrow_deco:   { label:'Arrow',      icon:'➡️', cat:'decor',    color:'#00e5ff', decor:true, dArrow:true    },
  spike_deco:   { label:'Spike Deco', icon:'🔷', cat:'decor',    color:'#a855f7', decor:true, dSpikeDeco:true},
  chain_deco:   { label:'Chain',      icon:'⛓️', cat:'decor',    color:'#94a3b8', decor:true, dChain:true    },
  lamp_deco:    { label:'Lamp',       icon:'🕯️', cat:'decor',    color:'#ffe66d', decor:true, dLamp:true     },
  portal_ring:  { label:'Portal Ring',icon:'🌀', cat:'decor',    color:'#00e5ff', decor:true, dPortalRing:true},
  // Level markers
  start_marker:{ label:'Start',       icon:'🟢', cat:'level',    color:'#22c55e', startMarker:true },
  end_marker:  { label:'End Line',    icon:'🏁', cat:'level',    color:'#ff2244', endMarker:true },
};

// ── Palette colors ───────────────────────────────────────────
const PALETTE_COLORS = [
  '#00e5ff','#a855f7','#ff6b6b','#ffe66d','#22c55e',
  '#fb923c','#ec4899','#ffffff','#2563eb','#1a1a3e',
];

// ── Creator XP rewards ───────────────────────────────────────
const WC_XP_REWARDS = [
  { id:'create',    icon:'✏️',  name:'Create a level',      desc:'Saved for the first time',   xp:50  },
  { id:'upload',    icon:'⬆️',  name:'Upload a level',      desc:'Share with community',        xp:100 },
  { id:'like',      icon:'❤️',  name:'Receive a like',      desc:'Per like on your level',      xp:20  },
  { id:'beat',      icon:'🏆', name:'Beat a level',         desc:'Complete any wave level',     xp:30  },
  { id:'beat_own',  icon:'🌊', name:'Beat your own level',  desc:'Verify your creation',        xp:25  },
  { id:'coin',      icon:'🪙', name:'Collect all coins',    desc:'Get 3 coins in one run',      xp:40  },
];

// ── Creator ranks ────────────────────────────────────────────
const WC_RANKS = [
  { id:'builder',   icon:'🔨', label:'Builder',         cxp:0,    cls:'rank-builder',   perk:'Unlock 10 object types'          },
  { id:'creator',   icon:'⚙️', label:'Creator',         cxp:100,  cls:'rank-creator',   perk:'Unlock all objects + triggers'   },
  { id:'architect', icon:'🏛️', label:'Architect',       cxp:500,  cls:'rank-architect', perk:'Animated backgrounds + effects'  },
  { id:'legend',    icon:'👑', label:'Legend Creator',  cxp:2000, cls:'rank-legend',    perk:'Featured level slot + gold badge' },
];

// ── Global editor state ──────────────────────────────────────
let wcState = {
  objects:    [],       // placed objects
  selected:   [],       // indices of selected objects
  tool:       'select',
  objType:    'block',
  color:      '#2563eb',
  layer:      1,        // 1=bg,2=main,3=fg
  gridSize:   30,
  zoom:       1,
  panX:       0,
  panY:       0,
  bgColor:    '#020210',
  levelSpeed: 4,        // default slow — adjustable via the speed slider
  levelTiles: 120,      // tiles wide (grid-based)
  difficulty: 'normal',
  dragging:   false,
  dragStart:  null,
  multiSel:   false,
  clipboard:  [],
  undoStack:  [],
  redoStack:  [],
  draggingEndLine:   false,  // true while the user drags the END marker
  draggingStartLine: false,  // true while the user drags the START marker
};

// ── Level data (save/load) ───────────────────────────────────
let wcLevelData = {
  name:       'My Wave Level',
  desc:       '',
  difficulty: 'normal',
  bgColor:    '#020210',
  speed:      6,
  startTile:  2,     // player spawn X tile
  startY:     6,     // player spawn Y tile
  endTile:    120,   // how many grid tiles wide the level is
  objects:    [],
};

// ── Play state ───────────────────────────────────────────────
let wcPlay = {
  active:      false,
  practice:    false,
  frame:       null,
  wx:          0,       // wave player x in world
  wy:          0,       // wave player y in world
  velY:        0,
  gravity:     1,       // +1 = down, -1 = up (flipped)
  speed:       6,
  camX:        0,
  progress:    0,
  alive:       true,
  attempts:    0,
  best:        0,
  checkpoints: [],      // x positions of checkpoints (practice mode)
  lastCP:      0,
  coins:       new Set(),
  coinsTotal:  0,
  deathParticles: [],
  prevTouch:   new Set(), // one-shot collision: objects touched last frame
  sizeScale:   1.0,       // size portal: 1=normal, 0.5=mini
  firedTriggers: new Set(),
  triggerAnims:  [],
  offsets:       {},
  bgColorOverride: null,
};

// ── Community data (simulated) ───────────────────────────────
let wcCommunity = {
  tab: 'featured',
  playingLevel: null,
  playActive: false,
  playFrame: null,
};

// Simulated community levels
const WC_COMM_LEVELS = [
  { id:'c1', name:'Neon Rush',       creator:'StarBuilder',  diff:'normal', likes:142, plays:890,  featured:true,  emoji:'🌊', desc:'Classic wave challenge through neon corridors' },
  { id:'c2', name:'Gravity Chaos',   creator:'PixelWizard',  diff:'hard',   likes:87,  plays:445,  featured:true,  emoji:'🔄', desc:'Gravity flips every 3 seconds — can you handle it?' },
  { id:'c3', name:'Easy Vibes',      creator:'CoolKid99',    diff:'easy',   likes:203, plays:1240, featured:false, emoji:'✨', desc:'A relaxing wave ride for beginners' },
  { id:'c4', name:'Death Machine',   creator:'DemonSlayer',  diff:'demon',  likes:55,  plays:221,  featured:false, emoji:'💀', desc:'Ultra-tight corridors. Good luck!' },
  { id:'c5', name:'Speed Surge',     creator:'TurboBuilder', diff:'insane', likes:31,  plays:178,  featured:false, emoji:'⚡', desc:'Max speed from start to finish' },
  { id:'c6', name:'Coin Hunt',       creator:'ExplorerAlex', diff:'easy',   likes:98,  plays:567,  featured:true,  emoji:'🪙', desc:'Find all 3 hidden coins along the way' },
  { id:'c7', name:'Midnight Wave',   creator:'StarGazer_Mia',diff:'normal', likes:176, plays:930,  featured:true,  emoji:'🌙', desc:'Beautiful dark atmosphere with pulsing lights' },
  { id:'c8', name:'Insane Spikes',   creator:'NinjaCoderZ',  diff:'insane', likes:44,  plays:290,  featured:false, emoji:'🔺', desc:'Spike walls everywhere. Precision required.' },
];

// ══════════════════════════════════════════════════════════════
//  BUILT-IN PRESETS
// ══════════════════════════════════════════════════════════════
function _obj(type, gx, gy, color, extra) {
  return { type, gx, gy, layer:2, rot:0, scale:1, color, speed:1, grav:'down', flip:false, ...(extra||{}) };
}
function _row(type, y, x0, x1, color) {
  const out = [];
  for (let x=x0; x<=x1; x++) out.push(_obj(type, x, y, color));
  return out;
}

function wcBuildPresets() {
  // ── Preset 0 : Neon Corridor ─────────────────────────────
  // Deep-space cyan rush with spike gauntlets and glow trails
  const p0 = [];
  const floorY=11, ceilY=-1, len=120;
  p0.push(..._row('block',floorY,0,len,'#0e2350'));   // floor
  p0.push(..._row('block',ceilY, 0,len,'#0e2350'));   // ceiling
  // Block pillars (leave 3-unit passages) — first half
  [[6,9,10],[13,9,10],[20,8,9],[27,9,10],[34,8,10],[41,9,10],[48,8,9],[55,9,10]].forEach(([x,y1,y2])=>{
    for(let y=y1;y<=y2;y++) p0.push(_obj('block',x,y,'#1a4080'));
  });
  // Block pillars — second half (tiles 64-120)
  [[66,9,10],[73,8,9],[80,9,10],[87,8,10],[94,9,10],[101,8,9],[108,9,10],[115,8,9]].forEach(([x,y1,y2])=>{
    for(let y=y1;y<=y2;y++) p0.push(_obj('block',x,y,'#1e5090'));
  });
  // Spikes on floor (first 6 tiles clear for safe start)
  [8,12,16,22,26,30,36,40,44,50,54,58,65,70,75,80,85,90,96,102,108,114,118].forEach(x=>p0.push(_obj('spike',x,floorY-1,'#ff4466')));
  // Spikes on ceiling (first 6 tiles clear for safe start)
  [10,18,24,32,38,46,52,60,68,76,84,92,100,110,116].forEach(x=>p0.push(_obj('spike_down',x,ceilY+1,'#ff4466')));
  // Coins in the corridor
  [3,9,15,21,28,35,43,50,58,67,74,81,88,95,103,111,117].forEach(x=>p0.push(_obj('coin',x,6,'#ffe66d')));
  // Glow orbs drifting top
  [2,10,18,26,34,42,50,58,66,74,82,90,98,106,114].forEach(x=>p0.push(_obj('glow_orb',x,2,'#00e5ff')));
  // Speed portals (slow-down, speed-up, extra pair in second half)
  p0.push(_obj('portal_speed',22,5,'#22c55e',{speed:0.7,layer:2}));
  p0.push(_obj('portal_speed',44,5,'#00e5ff',{speed:1.6,layer:2}));
  p0.push(_obj('portal_speed',82,5,'#22c55e',{speed:0.7,layer:2}));
  p0.push(_obj('portal_speed',104,5,'#00e5ff',{speed:1.8,layer:2}));
  // Pulse lights near floor
  [5,12,19,26,33,40,47,54,61,68,75,82,89,96,103,110,117].forEach(x=>p0.push(_obj('pulse_light',x,9,'#00e5ff')));
  // Stars bg
  [1,7,14,22,30,38,46,54,62,70,78,86,94,102,110,118].forEach(x=>p0.push(_obj('star',x,1,'#00aaff',{layer:1})));

  // ── Preset 1 : Rainbow Rush ──────────────────────────────
  // Colorful cascading pillars, every obstacle a different hue
  const p1 = [];
  const RAINBOW=['#ff6b6b','#fb923c','#ffe66d','#22c55e','#00e5ff','#a855f7','#ec4899'];
  p1.push(..._row('block',floorY,0,len,'#1a0a2e'));
  p1.push(..._row('block',ceilY, 0,len,'#1a0a2e'));
  // Colorful pillar walls — full 120-tile span
  const pillars=[
    {x:5, h:3, c:'#ff6b6b'},{x:10,h:2,c:'#fb923c'},{x:15,h:4,c:'#ffe66d'},
    {x:20,h:2,c:'#22c55e'},{x:25,h:3,c:'#00e5ff'},{x:30,h:5,c:'#a855f7'},
    {x:35,h:2,c:'#ec4899'},{x:40,h:3,c:'#ff6b6b'},{x:45,h:4,c:'#fb923c'},
    {x:50,h:2,c:'#ffe66d'},{x:55,h:3,c:'#22c55e'},{x:60,h:2,c:'#00e5ff'},
    // second half (tiles 64-120)
    {x:67,h:4,c:'#a855f7'},{x:72,h:2,c:'#ff6b6b'},{x:77,h:5,c:'#fb923c'},
    {x:82,h:3,c:'#ffe66d'},{x:87,h:2,c:'#22c55e'},{x:92,h:4,c:'#00e5ff'},
    {x:97,h:3,c:'#a855f7'},{x:102,h:5,c:'#ec4899'},{x:107,h:2,c:'#ff6b6b'},
    {x:112,h:3,c:'#fb923c'},{x:117,h:4,c:'#ffe66d'},
  ];
  pillars.forEach(({x,h,c})=>{
    for(let i=0;i<h;i++) p1.push(_obj('block',x,floorY-1-i,c));
  });
  // Ceiling spikes in matching colors
  pillars.forEach(({x,c},i)=>{
    if(i%2===0) p1.push(_obj('spike_down',x,ceilY+1,c));
  });
  // Floor spikes between pillars (first 6 tiles clear for safe start)
  [8,13,18,23,28,33,38,43,48,53,58,65,70,75,80,85,90,95,100,105,110,115].forEach((x,i)=>
    p1.push(_obj('spike',x,floorY-1,RAINBOW[i%7]))
  );
  // Coins above each pillar
  pillars.forEach(({x,h,c})=>p1.push(_obj('coin',x,floorY-h-2,c)));
  // Glow orbs — rainbow (spread over full length)
  RAINBOW.forEach((c,i)=>p1.push(_obj('glow_orb',i*8+4,3,c)));
  RAINBOW.forEach((c,i)=>p1.push(_obj('glow_orb',i*8+68,3,c)));
  // Jump rings
  [18,36,54,72,90,108].forEach((x,i)=>p1.push(_obj('jump_ring',x,6,RAINBOW[i%7])));
  // Stars all colors
  for(let i=0;i<20;i++) p1.push(_obj('star',i*6+2,1,RAINBOW[i%7],{layer:1}));
  // Particle sources
  [0,32,64,96,120].forEach(x=>p1.push(_obj('particle_src',x,5,'#ec4899',{layer:1})));

  // ── Preset 2 : Gravity Flip ──────────────────────────────
  // Gravity portals flip the world — survive both orientations
  const p2 = [];
  p2.push(..._row('block',floorY,0,len,'#200030'));
  p2.push(..._row('block',ceilY, 0,len,'#200030'));
  // Both-side spike gauntlets — first half (first 6 tiles clear for safe start)
  [9,11,13,19,21,23,25,35,37,39,41,51,53,55,57].forEach(x=>{
    p2.push(_obj('spike',     x,floorY-1,'#ff44cc'));
    p2.push(_obj('spike_down',x,ceilY+1, '#44aaff'));
  });
  // Both-side spike gauntlets — second half (tighter!)
  [67,69,71,73,83,85,87,89,99,101,103,105,111,113,115,117].forEach(x=>{
    p2.push(_obj('spike',     x,floorY-1,'#cc44ff'));
    p2.push(_obj('spike_down',x,ceilY+1, '#ff44aa'));
  });
  // Open safe zones with blocks — first half
  [[13,8,10,'#a855f7'],[29,8,10,'#ec4899'],[45,7,9,'#a855f7'],[61,8,10,'#c084fc']].forEach(([x,y1,y2,c])=>{
    for(let y=y1;y<=y2;y++) p2.push(_obj('block',x,y,c));
    for(let y=y1;y<=y2;y++) p2.push(_obj('block',x+1,y,c));
  });
  // Open safe zones — second half
  [[77,8,10,'#7c3aed'],[93,7,9,'#c026d3'],[109,8,10,'#a855f7']].forEach(([x,y1,y2,c])=>{
    for(let y=y1;y<=y2;y++) p2.push(_obj('block',x,y,c));
    for(let y=y1;y<=y2;y++) p2.push(_obj('block',x+1,y,c));
  });
  // Gravity flip portals (every 10 tiles)
  [10,20,30,40,50,60,70,80,90,100,110].forEach(x=>
    p2.push(_obj('portal_grav',x,5,'#a855f7',{layer:2}))
  );
  // Coins scattered in middle
  [6,14,22,28,36,44,52,60,66,74,82,88,96,104,112,118].forEach((x,i)=>
    p2.push(_obj('coin',x, i%2===0?5:6,'#ffe66d'))
  );
  // Pulsing purple lights
  [2,8,15,22,30,38,46,54,62,70,78,86,94,102,110,118].forEach(x=>p2.push(_obj('pulse_light',x,5,'#a855f7')));
  // Glow orbs
  [4,12,20,28,36,44,52,60,68,76,84,92,100,108,116].forEach(x=>p2.push(_obj('glow_orb',x,2,'#ec4899')));
  // BG grid decoration
  for(let x=0;x<len;x+=4) p2.push(_obj('bg_grid',x,4,'#300050',{layer:1,scale:2}));

  // ── Preset 3 : Coin Heaven ───────────────────────────────
  // Treasure maze — collect all coins, avoid traps
  const p3 = [];
  p3.push(..._row('block',floorY,0,len,'#2a1500'));
  p3.push(..._row('block',ceilY, 0,len,'#2a1500'));
  // Horizontal guide platforms (thin) — full length
  [[8,2,12,'#fb923c'],[20,8,14,'#ffe66d'],[32,4,10,'#fb923c'],[44,6,12,'#ffe66d'],[56,3,9,'#fb923c'],
   [70,2,76,'#ff9900'],[82,7,88,'#ffe66d'],[94,4,100,'#fb923c'],[106,6,112,'#ffe66d'],[116,3,119,'#ff9900']].forEach(([x,y,x2,c])=>{
    for(let xx=x;xx<=x2;xx++) p3.push(_obj('platform',xx,y,c));
  });
  // Dense coin rows — 3 staggered rows (full length)
  for(let x=2;x<len;x+=2) p3.push(_obj('coin',x,4,'#ffe66d'));
  for(let x=3;x<len;x+=3) p3.push(_obj('coin',x,7,'#fb923c'));
  for(let x=4;x<len;x+=4) p3.push(_obj('coin',x,10,'#ff9900'));
  // Spikes guarding coins
  [6,14,22,32,40,50,58,66,74,84,92,102,110,118].forEach(x=>{
    p3.push(_obj('spike',x,floorY-1,'#ff6b6b'));
    p3.push(_obj('spike_down',x,ceilY+1,'#ff6b6b'));
  });
  // Jump rings — help collect high coins
  [10,24,38,52,68,82,96,112].forEach(x=>p3.push(_obj('jump_ring',x,8,'#ffe66d')));
  // Speed portals scattered (extra burst in second half)
  [16,34,56].forEach(x=>p3.push(_obj('portal_speed',x,5,'#fb923c',{speed:1.4,layer:2})));
  [72,90,108].forEach(x=>p3.push(_obj('portal_speed',x,5,'#ff9900',{speed:1.6,layer:2})));
  // Pulse lights (golden glow)
  for(let x=0;x<len;x+=5) p3.push(_obj('pulse_light',x,2,'#ffe66d'));
  // Glow orbs (orange)
  [6,18,30,42,54,66,78,90,102,114].forEach(x=>p3.push(_obj('glow_orb',x,9,'#fb923c')));
  // Stars bg decor
  for(let x=0;x<len;x+=3) p3.push(_obj('star',x,0,'#ffe66d',{layer:1}));

  return [
    { name:'Neon Corridor', emoji:'🌊', bgColor:'#010214', speed:4, endTile:120, objects:p0 },
    { name:'Rainbow Rush',  emoji:'🌈', bgColor:'#0a0018', speed:4, endTile:120, objects:p1 },
    { name:'Gravity Flip',  emoji:'🔄', bgColor:'#0f0020', speed:4, endTile:120, objects:p2 },
    { name:'Coin Heaven',   emoji:'🪙', bgColor:'#130800', speed:4, endTile:120, objects:p3 },
  ];
}

let WC_PRESETS = null;  // lazy-built on first use

// ── Load a preset into the editor ────────────────────────────
function wcLoadPreset(idx) {
  if (!WC_PRESETS) WC_PRESETS = wcBuildPresets();
  const preset = WC_PRESETS[idx];
  if (!preset) return;

  wcState.objects    = preset.objects.map(o=>({...o}));
  wcState.selected   = [];
  wcState.undoStack  = [];
  wcState.redoStack  = [];
  wcState.bgColor    = preset.bgColor;
  wcState.levelSpeed = preset.speed;
  wcLevelData.bgColor = preset.bgColor;
  wcLevelData.speed   = preset.speed;
  wcLevelData.startTile = preset.startTile ?? 2;
  wcLevelData.startY    = preset.startY    ?? 6;
  wcLevelData.endTile   = preset.endTile   || 120;

  // Sync UI
  const stInp2 = document.getElementById('wc-start-tile');
  if (stInp2) stInp2.value = wcLevelData.startTile;
  const etInp2 = document.getElementById('wc-end-tile');
  if (etInp2) etInp2.value = wcLevelData.endTile;
  const bgEl  = document.getElementById('wc-bg-color');
  const spdEl = document.getElementById('wc-lvl-speed');
  if (bgEl)  bgEl.value  = preset.bgColor;
  if (spdEl) spdEl.value = preset.speed;
  wcChangeSpeed(preset.speed);

  document.getElementById('wc-level-name').value = preset.name;

  // Highlight active preset button
  document.querySelectorAll('.wc-preset-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('pre-btn-' + idx);
  if (btn) btn.classList.add('active');

  wcUpdateObjCount();
  wcRenderEditor();
  showToast(`Loaded "${preset.name}" — ${preset.objects.length} objects`, preset.emoji);
}

// ── Clear all objects ────────────────────────────────────────
function wcClearAll() {
  if (wcState.objects.length === 0) { showToast('Canvas is already empty!','✨'); return; }
  wcPushUndo();
  wcState.objects = [];
  wcState.selected = [];
  // Remove active preset highlight
  document.querySelectorAll('.wc-preset-btn').forEach(b => b.classList.remove('active'));
  wcUpdateObjCount();
  wcShowPropPanel();
  wcRenderEditor();
  showToast('Canvas cleared','🗑️');
}

// ── Canvas refs ──────────────────────────────────────────────
let wcCanvas, wcCtx, wcWrap;
let wcPlayCanvas, wcPlayCtx;     // for community level modal

// ── Init ─────────────────────────────────────────────────────
function wcInit() {
  wcCanvas  = document.getElementById('wc-canvas');
  wcCtx     = wcCanvas.getContext('2d');
  wcWrap    = document.getElementById('wc-canvas-wrap');
  wcPlayCanvas = document.getElementById('wc-play-canvas');
  if (wcPlayCanvas) wcPlayCtx = wcPlayCanvas.getContext('2d');

  wcResizeCanvas();
  wcBuildPalette();
  wcBuildColorRow();
  wcBuildLayers();
  wcBindEvents();
  wcInitScrollbar();
  wcRenderEditor();
  wcRenderMyLevels();
  wcRenderCommunity();
  wcRenderProfile();
  wcUpdateSpeedLabel(wcState.levelSpeed); // init speed label
  // Auto-load the first preset so the editor is never empty on first visit
  wcLoadPreset(0);

  recordVisit('wave');
  updateSidebarLevel();
  updateUsernameDisplay();
}

// ── Resize canvas to fill container ─────────────────────────
function wcResizeCanvas() {
  const r = wcWrap.getBoundingClientRect();
  wcCanvas.width  = Math.max(200, r.width  || 800);
  wcCanvas.height = Math.max(200, r.height || 400);
}

// ── Build palette buttons ────────────────────────────────────
function wcBuildPalette() {
  const cats = { blocks:'blocks', hazards:'hazards', specials:'specials', decor:'decor', triggers:'triggers', level:'level' };
  for (const [cat, id] of Object.entries(cats)) {
    const el = document.getElementById('wc-obj-grid-' + id);
    if (!el) continue;
    el.innerHTML = '';
    for (const [key, def] of Object.entries(WC_OBJECTS)) {
      if (def.cat !== cat) continue;
      const btn = document.createElement('div');
      btn.className = 'wc-obj-btn' + (key === wcState.objType ? ' selected' : '');
      btn.id = 'obj-btn-' + key;
      btn.title = def.label;
      btn.innerHTML = `<span class="wc-obj-icon">${def.icon}</span><span class="wc-obj-label">${def.label}</span>`;
      btn.onclick = () => wcSelectObjType(key);
      el.appendChild(btn);
    }
  }
}

// ── Build color row ──────────────────────────────────────────
function wcBuildColorRow() {
  const el = document.getElementById('wc-color-row');
  if (!el) return;
  el.innerHTML = '';
  PALETTE_COLORS.forEach(c => {
    const dot = document.createElement('div');
    dot.className = 'wc-color-dot' + (c === wcState.color ? ' selected' : '');
    dot.style.background = c;
    dot.title = c;
    dot.onclick = () => {
      wcState.color = c;
      document.querySelectorAll('.wc-color-dot').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
    };
    el.appendChild(dot);
  });
}

// ── Build layers ─────────────────────────────────────────────
function wcBuildLayers() {
  const el = document.getElementById('wc-layers');
  if (!el) return;
  el.innerHTML = '';
  const layers = [ {id:3,label:'⬆ Foreground'}, {id:2,label:'◆ Main'}, {id:1,label:'⬇ Background'} ];
  layers.forEach(l => {
    const row = document.createElement('div');
    row.className = 'wc-layer-row' + (l.id === wcState.layer ? ' active' : '');
    row.id = 'layer-row-' + l.id;
    row.innerHTML = `<span>${l.label}</span><span style="font-size:10px;opacity:.5">${l.id}</span>`;
    row.onclick = () => {
      wcState.layer = l.id;
      document.querySelectorAll('.wc-layer-row').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
    };
    el.appendChild(row);
  });
}

// ── Tool setter ──────────────────────────────────────────────
function wcSetTool(t) {
  wcState.tool = t;
  document.querySelectorAll('.wc-tool-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('tool-' + t);
  if (btn) btn.classList.add('active');
}

// ── Object type selector ─────────────────────────────────────
function wcSelectObjType(key) {
  wcState.objType = key;
  document.querySelectorAll('.wc-obj-btn').forEach(b => b.classList.remove('selected'));
  const btn = document.getElementById('obj-btn-' + key);
  if (btn) btn.classList.add('selected');
  // Level markers always use place mode — one click sets the position
  const def = WC_OBJECTS[key];
  if (def && (def.startMarker || def.endMarker)) {
    wcSetTool('place');
  } else if (wcState.tool === 'select') {
    wcSetTool('place');
  }
  // Set default color from type
  if (def) { wcState.color = def.color; wcBuildColorRow(); }
}

// ── Canvas event binding ─────────────────────────────────────
function wcBindEvents() {
  const c = wcCanvas;

  c.addEventListener('mousedown', e => {
    if (wcPlay.active) return;
    // Check if clicking on the start-line drag handle (within 10px)
    if (Math.abs(e.offsetX - (wcState._startLineCanvasX || -999)) < 10) {
      wcState.draggingStartLine = true;
      c.style.cursor = 'ew-resize';
      return;
    }
    // Check if clicking on the end-line drag handle (within 10px)
    if (Math.abs(e.offsetX - (wcState._endLineCanvasX || -999)) < 10) {
      wcState.draggingEndLine = true;
      c.style.cursor = 'ew-resize';
      return;
    }
    const pos = wcCanvasToWorld(e.offsetX, e.offsetY);
    wcState.dragStart = pos;
    wcState.dragging = true;
    wcState.multiSel = e.shiftKey;
    wcHandlePointerDown(pos, e);
  });

  c.addEventListener('mousemove', e => {
    if (wcPlay.active) return;
    wcState._mouseX = e.offsetX;
    wcState._mouseY = e.offsetY;
    // Start-line dragging
    if (wcState.draggingStartLine) {
      const pos = wcCanvasToWorld(e.offsetX, e.offsetY);
      wcLevelData.startTile = Math.max(0, Math.round(pos.wx));
      wcLevelData.startY    = Math.max(0, Math.round(pos.wy));
      const inpX = document.getElementById('wc-start-tile');
      if (inpX) inpX.value = wcLevelData.startTile;
      wcRenderEditor();
      return;
    }
    // End-line dragging
    if (wcState.draggingEndLine) {
      const pos = wcCanvasToWorld(e.offsetX, e.offsetY);
      const newTile = Math.max(10, Math.round(pos.wx));
      wcLevelData.endTile = newTile;
      const inp = document.getElementById('wc-end-tile');
      if (inp) inp.value = newTile;
      wcRenderEditor();
      return;
    }
    // Cursor hints near the marker lines
    const nearStart = Math.abs(e.offsetX - (wcState._startLineCanvasX || -999)) < 10;
    const nearEnd   = Math.abs(e.offsetX - (wcState._endLineCanvasX   || -999)) < 10;
    c.style.cursor = (nearStart || nearEnd) ? 'ew-resize' : 'crosshair';
    const pos = wcCanvasToWorld(e.offsetX, e.offsetY);
    wcUpdateCursorPos(pos);
    if (wcState.dragging) wcHandlePointerMove(pos, e);
    wcRenderEditor();
  });

  c.addEventListener('mouseup', e => {
    if (wcPlay.active) return;
    if (wcState.draggingStartLine) {
      wcState.draggingStartLine = false;
      wcMarkLevelDirty();
      c.style.cursor = 'crosshair';
      return;
    }
    if (wcState.draggingEndLine) {
      wcState.draggingEndLine = false;
      c.style.cursor = 'crosshair';
      return;
    }
    const pos = wcCanvasToWorld(e.offsetX, e.offsetY);
    if (wcState.dragging) wcHandlePointerUp(pos, e);
    wcState.dragging = false;
    wcState.dragStart = null;
  });

  c.addEventListener('mouseleave', () => {
    if (!wcPlay.active) {
      wcState.dragging = false;
      wcState.draggingEndLine   = false;
      wcState.draggingStartLine = false;
      wcState._mouseX = undefined;
    }
  });

  // Zoom with scroll
  c.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1/1.1;
    wcZoom(factor, e.offsetX, e.offsetY);
  }, { passive:false });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); wcUndo(); }
    if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); wcRedo(); }
    if (e.ctrlKey && e.key === 'c') { e.preventDefault(); wcCopy(); }
    if (e.ctrlKey && e.key === 'v') { e.preventDefault(); wcPaste(); }
    if (e.ctrlKey && e.key === 'a') { e.preventDefault(); wcSelAll(); }
    if (e.key === 'Delete' || e.key === 'Backspace') wcDeleteSel();
    if (e.key === 'Escape') { wcClearSel(); wcRenderEditor(); }
    // Editor shortcuts only when not playing
    if (!wcPlay.active) {
      if (e.key === 'q') wcSetTool('select');
      if (e.key === 'w') wcSetTool('place');
      if (e.key === 'e') wcSetTool('erase');
      if (e.key === ' ') { e.preventDefault(); wcStartPlay(false); }
    }
    // Escape always stops play
    if (e.key === 'Escape') { if (wcPlay.active) wcStopPlay(); else { wcClearSel(); wcRenderEditor(); } }
  });

  // Touch support
  c.addEventListener('touchstart', e => {
    if (wcPlay.active) return; // play mode handles touch via wcHoldOn
    const t = e.touches[0];
    const r = c.getBoundingClientRect();
    const pos = wcCanvasToWorld(t.clientX - r.left, t.clientY - r.top);
    wcState.dragStart = pos; wcState.dragging = true;
    wcHandlePointerDown(pos, { shiftKey:false });
    e.preventDefault();
  }, { passive:false });

  c.addEventListener('touchmove', e => {
    if (wcPlay.active) return;
    const t = e.touches[0];
    const r = c.getBoundingClientRect();
    const pos = wcCanvasToWorld(t.clientX - r.left, t.clientY - r.top);
    wcUpdateCursorPos(pos);
    if (wcState.dragging) wcHandlePointerMove(pos, {});
    wcRenderEditor();
    e.preventDefault();
  }, { passive:false });

  c.addEventListener('touchend', e => {
    if (wcPlay.active) return;
    const t = e.changedTouches[0];
    const r = c.getBoundingClientRect();
    const pos = wcCanvasToWorld(t.clientX - r.left, t.clientY - r.top);
    if (wcState.dragging) wcHandlePointerUp(pos, {});
    wcState.dragging = false;
    e.preventDefault();
  }, { passive:false });

  window.addEventListener('resize', () => { wcResizeCanvas(); wcRenderEditor(); });
}

// ── Coordinate transforms ────────────────────────────────────
function wcCanvasToWorld(cx, cy) {
  const g = wcState.gridSize * wcState.zoom;
  const wx = (cx - wcState.panX) / g;
  const wy = (cy - wcState.panY) / g;
  return { wx, wy };
}

function wcWorldToCanvas(wx, wy) {
  const g = wcState.gridSize * wcState.zoom;
  return { cx: wx * g + wcState.panX, cy: wy * g + wcState.panY };
}

function wcSnapGrid(v) { return Math.floor(v); }

// ── Pointer handlers ─────────────────────────────────────────
function wcHandlePointerDown(pos, e) {
  const gx = wcSnapGrid(pos.wx), gy = wcSnapGrid(pos.wy);

  if (wcState.tool === 'select') {
    const hit = wcHitTest(gx, gy);
    if (hit >= 0) {
      if (!e.shiftKey) wcState.selected = [hit];
      else {
        const i = wcState.selected.indexOf(hit);
        if (i >= 0) wcState.selected.splice(i,1);
        else wcState.selected.push(hit);
      }
    } else {
      if (!e.shiftKey) wcState.selected = [];
    }
    wcShowPropPanel();
  } else if (wcState.tool === 'place') {
    wcPushUndo();
    wcPlaceObject(gx, gy);
  } else if (wcState.tool === 'erase') {
    wcPushUndo();
    wcEraseAt(gx, gy);
  } else if (wcState.tool === 'fill') {
    wcPushUndo();
    wcFill(gx, gy);
  }
}

function wcHandlePointerMove(pos, e) {
  const gx = wcSnapGrid(pos.wx), gy = wcSnapGrid(pos.wy);
  if (wcState.tool === 'place' && wcState.dragging) {
    wcPlaceObject(gx, gy);
  } else if (wcState.tool === 'erase' && wcState.dragging) {
    wcEraseAt(gx, gy);
  } else if (wcState.tool === 'select' && wcState.dragging && wcState.selected.length > 0) {
    // Move selected objects
    if (wcState.dragStart) {
      const dx = gx - wcSnapGrid(wcState.dragStart.wx);
      const dy = gy - wcSnapGrid(wcState.dragStart.wy);
      if (dx !== 0 || dy !== 0) {
        wcState.selected.forEach(i => {
          wcState.objects[i].gx += dx;
          wcState.objects[i].gy += dy;
        });
        wcState.dragStart = pos;
      }
    }
  }
}

function wcHandlePointerUp(pos, e) {
  // If objects were moved via select drag, mark level dirty
  if (wcState.tool === 'select' && wcState.selected.length > 0) {
    wcMarkLevelDirty();
  }
  wcRenderEditor();
}

// ── Dirty flag — reset beat verification when level changes ──
function wcMarkLevelDirty() {
  if (wcPlay.best > 0) {
    wcPlay.best = 0;
    const uploadBtn = document.querySelector('[onclick="wcUploadLevel()"]');
    if (uploadBtn) {
      uploadBtn.textContent = '⬆️ Upload 🔒';
      uploadBtn.title = 'Beat your own level to unlock uploading! 🏆';
      uploadBtn.style.boxShadow = '';
    }
    showToast('Level edited — beat it again to re-verify! 🔒', '✏️');
  }
}

// ── Object operations ────────────────────────────────────────
function wcPlaceObject(gx, gy) {
  // Special: start_marker sets the spawn point
  if (wcState.objType === 'start_marker') {
    const newX = Math.max(0, gx);
    const newY = Math.max(0, gy);
    if (newX === wcLevelData.startTile && newY === wcLevelData.startY) return;
    wcLevelData.startTile = newX;
    wcLevelData.startY    = newY;
    const inpX = document.getElementById('wc-start-tile');
    if (inpX) inpX.value = newX;
    wcMarkLevelDirty();
    wcRenderEditor();
    return;
  }

  // Special: end_marker moves the end line instead of placing an object
  if (wcState.objType === 'end_marker') {
    const newTile = Math.max(10, gx);
    if (newTile === wcLevelData.endTile) return; // no change
    wcLevelData.endTile = newTile;
    const inp = document.getElementById('wc-end-tile');
    if (inp) inp.value = newTile;
    wcMarkLevelDirty();
    wcRenderEditor();
    return;
  }

  // Don't double-place same type at same position
  const dup = wcState.objects.findIndex(o => o.gx===gx && o.gy===gy && o.layer===wcState.layer);
  if (dup >= 0) return;

  const def = WC_OBJECTS[wcState.objType];
  wcState.objects.push({
    type:  wcState.objType,
    gx, gy,
    layer: wcState.layer,
    rot:   0,
    scale: 1,
    color: wcState.color || def.color,
    speed: 1,
    grav:  'down',
    flip:  false,
  });
  wcUpdateObjCount();
  wcMarkLevelDirty();
}

function wcEraseAt(gx, gy) {
  const i = wcHitTest(gx, gy);
  if (i >= 0) {
    wcState.objects.splice(i, 1);
    wcState.selected = wcState.selected.filter(s => s !== i).map(s => s > i ? s-1 : s);
    wcUpdateObjCount();
    wcShowPropPanel();
    wcMarkLevelDirty();
  }
}

function wcFill(gx, gy) {
  // Fill a 5×3 region around click
  for (let dx=-2; dx<=2; dx++) for (let dy=-1; dy<=1; dy++) wcPlaceObject(gx+dx, gy+dy);
}

function wcHitTest(gx, gy) {
  // Check current layer first, then others
  for (let i=wcState.objects.length-1; i>=0; i--) {
    const o = wcState.objects[i];
    if (o.layer === wcState.layer && o.gx === gx && o.gy === gy) return i;
  }
  for (let i=wcState.objects.length-1; i>=0; i--) {
    const o = wcState.objects[i];
    if (o.gx === gx && o.gy === gy) return i;
  }
  return -1;
}

function wcDeleteSel() {
  if (!wcState.selected.length) return;
  wcPushUndo();
  const keep = wcState.objects.filter((_,i) => !wcState.selected.includes(i));
  wcState.objects = keep;
  wcState.selected = [];
  wcShowPropPanel();
  wcUpdateObjCount();
  wcRenderEditor();
}

function wcDuplicateSel() {
  if (!wcState.selected.length) return;
  wcPushUndo();
  const newObjs = wcState.selected.map(i => ({...wcState.objects[i], gx:wcState.objects[i].gx+1, gy:wcState.objects[i].gy+1}));
  const startIdx = wcState.objects.length;
  wcState.objects.push(...newObjs);
  wcState.selected = newObjs.map((_,j) => startIdx+j);
  wcRenderEditor();
}

function wcFlipSel() {
  if (!wcState.selected.length) return;
  wcPushUndo();
  wcState.selected.forEach(i => { wcState.objects[i].flip = !wcState.objects[i].flip; });
  wcRenderEditor();
}

function wcClearSel() { wcState.selected = []; wcShowPropPanel(); }
function wcSelAll()   { wcState.selected = wcState.objects.map((_,i)=>i); wcShowPropPanel(); wcRenderEditor(); }

function wcCopy()  { wcState.clipboard = wcState.selected.map(i=>({...wcState.objects[i]})); }
function wcPaste() {
  if (!wcState.clipboard.length) return;
  wcPushUndo();
  const start = wcState.objects.length;
  wcState.clipboard.forEach(o => wcState.objects.push({...o, gx:o.gx+1, gy:o.gy+1}));
  wcState.selected = wcState.clipboard.map((_,j)=>start+j);
  wcRenderEditor();
}

// ── Property panel ───────────────────────────────────────────
function wcShowPropPanel() {
  const noSel = document.getElementById('wc-no-sel');
  const selProps = document.getElementById('wc-sel-props');
  if (wcState.selected.length === 0) {
    noSel.style.display=''; selProps.style.display='none'; return;
  }
  noSel.style.display='none'; selProps.style.display='';
  const o = wcState.objects[wcState.selected[0]];
  if (!o) return;
  const def = WC_OBJECTS[o.type] || {};
  document.getElementById('wc-prop-type').textContent  = (def.icon||'') + ' ' + (def.label||o.type);
  document.getElementById('wc-prop-rot').value         = o.rot   || 0;
  document.getElementById('wc-prop-scale').value       = o.scale || 1;
  document.getElementById('wc-prop-color').value       = o.color || def.color || '#ffffff';
  document.getElementById('wc-prop-speed-row').style.display = def.portal==='speed' ? '' : 'none';
  document.getElementById('wc-prop-grav-row').style.display  = def.portal==='grav'  ? '' : 'none';
  if (def.portal==='speed') document.getElementById('wc-prop-speed').value = o.speed||1;
  if (def.portal==='grav')  document.getElementById('wc-prop-grav').value  = o.grav||'down';

  // Group ID row — shown for all objects except level markers
  const isMarker = def.startMarker || def.endMarker;
  const groupRow = document.getElementById('wc-prop-group-row');
  if (groupRow) {
    groupRow.style.display = isMarker ? 'none' : '';
    if (!isMarker) document.getElementById('wc-prop-group').value = o.group || 0;
  }

  // Trigger-specific rows
  const isTrigger = !!def.trigger;
  const trigSection = document.getElementById('wc-prop-trigger-section');
  if (trigSection) {
    trigSection.style.display = isTrigger ? '' : 'none';
    if (isTrigger) {
      document.getElementById('wc-prop-tgt-group').value  = o.targetGroup  || 1;
      document.getElementById('wc-prop-trig-dur').value   = o.duration      || 1;
      document.getElementById('wc-prop-move-row').style.display   = def.triggerMove   ? '' : 'none';
      document.getElementById('wc-prop-move-row-y').style.display = def.triggerMove   ? '' : 'none';
      document.getElementById('wc-prop-rotate-row').style.display = def.triggerRotate ? '' : 'none';
      document.getElementById('wc-prop-color-row').style.display  = def.triggerColor  ? '' : 'none';
      document.getElementById('wc-prop-alpha-row').style.display  = def.triggerAlpha  ? '' : 'none';
      if (def.triggerMove)   { document.getElementById('wc-prop-movex').value = o.moveX||0; document.getElementById('wc-prop-movey').value = o.moveY||0; }
      if (def.triggerRotate) { document.getElementById('wc-prop-degrees').value = o.degrees||90; }
      if (def.triggerColor)  { document.getElementById('wc-prop-trig-color').value = o.triggerColor||'#ff0000'; }
      if (def.triggerAlpha)  { document.getElementById('wc-prop-talpha').value = o.targetAlpha ?? 0; }
    }
  }
}

function wcPropChange(prop, val) {
  wcPushUndo();
  wcState.selected.forEach(i => { wcState.objects[i][prop] = val; });
  wcRenderEditor();
}

// ── Level settings ───────────────────────────────────────────
function wcSetBgColor(v)      { wcState.bgColor = v; wcLevelData.bgColor = v; wcRenderEditor(); }
function wcSetLevelSpeed(v)   { wcState.levelSpeed = v; wcLevelData.speed = v; }
function wcSetLevelLength(v)  { wcLevelData.endTile = Math.max(10, +v); const inp=document.getElementById('wc-end-tile'); if(inp) inp.value=wcLevelData.endTile; wcMarkLevelDirty(); wcRenderEditor(); }
function wcSetEndTile(v)      { wcSetLevelLength(v); }
function wcSetStartTile(v)    { wcLevelData.startTile = Math.max(0, +v); wcMarkLevelDirty(); wcRenderEditor(); }
function wcSetDifficulty(v)   { wcLevelData.difficulty = v; }

// Live speed control — usable both in editor and during play
function wcChangeSpeed(v) {
  const spd = parseFloat(v);
  wcState.levelSpeed = spd;
  wcLevelData.speed  = spd;
  if (wcPlay.active) wcPlay.speed = spd; // apply immediately
  // keep editor dropdown in sync
  const sel = document.getElementById('wc-lvl-speed');
  if (sel) {
    // find closest option
    let best = null, bestDiff = Infinity;
    for (const opt of sel.options) {
      const d = Math.abs(parseFloat(opt.value) - spd);
      if (d < bestDiff) { bestDiff = d; best = opt; }
    }
    if (best) best.selected = true;
  }
  wcUpdateSpeedLabel(spd);
}

function wcUpdateSpeedLabel(spd) {
  const el = document.getElementById('wc-speed-val');
  if (el) {
    const names = { 1:'Crawl', 2:'Very Slow', 3:'Slow', 4:'Slow', 5:'Normal',
                    6:'Normal', 7:'Fast', 8:'Fast', 9:'Fast', 10:'Very Fast',
                    11:'Very Fast', 12:'Max', 13:'Max' };
    const name = names[Math.round(spd)] || (spd < 4 ? 'Slow' : spd < 8 ? 'Normal' : 'Fast');
    el.textContent = `Speed: ${name} (${spd})`;
  }
}
function wcSetGridSize(v)     { wcState.gridSize = v; wcRenderEditor(); }

// ── Zoom ─────────────────────────────────────────────────────
function wcZoom(factor, cx, cy) {
  const prevZoom = wcState.zoom;
  wcState.zoom = Math.max(0.25, Math.min(4, wcState.zoom * factor));
  if (cx != null) {
    // Zoom toward cursor point
    wcState.panX = cx - (cx - wcState.panX) * (wcState.zoom / prevZoom);
    wcState.panY = cy - (cy - wcState.panY) * (wcState.zoom / prevZoom);
  }
  document.getElementById('wc-zoom-label').textContent = 'Zoom: ' + Math.round(wcState.zoom*100) + '%';
  wcRenderEditor();
}
function wcResetZoom() { wcState.zoom=1; wcState.panX=0; wcState.panY=0; wcZoom(1); wcRenderEditor(); }

// ── Horizontal scrollbar ─────────────────────────────────────
// The scrollbar lives below the canvas and maps panX ↔ scroll position.
// totalLevelPx  = endTile * gridSize * zoom  (full level width in canvas pixels)
// visiblePx     = canvas.width
// If totalLevelPx <= visiblePx the scrollbar hides itself.

let _hscrollDragging = false;
let _hscrollDragStartX = 0;
let _hscrollDragStartPan = 0;

function wcInitScrollbar() {
  const track = document.getElementById('wc-hscroll-track');
  const thumb = document.getElementById('wc-hscroll-thumb');
  if (!track || !thumb) return;

  // Thumb drag
  thumb.addEventListener('mousedown', e => {
    _hscrollDragging = true;
    _hscrollDragStartX   = e.clientX;
    _hscrollDragStartPan = wcState.panX;
    thumb.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // Track click — jump to position
  track.addEventListener('mousedown', e => {
    if (e.target === thumb) return;
    const tr = track.getBoundingClientRect();
    const ratio = (e.clientX - tr.left) / tr.width;
    wcScrollbarSetRatio(ratio);
  });

  document.addEventListener('mousemove', e => {
    if (!_hscrollDragging) return;
    const tr = track.getBoundingClientRect();
    const totalPx  = (wcLevelData.endTile || 120) * wcState.gridSize * wcState.zoom;
    const visiblePx = wcCanvas.width;
    const scrollable = Math.max(0, totalPx - visiblePx);
    const trackW = tr.width;
    const thumbW = Math.max(40, (visiblePx / totalPx) * trackW);
    const maxThumbX = trackW - thumbW;
    const dx = e.clientX - _hscrollDragStartX;
    const newThumbX = Math.max(0, Math.min(maxThumbX,
      ((-_hscrollDragStartPan) / scrollable) * maxThumbX + dx));
    const newRatio = maxThumbX > 0 ? newThumbX / maxThumbX : 0;
    wcState.panX = -newRatio * scrollable;
    wcUpdateScrollbar();
    wcRenderEditor();
  });

  document.addEventListener('mouseup', () => {
    if (_hscrollDragging) {
      _hscrollDragging = false;
      thumb.style.cursor = 'grab';
    }
  });
}

function wcScrollbarSetRatio(ratio) {
  const totalPx   = (wcLevelData.endTile || 120) * wcState.gridSize * wcState.zoom;
  const visiblePx = wcCanvas.width;
  const scrollable = Math.max(0, totalPx - visiblePx);
  wcState.panX = -Math.max(0, Math.min(scrollable, ratio * scrollable));
  wcUpdateScrollbar();
  wcRenderEditor();
}

function wcUpdateScrollbar() {
  const track = document.getElementById('wc-hscroll-track');
  const thumb = document.getElementById('wc-hscroll-thumb');
  if (!track || !thumb || wcPlay.active) { if (track) track.style.display='none'; return; }

  const totalPx   = (wcLevelData.endTile || 120) * wcState.gridSize * wcState.zoom;
  const visiblePx = wcCanvas.width;

  if (totalPx <= visiblePx + 2) {
    track.style.display = 'none'; // level fits — no scrollbar needed
    return;
  }

  track.style.display = '';
  const scrollable = totalPx - visiblePx;
  const trackW = track.clientWidth || track.getBoundingClientRect().width;
  const thumbW = Math.max(40, Math.round((visiblePx / totalPx) * trackW));
  const maxThumbX = trackW - thumbW;
  const scrollRatio = Math.min(1, Math.max(0, (-wcState.panX) / scrollable));
  const thumbX = Math.round(scrollRatio * maxThumbX);

  thumb.style.width = thumbW + 'px';
  thumb.style.left  = thumbX + 'px';

  // Highlight when at extremes
  thumb.style.background = scrollRatio > 0.98
    ? 'rgba(255,68,68,.6)'
    : scrollRatio < 0.02
    ? 'rgba(0,229,255,.45)'
    : 'rgba(0,229,255,.38)';
}

// ── Cursor position display ──────────────────────────────────
function wcUpdateCursorPos(pos) {
  const gx = wcSnapGrid(pos.wx), gy = wcSnapGrid(pos.wy);
  const el = document.getElementById('wc-cursor-pos');
  if (el) el.textContent = `${gx}, ${gy}`;
}

// ── Object count display ─────────────────────────────────────
function wcUpdateObjCount() {
  const el = document.getElementById('wc-obj-count');
  if (el) el.textContent = 'Objects: ' + wcState.objects.length;
}

// ── Undo / Redo ──────────────────────────────────────────────
function wcPushUndo() {
  wcState.undoStack.push(JSON.stringify(wcState.objects));
  if (wcState.undoStack.length > 80) wcState.undoStack.shift();
  wcState.redoStack = [];
}
function wcUndo() {
  if (!wcState.undoStack.length) return;
  wcState.redoStack.push(JSON.stringify(wcState.objects));
  wcState.objects = JSON.parse(wcState.undoStack.pop());
  wcState.selected = [];
  wcUpdateObjCount(); wcShowPropPanel(); wcRenderEditor();
}
function wcRedo() {
  if (!wcState.redoStack.length) return;
  wcState.undoStack.push(JSON.stringify(wcState.objects));
  wcState.objects = JSON.parse(wcState.redoStack.pop());
  wcState.selected = [];
  wcUpdateObjCount(); wcShowPropPanel(); wcRenderEditor();
}

// ══════════════════════════════════════════════════════════════
//  EDITOR RENDERER
// ══════════════════════════════════════════════════════════════
function wcRenderEditor() {
  if (!wcCtx || wcPlay.active) return;
  const ctx = wcCtx, W = wcCanvas.width, H = wcCanvas.height;
  const g = wcState.gridSize * wcState.zoom;
  const pX = wcState.panX, pY = wcState.panY;

  // Background
  ctx.fillStyle = wcState.bgColor;
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(0,229,255,0.08)';
  ctx.lineWidth = 1;
  const startX = pX % g, startY = pY % g;
  for (let x = startX; x < W; x += g) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = startY; y < H; y += g) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // ── START line — draggable green marker ──────────────────────
  const startTile = wcLevelData.startTile ?? 2;
  const spawnY    = wcLevelData.startY    ?? 5;
  const startCanX = startTile * g + pX;
  const startCanY = spawnY    * g + pY;
  wcState._startLineCanvasX = startCanX;
  wcState._startLineCanvasY = startCanY;
  if (startCanX > -20 && startCanX < W + 20) {
    const hoverS = wcState.draggingStartLine ||
      (wcState._mouseX !== undefined && Math.abs(wcState._mouseX - startCanX) < 10);
    ctx.save();
    // Green zone fill to the left of start
    ctx.fillStyle = 'rgba(34,197,94,0.05)';
    ctx.fillRect(0, 0, startCanX, H);
    // Dashed line
    ctx.strokeStyle = hoverS ? '#22c55e' : 'rgba(34,197,94,0.6)';
    ctx.lineWidth   = hoverS ? 3 : 2;
    ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(startCanX, 0); ctx.lineTo(startCanX, H); ctx.stroke();
    ctx.setLineDash([]);
    // Spawn dot (shows where the wave will spawn vertically)
    ctx.fillStyle   = hoverS ? '#22c55e' : 'rgba(34,197,94,0.85)';
    ctx.beginPath(); ctx.arc(startCanX, startCanY, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.stroke();
    // Label pill
    const sLabel = `START  tile ${startTile}`;
    ctx.font = 'bold 11px Nunito,sans-serif';
    const stw = ctx.measureText(sLabel).width;
    ctx.fillStyle = hoverS ? '#22c55e' : 'rgba(34,197,94,0.8)';
    ctx.fillRect(startCanX - stw/2 - 8, 6, stw + 16, 20);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(sLabel, startCanX, 16);
    // Drag handle triangle (points right)
    ctx.fillStyle = hoverS ? '#22c55e' : 'rgba(34,197,94,0.7)';
    ctx.beginPath();
    ctx.moveTo(startCanX + 8, H/2 - 12);
    ctx.lineTo(startCanX - 8, H/2);
    ctx.lineTo(startCanX + 8, H/2 + 12);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ── END line — draggable red marker ──────────────────────────
  const endTile = wcLevelData.endTile || 120;
  const boundX  = endTile * g + pX;
  wcState._endLineCanvasX = boundX; // store for hit-testing
  if (boundX > -20 && boundX < W + 20) {
    const hover = wcState.draggingEndLine ||
      (wcState._mouseX !== undefined && Math.abs(wcState._mouseX - boundX) < 10);
    ctx.save();
    // Red zone fill to the right
    ctx.fillStyle = 'rgba(255,50,50,0.06)';
    ctx.fillRect(boundX, 0, W - boundX, H);
    // Dashed line
    ctx.strokeStyle = hover ? '#ff6b6b' : 'rgba(255,107,107,0.55)';
    ctx.lineWidth = hover ? 3 : 2;
    ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(boundX,0); ctx.lineTo(boundX,H); ctx.stroke();
    ctx.setLineDash([]);
    // Label pill
    const label = `END  tile ${endTile}`;
    ctx.font = 'bold 11px Nunito,sans-serif';
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = hover ? '#ff6b6b' : 'rgba(255,107,107,0.8)';
    ctx.fillRect(boundX - tw/2 - 8, 6, tw + 16, 20);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, boundX, 16);
    // Drag handle triangle
    ctx.fillStyle = hover ? '#ff6b6b' : 'rgba(255,107,107,0.7)';
    ctx.beginPath();
    ctx.moveTo(boundX - 8, H/2 - 12);
    ctx.lineTo(boundX + 8, H/2);
    ctx.lineTo(boundX - 8, H/2 + 12);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // Objects (sorted by layer)
  const sorted = [...wcState.objects].map((o,i)=>({...o,_i:i})).sort((a,b)=>a.layer-b.layer);
  for (const o of sorted) {
    const cx = o.gx * g + pX, cy = o.gy * g + pY;
    const sz = g * (o.scale||1);
    const sel = wcState.selected.includes(o._i);
    wcDrawObject(ctx, o, cx, cy, sz, sel, false);
  }

  // Drag-place preview
  // (handled by showing object under cursor in mousemove — nothing extra needed)

  // Update scrollbar to reflect current panX
  wcUpdateScrollbar();
}

function wcDrawObject(ctx, obj, cx, cy, sz, selected, isGame) {
  const def = WC_OBJECTS[obj.type] || {};
  const col = obj.color || def.color || '#4488ff';
  const rot = (obj.rot||0) * Math.PI/180;

  ctx.save();
  ctx.translate(cx + sz/2, cy + sz/2);
  if (obj.flip) ctx.scale(-1,1);
  if (rot) ctx.rotate(rot);

  if (def.decor && def.bg) {
    // Background grid decoration
    ctx.strokeStyle = col + '44';
    ctx.lineWidth = 1;
    ctx.strokeRect(-sz/2, -sz/2, sz, sz);
  } else if (def.kills && obj.type === 'spike') {
    // Triangle spike (up)
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, -sz/2);
    ctx.lineTo( sz/2,  sz/2);
    ctx.lineTo(-sz/2,  sz/2);
    ctx.closePath(); ctx.fill();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); }
  } else if (def.kills && obj.type === 'spike_down') {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0,  sz/2);
    ctx.lineTo( sz/2, -sz/2);
    ctx.lineTo(-sz/2, -sz/2);
    ctx.closePath(); ctx.fill();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); }
  } else if (def.slope) {
    // Slope
    ctx.fillStyle = col;
    ctx.beginPath();
    if (def.slope === 'up') {
      ctx.moveTo(-sz/2,  sz/2);
      ctx.lineTo( sz/2,  sz/2);
      ctx.lineTo( sz/2, -sz/2);
    } else {
      ctx.moveTo(-sz/2,  sz/2);
      ctx.lineTo( sz/2,  sz/2);
      ctx.lineTo(-sz/2, -sz/2);
    }
    ctx.closePath(); ctx.fill();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); }
  } else if (def.thin) {
    // Platform (thin bar)
    ctx.fillStyle = col;
    ctx.fillRect(-sz/2, -sz/6, sz, sz/3);
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/6,sz,sz/3); }
  } else if (def.spin) {
    // Saw — draw as star
    const spokes = 8, outerR = sz/2-2, innerR = sz/4;
    ctx.fillStyle = col;
    ctx.beginPath();
    for (let i=0; i<spokes*2; i++) {
      const a = (i/(spokes*2))*Math.PI*2 + (isGame ? Date.now()/300 : 0);
      const r = i%2===0 ? outerR : innerR;
      i===0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r) : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.closePath(); ctx.fill();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); }
  } else if (def.laser) {
    // Laser — vertical line
    ctx.strokeStyle = col;
    ctx.lineWidth = sz/5;
    ctx.shadowColor = col;
    ctx.shadowBlur = sz/3;
    ctx.beginPath(); ctx.moveTo(0,-sz/2); ctx.lineTo(0,sz/2); ctx.stroke();
    ctx.shadowBlur = 0;
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.collectible) {
    // Coin
    ctx.fillStyle = col;
    ctx.shadowColor = col; ctx.shadowBlur = sz/3;
    ctx.beginPath(); ctx.arc(0, 0, sz/2-2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000'; ctx.font = `${sz*0.45}px Nunito,sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('$', 0, 1);
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); }
  } else if (def.portal) {
    // Portal — tall frame style (like GD portals)
    ctx.strokeStyle = col; ctx.lineWidth = sz*0.1;
    ctx.shadowColor = col; ctx.shadowBlur = 14;
    // Tall rectangular portal frame
    const pw=sz*0.55, ph=sz*0.9;
    ctx.strokeRect(-pw/2,-ph/2,pw,ph);
    ctx.shadowBlur=0;
    ctx.fillStyle=col+'18'; ctx.fillRect(-pw/2,-ph/2,pw,ph);
    // Inner icon
    const pIcon = def.portal==='speed'
      ? (def.speed>1.5?'▶▶':def.speed<1?'◀':def.portal==='speed'?'▶':'')
      : def.portal==='grav' ? '↕'
      : def.sizeMini ? '↙↘' : '↖↗';
    ctx.fillStyle=col; ctx.font=`bold ${sz*0.32}px Nunito,sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(pIcon,0,0);
    // Speed label
    if (def.portal==='speed') {
      const lbl = def.speed>=2?'FAST':def.speed<=0.7?'SLOW':'1×';
      ctx.font=`bold ${sz*0.2}px Nunito,sans-serif`;
      ctx.fillText(lbl,0,sz*0.3);
    }
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.checkpoint) {
    // Checkpoint flag
    ctx.fillStyle = col;
    ctx.fillRect(-2, -sz/2, 4, sz);
    ctx.beginPath(); ctx.moveTo(2,-sz/2); ctx.lineTo(sz/2,-sz/4); ctx.lineTo(2,-sz/8); ctx.closePath(); ctx.fill();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.light) {
    // Pulsing light
    const pulse = isGame ? (0.5 + 0.5*Math.sin(Date.now()/300)) : 0.7;
    ctx.fillStyle = col + Math.round(pulse*255).toString(16).padStart(2,'0');
    ctx.shadowColor = col; ctx.shadowBlur = sz*pulse;
    ctx.beginPath(); ctx.arc(0,0,sz/3,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.jumpring) {
    // Jump ring
    ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.shadowColor = col; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(0,0,sz/2-3,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = col + '66'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0,0,sz/4,0,Math.PI*2); ctx.stroke();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.iceBlock) {
    // Ice block — blue-white gradient with frost shimmer
    const ig = ctx.createLinearGradient(-sz/2,-sz/2,sz/2,sz/2);
    ig.addColorStop(0,'#e0f2fe'); ig.addColorStop(0.5,col); ig.addColorStop(1,'#bfdbfe');
    ctx.fillStyle = ig; ctx.fillRect(-sz/2,-sz/2,sz,sz);
    ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1;
    ctx.strokeRect(-sz/2+2,-sz/2+2,sz-4,sz-4);
    // Frost cross lines
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.moveTo(0,-sz/2); ctx.lineTo(0,sz/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-sz/2,0); ctx.lineTo(sz/2,0); ctx.stroke();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.spikedTop) {
    // Block with spike on top — solid block, kills from above
    const sg = ctx.createLinearGradient(-sz/2,-sz/2,sz/2,sz/2);
    sg.addColorStop(0,col); sg.addColorStop(1,col+'88');
    ctx.fillStyle=sg; ctx.fillRect(-sz/2,0,sz,sz/2);
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.strokeRect(-sz/2+1,1,sz-2,sz/2-2);
    // Top spike
    ctx.fillStyle='#ef4444';
    ctx.beginPath(); ctx.moveTo(0,-sz/2); ctx.lineTo(sz/2,0); ctx.lineTo(-sz/2,0); ctx.closePath(); ctx.fill();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.spikeTiny) {
    // Mini spike — drawn at half size
    const ts = sz*0.5;
    ctx.fillStyle = col;
    ctx.shadowColor = col; ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.moveTo(0,-ts/2); ctx.lineTo(ts/2,ts/2); ctx.lineTo(-ts/2,ts/2); ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0;
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); }
  } else if (def.orb) {
    // GD-style orb — glowing ring with type-specific inner icon/color
    const pulse = isGame ? 0.7+0.3*Math.sin(Date.now()/250) : 0.85;
    ctx.strokeStyle = col; ctx.lineWidth = sz*0.12;
    ctx.shadowColor = col; ctx.shadowBlur = sz*0.5*pulse;
    ctx.beginPath(); ctx.arc(0,0,sz/2-sz*0.08,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0;
    // Inner fill
    const ig2 = ctx.createRadialGradient(0,0,0,0,0,sz/2-sz*0.1);
    ig2.addColorStop(0, col+'44'); ig2.addColorStop(1,'transparent');
    ctx.fillStyle=ig2; ctx.beginPath(); ctx.arc(0,0,sz/2-sz*0.08,0,Math.PI*2); ctx.fill();
    // Center icon
    const orbIcon = def.orbYellow?'▲' : def.orbBlue||def.ringGrav?'↕' : def.orbGreen?'↑' :
                    def.orbRed?'↓' : def.orbBlack?'×' : def.orbMagenta?'~' :
                    def.orbSpider?'🕷' : def.ringDash?'»' : '○';
    ctx.fillStyle=col; ctx.font=`bold ${sz*0.38}px Nunito,sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(orbIcon,0,1);
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.glow) {
    // Glow orb decor
    const g2 = ctx.createRadialGradient(0,0,0,0,0,sz/2);
    g2.addColorStop(0, col + 'cc'); g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.shadowColor = col; ctx.shadowBlur = sz/2;
    ctx.beginPath(); ctx.arc(0,0,sz/2,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  } else if (def.spikeLeft) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-sz/2, 0);
    ctx.lineTo(sz/2, -sz/2);
    ctx.lineTo(sz/2,  sz/2);
    ctx.closePath(); ctx.fill();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); }
  } else if (def.spikeRight) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo( sz/2, 0);
    ctx.lineTo(-sz/2, -sz/2);
    ctx.lineTo(-sz/2,  sz/2);
    ctx.closePath(); ctx.fill();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); }
  } else if (def.halfH) {
    const grad = ctx.createLinearGradient(-sz/2, 0, sz/2, sz/2);
    grad.addColorStop(0, col); grad.addColorStop(1, col+'99');
    ctx.fillStyle = grad;
    ctx.fillRect(-sz/2, sz/4, sz, sz/2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.strokeRect(-sz/2+2, sz/4+2, sz-4, sz/2-4);
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.strokeRect(-sz/2,sz/4,sz,sz/2); }
  } else if (def.ring) {
    const ringCol = col;
    ctx.strokeStyle = ringCol; ctx.lineWidth = 3;
    ctx.shadowColor = ringCol; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(0, 0, sz/2-3, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = ringCol+'66'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, sz/4, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = ringCol; ctx.font = `${sz*0.35}px Nunito,sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(def.ringGrav ? '↕' : '→', 0, 1);
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.pad) {
    ctx.fillStyle = col;
    ctx.shadowColor = col; ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-sz/2,  sz/2);
    ctx.lineTo( sz/2,  sz/2);
    ctx.lineTo( sz/3, -sz/4);
    ctx.lineTo(-sz/3, -sz/4);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-sz/4, sz/6); ctx.lineTo(sz/4, sz/6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-sz/5, sz/8); ctx.lineTo(sz/5, sz/8); ctx.stroke();
    const padIcon = def.padGrav?'↕' : def.padPink?'↑↑' : def.padRed?'⚡' : '';
    if (padIcon) {
      ctx.fillStyle = '#fff'; ctx.font = `${sz*0.24}px Nunito,sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(padIcon, 0, sz*0.12);
    }
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.trigger) {
    const tCol = col;
    ctx.fillStyle = tCol+'22'; ctx.strokeStyle = tCol; ctx.lineWidth = 2;
    ctx.setLineDash([4,3]);
    ctx.strokeRect(-sz/2,-sz/2,sz,sz); ctx.fillRect(-sz/2,-sz/2,sz,sz);
    ctx.setLineDash([]);
    const icons = { triggerMove:'↔', triggerRotate:'↺', triggerColor:'🎨', triggerAlpha:'👁', triggerStop:'⏹' };
    const iKey = Object.keys(icons).find(k => def[k]);
    ctx.fillStyle = tCol; ctx.font = `${sz*0.38}px Nunito,sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(iKey ? icons[iKey] : '⚡', 0, 2);
    ctx.font = `bold ${sz*0.22}px Nunito,sans-serif`;
    ctx.fillText(def.label, 0, -sz/2+sz*0.2);
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.setLineDash([]); ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.decor && def.particles) {
    ctx.fillStyle = col + '44'; ctx.beginPath(); ctx.arc(0,0,sz/3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = col; ctx.font = `${sz*0.4}px Nunito,sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('✨',0,1);
  } else if (def.decor && def.dCrystal) {
    // Crystal — diamond gem shape with gradient
    const cg = ctx.createLinearGradient(0,-sz/2,0,sz/2);
    cg.addColorStop(0,'#fff'); cg.addColorStop(0.3,col); cg.addColorStop(1,col+'88');
    ctx.fillStyle=cg; ctx.shadowColor=col; ctx.shadowBlur=sz*0.4;
    ctx.beginPath();
    ctx.moveTo(0,-sz/2); ctx.lineTo(sz/3,-sz/6); ctx.lineTo(sz*0.4,sz*0.1);
    ctx.lineTo(0,sz/2);  ctx.lineTo(-sz*0.4,sz*0.1); ctx.lineTo(-sz/3,-sz/6);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0;
    // Inner shine
    ctx.fillStyle='rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.moveTo(0,-sz/2); ctx.lineTo(sz/3,-sz/6); ctx.lineTo(0,-sz/6); ctx.closePath(); ctx.fill();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.decor && def.dNeonRing) {
    // Neon ring — outlined circle, glowing
    const pulse2 = isGame ? 0.6+0.4*Math.sin(Date.now()/400) : 0.8;
    ctx.strokeStyle=col; ctx.lineWidth=sz*0.07; ctx.shadowColor=col; ctx.shadowBlur=sz*0.4*pulse2;
    ctx.beginPath(); ctx.arc(0,0,sz/2-sz*0.05,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.strokeStyle=col+'44'; ctx.lineWidth=sz*0.03;
    ctx.beginPath(); ctx.arc(0,0,sz/3,0,Math.PI*2); ctx.stroke();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.decor && def.dCloud) {
    // Cloud — overlapping circles
    ctx.fillStyle=col+'bb'; ctx.shadowColor='rgba(255,255,255,0.3)'; ctx.shadowBlur=8;
    const r=sz/4;
    ctx.beginPath(); ctx.arc(-sz*0.18,sz*0.05,r*0.9,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(0,-sz*0.05,r*1.1,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sz*0.18,sz*0.05,r*0.9,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.decor && def.dPlanet) {
    // Planet with ring
    const pg = ctx.createRadialGradient(-sz*0.1,-sz*0.1,0,0,0,sz*0.35);
    pg.addColorStop(0,col+'ee'); pg.addColorStop(1,'#1e0a3c');
    ctx.fillStyle=pg; ctx.shadowColor=col; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.arc(0,0,sz*0.34,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    // Ring ellipse
    ctx.strokeStyle=col+'88'; ctx.lineWidth=sz*0.06;
    ctx.beginPath(); ctx.ellipse(0,0,sz*0.48,sz*0.14,Math.PI*0.2,0,Math.PI*2); ctx.stroke();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.decor && def.dDebris) {
    // Rock/debris — irregular polygon
    ctx.fillStyle=col+'cc';
    ctx.beginPath();
    const pts=[[-sz*.35,-sz*.15],[-sz*.1,-sz*.4],[sz*.2,-sz*.3],[sz*.4,0],[sz*.25,sz*.35],[-sz*.1,sz*.4],[-sz*.38,sz*.15]];
    pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=1;
    ctx.stroke();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.decor && def.dArrow) {
    // Arrow decoration pointing right
    ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=8;
    ctx.beginPath();
    ctx.moveTo(-sz*0.35,-sz*0.12); ctx.lineTo(sz*0.05,-sz*0.12); ctx.lineTo(sz*0.05,-sz*0.28);
    ctx.lineTo(sz*0.4,0); ctx.lineTo(sz*0.05,sz*0.28); ctx.lineTo(sz*0.05,sz*0.12);
    ctx.lineTo(-sz*0.35,sz*0.12); ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0;
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.decor && def.dSpikeDeco) {
    // Decorative spike (purple/themed, no kill)
    ctx.fillStyle=col+'bb'; ctx.shadowColor=col; ctx.shadowBlur=6;
    ctx.beginPath(); ctx.moveTo(0,-sz/2); ctx.lineTo(sz/2,sz/2); ctx.lineTo(-sz/2,sz/2); ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=col; ctx.lineWidth=1;
    ctx.stroke();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.decor && def.dChain) {
    // Chain links
    ctx.strokeStyle=col; ctx.lineWidth=sz*0.08;
    for (let ci=-1; ci<=1; ci++) {
      const cx2=ci*(sz*0.3);
      ctx.beginPath(); ctx.ellipse(cx2,0,sz*0.12,sz*0.2,ci===0?0:Math.PI/2,0,Math.PI*2); ctx.stroke();
    }
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.decor && def.dLamp) {
    // Hanging lamp
    ctx.strokeStyle=col; ctx.lineWidth=sz*0.05;
    ctx.beginPath(); ctx.moveTo(0,-sz/2); ctx.lineTo(0,-sz*0.1); ctx.stroke();
    const lg=ctx.createRadialGradient(0,sz*0.15,0,0,sz*0.15,sz*0.28);
    lg.addColorStop(0,col); lg.addColorStop(1,col+'33');
    ctx.fillStyle=lg; ctx.shadowColor=col; ctx.shadowBlur=sz*0.5;
    ctx.beginPath(); ctx.arc(0,sz*0.15,sz*0.25,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(-sz*0.08,sz*0.08,sz*0.07,0,Math.PI*2); ctx.fill();
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  } else if (def.decor && def.dPortalRing) {
    // Rotating portal ring decoration
    const angle = isGame ? Date.now()/800 : 0;
    ctx.save(); ctx.rotate(angle);
    for (let ri=0; ri<8; ri++) {
      const ra=ri*Math.PI/4;
      ctx.strokeStyle=`hsl(${ri*45+((isGame?Date.now()/10:0))%360},100%,70%)`;
      ctx.lineWidth=sz*0.05; ctx.globalAlpha=0.7;
      ctx.beginPath();
      ctx.arc(Math.cos(ra)*sz*0.3, Math.sin(ra)*sz*0.3, sz*0.08, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha=1;
    ctx.strokeStyle=col; ctx.lineWidth=sz*0.04;
    ctx.shadowColor=col; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.arc(0,0,sz*0.15,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0;
  } else if (def.decor) {
    // Generic decor fallback
    ctx.fillStyle = col + '66';
    ctx.font = `${sz*0.55}px Nunito,sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(def.icon||'⭐',0,2);
  } else {
    // Default: filled rectangle (block)
    // Gradient for nice look
    const grad = ctx.createLinearGradient(-sz/2,-sz/2,sz/2,sz/2);
    grad.addColorStop(0, col);
    grad.addColorStop(1, col + '99');
    ctx.fillStyle = grad;
    ctx.fillRect(-sz/2, -sz/2, sz, sz);
    // Inner bevel
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
    ctx.strokeRect(-sz/2+2, -sz/2+2, sz-4, sz-4);
    if (selected) { ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.strokeRect(-sz/2,-sz/2,sz,sz); }
  }

  ctx.restore();
}

// ══════════════════════════════════════════════════════════════
//  WAVE PHYSICS ENGINE
// ══════════════════════════════════════════════════════════════
const WP = {
  SIZE:  10,    // player hitbox half-size in px  (= 10/30/2 = 0.17 grid units each side)
  GRAV:  0.014, // gravity per frame in grid units (tuned for ~15-unit-tall canvas)
  LIFT: -0.022, // wave lift when holding (slightly stronger than gravity)
  TERM:  0.38,  // terminal velocity — kept < 0.5 to prevent tunneling through 1-unit blocks
};

let wcHolding = false;

function wcStartPlay(practice) {
  if (wcPlay.active) wcStopPlay();
  if (wcState.objects.length === 0) {
    showToast('Place some objects first!','🌊'); return;
  }

  wcPlay.active   = true;
  wcPlay.practice = practice;
  wcPlay.alive    = true;
  wcPlay.attempts++;
  // Spawn at the placed START marker (defaults to tile 2, mid-height)
  wcPlay.wx       = wcLevelData.startTile ?? 2;
  wcPlay.wy       = wcLevelData.startY    ?? Math.max(1.5, (wcCanvas.height / wcState.gridSize) * 0.3);
  wcPlay.velY     = 0;
  wcPlay.gravity  = 1;
  wcPlay.speed    = wcState.levelSpeed;
  wcPlay.camX     = 0;
  wcPlay.progress = 0;
  wcPlay.coins    = new Set();
  wcPlay.coinsTotal = wcState.objects.filter(o=>WC_OBJECTS[o.type]?.collectible).length;
  wcPlay.deathParticles = [];
  wcPlay.hintStart = undefined; // reset the "hold to fly" hint timer
  wcPlay.firedTriggers   = new Set();
  wcPlay.triggerAnims    = [];
  wcPlay.offsets         = {};  // idx→{dx,dy,rot,alpha}
  wcPlay.bgColorOverride = null;
  wcPlay.prevTouch       = new Set(); // one-shot collision tracking
  wcPlay.sizeScale       = 1.0;       // size portal (1=normal, 0.5=mini)

  if (!practice) wcPlay.checkpoints = [];
  wcPlay.lastCP = wcPlay.wx;

  // Build checkpoint list for practice mode
  if (practice) {
    wcPlay.checkpoints = wcState.objects
      .filter(o => WC_OBJECTS[o.type]?.checkpoint)
      .map(o => o.gx)
      .sort((a,b)=>a-b);
  }

  // Hide editor overlay
  document.getElementById('wc-game-overlay').classList.remove('visible');

  // Collapse palette, props & scrollbar during play
  const palette = document.querySelector('.wc-palette');
  const props   = document.querySelector('.wc-props');
  if (palette) palette.style.display = 'none';
  if (props)   props.style.display   = 'none';
  const hscroll = document.getElementById('wc-hscroll-track');
  if (hscroll) hscroll.style.display = 'none';

  // Show stop button, hide play buttons
  document.getElementById('wc-btn-play').style.display     = 'none';
  document.getElementById('wc-btn-practice').style.display = 'none';
  document.getElementById('wc-btn-stop').style.display     = '';
  document.getElementById('wc-attempts-label').textContent = 'Attempts: ' + wcPlay.attempts;

  // Sync speed slider to current level speed
  const slider = document.getElementById('wc-speed-slider');
  if (slider) { slider.value = wcPlay.speed; wcUpdateSpeedLabel(wcPlay.speed); }

  // Bind hold
  wcHolding = false;
  document.addEventListener('keydown',  wcHoldOn);
  document.addEventListener('keyup',    wcHoldOff);
  wcCanvas.addEventListener('mousedown',wcHoldOn);
  wcCanvas.addEventListener('mouseup',  wcHoldOff);
  wcCanvas.addEventListener('touchstart',wcHoldOn,{passive:true});
  wcCanvas.addEventListener('touchend', wcHoldOff,{passive:true});

  wcPlay.frame = requestAnimationFrame(wcPlayLoop);
}

function wcHoldOn(e)  { if (!e.key || e.key === ' ' || e.type.startsWith('mouse') || e.type.startsWith('touch')) wcHolding = true; }
function wcHoldOff(e) { if (!e.key || e.key === ' ' || e.type.startsWith('mouse') || e.type.startsWith('touch')) wcHolding = false; }

function wcStopPlay() {
  if (wcPlay.frame) { cancelAnimationFrame(wcPlay.frame); wcPlay.frame=null; }
  wcPlay.active = false;
  wcHolding = false;
  document.removeEventListener('keydown',  wcHoldOn);
  document.removeEventListener('keyup',    wcHoldOff);
  wcCanvas.removeEventListener('mousedown',wcHoldOn);
  wcCanvas.removeEventListener('mouseup',  wcHoldOff);
  wcCanvas.removeEventListener('touchstart',wcHoldOn);
  wcCanvas.removeEventListener('touchend', wcHoldOff);

  document.getElementById('wc-btn-play').style.display     = '';
  document.getElementById('wc-btn-practice').style.display = '';
  document.getElementById('wc-btn-stop').style.display     = 'none';
  document.getElementById('wc-progress-bar').style.width   = '0%';
  document.getElementById('wc-pct-label').textContent      = '0%';
  document.getElementById('wc-game-overlay').classList.remove('visible');

  // Restore palette, props & scrollbar
  const palette = document.querySelector('.wc-palette');
  const props   = document.querySelector('.wc-props');
  if (palette) palette.style.display = '';
  if (props)   props.style.display   = '';
  wcUpdateScrollbar();

  // Resize canvas now that panels are back
  wcResizeCanvas();
  wcRenderEditor();
}

function wcRestartPlay() {
  const p = wcPlay.practice;
  wcStopPlay();
  setTimeout(() => wcStartPlay(p), 50);
}

function wcPlayLoop() {
  if (!wcPlay.active) return;

  // Physics
  const grav = WP.GRAV * wcPlay.gravity;
  wcPlay.velY += wcHolding ? WP.LIFT : grav;
  wcPlay.velY  = Math.max(-WP.TERM, Math.min(WP.TERM, wcPlay.velY));
  wcPlay.wy   += wcPlay.velY;
  wcPlay.wx   += wcPlay.speed / wcState.gridSize;

  // Camera follows player
  const camTarget = wcPlay.wx - 4;
  wcPlay.camX = camTarget;

  // Boundary collision (top/bottom)
  const maxY = wcCanvas.height / wcState.gridSize - 1;
  if (wcPlay.wy < 0.5)   { wcPlay.wy = 0.5;   wcKill(); }
  if (wcPlay.wy > maxY)  { wcPlay.wy = maxY;   wcKill(); }

  // Fire triggers when player X reaches them (GD-style: based on position, not touch)
  if (wcPlay.alive) {
    for (let i = 0; i < wcState.objects.length; i++) {
      const o = wcState.objects[i];
      const def = WC_OBJECTS[o.type] || {};
      if (!def.trigger || wcPlay.firedTriggers.has(i)) continue;
      if (wcPlay.wx < o.gx) continue;
      wcPlay.firedTriggers.add(i);
      wcFireTrigger(o);
    }
    wcUpdateTriggerAnims();
  }

  // Object collision
  if (wcPlay.alive) {
    const px = wcPlay.wx, py = wcPlay.wy;
    // Hitbox size: reduced by sizeScale (mini portal) and spike gets tighter hitbox
    const baseHW = WP.SIZE / wcState.gridSize / 2 * (wcPlay.sizeScale||1);
    const curTouch = new Set();

    for (let i=0; i<wcState.objects.length; i++) {
      const o  = wcState.objects[i];
      const def = WC_OBJECTS[o.type] || {};
      if (def.decor || def.trigger) continue;
      const off = wcPlay.offsets[i] || null;
      const ox = o.gx + (off?.dx||0);
      const oy = o.gy + (off?.dy||0);
      const ow = o.scale||1;
      const effOy = def.halfH ? oy + 0.5 : oy;
      const effOh = def.halfH ? 0.5 : (o.scale||1);
      // Spikes get a tighter hitbox (75% of tile) to match GD feel
      const hw = (def.kills && !def.spikeLeft && !def.spikeRight) ? baseHW*0.75 : baseHW;

      // AABB overlap
      if (px+hw > ox && px-hw < ox+ow && py+hw > effOy && py-hw < effOy+effOh) {
        curTouch.add(i);
        const justEntered = !(wcPlay.prevTouch||new Set()).has(i);

        if (def.kills) { wcKill(); break; }
        if (def.collectible && !wcPlay.coins.has(i)) {
          wcPlay.coins.add(i);
          if (wcPlay.coins.size === wcPlay.coinsTotal && wcPlay.coinsTotal > 0) {
            showToast('All coins collected! +40 XP','🪙');
            addXP(40,'All coins collected');
            wcAddCreatorXP(40,'coin');
          }
        }
        // Portals fire every frame (continuous effect while inside)
        if (def.portal === 'speed') { wcPlay.speed = (wcState.levelSpeed * (o.speed||1.5)); }
        if (def.portal === 'grav')  { if(justEntered){ wcPlay.gravity *= -1; wcPlay.velY *= -0.5; } }
        if (def.portal === 'size')  { if(justEntered){ wcPlay.sizeScale = def.sizeMini ? 0.5 : 1.0; } }
        if (def.checkpoint && wcPlay.practice) { wcPlay.lastCP = o.gx; }
        // One-shot effects: only fire on entry (justEntered)
        if (justEntered) {
          if (def.jumpring)         { wcPlay.velY = wcPlay.gravity<0 ? WP.TERM : -WP.TERM; }
          if (def.orb && def.orbYellow)  { wcPlay.velY = wcPlay.gravity<0 ? WP.TERM : -WP.TERM; }
          if (def.orb && def.orbBlue)    { wcPlay.gravity *= -1; wcPlay.velY *= -0.5; }
          if (def.orb && def.orbGreen)   { wcPlay.velY = wcPlay.gravity<0 ? WP.TERM*0.55 : -WP.TERM*0.55; }
          if (def.orb && def.orbRed)     { wcPlay.velY = wcPlay.gravity<0 ? -WP.TERM : WP.TERM; }
          if (def.orb && def.orbBlack)   { wcPlay.velY = Math.min(WP.TERM, Math.abs(wcPlay.velY)*1.5) * (wcPlay.velY>0?-1:1); }
          if (def.orb && def.orbMagenta) { wcPlay.gravity *= -1; wcPlay.velY = 0; }
          if (def.orb && def.orbSpider)  { const mY=wcCanvas.height/wcState.gridSize-1; wcPlay.wy=mY-wcPlay.wy; wcPlay.velY=0; }
          if (def.ringGrav)  { wcPlay.gravity *= -1; wcPlay.velY *= -0.5; }
          if (def.ringDash)  { wcPlay.speed = Math.min(wcPlay.speed*1.8, wcState.levelSpeed*3); setTimeout(()=>{ wcPlay.speed=wcState.levelSpeed; }, 1500); }
          if (def.pad && def.padJump)  { wcPlay.velY = wcPlay.gravity<0 ? WP.TERM : -WP.TERM; }
          if (def.pad && def.padGrav)  { wcPlay.gravity *= -1; wcPlay.velY = 0; }
          if (def.pad && def.padPink)  { wcPlay.velY = wcPlay.gravity<0 ? WP.TERM*1.3 : -WP.TERM*1.3; wcPlay.velY=Math.max(-WP.TERM,Math.min(WP.TERM,wcPlay.velY)); }
          if (def.pad && def.padRed)   { wcPlay.gravity *= -1; wcPlay.velY = wcPlay.gravity<0 ? WP.TERM : -WP.TERM; wcPlay.velY=Math.max(-WP.TERM,Math.min(WP.TERM,wcPlay.velY)); }
        }
        if (def.solid) {
          // Push out of solid block
          const overlapR = (ox+ow) - (px-hw);
          const overlapL = (px+hw) - ox;
          const overlapB = (effOy+effOh) - (py-hw);
          const overlapT = (py+hw) - effOy;
          const minO = Math.min(overlapR, overlapL, overlapB, overlapT);
          if (minO === overlapT) { wcPlay.wy = effOy-hw-0.01; wcPlay.velY = 0; }
          else if (minO === overlapB) { wcPlay.wy = effOy+effOh+hw+0.01; wcPlay.velY = 0; }
          else { wcKill(); break; }
        }
      }
    }
    wcPlay.prevTouch = curTouch; // save for next frame one-shot detection
  }

  // Progress — based on endTile
  const totalLen = wcLevelData.endTile || 120;
  wcPlay.progress = Math.min(1, wcPlay.wx / totalLen);
  const pct = Math.round(wcPlay.progress * 100);
  document.getElementById('wc-progress-bar').style.width = pct + '%';
  document.getElementById('wc-pct-label').textContent    = pct + '%';
  if (pct > wcPlay.best) {
    wcPlay.best = pct;
    document.getElementById('wc-best-label').textContent = 'Best: ' + pct + '%';
  }

  // Level complete
  if (wcPlay.progress >= 1 && wcPlay.alive) { wcLevelComplete(); return; }

  // Draw
  wcRenderPlay();

  if (wcPlay.alive) wcPlay.frame = requestAnimationFrame(wcPlayLoop);
}

function wcFireTrigger(o) {
  const def = WC_OBJECTS[o.type] || {};
  const tGroup = o.targetGroup || 1;
  const dur = Math.max(0.05, o.duration || 1);

  if (def.triggerStop) {
    wcPlay.triggerAnims = wcPlay.triggerAnims.filter(a => a.targetGroup !== tGroup);
    return;
  }

  // Snapshot current offsets for affected objects
  const snap = {};
  wcState.objects.forEach((obj, j) => {
    if ((obj.group || 0) === tGroup) {
      snap[j] = { dx: wcPlay.offsets[j]?.dx || 0, dy: wcPlay.offsets[j]?.dy || 0 };
    }
  });

  if (def.triggerMove) {
    wcPlay.triggerAnims.push({ type:'move', targetGroup:tGroup, dur, elapsed:0,
      moveX: o.moveX||0, moveY: o.moveY||0, snap });
  } else if (def.triggerRotate) {
    wcPlay.triggerAnims.push({ type:'rotate', targetGroup:tGroup, dur, elapsed:0,
      degrees: o.degrees||90, snap });
  } else if (def.triggerColor) {
    wcPlay.triggerAnims.push({ type:'color', dur, elapsed:0,
      fromColor: wcLevelData.bgColor || wcState.bgColor || '#020210', toColor: o.triggerColor||'#ff0000' });
  } else if (def.triggerAlpha) {
    wcPlay.triggerAnims.push({ type:'alpha', targetGroup:tGroup, dur, elapsed:0,
      targetAlpha: o.targetAlpha ?? 0, snap });
  }
}

function wcUpdateTriggerAnims() {
  const dt = 1/60;
  for (const a of wcPlay.triggerAnims) {
    a.elapsed = Math.min(a.elapsed + dt, a.dur);
    const t = a.elapsed / a.dur;
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease-in-out

    if (a.type === 'move') {
      for (const [j, s] of Object.entries(a.snap)) {
        if (!wcPlay.offsets[j]) wcPlay.offsets[j] = {};
        wcPlay.offsets[j].dx = s.dx + a.moveX * ease;
        wcPlay.offsets[j].dy = s.dy + a.moveY * ease;
      }
    } else if (a.type === 'rotate') {
      for (const [j] of Object.entries(a.snap)) {
        if (!wcPlay.offsets[j]) wcPlay.offsets[j] = {};
        wcPlay.offsets[j].rot = (wcPlay.offsets[j].rot||0) + a.degrees/60;
      }
    } else if (a.type === 'color') {
      // Interpolate background color
      const lerp = (a,b,t) => Math.round(a+(b-a)*t);
      const from = parseInt(a.fromColor.replace('#',''),16);
      const to   = parseInt(a.toColor.replace('#',''),16);
      const r = lerp((from>>16)&255,(to>>16)&255,ease);
      const g = lerp((from>>8)&255,(to>>8)&255,ease);
      const b = lerp(from&255,to&255,ease);
      wcPlay.bgColorOverride = `rgb(${r},${g},${b})`;
    } else if (a.type === 'alpha') {
      for (const [j] of Object.entries(a.snap)) {
        if (!wcPlay.offsets[j]) wcPlay.offsets[j] = {};
        wcPlay.offsets[j].alpha = 1 - (1 - a.targetAlpha) * ease;
      }
    }
  }
  // Remove completed anims (except color which should persist)
  wcPlay.triggerAnims = wcPlay.triggerAnims.filter(a => a.elapsed < a.dur || a.type==='color');
}

function wcKill() {
  if (!wcPlay.alive) return;
  wcPlay.alive = false;

  // Death particles
  for (let i=0; i<16; i++) {
    wcPlay.deathParticles.push({
      x: wcPlay.wx, y: wcPlay.wy,
      vx: (Math.random()-0.5)*0.4,
      vy: (Math.random()-0.5)*0.4,
      life: 1, color: ['#ff6b6b','#ffe66d','#a855f7','#00e5ff'][i%4],
    });
  }

  // Show overlay
  setTimeout(() => {
    const pct = Math.round(wcPlay.progress*100);
    const overlay = document.getElementById('wc-game-overlay');
    document.getElementById('wc-overlay-title').style.color = '#ff6b6b';
    document.getElementById('wc-overlay-title').textContent = '💀 You Died!';
    document.getElementById('wc-overlay-sub').textContent   = `Reached ${pct}%`;
    overlay.classList.add('visible');
    if (wcPlay.frame) { cancelAnimationFrame(wcPlay.frame); wcPlay.frame=null; }
  }, 600);

  // If practice mode, respawn at last checkpoint
  if (wcPlay.practice) {
    setTimeout(() => {
      document.getElementById('wc-game-overlay').classList.remove('visible');
      wcPlay.alive = true; wcPlay.velY = 0;
      wcPlay.wx = wcPlay.lastCP || wcLevelData.startTile || 2;
      wcPlay.wy = wcCanvas.height / wcState.gridSize / 2;
      wcPlay.frame = requestAnimationFrame(wcPlayLoop);
    }, 800);
  }
}

function wcLevelComplete() {
  cancelAnimationFrame(wcPlay.frame); wcPlay.frame=null;
  const overlay = document.getElementById('wc-game-overlay');
  document.getElementById('wc-overlay-title').style.color = '#22c55e';
  document.getElementById('wc-overlay-title').textContent = '🎉 Complete!';
  document.getElementById('wc-overlay-sub').textContent   = `100% — You beat it!`;
  overlay.classList.add('visible');

  addXP(25, 'Beat own wave level');
  wcAddCreatorXP(25, 'beat_own');

  const stats = WC.get('stats', {levels:0,uploads:0,likes:0,plays:0,beaten:0,cxp:0});
  stats.beaten = (stats.beaten||0)+1; WC.set('stats',stats);
  wcRenderProfile();

  // Unlock the Upload button now that the level has been beaten
  const uploadBtn = document.querySelector('[onclick="wcUploadLevel()"]');
  if (uploadBtn) {
    uploadBtn.textContent = '⬆️ Upload ✅';
    uploadBtn.title = 'Level beaten — ready to upload!';
    uploadBtn.style.boxShadow = '0 0 10px #22c55e';
  }
}

function wcRenderPlay() {
  const ctx = wcCtx, W = wcCanvas.width, H = wcCanvas.height;
  const g = wcState.gridSize;
  const camX = wcPlay.camX;

  ctx.fillStyle = wcPlay.bgColorOverride || wcLevelData.bgColor || wcState.bgColor || '#020210';
  ctx.fillRect(0,0,W,H);

  // Background grid
  ctx.strokeStyle = 'rgba(0,229,255,0.04)';
  ctx.lineWidth = 1;
  const ox = -(camX * g % g);
  for (let x=ox; x<W; x+=g) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y=0;  y<H; y+=g) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // Objects (with trigger offsets)
  const sorted = [...wcState.objects].map((o,i)=>({o,i})).sort((a,b)=>a.o.layer-b.o.layer);
  for (const {o, i} of sorted) {
    const def = WC_OBJECTS[o.type]||{};
    if (wcPlay.coins.has(i) && def.collectible) continue;
    if (def.trigger) continue; // triggers are invisible during play
    const off = wcPlay.offsets[i];
    const ogx = o.gx + (off?.dx||0);
    const ogy = o.gy + (off?.dy||0);
    const scx = (ogx - camX) * g;
    const scy = ogy * g;
    const sz  = g * (o.scale||1);
    if (scx + sz < -50 || scx > W+50) continue; // cull
    if (off?.alpha !== undefined) {
      ctx.globalAlpha = Math.max(0, Math.min(1, off.alpha));
    }
    wcDrawObject(ctx, o, scx, scy, sz, false, true);
    ctx.globalAlpha = 1;
  }

  // Death particles
  wcPlay.deathParticles = wcPlay.deathParticles.filter(p => {
    p.x += p.vx; p.y += p.vy; p.life -= 0.04;
    if (p.life <= 0) return false;
    const scx = (p.x - camX)*g, scy = p.y*g;
    const r = p.life * g/3;
    ctx.beginPath(); ctx.arc(scx, scy, r, 0, Math.PI*2);
    ctx.fillStyle = p.color + Math.round(p.life*255).toString(16).padStart(2,'0');
    ctx.fill();
    return true;
  });

  // Player — GD-style wave ship
  if (wcPlay.alive) {
    const px = (wcPlay.wx - camX) * g;
    const py = wcPlay.wy * g;
    const flip = wcPlay.gravity < 0;
    const s = g * 0.42; // ship half-size (~12.6 px at gridSize=30)

    ctx.save();
    ctx.translate(px, py);
    if (flip) ctx.scale(1, -1);

    // ── outer glow ───────────────────────────────────────────
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur  = 18;

    // ── main body (elongated diamond pointing right) ─────────
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.moveTo( s,       0);          // nose
    ctx.lineTo(-s*0.08, -s*0.58);     // top shoulder
    ctx.lineTo(-s*0.72, -s*0.28);     // top wing tip
    ctx.lineTo(-s*0.52,  0);          // back notch
    ctx.lineTo(-s*0.72,  s*0.28);     // bottom wing tip
    ctx.lineTo(-s*0.08,  s*0.58);     // bottom shoulder
    ctx.closePath();
    ctx.fill();

    // ── top wing shading ─────────────────────────────────────
    ctx.fillStyle = 'rgba(0,60,100,0.45)';
    ctx.beginPath();
    ctx.moveTo( s*0.18,  0);
    ctx.lineTo(-s*0.08, -s*0.58);
    ctx.lineTo(-s*0.72, -s*0.28);
    ctx.lineTo(-s*0.48,  0);
    ctx.closePath();
    ctx.fill();

    // ── bottom wing shading ───────────────────────────────────
    ctx.beginPath();
    ctx.moveTo( s*0.18,  0);
    ctx.lineTo(-s*0.08,  s*0.58);
    ctx.lineTo(-s*0.72,  s*0.28);
    ctx.lineTo(-s*0.48,  0);
    ctx.closePath();
    ctx.fill();

    // ── cockpit window ────────────────────────────────────────
    ctx.shadowBlur = 0;
    ctx.fillStyle  = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.ellipse(s*0.22, -s*0.08, s*0.26, s*0.19, 0, 0, Math.PI*2);
    ctx.fill();

    // window shine (top-left glint)
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(s*0.13, -s*0.2, s*0.10, s*0.065, 0, 0, Math.PI*2);
    ctx.fill();

    // ── engine stripe ─────────────────────────────────────────
    ctx.fillStyle = 'rgba(0,200,255,0.55)';
    ctx.fillRect(-s*0.52, -s*0.08, s*0.12, s*0.16);

    // ── thruster flame (flickers on hold) ─────────────────────
    const flLen   = (wcHolding ? 0.9 : 0.5) * s;
    const flicker = (Math.random() - 0.5) * s * 0.06;
    ctx.shadowColor = wcHolding ? '#ffe66d' : '#fb923c';
    ctx.shadowBlur  = 14;
    ctx.fillStyle   = wcHolding ? '#fff176' : '#fb923c';
    ctx.beginPath();
    ctx.moveTo(-s*0.5, -s*0.11);
    ctx.lineTo(-s*0.5,  s*0.11);
    ctx.lineTo(-s*0.5 - flLen, flicker);
    ctx.closePath();
    ctx.fill();

    // inner flame core
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.moveTo(-s*0.5, -s*0.04);
    ctx.lineTo(-s*0.5,  s*0.04);
    ctx.lineTo(-s*0.5 - flLen*0.45, flicker * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── engine trail particles ────────────────────────────────
    if (Math.random() < 0.5) {
      wcPlay.deathParticles.push({
        x: wcPlay.wx - 0.55,
        y: wcPlay.wy + (flip ? -1 : 1) * (Math.random() - 0.5) * 0.25,
        vx: -0.04 - Math.random() * 0.03,
        vy: (Math.random() - 0.5) * 0.06,
        life: 0.45,
        color: wcHolding ? '#ffe66d' : '#00e5ff',
      });
    }

    ctx.restore();
  }

  // "Hold to fly" hint — shown for first 3 seconds
  const elapsed = (wcPlay.hintStart !== undefined) ? (Date.now() - wcPlay.hintStart) : 0;
  if (wcPlay.hintStart === undefined) wcPlay.hintStart = Date.now();
  if (elapsed < 3000) {
    const alpha = elapsed > 2000 ? 1 - (elapsed-2000)/1000 : 1;
    ctx.save();
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = 'rgba(0,0,20,0.6)';
    const hint = 'HOLD  [SPACE] / CLICK  to fly up';
    ctx.font = 'bold 14px Nunito, sans-serif';
    const tw = ctx.measureText(hint).width;
    ctx.fillRect(W/2 - tw/2 - 12, H/2 - 22, tw + 24, 30);
    ctx.fillStyle = '#00e5ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(hint, W/2, H/2 - 7);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Progress top bar
  const pct = wcPlay.progress;
  ctx.fillStyle = 'rgba(0,229,255,0.15)';
  ctx.fillRect(0,0,W,4);
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(0,0,W*pct,4);

  // Practice mode checkpoints
  if (wcPlay.practice) {
    wcPlay.checkpoints.forEach(cpX => {
      const scx = (cpX - camX)*g;
      ctx.strokeStyle='#22c55e'; ctx.lineWidth=2; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(scx,0); ctx.lineTo(scx,H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='#22c55e'; ctx.font='14px Nunito,sans-serif';
      ctx.fillText('🚩',scx-8,18);
    });
  }
}

// ══════════════════════════════════════════════════════════════
//  SAVE / LOAD
// ══════════════════════════════════════════════════════════════
function wcOpenSave() {
  const modal = document.getElementById('wc-save-modal');
  document.getElementById('wc-save-name').value = document.getElementById('wc-level-name').value || 'My Wave Level';
  document.getElementById('wc-save-diff').value = wcLevelData.difficulty || 'normal';
  modal.classList.add('open');
}
function wcCloseSave() { document.getElementById('wc-save-modal').classList.remove('open'); }

function wcSaveLevel() {
  const name = document.getElementById('wc-save-name').value.trim() || 'My Wave Level';
  const desc = document.getElementById('wc-save-desc').value.trim();
  const diff = document.getElementById('wc-save-diff').value;

  const levels = WC.get('my_levels', []);
  const existing = levels.findIndex(l => l.name === name);
  const lvl = {
    id:         existing >= 0 ? levels[existing].id : 'lvl_' + Date.now(),
    name, desc, diff,
    bgColor:    wcState.bgColor,
    speed:      wcState.levelSpeed,
    startTile:  wcLevelData.startTile,
    startY:     wcLevelData.startY,
    endTile:    wcLevelData.endTile,
    objects:    JSON.parse(JSON.stringify(wcState.objects)),
    savedAt:    Date.now(),
    attempts:   wcPlay.attempts,
    best:       wcPlay.best,
  };

  if (existing >= 0) levels[existing] = lvl;
  else levels.unshift(lvl);
  WC.set('my_levels', levels);

  // Creator XP for first save
  const isNew = existing < 0;
  if (isNew) {
    const stats = WC.get('stats',{levels:0,uploads:0,likes:0,plays:0,beaten:0,cxp:0});
    stats.levels = (stats.levels||0)+1; WC.set('stats',stats);
    addXP(50, 'Created a wave level');
    wcAddCreatorXP(50, 'create');
  }

  document.getElementById('wc-level-name').value = name;
  wcCloseSave();
  showToast(`Level "${name}" saved! 💾`, '🌊');
  wcRenderMyLevels();
  wcRenderProfile();
}

function wcLoadLevel(lvl) {
  if (!confirm(`Load "${lvl.name}"? Unsaved changes will be lost.`)) return;
  wcState.objects   = JSON.parse(JSON.stringify(lvl.objects));
  wcState.bgColor     = lvl.bgColor  || '#020210';
  wcState.levelSpeed  = lvl.speed    || 6;
  wcLevelData.startTile  = lvl.startTile ?? 2;
  wcLevelData.startY     = lvl.startY    ?? 6;
  wcLevelData.endTile    = lvl.endTile   || lvl.length || 120;  // back-compat
  wcLevelData.difficulty = lvl.diff      || 'normal';
  document.getElementById('wc-level-name').value = lvl.name;
  document.getElementById('wc-bg-color').value   = lvl.bgColor  || '#020210';
  document.getElementById('wc-lvl-speed').value  = lvl.speed    || 6;
  document.getElementById('wc-lvl-diff').value   = lvl.diff     || 'normal';
  const stInp = document.getElementById('wc-start-tile');
  if (stInp) stInp.value = wcLevelData.startTile;
  const etInp = document.getElementById('wc-end-tile');
  if (etInp) etInp.value = wcLevelData.endTile;
  wcUpdateObjCount(); wcRenderEditor();
  wcShowSection('editor');
  showToast(`Loaded "${lvl.name}"`, '📂');
}

function wcDeleteLevel(id) {
  if (!confirm('Delete this level?')) return;
  let levels = WC.get('my_levels',[]);
  levels = levels.filter(l=>l.id!==id);
  WC.set('my_levels',levels);
  wcRenderMyLevels();
  showToast('Level deleted','🗑');
}

function wcExportLevel(lvl) {
  const json = JSON.stringify(lvl, null, 2);
  const blob = new Blob([json],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (lvl.name||'level').replace(/\s+/g,'_') + '.json';
  a.click();
}

function wcImportLevel() {
  document.getElementById('wc-import-json').value = '';
  document.getElementById('wc-import-modal').classList.add('open');
}

function wcDoImport() {
  try {
    const data = JSON.parse(document.getElementById('wc-import-json').value);
    if (!data.objects) throw new Error('Missing objects array');
    wcLoadLevel({ ...data, id:'lvl_'+Date.now(), savedAt:Date.now() });
    document.getElementById('wc-import-modal').classList.remove('open');
  } catch(e) {
    showToast('Import failed: ' + e.message, '❌');
  }
}

function wcNewLevel() {
  if (!confirm('Start a new level? Current work will be lost if not saved.')) return;
  wcState.objects = []; wcState.selected = [];
  wcState.undoStack = []; wcState.redoStack = [];
  wcPlay.attempts = 0; wcPlay.best = 0;
  wcLevelData.startTile = 2; wcLevelData.startY = 6;
  wcLevelData.endTile = 120;
  const stI = document.getElementById('wc-start-tile'); if (stI) stI.value = 2;
  const etI = document.getElementById('wc-end-tile');   if (etI) etI.value = 120;
  document.getElementById('wc-level-name').value = 'My Wave Level';
  wcUpdateObjCount(); wcRenderEditor(); wcShowSection('editor');
}

// ── Render My Levels grid ────────────────────────────────────
function wcRenderMyLevels() {
  const grid = document.getElementById('wc-my-levels-grid');
  if (!grid) return;
  const levels = WC.get('my_levels',[]);
  if (!levels.length) {
    grid.innerHTML = '<div style="color:rgba(200,200,255,.4);font-size:13px;font-weight:800;grid-column:1/-1">No saved levels yet — create your first one in the editor!</div>';
    return;
  }
  grid.innerHTML = levels.map(l => `
    <div class="wc-lvl-card" onclick="wcLoadLevel(${JSON.stringify(l).replace(/"/g,'&quot;')})">
      <div class="wc-lvl-thumb">
        <span style="font-size:40px">🌊</span>
      </div>
      <div class="wc-lvl-name">${l.name}</div>
      <div class="wc-lvl-meta">Saved ${wcTimeAgo(l.savedAt)} · ${l.objects?.length||0} objects</div>
      <div class="wc-lvl-chips">
        <span class="wc-diff-chip diff-${l.diff||'normal'}">${l.diff||'normal'}</span>
        <span class="wc-diff-chip" style="background:rgba(255,230,109,.1);color:#ffe66d;border:1px solid rgba(255,230,109,.2)">⭐ Best: ${l.best||0}%</span>
      </div>
      <div style="display:flex;gap:5px;margin-top:8px" onclick="event.stopPropagation()">
        <button class="btn btn-secondary" style="padding:4px 8px;font-size:11px" onclick="wcExportLevel(${JSON.stringify(l).replace(/"/g,'&quot;')})">Export</button>
        <button class="btn btn-danger" style="padding:4px 8px;font-size:11px" onclick="wcDeleteLevel('${l.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// ── Time formatting ───────────────────────────────────────────
function wcTimeAgo(ts) {
  if (!ts) return 'recently';
  const d = (Date.now()-ts)/1000;
  if (d<60) return 'just now';
  if (d<3600) return Math.floor(d/60)+'m ago';
  if (d<86400) return Math.floor(d/3600)+'h ago';
  return Math.floor(d/86400)+'d ago';
}

// ══════════════════════════════════════════════════════════════
//  COMMUNITY
// ══════════════════════════════════════════════════════════════
function wcRenderCommunity() {
  const grid = document.getElementById('wc-community-grid');
  if (!grid) return;

  let levels = [...WC_COMM_LEVELS];
  const tab = wcCommunity.tab;
  if (tab==='featured') levels = levels.filter(l=>l.featured);
  else if (tab==='trending') levels = levels.sort((a,b)=>b.plays-a.plays);
  else if (tab==='newest') levels = levels.reverse();
  else if (tab==='easy') levels = levels.filter(l=>l.diff==='easy');
  else if (tab==='demon') levels = levels.filter(l=>l.diff==='demon');

  grid.innerHTML = levels.map(l => `
    <div class="wc-lvl-card" onclick="wcPlayCommunityLevel('${l.id}')">
      <div class="wc-lvl-thumb" style="font-size:40px">${l.emoji}</div>
      <div class="wc-lvl-name">${l.name}</div>
      <div class="wc-lvl-meta">by ${l.creator}</div>
      <div class="wc-lvl-meta" style="margin-top:2px">❤️ ${l.likes} likes · ▶ ${l.plays} plays</div>
      <div class="wc-lvl-chips" style="margin-top:6px">
        <span class="wc-diff-chip diff-${l.diff}">${l.diff}</span>
        ${l.featured?'<span class="wc-diff-chip" style="background:rgba(255,230,109,.12);color:#ffe66d;border:1px solid rgba(255,230,109,.25)">⭐ Featured</span>':''}
      </div>
      <div style="font-size:10px;color:rgba(200,200,255,.4);font-weight:700;margin-top:6px;line-height:1.5">${l.desc}</div>
    </div>
  `).join('') || '<div style="color:rgba(200,200,255,.4);font-size:13px;font-weight:800;grid-column:1/-1">No levels found for this filter.</div>';
}

function wcCommTab(tab) {
  wcCommunity.tab = tab;
  document.querySelectorAll('[id^=comm-tab-]').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('comm-tab-' + tab);
  if (btn) btn.classList.add('active');
  wcRenderCommunity();
}

function wcPlayCommunityLevel(id) {
  const lvl = WC_COMM_LEVELS.find(l=>l.id===id);
  if (!lvl) return;
  wcCommunity.playingLevel = lvl;

  // Update modal
  document.getElementById('wc-play-modal-title').textContent = lvl.emoji + ' ' + lvl.name;
  document.getElementById('wc-play-modal-body').textContent  = `By ${lvl.creator} — ${lvl.desc}`;
  document.getElementById('wc-play-modal').classList.add('open');

  // Award XP for playing
  lvl.plays++;
  const stats = WC.get('stats',{levels:0,uploads:0,likes:0,plays:0,beaten:0,cxp:0});
  stats.plays = (stats.plays||0)+1; WC.set('stats',stats);

  // Start mini play session in modal canvas
  wcStartModalPlay(lvl);
}

function wcStartModalPlay(lvl) {
  if (wcCommunity.playFrame) cancelAnimationFrame(wcCommunity.playFrame);

  // Generate a simple procedural level for the chosen lvl
  wcCommunity.objects = wcGenProceduralLevel(lvl);
  wcCommunity.wx = 2; wcCommunity.wy = 5;
  wcCommunity.velY = 0; wcCommunity.gravity = 1;
  wcCommunity.speed = {easy:5,normal:6,hard:8,insane:10,demon:13}[lvl.diff]||6;
  wcCommunity.camX = 0; wcCommunity.alive = true;
  wcCommunity.progress = 0; wcCommunity.totalLen = 120;
  wcCommunity.holding = false;

  const modal = document.getElementById('wc-play-modal');
  if (modal.classList.contains('fullscreen')) {
    wcPlayCanvas.width  = window.innerWidth;
    wcPlayCanvas.height = window.innerHeight - 46; // minus HUD bar
  } else {
    wcPlayCanvas.width  = 420;
    wcPlayCanvas.height = 200;
  }

  document.getElementById('wc-play-modal-bar').style.width  = '0%';
  document.getElementById('wc-play-modal-pct').textContent  = '0%';
  document.getElementById('wc-play-modal-bar2').style.width = '0%';
  document.getElementById('wc-play-modal-pct2').textContent = '0%';
  const hudTitle = document.getElementById('wc-play-hud-title');
  if (hudTitle) hudTitle.textContent = lvl.emoji + ' ' + lvl.name;

  // Bind modal hold
  const hold = (v) => { wcCommunity.holding = v; };
  wcPlayCanvas.onmousedown   = () => hold(true);
  wcPlayCanvas.onmouseup     = () => hold(false);
  wcPlayCanvas.ontouchstart  = (e) => { hold(true); e.preventDefault(); };
  wcPlayCanvas.ontouchend    = (e) => { hold(false); e.preventDefault(); };

  const loop = () => {
    if (!document.getElementById('wc-play-modal').classList.contains('open')) return;
    wcRenderModalPlay();
    wcCommunity.playFrame = requestAnimationFrame(loop);
  };
  wcCommunity.playFrame = requestAnimationFrame(loop);
}

function wcGenProceduralLevel(lvl) {
  // Generate a wave level based on difficulty
  const objects = [];
  const density = {easy:0.15,normal:0.22,hard:0.3,insane:0.4,demon:0.5}[lvl.diff]||0.2;
  const g = 30;
  const H = wcPlayCanvas.height / g; // canvas height in grid units (dynamic)
  const len = 120;  // total length in tiles

  for (let x=4; x<len; x++) {
    if (Math.random() < 0.08) {
      // Spike on floor
      objects.push({type:'spike',gx:x,gy:Math.floor(H)-1,layer:2,rot:0,scale:1,color:'#ef4444'});
    }
    if (Math.random() < 0.08) {
      // Spike on ceiling
      objects.push({type:'spike_down',gx:x,gy:0,layer:2,rot:0,scale:1,color:'#ef4444'});
    }
    if (Math.random() < density/3) {
      // Block wall
      const gy = Math.floor(Math.random()*(H-2))+1;
      const h = Math.floor(Math.random()*2)+1;
      for (let dy=0; dy<h; dy++) objects.push({type:'block',gx:x,gy:gy+dy,layer:2,rot:0,scale:1,color:'#2563eb'});
    }
    if (Math.random() < 0.03) {
      objects.push({type:'coin',gx:x,gy:Math.floor(Math.random()*(H-2))+1,layer:2,rot:0,scale:0.8,color:'#ffe66d'});
    }
  }
  // Floor + ceiling
  for (let x=0; x<len; x++) {
    objects.push({type:'block',gx:x,gy:Math.floor(H),layer:1,rot:0,scale:1,color:'#1e3a5f'});
    objects.push({type:'block',gx:x,gy:-1,          layer:1,rot:0,scale:1,color:'#1e3a5f'});
  }
  return objects;
}

function wcRenderModalPlay() {
  const ctx = wcPlayCtx;
  if (!ctx) return;
  const W = wcPlayCanvas.width, H = wcPlayCanvas.height;
  const g = 30;
  const p = wcCommunity;

  // Physics
  p.velY = (p.velY||0);
  p.velY += p.holding ? WP.LIFT : WP.GRAV * p.gravity;
  p.velY  = Math.max(-WP.TERM, Math.min(WP.TERM, p.velY));
  p.wy   += p.velY;
  p.wx   += p.speed / g;
  p.camX  = p.wx - 4;

  const maxY = H/g - 1;
  if (p.wy < 0.3)  { p.wy = 0.3; wcModalKill(); }
  if (p.wy > maxY) { p.wy = maxY; wcModalKill(); }

  // Collision
  if (p.alive) {
    const hw = 0.35;
    for (const o of p.objects) {
      const def = WC_OBJECTS[o.type]||{};
      if (def.decor) continue;
      if (p.wx+hw>o.gx && p.wx-hw<o.gx+1 && p.wy+hw>o.gy && p.wy-hw<o.gy+1) {
        if (def.kills) { wcModalKill(); break; }
        if (def.solid) {
          const overlapT = (p.wy+hw)-o.gy, overlapB = (o.gy+1)-(p.wy-hw);
          if (overlapT < overlapB) { p.wy = o.gy-hw-0.01; p.velY=0; }
          else { wcModalKill(); break; }
        }
      }
    }
  }

  // Progress
  p.progress = Math.min(1, p.wx / p.totalLen);
  const pct = Math.round(p.progress*100);
  document.getElementById('wc-play-modal-bar').style.width  = pct+'%';
  document.getElementById('wc-play-modal-pct').textContent  = pct+'%';
  document.getElementById('wc-play-modal-bar2').style.width = pct+'%';
  document.getElementById('wc-play-modal-pct2').textContent = pct+'%';

  // Draw
  ctx.fillStyle = '#020210';
  ctx.fillRect(0,0,W,H);

  // Grid
  ctx.strokeStyle='rgba(0,229,255,0.05)'; ctx.lineWidth=1;
  const ox2 = -(p.camX*g%g);
  for (let x=ox2;x<W;x+=g) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y=0;y<H;y+=g)   { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // Objects
  for (const o of p.objects) {
    const scx=(o.gx-p.camX)*g, scy=o.gy*g, sz=g*(o.scale||1);
    if (scx+sz<-10||scx>W+10) continue;
    wcDrawObject(ctx,o,scx,scy,sz,false,true);
  }

  // Player
  if (p.alive) {
    const px=(p.wx-p.camX)*g, py=p.wy*g;
    ctx.save(); ctx.translate(px,py);
    if (p.gravity<0) ctx.scale(1,-1);
    ctx.shadowColor='#00e5ff'; ctx.shadowBlur=16;
    ctx.fillStyle='#00e5ff';
    ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(-6,8); ctx.lineTo(-3,0); ctx.lineTo(-6,-8); ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0; ctx.restore();
  }

  // Progress bar
  ctx.fillStyle='rgba(0,229,255,0.1)'; ctx.fillRect(0,0,W,3);
  ctx.fillStyle='#00e5ff'; ctx.fillRect(0,0,W*p.progress,3);

  // Level complete
  if (p.progress >= 1 && p.alive) {
    p.alive = false;
    addXP(30,'Beat community wave level');
    wcAddCreatorXP(30,'beat');
    const stats = WC.get('stats',{levels:0,uploads:0,likes:0,plays:0,beaten:0,cxp:0});
    stats.beaten=(stats.beaten||0)+1; WC.set('stats',stats);
    wcRenderProfile();
    showToast('Level Complete! +30 XP','🎉');
    ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#22c55e'; ctx.font='bold 28px Fredoka One,cursive';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🎉 Complete!',W/2,H/2);
  }

  // Death screen
  if (!p.alive && p.progress < 1) {
    ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ff6b6b'; ctx.font='bold 24px Fredoka One,cursive';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('💀 Tap/Click to Retry',W/2,H/2);
    wcPlayCanvas.onclick = () => { wcPlayCanvas.onclick=null; wcStartModalPlay(wcCommunity.playingLevel); };
  }
}

function wcModalKill() {
  if (!wcCommunity.alive) return;
  wcCommunity.alive = false;
  wcCommunity.velY = 0;
}

function wcClosePlayModal() {
  if (wcCommunity.playFrame) cancelAnimationFrame(wcCommunity.playFrame);
  wcCommunity.playFrame = null;
  const modal = document.getElementById('wc-play-modal');
  modal.classList.remove('open');
  modal.classList.remove('fullscreen');
}

function wcTogglePlayFullscreen() {
  const modal = document.getElementById('wc-play-modal');
  const entering = !modal.classList.contains('fullscreen');
  modal.classList.toggle('fullscreen', entering);

  // Resize canvas then restart game to regenerate level at new size
  if (wcCommunity.playingLevel) {
    wcStartModalPlay(wcCommunity.playingLevel);
  }
}

function wcPlayModalRetry() {
  wcStartModalPlay(wcCommunity.playingLevel);
}

function wcLikeLevel() {
  const lvl = wcCommunity.playingLevel;
  if (!lvl) return;
  const liked = WC.get('liked',[]);
  if (liked.includes(lvl.id)) { showToast('Already liked!','❤️'); return; }
  liked.push(lvl.id); WC.set('liked',liked);
  lvl.likes++;
  showToast('Liked! ❤️','❤️');
}

// ══════════════════════════════════════════════════════════════
//  UPLOAD (simulated)
// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
//  AI DIFFICULTY ANALYZER
// ══════════════════════════════════════════════════════════════

function wcAnalyzeLevelDifficulty() {
  const objects  = wcState.objects;
  const endTile  = wcLevelData.endTile  || 120;
  const baseSpd  = wcState.levelSpeed   || 6;
  const gridH    = wcCanvas ? (wcCanvas.height / wcState.gridSize) : 15;

  // ── Categorise objects ──────────────────────────────────────
  const hazards  = objects.filter(o => WC_OBJECTS[o.type]?.kills);
  const solids   = objects.filter(o => WC_OBJECTS[o.type]?.solid);
  const saws     = hazards.filter(o => o.type === 'saw' || o.type === 'laser');
  const spd_portals = objects.filter(o => WC_OBJECTS[o.type]?.portal === 'speed');

  // ── Density: hazards per tile ───────────────────────────────
  const density = hazards.length / Math.max(1, endTile);

  // ── Max effective speed (base × highest speed portal) ───────
  const maxMult  = spd_portals.reduce((m, o) => Math.max(m, o.speed || 1), 1);
  const effSpeed = baseSpd * maxMult;

  // ── Double-sided tiles (floor hazard + ceiling hazard) ───────
  const floorSet = new Set(hazards.filter(o => o.gy >= gridH - 2.5).map(o => Math.floor(o.gx)));
  const ceilSet  = new Set(hazards.filter(o => o.gy <= 1.5).map(o => Math.floor(o.gx)));
  let doubleSided = 0;
  for (const x of floorSet) if (ceilSet.has(x)) doubleSided++;
  const dblRatio = doubleSided / Math.max(1, endTile);

  // ── Tight corridors: vertical gap ≤ 3 tiles at any X ────────
  const solidsByX = {};
  for (const s of solids) {
    const x = Math.floor(s.gx);
    if (!solidsByX[x]) solidsByX[x] = [];
    solidsByX[x].push(s.gy);
  }
  let tightCnt = 0;
  for (const ys of Object.values(solidsByX)) {
    const sorted = [...ys].sort((a,b)=>a-b);
    for (let i=1; i<sorted.length; i++) {
      if (sorted[i]-sorted[i-1] <= 3) tightCnt++;
    }
  }
  const tightRatio = tightCnt / Math.max(1, endTile);

  // ── Saw / laser penalty (harder than plain spikes) ──────────
  const sawRatio = saws.length / Math.max(1, endTile);

  // ── Gravity portals (disorienting → harder) ─────────────────
  const gravCount = objects.filter(o => WC_OBJECTS[o.type]?.portal === 'grav').length;

  // ── Score 0-100 ──────────────────────────────────────────────
  let score = 0;
  score += Math.min(35, density      * 120);   // density drives ~35 pts
  score += Math.min(20, dblRatio     * 250);   // double-sided up to 20
  score += Math.min(15, (effSpeed-4) * 2.5);   // speed headroom up to 15
  score += Math.min(10, sawRatio     * 120);   // saws/lasers up to 10
  score += Math.min(10, tightRatio   * 80);    // tight corridors up to 10
  score += Math.min(10, gravCount    * 3);     // grav portals up to 10
  score = Math.round(Math.max(0, Math.min(100, score)));

  // ── Map score → difficulty tier ─────────────────────────────
  const estimated =
    score < 18 ? 'easy'   :
    score < 36 ? 'normal' :
    score < 56 ? 'hard'   :
    score < 76 ? 'insane' : 'demon';

  // ── Human-readable breakdown ─────────────────────────────────
  const stats = [
    { label:'Hazard density',   value: density.toFixed(2)+'/tile',   note: density<0.1?'Very sparse':density<0.25?'Light':density<0.45?'Moderate':density<0.65?'Dense':'Brutal' },
    { label:'Effective speed',  value: effSpeed.toFixed(1)+'×',      note: effSpeed<5?'Slow':effSpeed<7?'Normal':effSpeed<10?'Fast':effSpeed<14?'Very fast':'Max' },
    { label:'Double threats',   value: doubleSided+' tiles',         note: doubleSided<2?'None':doubleSided<6?'Few':doubleSided<12?'Some':'Many' },
    { label:'Tight corridors',  value: tightCnt+' spots',            note: tightCnt<2?'None':tightCnt<5?'Few':'Many' },
    { label:'Saws / Lasers',    value: saws.length+'',               note: saws.length===0?'None':saws.length<4?'Some':'Lots' },
    { label:'Gravity flips',    value: gravCount+'',                 note: gravCount===0?'None':gravCount<3?'Some':'Many' },
  ];

  // ── Context-aware tips ────────────────────────────────────────
  const makeHarderTips = [];
  const makeEasierTips = [];
  if (density < 0.15) makeHarderTips.push('Add more spikes or hazards — only ' + hazards.length + ' for ' + endTile + ' tiles');
  if (density > 0.55) makeEasierTips.push('Remove some hazards — ' + hazards.length + ' is very dense');
  if (effSpeed < 5)   makeHarderTips.push('Place a Fast 🔥 speed portal to raise the pace');
  if (effSpeed > 10)  makeEasierTips.push('Remove fast speed portals or use a Slow 🐢 one');
  if (doubleSided < 3 && score < 50) makeHarderTips.push('Add ceiling spikes above existing floor spikes for tight moments');
  if (tightCnt === 0 && score < 60)  makeHarderTips.push('Build wall corridors to force precise navigation');
  if (saws.length === 0 && score < 70) makeHarderTips.push('Add Saws ⚙️ or Lasers 💥 — they are harder to dodge than spikes');
  if (gravCount === 0 && score < 40) makeHarderTips.push('Add a Gravity portal 🔄 to disorient players');
  if (gravCount > 3) makeEasierTips.push('Too many gravity flips is disorienting — reduce to 1-2');

  return { score, density, effSpeed, doubleSided, tightCnt, sawCount:saws.length,
           gravCount, estimated, stats, makeHarderTips, makeEasierTips,
           hazardCount: hazards.length, endTile };
}

// Difficulty ordering for comparison
const WC_DIFF_ORDER = ['easy','normal','hard','insane','demon'];
const WC_DIFF_COLORS = { easy:'#22c55e', normal:'#00e5ff', hard:'#f97316', insane:'#a855f7', demon:'#ef4444' };
const WC_DIFF_EMOJIS = { easy:'😊', normal:'😐', hard:'😤', insane:'😰', demon:'💀' };

function wcRunAIAnalysis(fromUpload = false) {
  if (wcState.objects.length < 3) {
    showToast('Add more objects before analyzing!', '🤖'); return;
  }

  const analysis = wcAnalyzeLevelDifficulty();
  const chosen   = wcLevelData.difficulty || 'normal';
  const chosenIdx = WC_DIFF_ORDER.indexOf(chosen);
  const estIdx    = WC_DIFF_ORDER.indexOf(analysis.estimated);
  const gap       = estIdx - chosenIdx; // positive = level is harder than rated

  // ── Populate modal ───────────────────────────────────────────
  const modal = document.getElementById('wc-ai-modal');

  // Title
  document.getElementById('wc-ai-modal-title').textContent =
    fromUpload ? '🤖 AI Gate — Difficulty Check' : '🤖 AI Difficulty Analysis';

  // Verdict banner
  const verdict = document.getElementById('wc-ai-verdict');
  let verdictText, verdictBg;
  if (Math.abs(gap) <= 1) {
    verdictText = `✅ Looks good! Your ${chosen.toUpperCase()} rating matches the AI estimate (${analysis.estimated}).`;
    verdictBg   = 'rgba(34,197,94,.15)';
    verdict.style.color = '#22c55e';
    verdict.style.border = '1px solid #22c55e44';
  } else if (gap < 0) {
    // Level is EASIER than rated
    verdictText = `⚠️ Too easy for ${chosen.toUpperCase()}! AI rates this as ${analysis.estimated.toUpperCase()}. ${WC_DIFF_EMOJIS[analysis.estimated]} Please pick a lower difficulty or make the level harder.`;
    verdictBg   = 'rgba(255,179,0,.12)';
    verdict.style.color = '#ffe66d';
    verdict.style.border = '1px solid #ffe66d44';
  } else {
    // Level is HARDER than rated
    verdictText = `⚠️ Too hard for ${chosen.toUpperCase()}! AI rates this as ${analysis.estimated.toUpperCase()}. ${WC_DIFF_EMOJIS[analysis.estimated]} Please pick a higher difficulty or make the level easier.`;
    verdictBg   = 'rgba(239,68,68,.12)';
    verdict.style.color = '#fb923c';
    verdict.style.border = '1px solid #fb923c44';
  }
  verdict.textContent = verdictText;
  verdict.style.background = verdictBg;

  // Score bar
  const barPct = analysis.score + '%';
  const barCol = WC_DIFF_COLORS[analysis.estimated];
  document.getElementById('wc-ai-bar').style.cssText =
    `width:${barPct};background:linear-gradient(90deg,${barCol}88,${barCol});height:100%;border-radius:99px;`;
  document.getElementById('wc-ai-needle').style.left = barPct;

  // Stats grid
  const statsEl = document.getElementById('wc-ai-stats');
  statsEl.innerHTML = analysis.stats.map(s => `
    <div style="background:rgba(255,255,255,.05);border-radius:10px;padding:8px 10px">
      <div style="font-size:10px;font-weight:800;color:rgba(200,200,255,.5);text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px">${s.label}</div>
      <div style="font-size:14px;font-weight:900;color:#fff">${s.value}</div>
      <div style="font-size:10px;color:rgba(200,200,255,.6)">${s.note}</div>
    </div>`).join('');

  // Tips
  const tipsEl = document.getElementById('wc-ai-tips');
  let tipsHtml = '';
  if (gap < -1 && analysis.makeHarderTips.length) {
    tipsHtml += '<b style="color:#ffe66d">💡 To make it harder:</b><br>' +
      analysis.makeHarderTips.map(t => `• ${t}`).join('<br>') + '<br>';
  }
  if (gap > 1 && analysis.makeEasierTips.length) {
    tipsHtml += '<b style="color:#00e5ff">💡 To make it easier:</b><br>' +
      analysis.makeEasierTips.map(t => `• ${t}`).join('<br>');
  }
  if (!tipsHtml && Math.abs(gap) <= 1) {
    tipsHtml = `<span style="color:#22c55e">🤖 Score: <b>${analysis.score}/100</b> — Great match! ${analysis.hazardCount} hazards across ${analysis.endTile} tiles.</span>`;
  }
  tipsEl.innerHTML = tipsHtml;

  // Difficulty picker (shown only when mismatched)
  const pickRow = document.getElementById('wc-ai-pick-row');
  const diffBtns = document.getElementById('wc-ai-diff-buttons');
  if (Math.abs(gap) >= 2) {
    pickRow.style.display = '';
    diffBtns.innerHTML = WC_DIFF_ORDER.map(d => {
      const isEst = d === analysis.estimated;
      const isCur = d === chosen;
      return `<button class="btn ${isEst?'btn-primary':'btn-secondary'}" style="font-size:12px;padding:5px 10px${isEst?';box-shadow:0 0 10px '+WC_DIFF_COLORS[d]+'88':''}"
        onclick="wcAISetDifficulty('${d}')">
        ${WC_DIFF_EMOJIS[d]} ${d.charAt(0).toUpperCase()+d.slice(1)}${isEst?' ← AI pick':''}${isCur?' (current)':''}
      </button>`;
    }).join('');
  } else {
    pickRow.style.display = 'none';
  }

  // "Upload anyway" button (only when called from upload and mismatch < 2 levels)
  const uploadBtn = document.getElementById('wc-ai-upload-btn');
  uploadBtn.style.display = (fromUpload && Math.abs(gap) < 2) ? '' : 'none';

  modal.classList.add('open');
  return { gap, analysis };
}

function wcAISetDifficulty(diff) {
  wcLevelData.difficulty = diff;
  // Also update the sidebar dropdown
  const sel = document.getElementById('wc-lvl-diff');
  if (sel) sel.value = diff;
  showToast(`Difficulty changed to ${diff.toUpperCase()} ${WC_DIFF_EMOJIS[diff]}`, '🤖');
  // Re-run analysis to refresh the modal
  wcRunAIAnalysis();
}

function wcAIConfirmUpload() {
  document.getElementById('wc-ai-modal').classList.remove('open');
  wcDoUpload();
}

function wcUploadLevel() {
  const name = document.getElementById('wc-level-name').value.trim() || 'My Wave Level';
  if (wcState.objects.length < 5) {
    showToast('Add at least 5 objects before uploading!','⚠️'); return;
  }
  if ((wcPlay.best || 0) < 100) {
    showToast('Beat your own level first before uploading! 🔒','🏆'); return;
  }

  // AI difficulty gate — block if mismatch is 2+ tiers
  const analysis  = wcAnalyzeLevelDifficulty();
  const chosen    = wcLevelData.difficulty || 'normal';
  const chosenIdx = WC_DIFF_ORDER.indexOf(chosen);
  const estIdx    = WC_DIFF_ORDER.indexOf(analysis.estimated);
  const gap       = Math.abs(estIdx - chosenIdx);

  if (gap >= 2) {
    // Open AI modal in "upload gate" mode — blocks upload until fixed
    wcRunAIAnalysis(true);
    return;
  }

  wcDoUpload();
}

function wcDoUpload() {
  const name = document.getElementById('wc-level-name').value.trim() || 'My Wave Level';
  // Simulate upload
  showToast(`"${name}" uploaded to community! +100 XP`,'🚀');
  addXP(100,'Uploaded a wave level');
  wcAddCreatorXP(100,'upload');

  const stats = WC.get('stats',{levels:0,uploads:0,likes:0,plays:0,beaten:0,cxp:0});
  stats.uploads=(stats.uploads||0)+1; WC.set('stats',stats);
  wcRenderProfile();

  // Lock upload again — must make changes AND re-verify before uploading again
  wcPlay.best = 0;
  const uploadBtn = document.querySelector('[onclick="wcUploadLevel()"]');
  if (uploadBtn) {
    uploadBtn.textContent = '⬆️ Upload 🔒';
    uploadBtn.title = 'Make changes and beat your level again to re-upload!';
    uploadBtn.style.boxShadow = '';
  }
}

// ══════════════════════════════════════════════════════════════
//  CREATOR XP & RANK SYSTEM
// ══════════════════════════════════════════════════════════════
function wcAddCreatorXP(amount, reason) {
  const stats = WC.get('stats',{levels:0,uploads:0,likes:0,plays:0,beaten:0,cxp:0});
  stats.cxp = (stats.cxp||0) + amount; WC.set('stats',stats);
  wcRenderProfile();
}

function wcGetRank(cxp) {
  let rank = WC_RANKS[0];
  for (const r of WC_RANKS) { if (cxp >= r.cxp) rank = r; }
  return rank;
}

function wcRenderProfile() {
  const stats = WC.get('stats',{levels:0,uploads:0,likes:0,plays:0,beaten:0,cxp:0});
  const cxp = stats.cxp||0;
  const rank = wcGetRank(cxp);

  // Update stats numbers
  const els = {
    'wc-stat-levels':  stats.levels||0,
    'wc-stat-uploads': stats.uploads||0,
    'wc-stat-likes':   stats.likes||0,
    'wc-stat-plays':   stats.plays||0,
    'wc-stat-beaten':  stats.beaten||0,
    'wc-stat-cxp':     cxp,
  };
  for (const [id,val] of Object.entries(els)) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // Rank display
  const rd = document.getElementById('wc-rank-display');
  if (rd) {
    const nextRank = WC_RANKS.find(r=>r.cxp>cxp);
    rd.innerHTML = `
      <div style="font-size:48px;margin-bottom:10px">${rank.icon}</div>
      <div class="wc-rank-badge ${rank.cls}" style="font-size:14px;padding:6px 18px">${rank.label}</div>
      <div style="font-size:11px;color:rgba(200,200,255,.5);margin-top:8px;font-weight:800">${rank.perk}</div>
      ${nextRank ? `<div style="font-size:10px;color:rgba(200,200,255,.4);margin-top:6px;font-weight:800">${nextRank.cxp-cxp} CXP to ${nextRank.label}</div>` : '<div style="font-size:11px;color:#ffe66d;margin-top:6px;font-weight:900">MAX RANK ACHIEVED!</div>'}
    `;
  }

  // CXP progress bar
  const nextRank2 = WC_RANKS.find(r=>r.cxp>cxp);
  const prevRank  = rank;
  if (nextRank2) {
    const pct = ((cxp - prevRank.cxp) / (nextRank2.cxp - prevRank.cxp)) * 100;
    const bar = document.getElementById('wc-creator-xp-bar');
    const lbl = document.getElementById('wc-creator-xp-label');
    if (bar) bar.style.width = Math.min(100,pct)+'%';
    if (lbl) lbl.textContent = `${cxp} / ${nextRank2.cxp} Creator XP`;
  } else {
    const bar = document.getElementById('wc-creator-xp-bar');
    if (bar) bar.style.width='100%';
  }

  // XP rewards list
  const xpList = document.getElementById('wc-xp-list');
  if (xpList) xpList.innerHTML = WC_XP_REWARDS.map(r=>`
    <div class="wc-xp-item">
      <span class="wc-xp-icon">${r.icon}</span>
      <div class="wc-xp-info">
        <div class="wc-xp-name">${r.name}</div>
        <div class="wc-xp-desc">${r.desc}</div>
      </div>
      <div class="wc-xp-val">+${r.xp}</div>
    </div>
  `).join('');

  // Ranks list
  const rankList = document.getElementById('wc-ranks-list');
  if (rankList) rankList.innerHTML = WC_RANKS.map(r=>`
    <div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;margin-bottom:6px;background:rgba(255,255,255,.03);border:1px solid ${cxp>=r.cxp?'rgba(0,229,255,.15)':'rgba(255,255,255,.05)'}">
      <span style="font-size:24px">${r.icon}</span>
      <div style="flex:1">
        <div class="wc-rank-badge ${r.cls}" style="margin-bottom:4px">${r.label}</div>
        <div style="font-size:10px;color:rgba(200,200,255,.5);font-weight:800">${r.perk}</div>
      </div>
      <div style="font-size:11px;font-weight:900;color:${cxp>=r.cxp?'#22c55e':'rgba(200,200,255,.3)'}">${cxp>=r.cxp?'✓ Unlocked':r.cxp+' CXP'}</div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════════════════════
//  SECTION TABS
// ══════════════════════════════════════════════════════════════
function wcShowSection(name) {
  document.querySelectorAll('.wc-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.wc-tab').forEach(b=>b.classList.remove('active'));
  const section = document.getElementById('section-'+name);
  const tab = document.querySelector(`[data-section="${name}"]`);
  if (section) section.classList.add('active');
  if (tab) tab.classList.add('active');

  if (name==='my-levels') wcRenderMyLevels();
  if (name==='community') wcRenderCommunity();
  if (name==='profile')   wcRenderProfile();
  if (name==='editor')    { wcResizeCanvas(); wcRenderEditor(); }
}

// ══════════════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', wcInit);
window.addEventListener('resize', () => { if (wcState) { wcResizeCanvas(); wcRenderEditor(); } });
