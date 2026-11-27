// © Dunia Impianmu (@DuniaImpianmu · @dunia_impianmu). Hak cipta dilindungi. Dilarang menyalin, mengubah,
// atau menerbitkan ulang kode, model, audio, dan cerita game ini tanpa izin tertulis.
// Dunia Impianmu: jalan-jalan di negeri. Koordinat data = Blender (x, y, z-atas) -> three (x, z, -y).
// Teks (info bangunan, dialog, profil, cerita, ikan, link) ada di data.js.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { DAY, STATUS, LINKS, INFO, DIALOG, PROFILES, STORY, RULES, EPISODES, FISH, KOIN_AWAL, KOIN_IKAN, SHOPS, TELEPORTS, MAIN_MISSIONS, DAILY_POOL, DAILY_BONUS, JOBS } from './data.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Mode pengembang (alat tes & rekam video) hanya aktif di laptop sendiri, tidak di website online.
const DEV = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const CAPTURE = DEV && new URLSearchParams(location.search).has('capture');
// Tolak ditampilkan di dalam website lain (iframe) supaya tidak bisa dibajak/ditempel situs palsu.
if (!DEV && window.top !== window.self) { try { window.top.location.replace(location.href); } catch { document.documentElement.innerHTML = '<p style="font:18px sans-serif;padding:24px">Mainkan Dunia Impianmu langsung di <a href="https://duniaimpianmu.my.id" target="_top">duniaimpianmu.my.id</a></p>'; } throw new Error('dibuka di dalam iframe'); }
const CAP = { cam: null, input: null, forceFish: null };   // dipakai mode rekam video promosi
const touch = !CAPTURE && matchMedia('(pointer: coarse)').matches;
if (CAPTURE) document.body.classList.add('capture');
if (touch) document.body.classList.add('touch');
const store = { get(k, d) { try { const v = localStorage.getItem('di_' + k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem('di_' + k, JSON.stringify(v)); } catch {} } };
const SET = Object.assign({ music: 0.8, sfx: 0.8, gfx: touch ? 'rendah' : 'tinggi', cam: 1, weather: 'auto' }, store.get('set', {}));
const saveSet = () => store.set('set', SET);
const STATS = Object.assign({ dist: 0, photos: 0, time: 0, talked: [], caught: {}, seenDia: false, koin: KOIN_AWAL, bag: {}, given: [], eaten: 0 }, store.get('stats', {}));
// Data simpanan rusak/diutak-atik -> kembalikan ke bentuk yang benar supaya game tidak error.
{ const num = (v, d, max = 1e9) => (Number.isFinite(v) && v >= 0 ? Math.min(v, max) : d), obj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  STATS.koin = Math.floor(num(STATS.koin, KOIN_AWAL, 999999)); for (const k of ['dist', 'photos', 'time', 'eaten']) STATS[k] = num(STATS[k], 0);
  for (const k of ['talked', 'given']) if (!Array.isArray(STATS[k])) STATS[k] = [];
  for (const k of ['caught', 'bag']) if (!obj(STATS[k])) STATS[k] = {};
  for (const k in STATS.bag) STATS.bag[k] = Math.floor(num(STATS.bag[k], 0, 999)); }
const saveStats = () => store.set('stats', STATS);
let toastT = 0;
function toast(msg, sec = 2.2) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); toastT = sec; }
const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
$('#dayLbl').textContent = `DAY ${DAY}`;
function renderStats() { $('#stats').innerHTML = `Gold <b>${STATUS.gold}</b><br>Warga <b>${STATUS.warga}</b><br>Rumah <b>${STATUS.rumah}</b><div class="koin">🪙 Koinku <b>${STATS.koin}</b></div>`; }
renderStats();
function addKoin(n) { STATS.koin = Math.max(0, STATS.koin + n); saveStats(); renderStats(); }
$('#socials').innerHTML = LINKS.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener"><i style="background:${l.color}">${l.icon}</i>${esc(l.name)}</a>`).join('');

// ------------------------------------------------------------------ renderer & scene
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true });
const basePR = () => Math.min(devicePixelRatio, SET.gfx === 'rendah' ? 1 : touch ? 1.5 : 2);
renderer.setPixelRatio(basePR());
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = SET.gfx !== 'rendah'; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe6ff, 70, 190);
const camera = new THREE.PerspectiveCamera(55, 1, 0.25, 500);
const B2T = (x, y, z = 0) => new THREE.Vector3(x, z, -y);
const UP = new THREE.Vector3(0, 1, 0);

const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color('#6fb6ff') }, bot: { value: new THREE.Color('#fff1d6') } },
  vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying float h; void main(){ gl_FragColor = vec4(mix(bot, top, smoothstep(-0.05, 0.45, h)), 1.); }',
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), skyMat); sky.renderOrder = -3; scene.add(sky);
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
{
  const n = 700, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = Math.random() * 6.283, v = 0.08 + Math.random() * 0.9, r = 420; pos[i * 3] = Math.cos(u) * Math.sqrt(1 - v * v) * r; pos[i * 3 + 1] = v * r; pos[i * 3 + 2] = Math.sin(u) * Math.sqrt(1 - v * v) * r; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(g, starMat); stars.renderOrder = -2; scene.add(stars);
}
const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 12), new THREE.MeshBasicMaterial({ color: 0xfff6d8, transparent: true, opacity: 0, fog: false }));
moon.position.set(-160, 190, -300); scene.add(moon);
const hemi = new THREE.HemisphereLight(0xe4f1ff, 0x7fb860, 1.6); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 2.4); sun.castShadow = true;
sun.shadow.mapSize.set(touch ? 1024 : 2048, touch ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);
const SUN_OFF = new THREE.Vector3(14, 30, 18), MOON_OFF = new THREE.Vector3(-14, 28, -20);

// tekstur kecil buatan sendiri
function canvasTex(size, draw) { const cv = document.createElement('canvas'); cv.width = cv.height = size; draw(cv.getContext('2d'), size); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; }
const glowTex = canvasTex(128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,236,170,1)'); g.addColorStop(0.25, 'rgba(255,210,120,0.55)'); g.addColorStop(1, 'rgba(255,190,90,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
const puffTex = canvasTex(128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.6, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
const starTex = canvasTex(128, (c) => { c.translate(64, 64); c.fillStyle = '#fff'; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 22 : 58, a = (i / 10) * Math.PI * 2 - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); });
const heartTex = canvasTex(128, (c) => { c.fillStyle = '#ff4d7a'; c.beginPath(); c.moveTo(64, 112); c.bezierCurveTo(10, 72, 6, 30, 38, 22); c.bezierCurveTo(54, 18, 62, 30, 64, 40); c.bezierCurveTo(66, 30, 74, 18, 90, 22); c.bezierCurveTo(122, 30, 118, 72, 64, 112); c.fill(); });

// ------------------------------------------------------------------ loading
const bar = $('#load .bar i'), lp = $('#lp');
const manager = new THREE.LoadingManager();
manager.onProgress = (_u, a, b) => { bar.style.width = `${Math.round((a / b) * 100)}%`; };
const loader = new GLTFLoader(manager);
const loadGLB = (u) => new Promise((res, rej) => loader.load(u, res, undefined, rej));

const L = await (await fetch('./layout.json')).json();
L.items = L.items.filter((it) => Math.min(...it.s) > 0.02);   // buang benda yang sudah 'tenggelam' (pagar lama Day 3)
const GATE = { x: 0, y: L.fence.c[1] - L.fence.r, half: 2.4 };
const ZONE = L.zone || null;                   // kawasan selatan Day 5 (di luar pagar): [x0, x1, y0, y1]
const EXTRA = L.extra || [];                   // penghalang bangunan prosedural (pasar, bendungan, dll.)
const RIVER_END = ZONE ? -47.5 : -1e9;          // sungai berakhir di bendungan, di bawahnya waduk
const extraColor = (k) => ({ waduk: '#4aa8e0', tower: '#9aa3b5', safari_pagar: '#a8743a', safari_gerbang: '#7a4a1a', hewan: null, safari_pohon: null, safari_batu: null, safari_kolam: '#4aa8e0' }[k] ?? '#ffcf3a');
const ZONE_AVOID = [[-16, -5, -43.5, -35], [10, 25, -49, -35]];   // sawah & taman safari (rumput tidak tumbuh)
const inBox = (x, y, e, pad = 0) => { const dx = x - e.p[0], dy = y - e.p[1], c = Math.cos(-e.r), s = Math.sin(-e.r), lx = dx * c - dy * s, ly = dx * s + dy * c;
  return lx > e.b[0] - pad && lx < e.b[1] + pad && ly > e.b[2] - pad && ly < e.b[3] + pad; };
{ // tutup celah pagar (tempat sungai lewat); di gerbang selatan diberi gapura
  const C = L.fence.c, R = L.fence.r, step = (2 * Math.PI) / Math.floor((2 * Math.PI * R) / 2.0);
  const fen = L.items.filter((it) => it.a === 'pagar'), s = fen[0]?.s || [1, 1, 1];
  const ang = fen.map((it) => Math.atan2(it.p[1] - C[1], it.p[0] - C[0])).map((a) => (a + 2 * Math.PI) % (2 * Math.PI)).sort((a, b) => a - b);
  for (let k = 0; k < ang.length; k++) {
    const a0 = ang[k], a1 = k + 1 < ang.length ? ang[k + 1] : ang[0] + 2 * Math.PI;
    for (let a = a0 + step; a < a1 - step * 0.5; a += step) {
      const x = C[0] + Math.cos(a) * R, y = C[1] + Math.sin(a) * R;
      if (Math.abs(x - GATE.x) < GATE.half + 0.6 && Math.abs(y - GATE.y) < 2) continue;
      L.items.push({ a: 'pagar', p: [x, y, 0], r: a + Math.PI / 2, s });
    }
  }
}
const names = [...new Set([...L.assets, 'slime', 'monster'])];
const [terrain, ...glbs] = await Promise.all([loadGLB('./terrain.glb'), ...names.map((n) => loadGLB(`./assets/${n}.glb`))]);
const ASSET = Object.fromEntries(names.map((n, i) => [n, glbs[i]]));

// ------------------------------------------------------------------ penggabung: banyak bagian berwarna polos -> 1 geometri berwarna-verteks
const VC_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 });
const CLOUD_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide, fog: false });
const GLASS_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0, emissive: new THREE.Color('#ffc96b'), emissiveIntensity: 0 });
const special = (m) => m.transparent || m.opacity < 1 || m.map || (m.emissive && m.emissive.getHex() !== 0 && (m.emissiveIntensity ?? 1) > 0);
const isGlass = (c, g) => {   // kaca jendela (biru muda / kuning muda, tipis) -> menyala saat malam
  const blue = Math.abs(c.r - 0.62) < 0.07 && Math.abs(c.g - 0.85) < 0.07 && c.b > 0.93;
  const warm = c.r > 0.97 && c.g > 0.8 && c.g < 0.93 && c.b > 0.4 && c.b < 0.66;
  if (!blue && !warm) return false;
  g.computeBoundingBox(); const s = g.boundingBox.getSize(new THREE.Vector3());
  return Math.min(s.x, s.y, s.z) < 0.08;
};
function prep(geo, m4, color) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  if (!g.attributes.normal) g.computeVertexNormals();
  g.applyMatrix4(m4);
  if (color) { const n = g.attributes.position.count, c = new Float32Array(n * 3); for (let i = 0; i < n; i++) { c[i * 3] = color.r; c[i * 3 + 1] = color.g; c[i * 3 + 2] = color.b; } g.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
  return g;
}
// Anti z-fighting: bagian kecil yang menempel sejajar di bagian lain didorong 5 mm keluar.
function nudgeCoplanar(gs) {
  const bb = gs.map((g) => { g.computeBoundingBox(); return g.boundingBox; }), off = gs.map(() => [0, 0, 0]);
  const lo = (b, i) => b.min.getComponent(i), hi = (b, i) => b.max.getComponent(i), E = 0.004, PUSH = 0.005;
  for (let a = 0; a < gs.length; a++) for (let c = a + 1; c < gs.length; c++) {
    const A = bb[a], C = bb[c];
    for (let ax = 0; ax < 3; ax++) {
      const o = [0, 1, 2].filter((i) => i !== ax);
      if (!o.every((i) => Math.min(hi(A, i), hi(C, i)) - Math.max(lo(A, i), lo(C, i)) > 0.01)) continue;
      const area = (B) => (hi(B, o[0]) - lo(B, o[0])) * (hi(B, o[1]) - lo(B, o[1]));
      const [sm, big] = area(A) <= area(C) ? [a, c] : [c, a];
      for (const fa of [lo(A, ax), hi(A, ax)]) for (const fc of [lo(C, ax), hi(C, ax)]) {
        if (Math.abs(fa - fc) > E) continue;
        const mid = (lo(bb[big], ax) + hi(bb[big], ax)) / 2;
        off[sm][ax] = fa >= mid ? PUSH : -PUSH;
      }
    }
  }
  gs.forEach((g, i) => { if (off[i].some((v) => v)) g.translate(off[i][0], off[i][1], off[i][2]); });
}
function mergeParts(list, { vcMat = VC_MAT, nudge = true, glass = false } = {}) {
  const plain = [], glassG = [], spec = new Map(), all = [];
  for (const p of list) {
    const sp = special(p.mat), g = sp ? prep(p.geo, p.m) : prep(p.geo, p.m, p.mat.color || new THREE.Color(1, 1, 1));
    all.push(g);
    if (sp) { if (!spec.has(p.mat)) spec.set(p.mat, []); spec.get(p.mat).push(g); }
    else if (glass && isGlass(p.mat.color, g)) glassG.push(g);
    else plain.push(g);
  }
  if (nudge) nudgeCoplanar(all);
  const out = [];
  if (plain.length) out.push({ geo: mergeGeometries(plain), mat: vcMat });
  if (glassG.length) out.push({ geo: mergeGeometries(glassG), mat: GLASS_MAT });
  for (const [mat, gs] of spec) out.push({ geo: mergeGeometries(gs), mat });
  return out;
}
function rootOf(gltf) { const r = gltf.scene.children.length === 1 ? gltf.scene.children[0] : gltf.scene; gltf.scene.updateMatrixWorld(true); return r; }
function parts(gltf) {
  const root = rootOf(gltf), inv = root.matrixWorld.clone().invert(), out = [];
  root.traverse((o) => { if (o.isMesh) out.push({ geo: o.geometry, mat: o.material, m: inv.clone().multiply(o.matrixWorld) }); });
  return out;
}
const MERGED = {};
const merged = (n) => (MERGED[n] ??= mergeParts(parts(ASSET[n])));
function meshGroup(n, shadow = true) {
  const g = new THREE.Group();
  for (const { geo, mat } of merged(n)) { const me = new THREE.Mesh(geo, mat); me.castShadow = shadow; me.receiveShadow = true; g.add(me); }
  return g;
}

// tanah & benda prosedural
{
  terrain.scene.updateMatrixWorld(true);
  const flat = [], tall = [], clouds = [];
  terrain.scene.traverse((o) => { if (o.isMesh) { const nm = o.name + (o.parent?.name || ''); (/cloud/.test(nm) ? clouds : /ground|tepi|air|road|disc|zb|Sphere|Icosphere|riak/.test(nm) ? flat : tall).push({ geo: o.geometry, mat: o.material, m: o.matrixWorld }); } });
  const VC2 = VC_MAT.clone(); VC2.side = THREE.DoubleSide;
  for (const [list, cast, vm] of [[flat, false, VC2], [tall, true, VC2], [clouds, false, CLOUD_MAT]]) for (const { geo, mat } of mergeParts(list, { vcMat: vm, nudge: false })) {
    if (mat !== VC2 && mat !== CLOUD_MAT) mat.side = THREE.DoubleSide;
    const me = new THREE.Mesh(geo, mat); me.receiveShadow = true; me.castShadow = cast; scene.add(me);
  }
}

// ------------------------------------------------------------------ model -> InstancedMesh
function placeMatrix(it, r = it.r) {
  return new THREE.Matrix4().compose(B2T(it.p[0], it.p[1], it.p[2]), new THREE.Quaternion().setFromAxisAngle(UP, r), new THREE.Vector3(it.s[0], it.s[2], it.s[1]));
}
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const isCharName = (n) => n in DIALOG || /^warga/.test(n);
const byAsset = {}, INST = {};
for (const it of L.items) { const l = (byAsset[it.a] ??= []); it._i = l.length; l.push(it); }
const bridgeMeshes = [];
for (const [name, list] of Object.entries(byAsset)) {
  const small = /^(pot|tong|hydrant|kotak_pos|rambu|lampu|bangku)/.test(name);
  const glass = !isCharName(name) && !/^(pine|round|pagar)/.test(name);
  const ims = (INST[name] = []);
  for (const pt of (name in MERGED ? MERGED[name] : (MERGED[name] = mergeParts(parts(ASSET[name]), { glass })))) {
    const im = new THREE.InstancedMesh(pt.geo, pt.mat, list.length);
    list.forEach((it, i) => im.setMatrixAt(i, placeMatrix(it)));
    im.castShadow = !small || !touch; im.receiveShadow = true; im.computeBoundingSphere(); scene.add(im); ims.push(im);
    if (name === 'jembatan') bridgeMeshes.push(im);
  }
}
function setItemMatrix(it, m) { for (const im of INST[it.a] || []) { im.setMatrixAt(it._i, m); im.instanceMatrix.needsUpdate = true; } }

// ------------------------------------------------------------------ gapura "DUNIA IMPIANMU"
function signTexture(lines, w = 1024, h = 256) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  c.fillStyle = '#fff3d6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#8a5a2b'; c.lineWidth = h * 0.085; c.strokeRect(h * 0.043, h * 0.043, w - h * 0.086, h - h * 0.086);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const [txt, size, col, y] of lines) { c.font = `700 ${size}px Fredoka, sans-serif`; c.fillStyle = col; c.fillText(txt, w / 2, y); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
try { await document.fonts.load('700 80px Fredoka'); } catch {}
{
  const g = new THREE.Group(), W = GATE.half * 2, H = 3.3;
  const brick = new THREE.MeshStandardMaterial({ color: '#c8743f', roughness: 0.9 }), cap = new THREE.MeshStandardMaterial({ color: '#fff3d6', roughness: 0.8 });
  const gold = new THREE.MeshStandardMaterial({ color: '#ffcf3a', roughness: 0.4, metalness: 0.3, emissive: '#5a3a00', emissiveIntensity: 0.3 });
  const box = (w, h, d, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; g.add(me); return me; };
  for (const sx of [-1, 1]) { box(0.6, H, 0.6, brick, sx * GATE.half, H / 2, 0); box(0.78, 0.22, 0.78, cap, sx * GATE.half, H + 0.11, 0); box(0.3, 0.3, 0.3, gold, sx * GATE.half, H + 0.37, 0); }
  box(W + 0.9, 0.36, 0.5, brick, 0, H - 0.05, 0);
  const face = new THREE.MeshStandardMaterial({ map: signTexture([['DUNIA IMPIANMU', 118, '#5a3a1b', 120], ['★ SELAMAT DATANG ★', 40, '#c98a00', 205]]), roughness: 0.8 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(W - 0.2, 0.95, 0.12), [cap, cap, cap, cap, face, face]); board.position.set(0, H + 0.62, 0); board.castShadow = true; g.add(board);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.5, 5), gold); crown.position.set(0, H + 1.35, 0); g.add(crown);
  g.position.copy(B2T(GATE.x, GATE.y + 0.4, 0)); scene.add(g);
}

// ------------------------------------------------------------------ jalan, sungai, rumput & bunga
const ROADS = L.roads;
const segDist = (px, py, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l2));
  return Math.hypot(px - a[0] - dx * t, py - a[1] - dy * t);
};
const onRoad = (x, y, pad = 0) => ROADS.some(([a, b, w]) => segDist(x, y, a, b) < w / 2 + pad);
const riverX = (y) => -21 + 1.6 * Math.sin(y / 7);
const inRiver = (x, y, pad = 0) => y > RIVER_END && Math.abs(x - riverX(y)) < 1.6 + pad;
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const GRASS = [];
const Y0 = ZONE ? ZONE[2] + 1 : -32;
function scatter(n, geo, color, yOff, avoid) {
  const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 1 }), n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i < n * 3 && k < n; i++) {
    const x = -40 + rnd() * 80, y = Y0 + rnd() * (50 - Y0);
    if (avoid(x, y)) continue;
    const sc = 0.6 + rnd() * 0.7; s.set(sc, sc, sc); q.setFromAxisAngle(UP, rnd() * 6.3);
    m.compose(B2T(x, y, yOff * sc), q, s); im.setMatrixAt(k++, m);
  }
  im.count = k; im.userData.full = k; im.receiveShadow = true; im.computeBoundingSphere(); scene.add(im); GRASS.push(im);
}
const avoidG = (x, y) => onRoad(x, y, 0.05) || inRiver(x, y, 1.0) || x * x + (y - 0.4) ** 2 < 6 ||
  (y < GATE.y && (!ZONE || x < ZONE[0] || x > ZONE[1] || y < ZONE[2] + 1 || ZONE_AVOID.some(([a, b, c, d]) => x > a && x < b && y > c && y < d) || EXTRA.some((e) => inBox(x, y, e, 0.2))));
const cone = new THREE.ConeGeometry(0.045, 0.24, 3), GK = ZONE ? 1.35 : 1;
scatter(Math.round((touch ? 9000 : 16000) * GK), cone, '#6fbf4f', 0.12, avoidG);
scatter(Math.round((touch ? 5000 : 9000) * GK), cone, '#86d663', 0.12, avoidG);
const ball = new THREE.IcosahedronGeometry(0.05, 0);
scatter(Math.round(450 * GK), ball, '#ffe066', 0.05, avoidG); scatter(Math.round(450 * GK), ball, '#ff9ec4', 0.05, avoidG);

// lampu jalan
const glowMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false });
for (const it of L.items) if (it.a === 'lampu' && it.h) { const sp = new THREE.Sprite(glowMat); sp.position.copy(B2T(it.p[0], it.p[1], it.h - 0.12)); sp.scale.setScalar(1.6); scene.add(sp); }

// ------------------------------------------------------------------ tabrakan (bidang XY Blender)
const COLL = L.items.filter((it) => it.c).map((it) => { const o = { x: it.p[0], y: it.p[1], r: it.r, c: it.c, cos: Math.cos(-it.r), sin: Math.sin(-it.r), it }; it._coll = o; return o; });
for (const sx of [-1, 1]) COLL.push({ x: GATE.x + sx * GATE.half, y: GATE.y + 0.4, r: 0, c: { b: [-0.35, 0.35, -0.35, 0.35] }, cos: 1, sin: 0 });
for (const e of EXTRA) COLL.push({ x: e.p[0], y: e.p[1], r: e.r, c: { b: e.b }, cos: Math.cos(-e.r), sin: Math.sin(-e.r), k: e.k });
const DYN = [];   // penghalang dinamis (Slime NPC, kucing)
const BRIDGES = L.items.filter((it) => it.a === 'jembatan').map((it) => ({ x: it.p[0], y: it.p[1] }));
const FC = L.fence.c, FR = L.fence.r - 0.9;
function collide(px, py, R) {
  for (let pass = 0; pass < 2; pass++) {
    for (const o of COLL) {
      if (o.off) continue;
      const dx = px - o.x, dy = py - o.y;
      if (dx * dx + dy * dy > 400) continue;
      if (o.c.r !== undefined) {
        const d = Math.hypot(dx, dy), m = o.c.r + R;
        if (d < m && d > 1e-6) { px = o.x + (dx / d) * m; py = o.y + (dy / d) * m; }
        continue;
      }
      const lx = dx * o.cos - dy * o.sin, ly = dx * o.sin + dy * o.cos, [x0, x1, y0, y1] = o.c.b;
      const cx = Math.max(x0, Math.min(x1, lx)), cy = Math.max(y0, Math.min(y1, ly));
      const ex = lx - cx, ey = ly - cy; let d = Math.hypot(ex, ey);
      if (d >= R) continue;
      let nx, ny;
      if (d < 1e-6) {
        const opts = [[lx - x0, -1, 0], [x1 - lx, 1, 0], [ly - y0, 0, -1], [y1 - ly, 0, 1]].sort((a, b) => a[0] - b[0])[0];
        nx = opts[1]; ny = opts[2]; d = -opts[0];
      } else { nx = ex / d; ny = ey / d; }
      const push = R - d, qx = lx + nx * push, qy = ly + ny * push, c = Math.cos(o.r), s = Math.sin(o.r);
      px = o.x + qx * c - qy * s; py = o.y + qx * s + qy * c;
    }
    for (const o of DYN) {
      if (o.off) continue;
      const dx = px - o.x, dy = py - o.y, d = Math.hypot(dx, dy), m = o.r + R;
      if (d < m && d > 1e-6) { px = o.x + (dx / d) * m; py = o.y + (dy / d) * m; }
    }
  }
  return bound(px, py);
}
// batas dunia: di dalam pagar bundar, atau (Day 5) kawasan selatan yang hanya bisa dimasuki lewat gapura
const FO = L.fence.r + 0.9;
const inZone = (x, y) => ZONE && x > ZONE[0] + 1 && x < ZONE[1] - 1 && y > ZONE[2] + 1 && y < GATE.y + 4;
const atGate = (x, y) => Math.abs(x - GATE.x) < GATE.half - 0.4 && Math.abs(y - GATE.y) < 2.5;
function bound(px, py) {
  const fx = px - FC[0], fy = py - FC[1], fd = Math.hypot(fx, fy);
  if (fd <= FR || atGate(px, py)) return [px, py];
  if (ZONE) {
    // di luar pagar: jepit ke kotak kawasan selatan
    const qx = THREE.MathUtils.clamp(px, ZONE[0] + 1, ZONE[1] - 1), qy = THREE.MathUtils.clamp(py, ZONE[2] + 1, GATE.y + 4);
    const qd = Math.hypot(qx - FC[0], qy - FC[1]);
    if (qd >= FO) return [qx, qy];
    // sedang menempel di pagar: dorong ke sisi terdekat (dalam / luar)
    if (fd > (FR + FO) / 2 && inZone(px, py)) return [FC[0] + (fx / fd) * FO, FC[1] + (fy / fd) * FO];
  }
  return [FC[0] + (fx / fd) * FR, FC[1] + (fy / fd) * FR];
}
const isFree = (x, y, r) => { const [qx, qy] = collide(x, y, r); return Math.hypot(qx - x, qy - y) < 0.02 && !onRoad(x, y, r) && !inRiver(x, y, 0.6); };

// ------------------------------------------------------------------ suara (musik & SFX punya volume sendiri)
const SND = { ctx: null, buf: {}, on: store.get('sound', true), music: {}, amb: {} };
const SFILES = ['new', 'night', 'birds', 'crickets', 'rain', 'step', 'splash', 'boing', 'ding', 'pop_soft', 'flash', 'shimmer', 'whoosh', 'tring', 'coin'];
async function initAudio() {
  if (SND.ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const ctx = (SND.ctx = new AC());
  SND.master = ctx.createGain(); SND.master.gain.value = SND.on ? 1 : 0; SND.master.connect(ctx.destination);
  SND.mbus = ctx.createGain(); SND.mbus.gain.value = SET.music; SND.mbus.connect(SND.master);
  SND.fbus = ctx.createGain(); SND.fbus.gain.value = SET.sfx; SND.fbus.connect(SND.master);
  await Promise.all(SFILES.map(async (n) => { try { SND.buf[n] = await ctx.decodeAudioData(await (await fetch(`./audio/${n}.mp3`)).arrayBuffer()); } catch {} }));
  const loop = (n, vol, bus) => { if (!SND.buf[n]) return null; const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = SND.buf[n]; s.loop = true; g.gain.value = vol; s.connect(g).connect(bus); s.start(); return g; };
  SND.music.day = loop('new', 0.32, SND.mbus); SND.music.night = loop('night', 0, SND.mbus);
  SND.amb.day = loop('birds', 0.18, SND.mbus); SND.amb.night = loop('crickets', 0, SND.mbus); SND.amb.rain = loop('rain', 0, SND.fbus);
}
function sfx(n, vol = 0.6, rate = 1) {
  if (!SND.ctx || !SND.buf[n] || !SND.on) return;
  const s = SND.ctx.createBufferSource(), g = SND.ctx.createGain(); s.buffer = SND.buf[n]; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g).connect(SND.fbus); s.start();
}
function setSound(on) { SND.on = on; store.set('sound', on); $('#bSound').textContent = on ? '🔊' : '🔇'; if (SND.master) SND.master.gain.setTargetAtTime(on ? 1 : 0, SND.ctx.currentTime, 0.05); }
setSound(SND.on);
const pauseAudio = () => { if (SND.ctx && SND.ctx.state === 'running') SND.ctx.suspend(); };
const resumeAudio = () => { if (SND.ctx && SND.ctx.state === 'suspended' && !document.hidden && document.hasFocus()) SND.ctx.resume(); };
const fade = (g, v) => { if (g) g.gain.setTargetAtTime(v, SND.ctx.currentTime, 0.3); };

// ------------------------------------------------------------------ partikel efek (asap, bintang, hati)
const FX = [];
function fx(tex, pos, { n = 10, color = 0xffffff, size = 0.35, speed = 1.6, up = 1.2, life = 0.7, grow = 1.2, grav = 0, colors = null } = {}) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.SpriteMaterial({ map: tex, color: colors ? colors[i % colors.length] : color, transparent: true, depthWrite: false });
    const sp = new THREE.Sprite(m); sp.position.copy(pos); sp.scale.setScalar(size); scene.add(sp);
    const a = Math.random() * Math.PI * 2, v = speed * (0.5 + Math.random() * 0.7);
    FX.push({ sp, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: up * (0.4 + Math.random() * 0.9), life, max: life, size, grow, grav });
  }
}
function updateFX(dt) {
  for (let i = FX.length - 1; i >= 0; i--) {
    const f = FX[i]; f.life -= dt; f.vy -= f.grav * dt;
    f.sp.position.x += f.vx * dt; f.sp.position.y += f.vy * dt; f.sp.position.z += f.vz * dt; f.vx *= 0.95; f.vz *= 0.95;
    const k = 1 - f.life / f.max; f.sp.scale.setScalar(f.size * (1 + k * f.grow)); f.sp.material.opacity = Math.min(1, (f.life / f.max) * 1.6);
    if (f.life <= 0) { scene.remove(f.sp); f.sp.material.dispose(); FX.splice(i, 1); }
  }
}

// ------------------------------------------------------------------ pemain, pilihan karakter, efek ganti, nama di atas kepala
const CHARS = [{ id: 'slime', name: 'Slime', s: 1.0 }, { id: 'ucil', name: 'Ucil', s: 0.85 }, { id: 'ucup', name: 'Ucup', s: 1.0 }];
const body = new THREE.Group(); scene.add(body);
let avatar = null, avatarH = 1, PR = 0.45, charId = store.get('char', 'slime'), charAnim = 1, oldAv = null, oldT = 0;
if (!CHARS.some((c) => c.id === charId)) charId = 'slime';
const P = { x: 0, y: L.slime ? 10.4 : -1.2, vz: 0, z: 0, face: Math.PI };
const slimeNPC = { g: meshGroup('slime'), x: L.slime ? L.slime[0] : 0, y: L.slime ? L.slime[1] : 0.2 };
slimeNPC.g.position.copy(B2T(slimeNPC.x, slimeNPC.y)); slimeNPC.g.rotation.y = L.slime?.[2] ?? 0; slimeNPC.g.visible = false; scene.add(slimeNPC.g);
DYN.push((slimeNPC.coll = { x: slimeNPC.x, y: slimeNPC.y, r: 0.45, off: true }));
const statics = Object.fromEntries(['ucil', 'ucup'].map((n) => [n, (byAsset[n] || [])[0]]));
let nameTag = null;
function makeNameTag() {
  if (nameTag) { body.remove(nameTag); nameTag.material.map.dispose(); nameTag.material.dispose(); nameTag = null; }
  const nm = store.get('name', '').trim(); if (!nm) return;
  const S = 2, F = `700 ${30 * S}px Fredoka, sans-serif`, cv = document.createElement('canvas'), c = cv.getContext('2d');
  c.font = F; const tw = Math.ceil(c.measureText(nm).width);
  const H = 46 * S, R = 17 * S, padL = 8 * S, W = padL + R * 2 + 10 * S + tw + 18 * S, PT = 10 * S;
  cv.width = W + 8 * S; cv.height = H + PT + 8 * S;
  const x0 = 4 * S, y0 = 4 * S;
  // pita
  c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 6 * S; c.shadowOffsetY = 2 * S;
  const bg = c.createLinearGradient(0, y0, 0, y0 + H); bg.addColorStop(0, '#2a3080'); bg.addColorStop(1, '#141842');
  c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y0, W, H, H / 2); c.fill();
  c.shadowColor = 'transparent';
  c.lineWidth = 3 * S; c.strokeStyle = '#ffd84a'; c.beginPath(); c.roundRect(x0, y0, W, H, H / 2); c.stroke();
  // ujung lancip
  const cx = x0 + W / 2; c.fillStyle = '#ffd84a'; c.beginPath(); c.moveTo(cx - 9 * S, y0 + H - 1); c.lineTo(cx + 9 * S, y0 + H - 1); c.lineTo(cx, y0 + H + PT); c.closePath(); c.fill();
  // lencana mahkota
  const bx = x0 + padL + R, by = y0 + H / 2, gg = c.createLinearGradient(0, by - R, 0, by + R); gg.addColorStop(0, '#fff1a6'); gg.addColorStop(1, '#f0b400');
  c.fillStyle = gg; c.beginPath(); c.arc(bx, by, R, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#5a3a00'; const u = R / 17; c.beginPath();
  c.moveTo(bx - 10 * u, by + 6 * u); c.lineTo(bx - 11 * u, by - 5 * u); c.lineTo(bx - 5 * u, by); c.lineTo(bx, by - 8 * u); c.lineTo(bx + 5 * u, by); c.lineTo(bx + 11 * u, by - 5 * u); c.lineTo(bx + 10 * u, by + 6 * u); c.closePath(); c.fill();
  c.fillRect(bx - 10 * u, by + 7.5 * u, 20 * u, 3 * u);
  // nama
  c.font = F; c.textBaseline = 'middle'; c.textAlign = 'left';
  const tg = c.createLinearGradient(0, y0 + 8 * S, 0, y0 + H - 8 * S); tg.addColorStop(0, '#fff8dc'); tg.addColorStop(1, '#ffd84a');
  c.fillStyle = tg; c.fillText(nm, bx + R + 10 * S, by + 1 * S);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  nameTag = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  const hWorld = 0.5; nameTag.scale.set(hWorld * (cv.width / cv.height), hWorld, 1); nameTag.center.set(0.5, 0);
  nameTag.position.y = avatarH + 0.25; body.add(nameTag);
}
function setCharacter(id, effect = false) {
  const def = CHARS.find((c) => c.id === id); if (!def) return;
  if (effect && avatar) { if (oldAv) body.remove(oldAv); oldAv = avatar; oldT = 0; } else if (avatar) body.remove(avatar);
  charId = id; store.set('char', id);
  avatar = new THREE.Group(); const inner = meshGroup(id); inner.scale.setScalar(def.s); avatar.add(inner); body.add(avatar);
  const bb = new THREE.Box3().setFromObject(inner), sz = bb.getSize(new THREE.Vector3()); PR = Math.max(0.3, Math.max(sz.x, sz.z) * 0.42); avatarH = sz.y;
  for (const [n, it] of Object.entries(statics)) if (it) { const me = n === id; setItemMatrix(it, me ? ZERO : placeMatrix(it)); if (it._coll) it._coll.off = me; }
  slimeNPC.g.visible = id !== 'slime'; slimeNPC.coll.off = id === 'slime';
  if (nameTag) nameTag.position.y = avatarH + 0.25;
  if (effect) {
    charAnim = 0; const p = body.position.clone(); p.y += 0.5;
    fx(puffTex, p, { n: 14, size: 0.55, speed: 1.4, up: 0.8, life: 0.7, grow: 1.6 });
    fx(starTex, p, { n: 12, size: 0.22, speed: 2.6, up: 2.4, life: 0.9, grow: 0.2, grav: 3, colors: [0xffd84a, 0xff7ab0, 0x7ad7ff, 0xa6ff7a] });
    sfx('shimmer', 0.5); sfx('pop_soft', 0.7, 0.8); toast(`✨ ${def.name}`, 1.4);
  }
}
function portraits() {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setSize(184, 184); r.outputColorSpace = THREE.SRGBColorSpace;
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 2.2)); const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(2, 3, 4); sc.add(dl);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50), out = {};
  for (const c of CHARS) {
    const g = meshGroup(c.id, false); sc.add(g);
    const bb = new THREE.Box3().setFromObject(g), ce = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3()), d = Math.max(sz.x, sz.y) * 1.75;
    cam.position.set(ce.x + d * 0.35, ce.y + d * 0.2, ce.z + d); cam.lookAt(ce); r.render(sc, cam); out[c.id] = r.domElement.toDataURL(); sc.remove(g);
  }
  r.dispose(); return out;
}

// ------------------------------------------------------------------ warga berjalan
const wargaNames = names.filter((n) => /^warga/.test(n));
const lanes = [];
for (const [a, b, w] of ROADS) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]); if (len < 4) continue;
  const dx = (b[0] - a[0]) / len, dy = (b[1] - a[1]) / len, nx = -dy, ny = dx, off = w / 2 - 0.25;
  for (const s of [1, -1]) lanes.push({ a: [a[0] + dx * 1.2 + nx * s * off, a[1] + dy * 1.2 + ny * s * off], b: [b[0] - dx * 1.2 + nx * s * off, b[1] - dy * 1.2 + ny * s * off], len: len - 2.4 });
}
const NPC = [];
for (let i = 0; i < (touch ? 18 : 30); i++) {
  const lane = lanes[Math.floor(rnd() * lanes.length)], h = meshGroup(wargaNames[i % wargaNames.length]); scene.add(h);
  NPC.push({ h, lane, t: rnd(), dir: rnd() < 0.5 ? 1 : -1, sp: (0.8 + rnd() * 0.5) / lane.len, ph: rnd() * 6 });
}

// ------------------------------------------------------------------ hewan: kucing, ikan melompat, burung, kunang-kunang
function colored(geo, hex) { const g = geo.index ? geo.toNonIndexed() : geo; const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(k)) g.deleteAttribute(k); return g; }
const at = (g, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz)));
const CATS = [];
{
  const coats = [['#f0a04b', '#fff3e0'], ['#8d8d96', '#e8e8ee'], ['#3a3a44', '#ffffff'], ['#e8d2b0', '#fff8ec'], ['#c0703a', '#2e2a28']];
  const houses = L.items.filter((it) => /^rumahw/.test(it.a)).sort((a, b) => Math.hypot(a.p[0], a.p[1] - 8) - Math.hypot(b.p[0], b.p[1] - 8));
  for (const h of houses) {
    if (CATS.length >= 5) break;
    const fx_ = Math.sin(h.r), fy_ = -Math.cos(h.r), x = h.p[0] + fx_ * 1.5 + fy_ * 0.5, y = h.p[1] + fy_ * 1.5 - fx_ * 0.5;
    if (!isFree(x, y, 0.3) || CATS.some((c) => Math.hypot(c.x - x, c.y - y) < 9)) continue;
    const [fur, belly] = coats[CATS.length % coats.length];
    const parts_ = [
      at(colored(new THREE.SphereGeometry(0.16, 10, 8), fur), 0, 0.11, 0, 0, 0, 0, 1.0, 0.62, 1.5),
      at(colored(new THREE.SphereGeometry(0.1, 10, 8), belly), 0, 0.09, 0.02, 0, 0, 0, 1.25, 0.55, 1.6),
      at(colored(new THREE.SphereGeometry(0.11, 10, 8), fur), 0, 0.17, 0.25),
      at(colored(new THREE.ConeGeometry(0.045, 0.08, 4), fur), -0.06, 0.27, 0.25, 0, 0, 0.25),
      at(colored(new THREE.ConeGeometry(0.045, 0.08, 4), fur), 0.06, 0.27, 0.25, 0, 0, -0.25),
      at(colored(new THREE.SphereGeometry(0.018, 6, 4), '#222'), -0.04, 0.19, 0.35), at(colored(new THREE.SphereGeometry(0.018, 6, 4), '#222'), 0.04, 0.19, 0.35),
      at(colored(new THREE.SphereGeometry(0.014, 6, 4), '#ff8aa0'), 0, 0.165, 0.36),
    ];
    const g = new THREE.Group(), bodyM = new THREE.Mesh(mergeGeometries(parts_), VC_MAT); bodyM.castShadow = true; g.add(bodyM);
    const tail = new THREE.Mesh(at(colored(new THREE.CylinderGeometry(0.025, 0.03, 0.32, 6), fur), 0, 0.16, 0, Math.PI / 2 - 0.3), VC_MAT);
    const tg = new THREE.Group(); tg.position.set(0.05, 0.08, -0.2); tg.add(tail); tail.position.set(0, 0, -0.13); g.add(tg);
    g.position.copy(B2T(x, y)); g.rotation.y = h.r + (Math.random() - 0.5) * 1.2; scene.add(g);
    DYN.push({ x, y, r: 0.28 }); CATS.push({ key: 'kucing', x, y, h: 0.3, g, body: bodyM, tail: tg, ph: Math.random() * 6, n: 0 });
  }
}
// ikan melompat di sungai
const fishGeo = mergeGeometries([
  at(colored(new THREE.SphereGeometry(0.12, 10, 8), '#f2a03c'), 0, 0, 0, 0, 0, 0, 0.55, 0.75, 1.6),
  at(colored(new THREE.ConeGeometry(0.09, 0.16, 4), '#e07a2c'), 0, 0, -0.24, -Math.PI / 2),
  at(colored(new THREE.SphereGeometry(0.02, 6, 4), '#222'), 0.05, 0.03, 0.12), at(colored(new THREE.SphereGeometry(0.02, 6, 4), '#222'), -0.05, 0.03, 0.12),
]);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false });
const ringGeo = new THREE.RingGeometry(0.12, 0.18, 24), RINGS = [];
function waterRing(x, y, size = 1) { const m = new THREE.Mesh(ringGeo, ringMat.clone()); m.rotation.x = -Math.PI / 2; m.position.copy(B2T(x, y, 0.05)); scene.add(m); RINGS.push({ m, t: 0, size }); }
const JUMP = { t: 3, f: null };
function updateRiverLife(dt) {
  for (let i = RINGS.length - 1; i >= 0; i--) { const r = RINGS[i]; r.t += dt; r.m.scale.setScalar(1 + r.t * 4 * r.size); r.m.material.opacity = Math.max(0, 0.7 - r.t * 0.8); if (r.t > 0.9) { scene.remove(r.m); r.m.material.dispose(); RINGS.splice(i, 1); } }
  JUMP.t -= dt;
  if (!JUMP.f && JUMP.t <= 0 && Math.abs(P.x - riverX(P.y)) < 28) {
    const y = THREE.MathUtils.clamp(P.y + (Math.random() - 0.5) * 24, -20, 40), x = riverX(y) + (Math.random() - 0.5) * 1.6, dir = Math.random() < 0.5 ? 1 : -1;
    const m = new THREE.Mesh(fishGeo, VC_MAT); scene.add(m); JUMP.f = { m, x, y, dir, t: 0, dur: 0.8 + Math.random() * 0.3, h: 0.6 + Math.random() * 0.5 }; waterRing(x, y); sfx('splash', 0.15, 1.4);
  }
  if (JUMP.f) {
    const f = JUMP.f; f.t += dt; const k = Math.min(1, f.t / f.dur), yy = f.y + (k - 0.5) * 1.4 * f.dir;
    f.m.position.copy(B2T(f.x, yy, 4 * f.h * k * (1 - k))); f.m.rotation.set(-(k - 0.5) * 2.4 * f.dir, f.dir > 0 ? Math.PI : 0, 0);
    if (k >= 1) { waterRing(f.x, yy); scene.remove(f.m); JUMP.f = null; JUMP.t = 3 + Math.random() * 5; }
  }
}
// burung (siang, tidak hujan)
const BIRDS = [];
{
  const wingG = new THREE.BufferGeometry(); wingG.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.12, 0, 0, -0.12, 0.5, 0.04, -0.02], 3)); wingG.computeVertexNormals();
  const mat = new THREE.MeshBasicMaterial({ color: 0x3a3f5c, side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group(), l = new THREE.Mesh(wingG, mat), r = new THREE.Mesh(wingG, mat); r.scale.x = -1; g.add(l, r);
    g.scale.setScalar(1.3); scene.add(g); BIRDS.push({ g, l, r, a: (i / 9) * 0.9, rad: 24 + (i % 3) * 2.5, h: 19 + (i % 4) * 1.4, ph: i * 0.7 });
  }
}
function updateBirds(t, show) {
  for (const b of BIRDS) {
    b.g.visible = show; if (!show) continue;
    const a = t * 0.11 + b.a, x = FC[0] + Math.cos(a) * b.rad, y = FC[1] + Math.sin(a) * b.rad;
    b.g.position.copy(B2T(x, y, b.h + Math.sin(t * 0.8 + b.ph) * 0.6)); b.g.rotation.y = Math.atan2(-Math.sin(a), -Math.cos(a)) - Math.PI / 2;
    const fl = Math.sin(t * 9 + b.ph) * 0.6; b.l.rotation.z = fl; b.r.rotation.z = -fl;
  }
}
// kunang-kunang (malam)
const FLY_N = 140, flyPos = new Float32Array(FLY_N * 3), flyData = [];
const flyMat = new THREE.PointsMaterial({ map: glowTex, color: 0xd9ff7a, size: 0.32, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const flies = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(flyPos, 3)), flyMat); flies.frustumCulled = false; scene.add(flies);
for (let i = 0; i < FLY_N; i++) flyData.push({ x: 0, y: 0, z: 0, ph: Math.random() * 6, sp: 0.3 + Math.random() * 0.5, init: false });
function updateFlies(t, op) {
  flyMat.opacity = op; flies.visible = op > 0.01; if (!flies.visible) return;
  for (let i = 0; i < FLY_N; i++) {
    const f = flyData[i];
    if (!f.init || Math.hypot(f.x - P.x, f.y - P.y) > 18) { const a = Math.random() * 6.28, r = 2 + Math.random() * 15; f.x = P.x + Math.cos(a) * r; f.y = P.y + Math.sin(a) * r; f.z = 0.3 + Math.random() * 1.9; f.init = true; }
    f.x += Math.sin(t * f.sp + f.ph) * 0.004; f.y += Math.cos(t * f.sp * 1.3 + f.ph) * 0.004;
    flyPos[i * 3] = f.x; flyPos[i * 3 + 1] = f.z + Math.sin(t * 1.5 + f.ph) * 0.15; flyPos[i * 3 + 2] = -f.y;
  }
  flies.geometry.attributes.position.needsUpdate = true;
}

// ------------------------------------------------------------------ mancing di sungai
const SPOTS = [];
for (const y of [-11, -7, -3, 4, 7, 10, 13, 16, 24, 27, 30]) {
  if (SPOTS.length >= 5 || BRIDGES.some((b) => Math.abs(b.y - y) < 2.5) || SPOTS.some((s) => Math.abs(s.y - y) < 5)) continue;
  const x = riverX(y) + 2.35, [qx, qy] = collide(x, y, 0.4);
  if (Math.hypot(qx - x, qy - y) > 0.02 || onRoad(x, y, 0.3)) continue;
  SPOTS.push({ x, y });
}
{
  const face = new THREE.MeshStandardMaterial({ map: signTexture([['🎣 MANCING', 150, '#2a6db0', 128]], 1024, 256), roughness: 0.8 });
  const wood = new THREE.MeshStandardMaterial({ color: '#8a5a2b', roughness: 0.9 });
  for (const s of SPOTS) {
    const g = new THREE.Group(), post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.9, 0.07), wood); post.position.y = 0.45; post.castShadow = true;
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.05), [wood, wood, wood, wood, face, face]); board.position.y = 0.92; board.castShadow = true;
    g.add(post, board); g.position.copy(B2T(s.x + 0.15, s.y + 1.35)); g.rotation.y = -Math.PI / 2 - 0.5; scene.add(g);
    COLL.push({ x: s.x + 0.15, y: s.y + 1.35, r: 0, c: { r: 0.12 }, cos: 1, sin: 0 });
  }
}
const rod = new THREE.Group();
{ const m = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, 1.25, 6), new THREE.MeshStandardMaterial({ color: '#7a4a1e' })); m.position.y = 0.62; rod.add(m); rod.position.set(0.22, 0.35, 0.12); rod.rotation.x = 0.95; rod.visible = false; body.add(rod); }
const bobber = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshStandardMaterial({ color: '#ff3b30', roughness: 0.4 })); bobber.visible = false; scene.add(bobber);
const lineG = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
const fLine = new THREE.Line(lineG, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })); fLine.frustumCulled = false; fLine.visible = false; scene.add(fLine);
const FISHING = { state: 'idle', t: 0, wait: 0, win: 1, spot: null, bx: 0, by: 0 };
const totalW = FISH.reduce((s, f) => s + f[4], 0);
function rollFish() { if (CAP.forceFish) return FISH.find((f) => f[0] === CAP.forceFish) || FISH[0]; let r = Math.random() * totalW; for (const f of FISH) { r -= f[4]; if (r <= 0) return f; } return FISH[0]; }
function startFishing(spot) {
  Object.assign(FISHING, { state: 'cast', t: 0, spot, bx: riverX(spot.y) + 0.75, by: spot.y + (Math.random() - 0.5) * 0.6 });
  P.x = spot.x; P.y = spot.y; P.face = Math.atan2(FISHING.bx - P.x, -(FISHING.by - P.y));
  rod.visible = true; bobber.visible = true; fLine.visible = true; sfx('whoosh', 0.45);
}
function stopFishing() { FISHING.state = 'idle'; rod.visible = false; bobber.visible = false; fLine.visible = false; $('#bite').style.display = 'none'; }
function reel() {
  if (FISHING.state === 'bite') { FISHING.state = 'reel'; FISHING.t = 0; sfx('whoosh', 0.5, 1.3); $('#bite').style.display = 'none'; }
  else if (FISHING.state === 'wait') { toast('Sabar... tunggu pelampungnya tenggelam!', 1.6); FISHING.wait = 1.5 + Math.random() * 3; FISHING.t = 0; }
}
function landFish() {
  const f = rollFish(), [key, name, em, rar, , [mn, mxs]] = f, size = Math.round(mn + (mxs - mn) * Math.pow(Math.random(), 1.6));
  const rec = (STATS.caught[key] ??= { n: 0, best: 0 }), isNew = rec.n === 0, best = size > rec.best;
  rec.n++; if (best) rec.best = size; saveStats();
  splashAt(FISHING.bx, FISHING.by, 10);
  const RC = { Umum: '#5aa469', Jarang: '#2a6db0', Langka: '#9b4dca', Lucu: '#e07a5f', Legendaris: '#d99a00' };
  const box = $('#catch'); box.querySelector('.em').textContent = em; box.querySelector('h3').textContent = name;
  const r = box.querySelector('.rar'); r.textContent = rar; r.style.background = RC[rar] || '#888';
  const kn = KOIN_IKAN[rar] || 0; if (kn) addKoin(kn); ev('fish', rar);
  box.querySelector('p').textContent = `Panjang ${size} cm${isNew ? ' · Jenis baru! 📖' : best ? ' · Rekor baru! 🏆' : ''}${kn ? ` · +${kn} 🪙` : ''}`;
  box.classList.add('on'); sfx(rar === 'Legendaris' ? 'shimmer' : 'coin', 0.6); if (rar === 'Legendaris') sfx('tring', 0.6);
  stopFishing();
}
$('#cOk').onclick = () => $('#catch').classList.remove('on');
const tipV = new THREE.Vector3();
function updateFishing(dt, t) {
  if (FISHING.state === 'idle') return;
  FISHING.t += dt; const water = B2T(FISHING.bx, FISHING.by, 0.06);
  rod.updateMatrixWorld(true); tipV.set(0, 1.25, 0); rod.localToWorld(tipV);
  if (FISHING.state === 'cast') {
    const k = Math.min(1, FISHING.t / 0.6); bobber.position.lerpVectors(tipV, water, k); bobber.position.y += Math.sin(k * Math.PI) * 1.2;
    if (k >= 1) { FISHING.state = 'wait'; FISHING.t = 0; FISHING.wait = 2 + Math.random() * 4; waterRing(FISHING.bx, FISHING.by, 0.5); sfx('splash', 0.25, 1.5); }
  } else if (FISHING.state === 'wait') {
    bobber.position.copy(water); bobber.position.y += Math.sin(t * 2.5) * 0.015;
    if (FISHING.t > FISHING.wait) { FISHING.state = 'bite'; FISHING.t = 0; FISHING.win = 1.0; sfx('tring', 0.5, 1.2); waterRing(FISHING.bx, FISHING.by, 0.4); }
  } else if (FISHING.state === 'bite') {
    bobber.position.copy(water); bobber.position.y += -0.06 + Math.sin(t * 22) * 0.03;
    const v = B2T(P.x, P.y, gZ + avatarH + 0.9).project(camera), b = $('#bite');
    b.style.display = 'block'; b.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`; b.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`;
    if (FISHING.t > FISHING.win) { b.style.display = 'none'; toast('Yah, ikannya lepas! Coba lagi...', 1.8); FISHING.state = 'wait'; FISHING.t = 0; FISHING.wait = 2 + Math.random() * 4; }
  } else if (FISHING.state === 'reel') {
    const k = Math.min(1, FISHING.t / 0.45); bobber.position.lerpVectors(water, tipV, k); bobber.position.y += Math.sin(k * Math.PI) * 0.8;
    if (k >= 1) { landFish(); return; }
  }
  const a = lineG.attributes.position.array; a[0] = tipV.x; a[1] = tipV.y; a[2] = tipV.z; a[3] = bobber.position.x; a[4] = bobber.position.y; a[5] = bobber.position.z; lineG.attributes.position.needsUpdate = true;
}

// ------------------------------------------------------------------ ngobrol berpilihan & aksi (E / tombol)
const TALKERS = L.items.filter((it) => (it.d || it.a) in DIALOG).map((it) => ({ key: it.d || it.a, it, x: it.p[0], y: it.p[1], h: it.h || 1 }));
TALKERS.push({ key: 'slime', npc: slimeNPC, x: slimeNPC.x, y: slimeNPC.y, h: 0.9 });
for (const c of CATS) TALKERS.push(c);
const talkEl = $('#talk'), promptEl = $('#prompt'), actBtn = $('#actBtn'), optsEl = talkEl.querySelector('.opts');
let near = null, talking = null, node = null, typeT = 0, typeText = '', optSel = 0, optsShown = false;
const activeTalker = (t) => (t.key === 'slime' ? charId !== 'slime' : t.key !== charId);
const panggilFor = (d) => (charId === 'ucil' ? 'Cil' : charId === 'ucup' ? 'Cup' : d.panggil || 'Raja');
function faceTalker(t) {
  const rz = Math.atan2(P.x - t.x, -(P.y - t.y));
  if (t.npc) t.npc.g.rotation.y = rz; else if (t.it) setItemMatrix(t.it, placeMatrix(t.it, rz));
}
function talk(t) {
  const d = DIALOG[t.key]; if (!d) return;
  talking = t; sfx('ding', 0.5); document.body.classList.add('talking'); releaseAll();
  ev('talk', t.key);
  if (PROFILES.some((p) => p.key === t.key) && !STATS.talked.includes(t.key)) { STATS.talked.push(t.key); saveStats(); toast(`📖 Profil tokoh terbuka: ${d.name}`, 2.4); }
  if (t.key !== 'kucing') faceTalker(t);
  talkEl.querySelector('.who').textContent = d.name; talkEl.classList.add('on'); $('#info').classList.remove('on');
  showNode(d.start);
}
function showNode(id) {
  const d = DIALOG[talking.key]; node = d.nodes[id];
  if (!node) { endTalk(); return; }
  ev('node', talking.key + ':' + id);
  typeText = node.say.replaceAll('{panggil}', panggilFor(d)); typeT = 0; optSel = 0; optsShown = false;
  talkEl.querySelector('.say').textContent = ''; optsEl.innerHTML = ''; talkEl.querySelector('.next').textContent = '';
  if (node.give) {
    const it = node.give;
    if ((STATS.bag[it] || 0) > 0) { STATS.bag[it]--; ev('give', it + '@' + talking.key); if (!STATS.given.includes(talking.key + ':' + it)) { STATS.given.push(talking.key + ':' + it); if (node.koin) { addKoin(node.koin); toast(`🎁 Hadiah: +${node.koin} Koin!`, 2.4); sfx('coin', 0.6); } } saveStats(); }
    const p = (talking.it ? B2T(talking.x, talking.y, talking.h) : talking.npc ? talking.npc.g.position.clone() : null); if (p) fx(heartTex, p, { n: 6, size: 0.2, speed: 0.5, up: 1.0, life: 1.2, grow: 0.3 });
  }
  if (node.fx === 'love' && talking.g) { const p = talking.g.position.clone(); p.y += 0.45; fx(heartTex, p, { n: 5, size: 0.18, speed: 0.4, up: 1.0, life: 1.2, grow: 0.3 }); }
}
// opsi dialog untuk misi aktif -> 'misi' (emas berkilau); opsi kerja sambilan di luar misi -> 'kerja' (hijau)
function isJobOpt(t) { return !!t && (t.startsWith('job:') || (t === 'kerja' && !!DIALOG[talking?.key]?.nodes?.kerja)); }
function optKind(t) {
  if (!t || !talking) return '';
  const g = curMain()?.goal, who = talking.key;
  if (g) {
    if (g.type === 'job' && isJobOpt(t)) return 'misi';
    if (g.type === 'eat' && t.startsWith('shop:') && g.target.includes(t.slice(5)) && !MS_.prog.set.includes(t.slice(5))) return 'misi';
    if (g.type === 'give') { const [item, to] = g.target.split('@'), has = (STATS.bag[item] || 0) > 0;
      if (!has && t === 'shop:mainan') return 'misi'; if (has && who === to && t.startsWith('?punya:' + item)) return 'misi'; }
    if (g.type === 'node') { const [k, n] = g.target.split(':'); if (who === k && t === n) return 'misi'; }
  }
  if (isJobOpt(t)) return STATS.daily.list.some((d) => !d.done && dailyDef(d.id)?.goal.type === 'job') ? 'misi' : 'kerja';
  return '';
}
function renderOpts() {
  optsShown = true; const opts = node.opts || [];
  const TAG = { misi: '<em>🎯 MISI</em>', kerja: '<em>🪙 KERJA</em>' };
  optsEl.innerHTML = opts.map(([txt, t], i) => { const k = optKind(t); return `<button data-i="${i}" class="${i === optSel ? 'sel' : ''} ${k}"><i>${i + 1}</i><span>${esc(txt)}</span>${TAG[k] || ''}</button>`; }).join('');
  talkEl.querySelector('.next').textContent = opts.length ? (touch ? 'Ketuk jawabanmu' : 'Pilih 1–3 atau ↑ ↓ lalu Spasi') : (touch ? 'Ketuk untuk menutup ✕' : 'Spasi untuk menutup ✕');
}
function choose(i) {
  const o = node?.opts?.[i]; if (!o) { endTalk(); return; }
  sfx('pop_soft', 0.6); let target = o[1];
  if (target && target.startsWith('?ikan:')) { const [, a, b] = target.split(':'); target = Object.keys(STATS.caught).length ? a : b; }
  if (target && target.startsWith('?punya:')) { const [, item, a, b] = target.split(':'); target = (STATS.bag[item] || 0) > 0 ? a : b; }
  if (target && target.startsWith('shop:')) { endTalk(); openShop(target.slice(5)); return; }
  if (target && target.startsWith('job:')) { endTalk(); startJob(target.slice(4)); return; }
  if (!target) { endTalk(); return; } showNode(target);
}
function dialogConfirm() {
  if (!talking) return;
  if (typeT < typeText.length) { typeT = typeText.length; talkEl.querySelector('.say').textContent = typeText; renderOpts(); return; }
  if (node?.opts?.length) choose(optSel); else endTalk();
}
function moveSel(d) { const n = node?.opts?.length || 0; if (!n || !optsShown) return; optSel = (optSel + d + n) % n; optsEl.querySelectorAll('button').forEach((b, i) => b.classList.toggle('sel', i === optSel)); sfx('pop_soft', 0.25, 1.4); }
function endTalk() { talking = null; node = null; talkEl.classList.remove('on'); document.body.classList.remove('talking'); }
function doAction() {
  if (talking) { dialogConfirm(); return; }
  if (ui()) return;
  if (JOB.id && JOB.act) return;
  if (JOB.id && JOB.near != null) { startAct(); return; }
  if (FISHING.state !== 'idle') { reel(); return; }
  if (near?.spot) startFishing(near.spot); else if (near) talk(near);
}
optsEl.addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (!b) return; e.stopPropagation(); if (typeT < typeText.length) return; choose(+b.dataset.i); });
talkEl.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (!e.target.closest('.opts button')) dialogConfirm(); });
actBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); doAction(); });
function updateNear(dt) {
  let best = null, bd = 2.0;
  if (FISHING.state === 'idle' && !talking) {
    for (const t of TALKERS) { if (!activeTalker(t)) continue; const d = Math.hypot(P.x - t.x, P.y - t.y); if (d < bd) { bd = d; best = t; } }
    for (const s of SPOTS) { const d = Math.hypot(P.x - s.x, P.y - s.y); if (d < Math.min(bd, 1.6)) { bd = d; best = { spot: s, x: s.x, y: s.y, h: 1.2 }; } }
    if (!(near?.spot && best?.spot && near.spot === best.spot)) near = best;
  }
  const fishing = FISHING.state !== 'idle', jn = JOB.id && JOB.near != null && !JOB.act && !talking;
  if (jn) { const q = JOB.pts[JOB.near], v = B2T(q[0], q[1], groundAt(q[0], q[1]) + 1.3).project(camera);
    actBtn.classList.add('on'); actBtn.classList.remove('hot'); actBtn.textContent = jobVerb().toUpperCase();
    if (v.z < 1) { promptEl.style.display = 'block'; promptEl.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`; promptEl.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`;
      promptEl.innerHTML = `${JOBS[JOB.id].em} ${esc(jobVerb())}${touch ? '' : ' <b>(E)</b>'}`; } else promptEl.style.display = 'none';
    return; }
  actBtn.classList.toggle('on', !!near || fishing); actBtn.classList.toggle('hot', FISHING.state === 'bite');
  actBtn.textContent = fishing ? 'TARIK!' : near?.spot ? 'MANCING' : 'NGOBROL';
  if (near && !talking) {
    const v = B2T(near.x, near.y, near.h + 0.45).project(camera);
    if (v.z < 1) {
      promptEl.style.display = 'block'; promptEl.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`; promptEl.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`;
      promptEl.innerHTML = `${near.spot ? '🎣 Mancing' : `💬 ${esc(DIALOG[near.key].name)}`}${touch ? '' : ' <b>(E)</b>'}`;
    }
  } else promptEl.style.display = 'none';
  if (talking && typeT < typeText.length) { typeT = Math.min(typeText.length, typeT + dt * 45); talkEl.querySelector('.say').textContent = typeText.slice(0, Math.ceil(typeT)); }
  else if (talking && !optsShown) renderOpts();
}

// ------------------------------------------------------------------ cuaca: otomatis / cerah / gerimis / hujan
const WMODES = [['auto', '🔄 Otomatis'], ['cerah', '☀️ Cerah'], ['gerimis', '🌦️ Gerimis'], ['hujan', '🌧️ Hujan']];
if (!WMODES.some((w) => w[0] === SET.weather)) SET.weather = 'auto';
const WTARGET = { cerah: 0, gerimis: 0.4, hujan: 1 };
const WX = { cur: 'cerah', t: 120, wet: 0 };
function updateWeatherIcon() { $('#bWeather').textContent = { cerah: '☀️', gerimis: '🌦️', hujan: '🌧️' }[WX.cur] || '☁️'; }
function setWeather(mode, announce = true) {
  SET.weather = mode; saveSet();
  if (mode !== 'auto') WX.cur = mode; else { WX.cur = 'cerah'; WX.t = 60 + Math.random() * 90; }
  if (announce) toast(`Cuaca: ${WMODES.find((w) => w[0] === mode)[1]}`, 1.8);
  updateWeatherIcon();
}
function cycleWeather() { const i = WMODES.findIndex((w) => w[0] === SET.weather); setWeather(WMODES[(i + 1) % WMODES.length][0]); sfx('whoosh', 0.35); }
function autoWeather(dt) {
  if (SET.weather !== 'auto') return;
  WX.t -= dt; if (WX.t > 0) return;
  const r = Math.random(), c = WX.cur;
  if (c === 'cerah') WX.cur = r < 0.6 ? 'cerah' : r < 0.85 ? 'gerimis' : 'hujan';
  else if (c === 'gerimis') WX.cur = r < 0.45 ? 'hujan' : 'cerah';
  else WX.cur = r < 0.35 ? 'gerimis' : 'cerah';
  WX.t = WX.cur === 'cerah' ? 90 + Math.random() * 120 : 35 + Math.random() * 35;
  if (WX.cur !== c) { toast({ cerah: '☀️ Langit cerah lagi', gerimis: '🌦️ Gerimis turun...', hujan: '🌧️ Hujan deras!' }[WX.cur], 2); updateWeatherIcon(); }
}
const RAIN_N = touch ? 700 : 1500, rainPos = new Float32Array(RAIN_N * 6), rainD = [];
const rainMat = new THREE.LineBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0, depthWrite: false });
const rain = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(rainPos, 3)), rainMat); rain.frustumCulled = false; scene.add(rain);
for (let i = 0; i < RAIN_N; i++) rainD.push({ x: (Math.random() - 0.5) * 40, y: Math.random() * 16, z: (Math.random() - 0.5) * 40, v: 11 + Math.random() * 5 });
function updateRain(dt, wet) {
  rain.visible = wet > 0.02; if (!rain.visible) return;
  rainMat.opacity = 0.25 + wet * 0.4; const cnt = Math.floor(RAIN_N * (0.25 + 0.75 * wet)); rain.geometry.setDrawRange(0, cnt * 2);
  const cx = camera.position.x, cz = camera.position.z, cy = Math.max(0, camera.position.y - 4);
  for (let i = 0; i < cnt; i++) {
    const d = rainD[i]; d.y -= d.v * dt; if (d.y < 0) { d.y = 12 + Math.random() * 4; d.x = (Math.random() - 0.5) * 40; d.z = (Math.random() - 0.5) * 40; }
    const o = i * 6, x = cx + d.x, z = cz + d.z, y = cy + d.y;
    rainPos[o] = x; rainPos[o + 1] = y; rainPos[o + 2] = z; rainPos[o + 3] = x + 0.03; rainPos[o + 4] = y + 0.45; rainPos[o + 5] = z + 0.02;
  }
  rain.geometry.attributes.position.needsUpdate = true;
  if (wet > 0.3 && Math.random() < dt * 6 * wet && Math.abs(P.x - riverX(P.y)) < 12) { const y = P.y + (Math.random() - 0.5) * 14; waterRing(riverX(y) + (Math.random() - 0.5) * 2.6, y, 0.25); }
}
// ------------------------------------------------------------------ siang & malam (+ bayangan misterius)
const CYCLE = 300;
let dayT = 0, nCur = 0;
const egg = { t: CAPTURE ? 1e9 : 30, on: 0 };
const nightAt = (t) => { t %= CYCLE; if (t < 170) return 0; if (t < 200) return (t - 170) / 30; if (t < 280) return 1; return 1 - (t - 280) / 20; };
const C = (h) => new THREE.Color(h);
const SKY = { dayTop: C('#6fb6ff'), dayBot: C('#fff1d6'), duskBot: C('#ffb27a'), nightTop: C('#070b26'), nightBot: C('#1b2350'), fogDay: C('#cfe6ff'), fogNight: C('#111833'), stormTop: C('#7d8899'), stormBot: C('#b9c0c9') };
const tmp = new THREE.Color();
function applyEnv(n, wet) {
  const dusk = Math.sin(Math.min(1, n * 1.6) * Math.PI) * (n < 0.7 ? 1 : 0), storm = wet * 0.8;
  skyMat.uniforms.top.value.copy(SKY.dayTop).lerp(SKY.nightTop, n).lerp(SKY.stormTop, storm * (1 - n));
  skyMat.uniforms.bot.value.copy(SKY.dayBot).lerp(SKY.duskBot, dusk * 0.8 * (1 - wet)).lerp(SKY.nightBot, n).lerp(SKY.stormBot, storm * (1 - n));
  scene.fog.color.copy(SKY.fogDay).lerp(SKY.nightBot, dusk * 0.3).lerp(SKY.fogNight, n).lerp(SKY.stormBot, storm * (1 - n) * 0.8);
  scene.fog.near = 70 - 38 * wet; scene.fog.far = 190 - 80 * wet;
  hemi.intensity = (1.6 - 1.2 * n) * (1 - 0.25 * wet); hemi.color.copy(tmp.set('#e4f1ff').lerp(C('#8ea4ff'), n));
  sun.intensity = (2.4 - 1.95 * n) * (1 - 0.6 * wet); sun.color.copy(tmp.set('#fff0d8').lerp(C('#ffb070'), dusk).lerp(C('#a9bcff'), n));
  starMat.opacity = Math.max(0, n * 1.2 - 0.2) * (1 - wet); moon.material.opacity = n * (1 - wet * 0.8);
  GLASS_MAT.emissiveIntensity = Math.min(1.3, n * 1.3 + wet * 0.25); glowMat.opacity = Math.min(1, n + wet * 0.2);
  CLOUD_MAT.color.setScalar(1 - 0.72 * n).lerp(C('#ffc9a0'), dusk * 0.35 * (1 - wet)).lerp(C('#8a919b'), wet * (1 - n));
  if (SND.music.day) { fade(SND.music.day, 0.32 * (1 - n)); fade(SND.music.night, 0.3 * n); fade(SND.amb.day, 0.18 * (1 - n) * (1 - wet)); fade(SND.amb.night, 0.22 * n * (1 - wet)); fade(SND.amb.rain, 0.55 * wet); }
}
const shadowMan = rootOf(ASSET.monster).clone(true);
const eggMat = new THREE.MeshBasicMaterial({ color: 0x05040c, transparent: true, opacity: 0, fog: false });
shadowMan.traverse((o) => { if (o.isMesh) { const red = o.material?.color && o.material.color.r > 0.5 && o.material.color.g < 0.3; o.material = red ? new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0, fog: false }) : eggMat; } });
shadowMan.scale.setScalar(2.6); shadowMan.visible = false; scene.add(shadowMan);
function updateEgg(dt, n) {
  egg.t -= dt;
  if (n > 0.85 && egg.t <= 0 && !egg.on) {
    const fw = Math.atan2(-(camera.position.x - body.position.x), -(camera.position.z - body.position.z)) + (Math.random() - 0.5) * 1.2;
    const x = FC[0] + Math.sin(fw) * 47, y = FC[1] - Math.cos(fw) * 47;
    shadowMan.position.copy(B2T(x, y, 0)); shadowMan.rotation.y = Math.atan2(FC[0] - x, -(FC[1] - y)); shadowMan.visible = true; egg.on = 6;
    if (!STATS.seenDia) { STATS.seenDia = true; saveStats(); setTimeout(() => toast('📖 Profil baru terbuka: ???', 2.6), 6500); }
  }
  if (egg.on) {
    egg.on = Math.max(0, egg.on - dt); const a = Math.min(1, Math.min(egg.on, 6 - egg.on) / 1.2);
    shadowMan.traverse((o) => { if (o.isMesh) o.material.opacity = a * (o.material === eggMat ? 0.92 : 1); });
    if (!egg.on) { shadowMan.visible = false; egg.t = 45 + Math.random() * 40; }
  }
}
function toggleNight() { dayT = nightAt(dayT) > 0.5 ? 0 : 205; sfx('whoosh', 0.5); }

// ------------------------------------------------------------------ foto
async function takePhoto() {
  sfx('flash', 0.6); const fl = $('#flash'); fl.style.transition = 'none'; fl.style.opacity = 0.9; requestAnimationFrame(() => { fl.style.transition = 'opacity .5s'; fl.style.opacity = 0; });
  promptEl.style.display = 'none';
  const pr = renderer.getPixelRatio(), hi = Math.min(3, Math.max(pr, 1080 / Math.min(innerWidth, innerHeight)));
  renderer.setPixelRatio(hi); renderer.setSize(innerWidth, innerHeight, false); renderer.render(scene, camera);
  const src = renderer.domElement, W = Math.min(src.width, 1440), H = Math.round(src.height * (W / src.width));
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  c.drawImage(src, 0, 0, W, H);
  renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight, false);
  const u = W / 1080, bh = 150 * u, gr = c.createLinearGradient(0, H - bh * 1.6, 0, H);
  gr.addColorStop(0, 'rgba(10,8,40,0)'); gr.addColorStop(1, 'rgba(10,8,40,0.78)'); c.fillStyle = gr; c.fillRect(0, H - bh * 1.6, W, bh * 1.6);
  c.strokeStyle = '#ffd84a'; c.lineWidth = 14 * u; c.strokeRect(7 * u, 7 * u, W - 14 * u, H - 14 * u);
  c.font = `700 ${44 * u}px Fredoka, sans-serif`; const tw = c.measureText(`DAY ${DAY}`).width + 48 * u;
  c.fillStyle = '#ffd84a'; c.beginPath(); c.roundRect(34 * u, 34 * u, tw, 64 * u, 32 * u); c.fill(); c.fillStyle = '#2a1d00'; c.textBaseline = 'middle'; c.fillText(`DAY ${DAY}`, 58 * u, 67 * u);
  c.textBaseline = 'alphabetic'; c.font = `700 ${70 * u}px Fredoka, sans-serif`; c.lineWidth = 12 * u; c.strokeStyle = '#1d2050'; c.fillStyle = '#ffd84a';
  c.strokeText('DUNIA IMPIANMU', 40 * u, H - 64 * u); c.fillText('DUNIA IMPIANMU', 40 * u, H - 64 * u);
  c.font = `600 ${34 * u}px Fredoka, sans-serif`; c.fillStyle = '#ffffff'; c.fillText('@dunia_impianmu · jalan-jalan di negeri kita', 42 * u, H - 22 * u);
  const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.92));
  const url = URL.createObjectURL(blob), box = $('#photo'); box.querySelector('img').src = url; box.classList.add('on'); box._blob = blob; box._url = url;
  $('#pShare').style.display = navigator.canShare && navigator.canShare({ files: [new File([blob], 'x.jpg', { type: 'image/jpeg' })] }) ? '' : 'none';
  STATS.photos++; saveStats(); ev('photo');
}
$('#pSave').onclick = () => { const b = $('#photo'), a = document.createElement('a'); a.href = b._url; a.download = `dunia-impianmu-${Date.now()}.jpg`; document.body.appendChild(a); a.click(); a.remove(); sfx('tring', 0.5); };
$('#pShare').onclick = async () => { const b = $('#photo'); try { await navigator.share({ files: [new File([b._blob], 'dunia-impianmu.jpg', { type: 'image/jpeg' })], text: 'Jalan-jalan di Dunia Impianmu! @dunia_impianmu' }); } catch {} };
$('#pClose').onclick = () => { const b = $('#photo'); b.classList.remove('on'); URL.revokeObjectURL(b._url); };

// ------------------------------------------------------------------ grafis rendah / tinggi
function applyGfx() {
  const low = SET.gfx === 'rendah';
  renderer.setPixelRatio(basePR()); resize();
  if (renderer.shadowMap.enabled === low) { renderer.shadowMap.enabled = !low; scene.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => (m.needsUpdate = true)); }); }
  for (const g of GRASS) g.count = Math.floor(g.userData.full * (low ? 0.45 : 1));
}

// ------------------------------------------------------------------ menu (profil, tokoh, ikan, tentang, pengaturan, ikuti)
const TABS = [['aku', '👤 Aku'], ['misi', '🎯 Misi'], ['tas', '🎒 Tas'], ['tokoh', '📖 Tokoh'], ['ikan', '🎣 Ikan'], ['tentang', '🏰 Tentang'], ['atur', '⚙️ Atur'], ['ikuti', '❤️ Ikuti']];
let menuTab = 'aku';
const fmtTime = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h} jam ${m} menit` : `${m} menit`; };
function openMenu(tab = menuTab) { menuTab = tab; $('#menu').classList.add('on'); renderMenu(); releaseAll(); }
function closeMenu() { $('#menu').classList.remove('on'); }
const unlocked = (p) => ['slime', 'ucil', 'ucup'].includes(p.key) || (p.secret ? STATS.seenDia : STATS.talked.includes(p.key));
function renderMenu() {
  $('#menu .tabs').innerHTML = TABS.map(([k, l]) => `<button data-t="${k}" class="${k === menuTab ? 'on' : ''}">${l}</button>`).join('');
  const b = $('#menu .body'); let h = '';
  if (menuTab === 'aku') {
    const kinds = Object.keys(STATS.caught).length, totalFish = Object.values(STATS.caught).reduce((s, c) => s + c.n, 0);
    const prof = PROFILES.filter((p) => !p.secret).length, open = PROFILES.filter((p) => !p.secret && unlocked(p)).length;
    h += `<h2>Profilku</h2><p>Namamu akan tampil di atas kepala karakter (ikut masuk foto).</p>
      <div class="field"><input id="nmIn" maxlength="18" placeholder="Tulis namamu..." value="${esc(store.get('name', ''))}"><button class="pbtn" id="nmSave">Simpan</button></div>
      <h4>Karakter</h4><div class="seg" style="justify-content:flex-start">${CHARS.map((c) => `<button data-c="${c.id}" class="${c.id === charId ? 'on' : ''}">${c.name}</button>`).join('')}</div>
      <h4>Statistik</h4>
      <div class="statrow"><span>🚶 Jarak jalan</span><b>${STATS.dist >= 1000 ? (STATS.dist / 1000).toFixed(2) + ' km' : Math.round(STATS.dist) + ' m'}</b></div>
      <div class="statrow"><span>🎣 Ikan ditangkap</span><b>${totalFish} (${kinds}/${FISH.length} jenis)</b></div>
      <div class="statrow"><span>📷 Foto diambil</span><b>${STATS.photos}</b></div>
      <div class="statrow"><span>💬 Tokoh dikenal</span><b>${open}/${prof}</b></div>
      <div class="statrow"><span>⏱️ Lama main</span><b>${fmtTime(STATS.time)}</b></div>`;
  } else if (menuTab === 'misi') { h += missionMenuHTML();
  } else if (menuTab === 'tas') {
    const all = Object.values(SHOPS).flatMap((sh) => sh.items), own = all.filter(([id]) => (STATS.bag[id] || 0) > 0);
    h += `<h2>Tasku</h2><p>🪙 Koin saku: <b>${STATS.koin}</b>. Koin didapat dari <b>mancing</b>, lalu bisa dibelanjakan di pasar, kios, dan Taman Safari. (Koin saku beda dengan Gold kas negeri!)</p><h4>Barang</h4>`;
    h += own.length ? `<div class="grid">${own.map(([id, nm, em, , , , ds]) => `<div class="tcard"><b>${em} ${esc(nm)} ×${STATS.bag[id]}</b><small>${esc(ds)}</small></div>`).join('')}</div>` : '<p>Tasmu masih kosong. Coba mampir ke pasar di selatan gapura!</p>';
    h += `<h4>Catatan</h4><div class="statrow"><span>🍽️ Makanan dimakan</span><b>${STATS.eaten}</b></div>`;
  } else if (menuTab === 'tokoh') {
    h += `<h2>Buku Tokoh</h2><p>Ajak ngobrol tokoh di negeri untuk membuka profilnya.</p><div class="grid">`;
    for (const p of PROFILES) {
      if (unlocked(p)) h += `<div class="tcard"><b>${esc(p.name)}</b><small>${esc(p.role)} · sejak ${esc(p.first)}</small><small>Sifat: ${esc(p.trait)}</small><div class="bio">${esc(p.bio)}</div><div class="q">“${esc(p.quote)}”</div></div>`;
      else h += `<div class="tcard locked"><b>???</b><small>${p.secret ? 'Muncul di malam hari...' : 'Ajak ngobrol untuk membuka'}</small></div>`;
    }
    h += '</div>';
  } else if (menuTab === 'ikan') {
    const kinds = Object.keys(STATS.caught).length;
    h += `<h2>Buku Ikan</h2><p>Mancing di papan 🎣 di tepi sungai. Terkumpul <b>${kinds}/${FISH.length}</b> jenis.</p><div class="grid">`;
    for (const [key, name, em, rar] of FISH) {
      const c = STATS.caught[key];
      h += c ? `<div class="tcard"><b>${em} ${esc(name)}</b><small>${esc(rar)}</small><small>Ditangkap ${c.n}× · rekor ${c.best} cm</small></div>` : `<div class="tcard locked"><b>❔ ???</b><small>${esc(rar)}</small></div>`;
    }
    h += '</div>';
  } else if (menuTab === 'tentang') {
    h += `<h2>Dunia Impianmu</h2>${STORY.split(/\n\s*\n/).map((p) => `<p>${esc(p.trim())}</p>`).join('')}
      <h4>Aturan negeri</h4><div class="rules">${RULES.map(([i, t]) => `<div>${i} ${esc(t)}</div>`).join('')}</div>
      <h4>Status negeri (Day ${DAY})</h4><div class="rules"><div>🪙 Gold: <b>${STATUS.gold}</b> · 👥 Warga: <b>${STATUS.warga}</b> · 🏠 Rumah: <b>${STATUS.rumah}</b></div></div>
      <h4>Episode</h4>${EPISODES.map((e) => `<div class="ep"><b>${esc(e.day)}</b> · <em>${esc(e.title)}</em><br><span>${esc(e.text)}</span></div>`).join('')}
      <p class="copy">© ${new Date().getFullYear()} Dunia Impianmu · YouTube @DuniaImpianmu · IG & TikTok @dunia_impianmu<br>Game resmi hanya di <b>duniaimpianmu.my.id</b>. Hak cipta dilindungi: dilarang menyalin atau menerbitkan ulang tanpa izin.</p>`;
  } else if (menuTab === 'atur') {
    const seg = (id, opts, cur) => `<div class="seg" data-k="${id}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    h += `<h2>Pengaturan</h2>
      <div class="opt"><span>🎵 Musik</span><input type="range" id="vMusic" min="0" max="1" step="0.05" value="${SET.music}"></div>
      <div class="opt"><span>🔔 Efek suara</span><input type="range" id="vSfx" min="0" max="1" step="0.05" value="${SET.sfx}"></div>
      <div class="opt"><span>🖼️ Grafis</span>${seg('gfx', [['tinggi', 'Tinggi'], ['rendah', 'Rendah']], SET.gfx)}</div>
      <div class="opt"><span>🎥 Putar kamera</span>${seg('cam', [[0.6, 'Pelan'], [1, 'Normal'], [1.6, 'Cepat']], SET.cam)}</div>
      <div class="opt"><span>☁️ Cuaca</span>${seg('weather', WMODES, SET.weather)}</div>
      <h4>Kontrol</h4>
      <div class="ctl"><h5>💻 Laptop</h5>
        <div class="krow"><span>Jalan</span><span class="kk"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></div>
        <div class="krow"><span>Lari</span><span class="kk"><kbd>Shift</kbd></span></div>
        <div class="krow"><span>Lompat</span><span class="kk"><kbd>Spasi</kbd></span></div>
        <div class="krow"><span>Ngobrol · mancing · pilih jawaban</span><span class="kk"><kbd>E</kbd></span></div>
        <div class="krow"><span>Foto</span><span class="kk"><kbd>P</kbd></span></div>
        <div class="krow"><span>Siang / malam</span><span class="kk"><kbd>N</kbd></span></div>
        <div class="krow"><span>Ganti cuaca</span><span class="kk"><kbd>R</kbd></span></div>
        <div class="krow"><span>Ganti karakter</span><span class="kk"><kbd>C</kbd></span></div>
        <div class="krow"><span>Suara</span><span class="kk"><kbd>M</kbd></span></div>
        <div class="krow"><span>Peta besar</span><span class="kk"><kbd>Tab</kbd></span></div>
        <div class="krow"><span>Menu</span><span class="kk"><kbd>Esc</kbd></span></div>
        <div class="krow"><span>Putar kamera · zoom</span><span class="kk"><kbd class="t">Geser mouse</kbd><kbd class="t">Scroll</kbd></span></div>
      </div>
      <div class="ctl"><h5>📱 HP</h5>
        <div class="krow"><span>Jalan</span><span class="kk"><kbd class="t">Geser layar kiri</kbd></span></div>
        <div class="krow"><span>Putar kamera</span><span class="kk"><kbd class="t">Geser layar kanan</kbd></span></div>
        <div class="krow"><span>Zoom</span><span class="kk"><kbd class="t">Cubit dua jari</kbd></span></div>
        <div class="krow"><span>Lompat · ngobrol · mancing</span><span class="kk"><kbd class="t">Tombol bulat</kbd></span></div>
        <div class="krow"><span>Peta besar</span><span class="kk"><kbd class="t">Ketuk peta kecil</kbd></span></div>
      </div>
      <h4>Data</h4><p><button class="pbtn alt dark" id="resetAll">Hapus koleksi & statistik</button></p>`;
  } else if (menuTab === 'ikuti') {
    h += `<h2>Ikuti Dunia Impianmu</h2><p>Episode baru, request bangunan, dan namamu bisa muncul di negeri ini!</p><div class="links">${LINKS.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener" style="background:${l.color}"><i>${l.icon}</i><span>${esc(l.name)}<small>${esc(l.handle)}</small></span></a>`).join('')}</div>`;
  }
  b.innerHTML = h; b.scrollTop = 0;
  $('#menu .tabs button.on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
}
$('#menu').addEventListener('click', (e) => {
  const tb = e.target.closest('[data-t]'); if (tb) { menuTab = tb.dataset.t; renderMenu(); return; }
  if (e.target.closest('[data-x]') || e.target === $('#menu')) { closeMenu(); return; }
  const cb = e.target.closest('[data-c]'); if (cb) { setCharacter(cb.dataset.c, true); renderMenu(); return; }
  const sb = e.target.closest('.seg[data-k] button');
  if (sb) {
    const k = sb.parentElement.dataset.k, v = sb.dataset.v;
    if (k === 'gfx') { SET.gfx = v; saveSet(); applyGfx(); }
    if (k === 'cam') { SET.cam = parseFloat(v); saveSet(); }
    if (k === 'weather') setWeather(v);
    renderMenu(); return;
  }
  if (e.target.id === 'nmSave') { store.set('name', $('#nmIn').value.trim().slice(0, 18)); makeNameTag(); toast('Nama disimpan ✔', 1.4); return; }
  if (e.target.id === 'resetAll' && confirm('Hapus semua koleksi ikan, profil tokoh, dan statistik?')) { Object.assign(STATS, { dist: 0, photos: 0, time: 0, talked: [], caught: {}, seenDia: false }); saveStats(); renderMenu(); }
});
$('#menu').addEventListener('input', (e) => {
  if (e.target.id === 'vMusic') { SET.music = +e.target.value; saveSet(); if (SND.mbus) SND.mbus.gain.value = SET.music; }
  if (e.target.id === 'vSfx') { SET.sfx = +e.target.value; saveSet(); if (SND.fbus) SND.fbus.gain.value = SET.sfx; }
});
$('#menu').addEventListener('keydown', (e) => { if (e.target.id === 'nmIn' && e.key === 'Enter') $('#nmSave').click(); });

// ------------------------------------------------------------------ peta besar (lihat & info, tanpa lompat)
const bm = { el: $('#bigmap'), cv: $('#bigmap canvas'), s: 10, cx: 0, cy: 8, sel: null };
const bctx = bm.cv.getContext('2d');
const LABELS = Object.entries({ ...L.old, ...L.new }).filter(([k]) => INFO[k] && k !== 'ladang2').map(([k, v]) => ({ k, x: v[0], y: v[1] }));
function openMap() { bm.el.classList.add('on'); fitMap(); drawMap(); releaseAll(); $('#mapInfo').style.display = 'none'; bm.sel = null; }
function fitMap() {
  const w = innerWidth, h = innerHeight, x0 = FC[0] - L.fence.r - 2, x1 = FC[0] + L.fence.r + 2, y1 = FC[1] + L.fence.r + 2, y0 = ZONE ? ZONE[2] - 1 : FC[1] - L.fence.r - 2;
  const top = Math.max(60, $('#tpBar').getBoundingClientRect().bottom + 6), avail = h - top - 24;
  bm.s = Math.min((w * 0.92) / (x1 - x0), avail / (y1 - y0)); bm.cx = (x0 + x1) / 2; bm.cy = (y0 + y1) / 2 + (top + avail / 2 - h / 2) / bm.s;
}
const W2S = (x, y) => [innerWidth / 2 + (x - bm.cx) * bm.s, innerHeight / 2 - (y - bm.cy) * bm.s];
function drawMap() {
  const dpr = Math.min(devicePixelRatio, 2), w = innerWidth, h = innerHeight; bm.cv.width = w * dpr; bm.cv.height = h * dpr;
  const c = bctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = '#2b4a3a'; c.fillRect(0, 0, w, h);
  const [fx_, fy_] = W2S(FC[0], FC[1]);
  c.fillStyle = '#8fd06b'; c.beginPath(); c.arc(fx_, fy_, (L.fence.r + 0.5) * bm.s, 0, 7); c.fill();
  if (ZONE) { const [a, b] = W2S(ZONE[0], GATE.y + 4), [d, e] = W2S(ZONE[1], ZONE[2]); c.beginPath(); c.roundRect(a, b, d - a, e - b, 2 * bm.s); c.fill(); }
  c.strokeStyle = '#4aa8e0'; c.lineWidth = 3.2 * bm.s; c.lineCap = 'round'; c.beginPath();
  { const y0 = Math.max(-40, Math.ceil(RIVER_END)); for (let y = y0; y <= 60; y += 1) { const [X, Y] = W2S(riverX(y), y); y === y0 ? c.moveTo(X, Y) : c.lineTo(X, Y); } } c.stroke();
  c.strokeStyle = '#ead9ad';
  for (const [a, b, wd] of ROADS) { c.lineWidth = wd * bm.s; c.beginPath(); c.moveTo(...W2S(a[0], a[1])); c.lineTo(...W2S(b[0], b[1])); c.stroke(); }
  for (const it of L.items) {
    if (/^(pine|round)/.test(it.a)) { const [X, Y] = W2S(it.p[0], it.p[1]); c.fillStyle = '#5aa04a'; c.beginPath(); c.arc(X, Y, Math.max(1.5, 0.5 * it.s[0] * bm.s), 0, 7); c.fill(); continue; }
    const o = it._coll; if (!o || !o.c.b || isCharName(it.a)) continue;
    const [x0, x1, y0, y1] = o.c.b; if (x1 - x0 < 0.5) continue;
    c.save(); c.translate(...W2S(o.x, o.y)); c.rotate(-o.r);
    c.fillStyle = INFO[it.a] ? '#ffcf3a' : /^rumah/.test(it.a) ? '#e07a5f' : '#c9b9a6'; c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1;
    c.fillRect(x0 * bm.s, -y1 * bm.s, (x1 - x0) * bm.s, (y1 - y0) * bm.s); c.strokeRect(x0 * bm.s, -y1 * bm.s, (x1 - x0) * bm.s, (y1 - y0) * bm.s); c.restore();
  }
  if (L.new.taman_safari) { const [sx, sy, sr] = L.new.taman_safari; c.save(); c.translate(...W2S(sx, sy)); c.rotate(-sr); c.fillStyle = '#d9c27a'; c.fillRect(-6.5 * bm.s, -5 * bm.s, 13 * bm.s, 10 * bm.s); c.restore(); }
  for (const e of EXTRA) {
    const [x0, x1, y0, y1] = e.b; c.save(); c.translate(...W2S(e.p[0], e.p[1])); c.rotate(-e.r);
    const col = extraColor(e.k); if (!col) { c.restore(); continue; } c.fillStyle = col; c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1;
    c.fillRect(x0 * bm.s, -y1 * bm.s, (x1 - x0) * bm.s, (y1 - y0) * bm.s); c.strokeRect(x0 * bm.s, -y1 * bm.s, (x1 - x0) * bm.s, (y1 - y0) * bm.s); c.restore();
  }
  c.strokeStyle = '#7a4a1e'; c.lineWidth = Math.max(2, 0.25 * bm.s); c.beginPath(); c.arc(fx_, fy_, L.fence.r * bm.s, 0, 7); c.stroke();
  const [gx, gy] = W2S(GATE.x, GATE.y); c.font = `700 ${Math.max(11, Math.min(15, bm.s * 0.9))}px Fredoka, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = '#fff'; c.fillText('GAPURA', gx, gy + 18);
  for (const s of SPOTS) { const [X, Y] = W2S(s.x, s.y); c.font = `${Math.max(14, Math.min(26, bm.s * 1.3))}px sans-serif`; c.fillText('🎣', X, Y + 5); }
  const placed = []; c.font = `700 ${Math.max(11, Math.min(16, bm.s * 0.75))}px Fredoka, sans-serif`;
  for (const lb of LABELS) {
    const [X, Y] = W2S(lb.x, lb.y), txt = INFO[lb.k][0], tw = c.measureText(txt).width + 12, th = 20, r = { x: X - tw / 2, y: Y - th - 6, w: tw, h: th };
    lb.r = r; if (placed.some((p) => r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y)) { lb.r = null; continue; }
    placed.push(r); c.fillStyle = bm.sel === lb.k ? '#ffd84a' : 'rgba(18,22,60,0.85)'; c.beginPath(); c.roundRect(r.x, r.y, r.w, r.h, 10); c.fill();
    c.fillStyle = bm.sel === lb.k ? '#2a1d00' : '#fff'; c.textBaseline = 'middle'; c.fillText(txt, X, r.y + th / 2 + 1); c.textBaseline = 'alphabetic';
  }
  for (const [x, y, kd] of MARKS) { const [X, Y] = W2S(x, y); c.fillStyle = MARK_COL[kd] || '#ff5a3a'; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(X, Y, 8, 0, 7); c.fill(); c.stroke(); }
  const [px, py] = W2S(P.x, P.y); c.save(); c.translate(px, py); c.rotate(-P.face + Math.PI);
  c.fillStyle = '#2f7cff'; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -14); c.lineTo(10, 10); c.lineTo(0, 4); c.lineTo(-10, 10); c.closePath(); c.fill(); c.stroke(); c.restore();
  if (!bm.sel) { c.fillStyle = '#fff'; c.font = '600 13px Fredoka, sans-serif'; c.textAlign = 'left'; c.fillText('Panah biru = posisimu · ketuk nama bangunan untuk info', 14, h - 14); }
}
{
  const ptrs = new Map(); let moved = 0;
  bm.cv.addEventListener('pointerdown', (e) => { try { bm.cv.setPointerCapture(e.pointerId); } catch {} ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; });
  bm.cv.addEventListener('pointermove', (e) => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d0 = Math.hypot(a.x - b.x, a.y - b.y); p.x = e.clientX; p.y = e.clientY; const d1 = Math.hypot(a.x - b.x, a.y - b.y); bm.s = THREE.MathUtils.clamp(bm.s * (d1 / (d0 || 1)), 4, 60); moved += 10; drawMap(); return; }
    bm.cx -= (e.clientX - p.x) / bm.s; bm.cy += (e.clientY - p.y) / bm.s; moved += Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y); p.x = e.clientX; p.y = e.clientY; drawMap();
  });
  const up = (e) => {
    if (ptrs.has(e.pointerId) && moved < 6) {
      const hit = LABELS.find((lb) => lb.r && e.clientX >= lb.r.x && e.clientX <= lb.r.x + lb.r.w && e.clientY >= lb.r.y && e.clientY <= lb.r.y + lb.r.h)
        || LABELS.map((lb) => { const [X, Y] = W2S(lb.x, lb.y); return [Math.hypot(X - e.clientX, Y - e.clientY), lb]; }).filter(([d]) => d < 28).sort((a, b) => a[0] - b[0])[0]?.[1];
      const mi = $('#mapInfo');
      if (hit) { bm.sel = hit.k; mi.querySelector('h3').textContent = INFO[hit.k][0]; mi.querySelector('p').textContent = INFO[hit.k][1]; mi.style.display = 'block'; sfx('pop_soft', 0.5); }
      else { bm.sel = null; mi.style.display = 'none'; }
      drawMap();
    }
    ptrs.delete(e.pointerId);
  };
  bm.cv.addEventListener('pointerup', up); bm.cv.addEventListener('pointercancel', (e) => ptrs.delete(e.pointerId));
  bm.cv.addEventListener('wheel', (e) => { bm.s = THREE.MathUtils.clamp(bm.s * (e.deltaY > 0 ? 0.9 : 1.1), 4, 60); drawMap(); }, { passive: true });
  $('#mClose').onclick = () => bm.el.classList.remove('on');
  $('#mIn').onclick = () => { bm.s = Math.min(60, bm.s * 1.3); drawMap(); };
  $('#mOut').onclick = () => { bm.s = Math.max(4, bm.s / 1.3); drawMap(); };
  $('#mMe').onclick = () => { bm.cx = P.x; bm.cy = P.y; bm.s = Math.max(bm.s, 18); drawMap(); };
}
$('#mini').addEventListener('click', openMap);

// ------------------------------------------------------------------ input
const keys = {}, seen = {}, rep = {};
const KEYMAP = { w: 'KeyW', a: 'KeyA', s: 'KeyS', d: 'KeyD' };
const codeOf = (e) => KEYMAP[(e.key || '').toLowerCase()] || e.code;
const ui = () => ['#photo', '#menu', '#bigmap', '#catch', '#shop'].some((s) => $(s).classList.contains('on')) || !!$('#load') || !!talking;
const joy = { id: null, x0: 0, y0: 0, x: 0, y: 0 };
const joyEl = $('#joy'), knob = joyEl.querySelector('i');
const releaseAll = () => { for (const c in keys) { keys[c] = false; rep[c] = false; } joy.id = null; joy.x = joy.y = 0; joyEl.style.display = 'none'; };
addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'INPUT') return;
  const c = codeOf(e); keys[c] = true; seen[c] = performance.now(); if (e.repeat) rep[c] = true;
  const k = (e.key || '').toLowerCase();
  if (e.code === 'Space') { e.preventDefault(); if (e.repeat || $('#load')) return;
    if (talking) { dialogConfirm(); return; }
    if ($('#catch').classList.contains('on')) { $('#catch').classList.remove('on'); return; }
    jump(); return; }
  if (e.repeat || $('#load')) return;
  if (talking) {
    if (['1', '2', '3', '4'].includes(k)) { if (typeT >= typeText.length) choose(+k - 1); }
    else if (k === 'arrowup' || k === 'w') moveSel(-1);
    else if (k === 'arrowdown' || k === 's') moveSel(1);
    else if (e.code === 'Enter') dialogConfirm();
    else if (k === 'escape') endTalk();
    return;
  }
  if (k === 'escape') { if ($('#menu').classList.contains('on')) closeMenu(); else if (bm.el.classList.contains('on')) bm.el.classList.remove('on'); else if ($('#catch').classList.contains('on')) $('#catch').classList.remove('on'); else openMenu(); return; }
  if ($('#catch').classList.contains('on') && (k === 'e' || e.code === 'Enter')) { $('#catch').classList.remove('on'); return; }
  if ((k === 'm' || k === 'tab') && bm.el.classList.contains('on')) { e.preventDefault(); bm.el.classList.remove('on'); return; }
  if (ui()) return;
  if (k === 'e' || e.code === 'Enter') doAction();
  else if (k === 'p') takePhoto();
  else if (k === 'n') toggleNight();
  else if (k === 'r') cycleWeather();
  else if (k === 'c') cycleChar();
  else if (k === 'm') openMap();
  else if (k === 'tab') { e.preventDefault(); openMap(); }
});
addEventListener('keyup', (e) => { for (const c of new Set([codeOf(e), e.code])) { keys[c] = false; rep[c] = false; } });
addEventListener('blur', releaseAll);
addEventListener('contextmenu', releaseAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); pauseAudio(); } else resumeAudio(); });
addEventListener('blur', pauseAudio); addEventListener('pagehide', pauseAudio);
addEventListener('focus', resumeAudio); addEventListener('pointerdown', resumeAudio);
// (watchdog lama dihapus: OS menghentikan auto-repeat W saat tombol lain ditekan, jadi W dilepas padahal masih ditahan.
//  Tombol macet sudah ditangani blur / visibilitychange / contextmenu.)
function keyWatchdog() {}
let camYaw = 0, camPitch = 0.42, camDist = 7.5;
const drags = new Map();
canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch {}
  if (e.pointerType === 'touch' && e.clientX < innerWidth * 0.45 && joy.id === null) {
    Object.assign(joy, { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: 0, y: 0 });
    joyEl.style.display = 'block'; joyEl.style.left = `${e.clientX - 60}px`; joyEl.style.top = `${e.clientY - 60}px`; knob.style.transform = '';
  } else drags.set(e.pointerId, { x: e.clientX, y: e.clientY });
  hideHelp();
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId === joy.id) {
    let dx = e.clientX - joy.x0, dy = e.clientY - joy.y0; const d = Math.hypot(dx, dy), m = 50;
    if (d > m) { dx *= m / d; dy *= m / d; }
    joy.x = dx / m; joy.y = dy / m; knob.style.transform = `translate(${dx}px, ${dy}px)`;
    return;
  }
  const d = drags.get(e.pointerId); if (!d) return;
  if (drags.size === 2) {
    const [p1, p2] = [...drags.values()], before = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    d.x = e.clientX; d.y = e.clientY; const after = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    camDist = THREE.MathUtils.clamp(camDist * (before / (after || 1)), 3.5, 18); return;
  }
  camYaw -= (e.clientX - d.x) * 0.006 * SET.cam; camPitch = THREE.MathUtils.clamp(camPitch + (e.clientY - d.y) * 0.004 * SET.cam, 0.08, 1.25);
  d.x = e.clientX; d.y = e.clientY;
});
const endPtr = (e) => { if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; joyEl.style.display = 'none'; } drags.delete(e.pointerId); };
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('wheel', (e) => { camDist = THREE.MathUtils.clamp(camDist * (1 + Math.sign(e.deltaY) * 0.1), 3.5, 18); }, { passive: true });
$('#jump').addEventListener('pointerdown', (e) => { e.stopPropagation(); jump(); });
$('#bPhoto').onclick = () => takePhoto();
$('#bNight').onclick = () => toggleNight();
$('#bWeather').onclick = () => cycleWeather();
$('#bChar').onclick = () => cycleChar();
$('#bSound').onclick = () => { setSound(!SND.on); initAudio(); };
$('#bMenu').onclick = () => openMenu();
function cycleChar() { const i = CHARS.findIndex((c) => c.id === charId); setCharacter(CHARS[(i + 1) % CHARS.length].id, true); }
function jump() { if (P.z <= 0.001 && !ui()) { if (FISHING.state !== 'idle') stopFishing(); P.vz = 4.2; sfx('boing', 0.35, 1.1); } }
let helpHidden = false; function hideHelp() { if (!helpHidden) { helpHidden = true; setTimeout(() => ($('#help').style.opacity = 0), 5000); } }

// ------------------------------------------------------------------ toko (koin saku) & efek makanan
const BOOST = { t: 0, k: 1, kind: '', puff: 0 };
let shopId = null;
function openShop(id) {
  const sh = SHOPS[id]; if (!sh) return;
  shopId = id; renderShop(); $('#shop').classList.add('on'); releaseAll(); sfx('pop_soft', 0.6);
}
function renderShop() {
  const sh = SHOPS[shopId], el = $('#shop .card');
  const fr = missionFree();
  el.innerHTML = `<h3>${esc(sh.name)}</h3><div class="sk">🪙 Koinku: <b>${STATS.koin}</b></div><div class="slist">${fr ? `<button data-free="1" class="free"><span class="em">${fr[2]}</span><span class="nm">${esc(fr[1])}<small>${esc(fr[5])}</small></span><span class="pr">GRATIS</span></button>` : ''}${sh.items.map(([id, nm, em, price, kind, , ds], i) =>
    `<button data-buy="${i}" class="${STATS.koin < price ? 'poor' : ''}"><span class="em">${em}</span><span class="nm">${esc(nm)}<small>${esc(ds)}${kind === 'barang' ? ` · di tas: ${STATS.bag[id] || 0}` : ''}</small></span><span class="pr">${price} 🪙</span></button>`).join('')}</div>
    <div class="row"><button class="pbtn alt" id="shopClose">Tutup</button></div>`;
}
// item gratis khusus misi utama (selama misinya berjalan dan belum didapat)
function missionFree() {
  const m = curMain(), fr = m?.free?.[shopId]; if (!fr) return null;
  if (m.goal.type === 'eat' && MS_.prog.set.includes(shopId)) return null;
  if (fr[3] === 'barang' && (STATS.bag[fr[0]] || 0) > 0) return null;
  return fr;
}
function takeFree() {
  const fr = missionFree(); if (!fr) return;
  const [id, nm, em, kind, eff] = fr; sfx('tring', 0.5);
  if (kind === 'makan') { STATS.eaten++; saveStats(); $('#shop').classList.remove('on'); ev('eat', shopId); eat(nm, em, eff); }
  else { STATS.bag[id] = (STATS.bag[id] || 0) + 1; saveStats(); toast(`🎯 ${em} ${nm} masuk tas! Antar sesuai misi`, 2.4); renderShop(); }
}
function buy(i) {
  const [id, nm, em, price, kind, eff] = SHOPS[shopId].items[i];
  if (STATS.koin < price) { toast('Koin kurang! Mancing dulu di sungai yuk 🎣', 2.2); sfx('boing', 0.4, 0.8); return; }
  addKoin(-price); sfx('coin', 0.6); ev('buy', id);
  if (kind === 'makan') { ev('eat', shopId); STATS.eaten++; saveStats(); $('#shop').classList.remove('on'); eat(nm, em, eff); }
  else { STATS.bag[id] = (STATS.bag[id] || 0) + 1; saveStats(); toast(`${em} ${nm} masuk tas!`, 1.8); renderShop(); }
}
function eat(nm, em, eff) {
  const p = body.position.clone(); p.y += avatarH + 0.2;
  if (eff === 'pedas') { Object.assign(BOOST, { t: 15, k: 1.45, kind: 'pedas' }); toast(`${em} HAAAH PEDAAAS! Lari jadi kencang 15 detik!`, 2.6); sfx('whoosh', 0.6, 0.8); }
  else if (eff === 'kuat') { Object.assign(BOOST, { t: 30, k: 1.25, kind: 'kuat' }); toast(`${em} Kenyang! Tenaga penuh 30 detik 💪`, 2.4); }
  else toast(`${em} Nyam! ${nm} enak banget`, 2.0);
  fx(heartTex, p, { n: 6, size: 0.2, speed: 0.5, up: 1.0, life: 1.2, grow: 0.3 }); sfx('pop_soft', 0.6, 1.2);
}
function updateBoost(dt) {
  if (BOOST.t <= 0) return;
  BOOST.t -= dt;
  if (BOOST.kind === 'pedas' && (BOOST.puff -= dt) <= 0) {
    BOOST.puff = 0.18; const p = body.position.clone(); p.y += avatarH * 0.9;
    fx(puffTex, p, { n: 2, color: Math.random() < 0.5 ? 0xff5a3a : 0xffa040, size: 0.22, speed: 0.6, up: 1.4, life: 0.6, grow: 1.2 });
  }
  if (BOOST.t <= 0) { BOOST.k = 1; toast('Efeknya sudah habis', 1.4); }
}
$('#shop').addEventListener('click', (e) => {
  if (e.target.closest('[data-free]')) { takeFree(); return; }
  const b = e.target.closest('[data-buy]'); if (b) { buy(+b.dataset.buy); return; }
  if (e.target.id === 'shopClose' || e.target === $('#shop')) { $('#shop').classList.remove('on'); sfx('pop_soft', 0.4); }
});

// ------------------------------------------------------------------ teleport (dari peta besar)
$('#tpBar').innerHTML = TELEPORTS.map(([nm, em], i) => `<button data-tp="${i}">${em} ${esc(nm)}</button>`).join('');
function teleport(i) {
  const [nm, , x, y] = TELEPORTS[i];
  bm.el.classList.remove('on'); $('#flash').style.transition = 'none'; $('#flash').style.opacity = 1;
  [P.x, P.y] = collide(x, y, PR); P.z = 0; P.vz = 0; gZ = groundAt(P.x, P.y);
  requestAnimationFrame(() => { $('#flash').style.transition = 'opacity .6s'; $('#flash').style.opacity = 0; });
  sfx('shimmer', 0.5); toast(`✨ Sampai di ${nm}`, 1.8); ev('teleport');
}
$('#tpBar').addEventListener('pointerdown', (e) => e.stopPropagation());
$('#tpBar').addEventListener('click', (e) => { const b = e.target.closest('[data-tp]'); if (b) teleport(+b.dataset.tp); });

// ------------------------------------------------------------------ misi utama, misi harian, kerja sambilan (hadiah koin saku)
const MS_ = (STATS.ms ??= { main: 0, prog: { p: 0, set: [] }, signs: [], badges: [], jobs: 0, jobCd: {} });
const SIGNS5 = L.signs.map((sg, i) => ({ i, x: sg.p[0], y: sg.p[1] })).filter((sg) => sg.y < GATE.y - 1);
const itemPos = (k) => { const it = L.items.find((i) => (i.d || i.a) === k); return it ? [it.p[0], it.p[1]] : null; };
const curMain = () => MAIN_MISSIONS.list[MS_.main] || null;
const dailyDef = (id) => DAILY_POOL.find((d) => d.id === id);
const need = (g) => g.n || (g.type === 'eat' ? g.target.length : 1);
function rollDaily() {
  const d = new Date().toDateString(); if (STATS.daily?.date === d) return;
  let h = 0; for (const c of d) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pool = [...DAILY_POOL], pick = [];
  while (pick.length < 3 && pool.length) { h = (h * 1103515245 + 12345) >>> 0; pick.push(pool.splice(h % pool.length, 1)[0].id); }
  STATS.daily = { date: d, list: pick.map((id) => ({ id, p: 0, set: [], done: false })), bonus: false, dist0: STATS.dist };
  saveStats();
}
rollDaily();
function advance(g, rec, e, arg) {
  const t = g.type; let ch = false;
  if (t === 'visit' || t === 'give' || t === 'node') { if (e === t && arg === g.target && rec.p < 1) { rec.p = 1; ch = true; } }
  else if (t === 'eat') { if (e === 'eat' && g.target.includes(arg) && !rec.set.includes(arg)) { rec.set.push(arg); rec.p = rec.set.length; ch = true; } }
  else if (t === 'talkSeller') { if (e === 'talk' && /^(pedagang|penjual)/.test(arg) && !rec.set.includes(arg)) { rec.set.push(arg); rec.p = rec.set.length; ch = true; } }
  else if (t === 'sign') { const n = MS_.signs.length; if (n !== rec.p) { rec.p = n; ch = true; } }
  else if (t === 'walk') { const n = Math.floor(STATS.dist - STATS.daily.dist0); if (n !== rec.p) { rec.p = n; ch = n >= g.n; } }
  else if (e === t) { rec.p++; ch = true; }
  return ch;
}
function ev(e, arg) {
  rollDaily();
  const m = curMain();
  if (m && advance(m.goal, MS_.prog, e, arg)) {
    if (MS_.prog.p >= need(m.goal)) finishMain(m);
    else if (e !== 'walk') toast(`🎯 ${m.title}: ${progText(m.goal, MS_.prog)}`, 1.8);
  }
  for (const d of STATS.daily.list) {
    if (d.done) continue; const def = dailyDef(d.id); if (!def) continue;
    if (advance(def.goal, d, e, arg) && d.p >= need(def.goal)) {
      d.done = true; addKoin(def.koin); sfx('coin', 0.6); toast(`✅ Misi harian: ${def.title} · +${def.koin} 🪙`, 2.6);
      if (!STATS.daily.bonus && STATS.daily.list.every((x) => x.done)) { STATS.daily.bonus = true; setTimeout(() => { addKoin(DAILY_BONUS); sfx('tring', 0.6); toast(`🌟 Semua misi harian selesai! Bonus +${DAILY_BONUS} 🪙`, 3); }, 2700); }
    }
  }
  saveStats(); renderQuest();
}
function finishMain(m) {
  MS_.main++; MS_.prog = { p: 0, set: [] }; addKoin(m.koin);
  if (m.badge && !MS_.badges.includes(m.badge[0])) MS_.badges.push(m.badge[0]);
  saveStats();
  const box = $('#catch'); box.querySelector('.em').textContent = m.badge ? m.badge[1] : '🏆'; box.querySelector('h3').textContent = m.title;
  const r = box.querySelector('.rar'); r.textContent = 'MISI SELESAI'; r.style.background = '#d99a00';
  const nx = curMain();
  box.querySelector('p').textContent = `+${m.koin} 🪙 Koin${m.badge ? ` · Lencana: ${m.badge[2]}` : ''}${nx ? ` · Misi berikutnya: ${nx.title}` : ' · Bab ini tamat! Tunggu misi baru di episode berikutnya'}`;
  box.classList.add('on'); sfx('shimmer', 0.6); sfx('coin', 0.6); releaseAll();
  setTimeout(() => ev('check'), 50);   // misi berikutnya mungkin sudah terpenuhi (mis. papan nama)
}
const progText = (g, rec) => g.type === 'walk' ? `${Math.min(rec.p, g.n)}/${g.n} m` : `${Math.min(rec.p, need(g))}/${need(g)}`;

// kerja sambilan: titik berkilau + waktu
const JOB = { id: null, t: 0, pts: [], done: [], got: 0 };
const carryM = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), new THREE.MeshStandardMaterial({ color: '#c8a050', roughness: 0.8 }));
carryM.visible = false; body.add(carryM);
function startJob(id) {
  const j = JOBS[id]; if (!j) return;
  if (JOB.id) { toast('Selesaikan dulu kerjaan yang sedang jalan!', 2); return; }
  const cd = (MS_.jobCd[id] || 0) - Date.now(); if (cd > 0) { toast(`Istirahat dulu ya. Coba lagi ${Math.ceil(cd / 1000)} detik lagi`, 2.2); return; }
  const pts = j.points === 'acak' ? Array.from({ length: j.n }, () => [j.area[0] + Math.random() * (j.area[1] - j.area[0]), j.area[2] + Math.random() * (j.area[3] - j.area[2])]) : j.points.map((q) => [...q]);
  Object.assign(JOB, { id, t: j.time, pts, done: pts.map(() => false), got: 0, act: null, near: null });
  toast(`${j.em} ${j.name} dimulai! Datangi sinar kuning, lalu ${touch ? 'ketuk tombol' : 'tekan E'}`, 2.6); sfx('tring', 0.5); renderQuest();
}
// aksi kerja: berdiri di titik, tekan E -> karakter bergerak bekerja + lingkaran loading di atas kepala
function jobVerb() { const j = JOBS[JOB.id]; return Array.isArray(j.verb) ? j.verb[JOB.got % 2] : (j.verb || 'Kerjakan'); }
function startAct() { const j = JOBS[JOB.id]; JOB.act = { i: JOB.near, t: 0, dur: j.act || 1.5, s: 0 }; promptEl.style.display = 'none'; sfx('pop_soft', 0.5, 0.9); }
function finishAct() {
  const j = JOBS[JOB.id], a = JOB.act, [x, y] = JOB.pts[a.i]; JOB.act = null; JOB.near = null; $('#jobBar').style.display = 'none';
  JOB.done[a.i] = true; JOB.got++; sfx('pop_soft', 0.7, 1.3);
  const pp = B2T(x, y, 0.8); fx(starTex, pp, { n: 8, color: 0xffd84a, size: 0.22, speed: 1.2, up: 1.4, life: 0.7 });
  if (j.pair) { carryM.visible = JOB.got % 2 === 1; carryM.position.set(0, avatarH + 0.35, 0); toast(JOB.got % 2 ? '💰 Karung diangkat! Bawa ke Gudang Gold' : `✅ Diantar! (${JOB.got / 2}/${JOB.pts.length / 2})`, 1.6); }
  else toast(`${j.em} ${j.label} ${JOB.got}/${JOB.pts.length}`, 1.2);
  renderQuest();
}
function endJob(ok) {
  const j = JOBS[JOB.id], id = JOB.id; JOB.id = null; JOB.act = null; JOB.near = null; carryM.visible = false; $('#jobBar').style.display = 'none';
  if (ok) { MS_.jobs++; MS_.jobCd[id] = Date.now() + j.cd * 1000; addKoin(j.koin); sfx('coin', 0.7); sfx('tring', 0.5); toast(`${j.em} ${j.name} beres! +${j.koin} 🪙`, 2.6); ev('job', id); }
  else { MS_.jobCd[id] = Date.now() + 10000; sfx('boing', 0.4, 0.7); toast('⏰ Waktu habis! Coba lagi sebentar lagi', 2.4); }
  saveStats(); renderQuest();
}
function jobTargets() {
  if (!JOB.id) return [];
  const j = JOBS[JOB.id];
  if (j.pair) { const i = JOB.done.indexOf(false); return i < 0 ? [] : [[...JOB.pts[i], i]]; }
  return JOB.pts.map((q, i) => [...q, i]).filter((q) => !JOB.done[q[2]]);
}
// penanda tujuan (sinar + bintang)
const beamMat = new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
const beamMatD = beamMat.clone(); beamMatD.color.set(0x5ad1ff);
const beamGeo = new THREE.CylinderGeometry(0.16, 0.16, 7, 10, 1, true); beamGeo.translate(0, 3.5, 0);
const bStarMat = new THREE.SpriteMaterial({ map: starTex, color: 0xffd84a, depthWrite: false, fog: false });
const bStarMatD = bStarMat.clone(); bStarMatD.color.set(0x5ad1ff);
const BEACONS = Array.from({ length: 14 }, () => { const g = new THREE.Group(), b = new THREE.Mesh(beamGeo, beamMat), st = new THREE.Sprite(bStarMat); st.scale.setScalar(0.45); g.add(b, st); g.visible = false; scene.add(g); return { g, b, st }; });
const MARK_COL = { m: '#ff5a3a', d: '#2fa8e0' };
let MARKS = [];
function mainTargets() {
  const m = curMain(); if (!m) return [];
  const g = m.goal;
  if (g.type === 'visit' && g.target === 'selatan') return [[GATE.x, GATE.y - 2]];
  if (g.type === 'eat') { const k = { roti: 'penjual_roti', seblak: 'penjual_seblak', padang: 'penjual_padang' }; return g.target.filter((x) => !MS_.prog.set.includes(x)).map((x) => itemPos(k[x])).filter(Boolean); }
  if (g.type === 'give') { const q = (STATS.bag.bola || 0) > 0 ? (charId === 'ucup' ? null : itemPos('ucup')) : itemPos('pedagang_mainan'); return q ? [q] : []; }
  if (g.type === 'node') { const q = itemPos(g.target.split(':')[0]); return q ? [q] : []; }
  if (g.type === 'job') return ['pedagang_sayur', 'penambang', 'penjaga_safari'].map(itemPos).filter(Boolean);
  if (g.type === 'sign') return SIGNS5.filter((sg) => !MS_.signs.includes(sg.i)).map((sg) => [sg.x, sg.y]);
  return [];
}
// tujuan misi harian 'kunjungi ...' yang belum selesai
const VISIT_POS = { safari: 'taman_safari', stadion: 'stadion', tambang: 'tambang' };
function nearestPos(list) { let b = null, bd = 1e9; for (const q of list) { if (!q) continue; const d = Math.hypot(P.x - q[0], P.y - q[1]); if (d < bd) { bd = d; b = q; } } return b; }
function dailyTargets() {
  const out = [], mg = curMain()?.goal;
  for (const d of STATS.daily.list) {
    if (d.done) continue; const g = dailyDef(d.id)?.goal; if (!g) continue;
    if (g.type === 'visit') { const q = L.new[VISIT_POS[g.target]]; if (q) out.push([q[0], q[1], 'd']); }
    else if (g.type === 'fish') { const q = nearestPos(SPOTS.map((s) => [s.x, s.y])); if (q) out.push([q[0], q[1], 'd']); }
    else if (g.type === 'talkSeller' || g.type === 'buy') { const q = itemPos('pedagang_sayur'); if (q) out.push([q[0], q[1], 'd']); }
    else if (g.type === 'job' && mg?.type !== 'job') for (const q of ['pedagang_sayur', 'penambang', 'penjaga_safari'].map(itemPos)) if (q) out.push([q[0], q[1], 'd']);
  }
  return out.filter((q, i) => out.findIndex((r) => Math.hypot(r[0] - q[0], r[1] - q[1]) < 1) === i);
}
let qT = 0;
function updateMissions(dt) {
  const t = performance.now() / 1000;
  if (JOB.id && !ui()) {
    const j = JOBS[JOB.id]; JOB.t -= dt;
    if (JOB.act) {
      const a = JOB.act; a.t += dt; a.s += dt;
      if (a.s > 0.4) { a.s = 0; sfx('step', 0.3, 1.4 + Math.random() * 0.3); const [x, y] = JOB.pts[a.i]; fx(starTex, B2T(x, y, 0.5), { n: 2, color: 0xffe9a0, size: 0.12, speed: 0.6, up: 0.8, life: 0.5 }); }
      const bar = $('#jobBar'), v = B2T(P.x, P.y, gZ + P.z + avatarH + 0.75).project(camera), k = Math.min(1, a.t / a.dur);
      bar.style.display = v.z < 1 ? 'grid' : 'none'; bar.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`; bar.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`;
      bar.style.setProperty('--k', (k * 360).toFixed(0) + 'deg'); bar.querySelector('b').textContent = j.em;
      if (k >= 1) finishAct();
    } else {
      JOB.near = null; let bd = j.reach || 1.3;
      for (const [x, y, i] of jobTargets()) { const d = Math.hypot(P.x - x, P.y - y); if (d < bd) { bd = d; JOB.near = i; } }
    }
    if (JOB.done.every(Boolean)) endJob(true); else if (JOB.t <= 0) endJob(false);
  }
  if ((qT += dt) > 0.35) {
    qT = 0;
    if (P.y < GATE.y - 2) ev('visit', 'selatan');
    const sf = L.new.taman_safari; if (sf) { const dx = P.x - sf[0], dy = P.y - sf[1], c = Math.cos(-sf[2]), s_ = Math.sin(-sf[2]); if (Math.abs(dx * c - dy * s_) < 6.2 && Math.abs(dx * s_ + dy * c) < 4.7) ev('visit', 'safari'); }
    if (L.new.stadion && Math.hypot(P.x - L.new.stadion[0], P.y - L.new.stadion[1]) < 9) ev('visit', 'stadion');
    if (L.new.tambang && Math.hypot(P.x - L.new.tambang[0], P.y - L.new.tambang[1]) < 7) ev('visit', 'tambang');
    for (const sg of SIGNS5) if (!MS_.signs.includes(sg.i) && Math.hypot(P.x - sg.x, P.y - sg.y) < 2.4) {
      MS_.signs.push(sg.i); sfx('ding', 0.5); toast(`🪧 Papan nama ditemukan (${MS_.signs.length}/${SIGNS5.length})`, 2); ev('sign');
    }
    if (STATS.daily.list.some((d) => !d.done && dailyDef(d.id)?.goal.type === 'walk')) ev('walk');
    MARKS = JOB.id ? jobTargets().map(([x, y]) => [x, y, 'm']) : mainTargets().map(([x, y]) => [x, y, 'm']).concat(dailyTargets()).slice(0, BEACONS.length);
    if (JOB.id) renderQuest();
  }
  BEACONS.forEach((b, i) => {
    const m = MARKS[i]; b.g.visible = !!m; if (!m) return;
    const dm = m[2] === 'd'; b.b.material = dm ? beamMatD : beamMat; b.st.material = dm ? bStarMatD : bStarMat;
    b.g.position.copy(B2T(m[0], m[1], 0)); b.st.position.y = 2.6 + Math.sin(t * 3 + i) * 0.25; b.st.material.rotation = t;
  });
}
// kotak misi di layar (ketuk = buka tab Misi)
function renderQuest() {
  const el = $('#quest'); if (!el) return;
  if (JOB.id) { const j = JOBS[JOB.id], n = j.pair ? JOB.pts.length / 2 : JOB.pts.length, got = j.pair ? Math.floor(JOB.got / 2) : JOB.got;
    el.innerHTML = `<b>${j.em} ${esc(j.name)}</b><span>${got}/${n} ${esc(j.label)} · ⏱️ ${Math.max(0, Math.ceil(JOB.t))} dtk</span>`; el.classList.add('job'); return; }
  el.classList.remove('job');
  const m = curMain();
  el.innerHTML = m ? `<b>🎯 ${esc(m.title)} <i>${progText(m.goal, MS_.prog)}</i></b><span>${esc(m.desc)}</span>` : `<b>🎯 Misi harian</b><span>${STATS.daily.list.filter((d) => d.done).length}/3 selesai · ketuk untuk lihat</span>`;
}
$('#quest').addEventListener('pointerdown', (e) => e.stopPropagation());
$('#quest').addEventListener('click', () => openMenu('misi'));
renderQuest();
function missionMenuHTML() {
  let h = `<h2>Misi</h2><p>Selesaikan misi untuk dapat 🪙 <b>Koin saku</b> (koinmu sekarang: <b>${STATS.koin}</b>). Koin saku bukan Gold kas negeri, jadi aman dari korupsi 😎</p>`;
  h += `<h4>Misi Utama · ${esc(MAIN_MISSIONS.bab)}</h4>`;
  MAIN_MISSIONS.list.forEach((m, i) => {
    if (i < MS_.main) h += `<div class="mrow done"><span>✅ ${esc(m.title)}</span><b>+${m.koin} 🪙</b></div>`;
    else if (i === MS_.main) { const k = Math.min(1, MS_.prog.p / need(m.goal)); h += `<div class="mrow cur"><span>🎯 ${esc(m.title)}<small>${esc(m.desc)}</small><em style="--k:${k}"></em></span><b>${progText(m.goal, MS_.prog)}<br>+${m.koin} 🪙</b></div>`; }
    else h += `<div class="mrow lock"><span>🔒 ???</span><b>+${m.koin} 🪙</b></div>`;
  });
  if (MS_.main >= MAIN_MISSIONS.list.length) h += '<p>🎉 Bab ini tamat! Misi baru datang bersama episode berikutnya.</p>';
  h += `<h4>Misi Harian · berganti setiap hari</h4>`;
  for (const d of STATS.daily.list) { const def = dailyDef(d.id); if (!def) continue; const k = Math.min(1, d.p / need(def.goal));
    h += `<div class="mrow ${d.done ? 'done' : 'cur'}"><span>${d.done ? '✅' : '⭐'} ${esc(def.title)}<em style="--k:${k}"></em></span><b>${progText(def.goal, d)}<br>+${def.koin} 🪙</b></div>`; }
  h += `<div class="mrow ${STATS.daily.bonus ? 'done' : ''}"><span>🌟 Bonus semua misi harian</span><b>+${DAILY_BONUS} 🪙</b></div>`;
  h += `<h4>Kerja Sambilan · bisa diulang</h4>`;
  const giver = { panen: 'Pedagang Sayur (pasar)', angkut: 'Penambang (Tambang Gold)', pakan: 'Penjaga Safari' };
  for (const [id, j] of Object.entries(JOBS)) { const cd = Math.max(0, Math.ceil(((MS_.jobCd[id] || 0) - Date.now()) / 1000));
    h += `<div class="mrow"><span>${j.em} ${esc(j.name)}<small>${esc(j.desc)} · ${j.time} detik · tanya ${giver[id] || ''}${cd ? ` · istirahat ${cd} dtk` : ''}</small></span><b>+${j.koin} 🪙</b></div>`; }
  h += `<h4>Lencana</h4><div class="grid">`;
  for (const m of MAIN_MISSIONS.list.filter((x) => x.badge)) { const own = MS_.badges.includes(m.badge[0]);
    h += own ? `<div class="tcard"><b>${m.badge[1]} ${esc(m.badge[2])}</b><small>${esc(m.title)}</small></div>` : `<div class="tcard locked"><b>???</b><small>Selesaikan misi utama</small></div>`; }
  return h + `</div><div class="statrow" style="margin-top:10px"><span>💪 Kerja sambilan selesai</span><b>${MS_.jobs}</b></div>`;
}

// ------------------------------------------------------------------ peta kecil & info bangunan
const mini = $('#mini'), mctx = mini.getContext('2d');
const MS = 260 / 72, mx = (x) => 130 + (x - P.x) * MS, my = (y) => 130 - (y - P.y) * MS;
function drawMini() {
  mctx.clearRect(0, 0, 260, 260); mctx.save(); mctx.beginPath(); mctx.arc(130, 130, 130, 0, Math.PI * 2); mctx.clip();
  mctx.fillStyle = '#8fd06b'; mctx.fillRect(0, 0, 260, 260);
  mctx.strokeStyle = '#4aa8e0'; mctx.lineWidth = 3.2 * MS; mctx.beginPath();
  { const y0 = Math.max(-40, Math.ceil(RIVER_END)); for (let y = y0; y <= 60; y += 2) { const X = mx(riverX(y)), Y = my(y); y === y0 ? mctx.moveTo(X, Y) : mctx.lineTo(X, Y); } } mctx.stroke();
  mctx.strokeStyle = '#e8d6a8'; mctx.lineCap = 'round';
  for (const [a, b, w] of ROADS) { mctx.lineWidth = w * MS; mctx.beginPath(); mctx.moveTo(mx(a[0]), my(a[1])); mctx.lineTo(mx(b[0]), my(b[1])); mctx.stroke(); }
  mctx.fillStyle = '#e07a5f';
  for (const o of COLL) if (o.c.b && (o.c.b[1] - o.c.b[0]) > 1.2) { mctx.fillStyle = o.k ? extraColor(o.k) : '#e07a5f'; if (!mctx.fillStyle || (o.k && !extraColor(o.k))) continue; const s = Math.max(2.5, (o.c.b[1] - o.c.b[0]) * MS * 0.7); mctx.fillRect(mx(o.x) - s / 2, my(o.y) - s / 2, s, s); }
  mctx.fillStyle = '#ffd84a';
  for (const lb of LABELS) { mctx.beginPath(); mctx.arc(mx(lb.x), my(lb.y), 5, 0, 7); mctx.fill(); }
  mctx.strokeStyle = 'rgba(120,70,20,0.8)'; mctx.lineWidth = 2; mctx.beginPath(); mctx.arc(mx(FC[0]), my(FC[1]), L.fence.r * MS, 0, 7); mctx.stroke();
  for (const [x, y, kd] of MARKS) { const X = THREE.MathUtils.clamp(mx(x), 8, 252), Y = THREE.MathUtils.clamp(my(y), 8, 252); mctx.fillStyle = MARK_COL[kd] || '#ff5a3a'; mctx.strokeStyle = '#fff'; mctx.lineWidth = 3; mctx.beginPath(); mctx.arc(X, Y, 8, 0, 7); mctx.fill(); mctx.stroke(); }
  mctx.restore();
  mctx.save(); mctx.translate(130, 130); mctx.rotate(-P.face + Math.PI);
  mctx.fillStyle = '#2f7cff'; mctx.strokeStyle = '#fff'; mctx.lineWidth = 3; mctx.beginPath(); mctx.moveTo(0, -13); mctx.lineTo(9, 9); mctx.lineTo(0, 4); mctx.lineTo(-9, 9); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.restore();
}
const BIG = { stadion: 9, tambang: 7, markas: 6, wisata: 7, teknologi: 6, hotel: 6, kantor_polisi: 5.5, balai_kota: 5.5, taman_safari: 9, pasar: 5, sawah: 6, waduk: 6, bendungan: 5, pembangkit: 5, kios_roti: 2, kios_seblak: 2, kios_padang: 2 };
const infoEl = $('#info'), POI = Object.entries({ ...L.old, ...L.new }).filter(([k]) => INFO[k]);
let infoKey = null;
function updateInfo() {
  let best = null, bd = 1e9;
  if (!talking && FISHING.state === 'idle') for (const [k, v] of POI) { const d = Math.hypot(P.x - v[0], P.y - v[1]) - (BIG[k] || 4); if (d < 0 && d < bd) { bd = d; best = k; } }
  if (best !== infoKey) {
    infoKey = best;
    if (best) { infoEl.querySelector('h3').textContent = INFO[best][0]; infoEl.querySelector('p').textContent = INFO[best][1]; infoEl.classList.add('on'); }
    else infoEl.classList.remove('on');
  }
}

// ------------------------------------------------------------------ air & tanah
const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0);
const waterDepth = (x, y) => y <= RIVER_END ? 0 : Math.max(0, Math.min(1, (1.6 - Math.abs(x - riverX(y))) / 0.7)) * 0.24;
function groundAt(x, y) {
  if (BRIDGES.some((b) => Math.abs(x - b.x) < 3.5 && Math.abs(y - b.y) < 1.6)) {
    ray.set(B2T(x, y, 5), down); const hit = ray.intersectObjects(bridgeMeshes, false)[0];
    if (hit && hit.point.y > 0.05) return hit.point.y;
  }
  return -waterDepth(x, y);
}
const ripple = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.62, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false }));
ripple.rotation.x = -Math.PI / 2; ripple.visible = false; scene.add(ripple);
const dropMat = new THREE.MeshBasicMaterial({ color: 0xe8f6ff }), dropGeo = new THREE.IcosahedronGeometry(0.06, 0), drops = [];
function splashAt(x, y, n = 14) {
  sfx('splash', 0.55, 0.9 + Math.random() * 0.2);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(dropGeo, dropMat), a = Math.random() * 6.28, sp = 1 + Math.random() * 1.6;
    m.position.copy(B2T(x, y, 0.1)); scene.add(m);
    drops.push({ m, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: 2.5 + Math.random() * 2, life: 0.9 });
  }
}

// ------------------------------------------------------------------ kamera
let camCur = 7.5;
const BOXES = L.items.filter((it) => it.c && it.c.b && it.h > 0.9).map((it) => ({ x: it.p[0], y: it.p[1], cos: Math.cos(-it.r), sin: Math.sin(-it.r), b: it.c.b, h: it.h }));
for (const it of L.items) if (/^(pine|round)/.test(it.a) && it.h) { const r = 0.85 * it.s[0]; BOXES.push({ x: it.p[0], y: it.p[1], cos: 1, sin: 0, b: [-r, r, -r, r], h: it.h }); }
BOXES.push({ x: GATE.x, y: GATE.y + 0.4, cos: 1, sin: 0, b: [-GATE.half - 0.4, GATE.half + 0.4, -0.3, 0.3], h: 4.6, gate: true });
for (const e of EXTRA) if (e.h > 0.9 && e.k !== 'waduk') BOXES.push({ x: e.p[0], y: e.p[1], cos: Math.cos(-e.r), sin: Math.sin(-e.r), b: e.b, h: e.h });
function camBlocked(target, dist) {
  const tx = target.x, ty = -target.z, tz = target.y;
  const dx = Math.sin(camYaw) * Math.cos(camPitch), dy = -Math.cos(camYaw) * Math.cos(camPitch), dz = Math.sin(camPitch);
  const nearB = BOXES.filter((o) => Math.hypot(o.x - tx, o.y - ty) < dist + 8);
  for (let s = 0.6; s <= dist; s += 0.2) {
    const x = tx + dx * s, y = ty + dy * s, z = tz + dz * s;
    for (const o of nearB) {
      if (z > o.h + 0.2 || (o.gate && z < 3.0 && Math.abs(x - o.x) < GATE.half - 0.4)) continue;
      const lx = (x - o.x) * o.cos - (y - o.y) * o.sin, ly = (x - o.x) * o.sin + (y - o.y) * o.cos, m = 0.25;
      if (lx > o.b[0] - m && lx < o.b[1] + m && ly > o.b[2] - m && ly < o.b[3] + m) return Math.max(1.6, s - 0.35);
    }
  }
  return dist;
}
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 68 : 55; camera.updateProjectionMatrix(); if (bm.el.classList.contains('on')) drawMap(); }
addEventListener('resize', resize); resize();

// ------------------------------------------------------------------ loop
const clock = new THREE.Clock(); let walkPh = 0, stepPh = 0, miniT = 0, saveT = 0, gZ = 0, simT = 0, wasWet = false;
const camPos = new THREE.Vector3(), look = new THREE.Vector3();
function tick() { frame(Math.min(clock.getDelta(), 0.05)); requestAnimationFrame(tick); }
function frame(dt) {
  const t = (simT += dt);
  keyWatchdog();
  const lock = (ui() || !!JOB.act) && !CAP.input;
  const ix = CAP.input ? CAP.input.x : lock ? 0 : (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
  const iy = CAP.input ? CAP.input.y : lock ? 0 : (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - joy.y;
  const mag = Math.min(1, Math.hypot(ix, iy)), moving = mag > 0.08;
  if (moving && FISHING.state !== 'idle' && FISHING.state !== 'reel') stopFishing();
  const wet = gZ < -0.08 && P.z < 0.05;
  if (moving) {
    const run = (CAP.input ? (CAP.input.run || 1) : keys.ShiftLeft || keys.ShiftRight ? 1.6 : 1) * (BOOST.t > 0 ? BOOST.k : 1), swimK = 1 - 0.5 * Math.min(1, Math.max(0, -gZ) / 0.2), sp = 4.2 * mag * run * swimK / Math.max(1, Math.hypot(ix, iy));
    const sy = Math.sin(camYaw), cy = Math.cos(camYaw);
    const vx = (-sy * iy + cy * ix) * sp, vy = (cy * iy + sy * ix) * sp, ox = P.x, oy = P.y;
    [P.x, P.y] = collide(P.x + vx * dt, P.y + vy * dt, PR);
    STATS.dist += Math.hypot(P.x - ox, P.y - oy);
    let df = Math.atan2(vx, -vy) - P.face; df = Math.atan2(Math.sin(df), Math.cos(df)); P.face += df * Math.min(1, dt * 12);
    walkPh += dt * 11 * mag * run; stepPh += dt * 11 * mag * run;
    if (stepPh > Math.PI) { stepPh -= Math.PI; if (P.z < 0.02) wet ? sfx('splash', 0.12, 1.3 + Math.random() * 0.3) : sfx('step', 0.35, 0.9 + Math.random() * 0.25); }
  } else walkPh *= 0.9;
  if (!lock) STATS.time += dt;
  updateBoost(dt); updateMissions(dt);
  gZ = THREE.MathUtils.lerp(gZ, groundAt(P.x, P.y), Math.min(1, dt * 14));
  const wasAir = P.z > 0.05;
  P.vz -= 12 * dt; P.z = Math.max(0, P.z + P.vz * dt); if (P.z === 0) P.vz = Math.max(0, P.vz);
  const wetNow = gZ < -0.08 && P.z < 0.05;
  if ((wetNow && !wasWet) || (wetNow && wasAir)) splashAt(P.x, P.y); wasWet = wetNow;
  const bob = wetNow ? Math.sin(t * 3) * 0.04 : Math.abs(Math.sin(walkPh)) * 0.16 * (moving ? 1 : 0);
  const sq = wetNow ? 1 : 1 + Math.sin(walkPh * 2) * 0.05 * (moving ? 1 : 0);
  ripple.visible = gZ < -0.05; ripple.position.copy(B2T(P.x, P.y, 0.045)); ripple.scale.setScalar(1 + Math.sin(t * 4) * 0.08 + (moving ? 0.15 : 0));
  ripple.material.opacity = 0.35 + 0.25 * Math.sin(t * 4 + 1);
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i]; d.life -= dt; d.vy -= 9 * dt;
    d.m.position.x += d.vx * dt; d.m.position.z += d.vz * dt; d.m.position.y += d.vy * dt;
    if (d.life <= 0 || d.m.position.y < 0) { scene.remove(d.m); drops.splice(i, 1); }
  }
  body.position.copy(B2T(P.x, P.y, gZ + P.z + bob)); body.rotation.y = P.face;
  // efek ganti karakter: yang lama berputar mengecil, yang baru muncul membal sambil berputar
  if (oldAv) { oldT += dt; const k = Math.min(1, oldT / 0.2); oldAv.scale.setScalar(Math.max(0.001, 1 - k)); oldAv.rotation.y = k * 6; if (k >= 1) { body.remove(oldAv); oldAv = null; } }
  if (charAnim < 1) { charAnim = Math.min(1, charAnim + dt / 0.5); const k = Math.max(0, (charAnim - 0.2) / 0.8), e = Math.max(0.001, k <= 0 ? 0 : easeOutBack(k)); avatar.scale.set(e / Math.sqrt(sq), e * sq, e / Math.sqrt(sq)); avatar.rotation.y = (1 - k) * Math.PI * 2; }
  else { avatar.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); avatar.rotation.y = 0; }
  if (JOB.act) { const w = JOB.act.t; avatar.rotation.z = Math.sin(w * 14) * 0.12; avatar.rotation.x = 0.18 + Math.sin(w * 7) * 0.12; avatar.position.y = Math.abs(Math.sin(w * 9)) * 0.06; }
  else if (avatar.rotation.z || avatar.rotation.x) { avatar.rotation.z = 0; avatar.rotation.x = 0; avatar.position.y = 0; }
  if (slimeNPC.g.visible) slimeNPC.g.position.y = Math.abs(Math.sin(t * 2.2)) * 0.05;
  for (const n of NPC) {
    n.t += n.sp * dt * n.dir; if (n.t > 1) { n.t = 1; n.dir = -1; } else if (n.t < 0) { n.t = 0; n.dir = 1; }
    const { a, b } = n.lane, x = a[0] + (b[0] - a[0]) * n.t, y = a[1] + (b[1] - a[1]) * n.t;
    const close = Math.hypot(x - P.x, y - P.y) < 1.2;
    if (close) n.t -= n.sp * dt * n.dir;
    n.h.position.copy(B2T(x, y, close ? 0 : Math.abs(Math.sin(t * 7 + n.ph)) * 0.05));
    n.h.rotation.y = Math.atan2((b[0] - a[0]) * n.dir, -(b[1] - a[1]) * n.dir);
  }
  for (const c of CATS) { c.body.scale.y = 1 + Math.sin(t * 2.2 + c.ph) * 0.03; c.tail.rotation.y = Math.sin(t * 1.6 + c.ph) * 0.5; }
  // lingkungan
  dayT += dt; const nT = nightAt(dayT); nCur += (nT - nCur) * Math.min(1, dt * 2.5);
  autoWeather(dt); WX.wet += (WTARGET[WX.cur] - WX.wet) * Math.min(1, dt * 0.6);
  applyEnv(nCur, WX.wet); updateEgg(dt, nCur);
  updateRain(dt, WX.wet); updateRiverLife(dt); updateBirds(t, nCur < 0.4 && WX.wet < 0.5); updateFlies(t, Math.max(0, nCur * 1.2 - 0.2) * (1 - WX.wet)); updateFX(dt);
  // kamera
  const target = B2T(P.x, P.y, gZ + 0.7);
  const want = camBlocked(target, camDist);
  camCur = want < camCur ? THREE.MathUtils.lerp(camCur, want, Math.min(1, dt * 20)) : THREE.MathUtils.lerp(camCur, want, Math.min(1, dt * 3));
  camPos.set(target.x + Math.sin(camYaw) * Math.cos(camPitch) * camCur, target.y + Math.sin(camPitch) * camCur, target.z + Math.cos(camYaw) * Math.cos(camPitch) * camCur);
  camera.position.lerp(camPos, Math.min(1, dt * 8)); look.lerp(target, Math.min(1, dt * 10)); camera.lookAt(look);
  if (CAP.cam) { camera.position.copy(B2T(...CAP.cam.pos)); camera.lookAt(B2T(...CAP.cam.look)); if (CAP.cam.fov) { camera.fov = CAP.cam.fov; camera.updateProjectionMatrix(); } }
  sun.position.copy(target).add(nCur > 0.5 ? MOON_OFF : SUN_OFF); sun.target.position.copy(target);
  updateFishing(dt, t); updateNear(dt);
  if (toastT > 0 && (toastT -= dt) <= 0) $('#toast').classList.remove('on');
  if ((miniT += dt) > 0.1) { miniT = 0; drawMini(); updateInfo(); }
  if ((saveT += dt) > 5) { saveT = 0; saveStats(); }
  renderer.render(scene, camera);
}

// ------------------------------------------------------------------ mulai: pilih karakter
setCharacter(charId); makeNameTag(); applyGfx();
setWeather(SET.weather, false);
look.copy(B2T(P.x, P.y, 0.7));
camera.position.copy(B2T(P.x, P.y - 30, 18));
lp.textContent = 'Pilih karakter untuk mulai jalan-jalan:';
$('#load .bar').style.display = 'none';
const pick = $('#pick'), pics = portraits();
for (const c of CHARS) {
  const b = document.createElement('button'); b.innerHTML = `<img src="${pics[c.id]}" alt="">${c.name}`;
  b.onclick = () => { setCharacter(c.id); initAudio(); const l = $('#load'); l.style.opacity = 0; l.style.pointerEvents = 'none'; setTimeout(() => l.remove(), 500); };
  pick.appendChild(b);
}
pick.style.display = 'flex';
addEventListener('beforeunload', saveStats);
if (DEV) window.__game = { startJob, ev, JOB, SND, STATS, SPOTS, CATS, FISHING, WX, renderer, P, scene, camera, keys, frame, doAction, startFishing, reel, takePhoto, toggleNight, setWeather, setCharacter, openMenu, openMap, egg, get dayT() { return dayT; }, set dayT(v) { dayT = v; }, cam: (y, p, d) => { camYaw = y ?? camYaw; camPitch = p ?? camPitch; camDist = d ?? camDist; } };
if (CAPTURE) {
  // mode rekam: tanpa layar pilih karakter & tanpa loop otomatis; skrip luar memanggil __game.frame(dt)
  setCharacter('slime'); $('#load').remove(); setWeather('cerah', false); applyGfx();
  Object.assign(window.__game || {}, { CAP, FISHING, CATS, SPOTS, talk, choose, dialogConfirm, endTalk, TALKERS, setCharacter, startFishing, reel, takePhoto, setWeather, WX, camState: () => ({ camYaw, camPitch, camDist }), get talking() { return talking; }, get charId() { return charId; } });
  window.__ready = true;
} else tick();

