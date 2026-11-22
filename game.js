// Dunia Impianmu: jalan-jalan di negeri (prototipe). Koordinat data = Blender (x, y, z-atas) -> three (x, z, -y).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const $ = (s) => document.querySelector(s);
const touch = matchMedia('(pointer: coarse)').matches;
if (touch) document.body.classList.add('touch');

// ------------------------------------------------------------------ renderer & scene
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe6ff, 70, 190);
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 600);

// langit gradasi (seperti di Blender)
{
  const g = new THREE.SphereGeometry(450, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#6fb6ff') }, bot: { value: new THREE.Color('#fff1d6') } },
    vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying float h; void main(){ gl_FragColor = vec4(mix(bot, top, smoothstep(-0.05, 0.45, h)), 1.); }',
  });
  const sky = new THREE.Mesh(g, m); sky.renderOrder = -1; scene.add(sky);
}
const hemi = new THREE.HemisphereLight(0xe4f1ff, 0x7fb860, 1.6); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 2.4); sun.castShadow = true;
sun.shadow.mapSize.set(touch ? 1024 : 2048, touch ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);
const SUN_OFF = new THREE.Vector3(14, 30, 18);

const B2T = (x, y, z = 0) => new THREE.Vector3(x, z, -y);

// ------------------------------------------------------------------ data
const INFO = {
  balai_kota: ['BALAI KOTA', 'Janji Day 3 ditepati: berdiri di Day 4 (-150 Gold)'],
  tambang: ['TAMBANG GOLD', 'Permintaan @huda_laper_buk & @lilisrahmawati1838 · bonus 1000 Gold!'],
  markas: ['MARKAS MILITER', 'Permintaan agil k 2 · biar negeri selalu aman'],
  kedai_es: ['KEDAI ES KRIM', 'Tukang es krimnya: PP Ramadhan 2027'],
  minimarket: ['MINIMARKET', 'Gagal di Day 3, akhirnya berdiri di Day 4'],
  hotel: ['HOTEL', 'Dibangun di Day 4 (-200 Gold)'],
  kantor_polisi: ['KANTOR POLISI', 'Dibangun di Day 4 (-180 Gold)'],
  stadion: ['STADION', 'Bangunan termahal Day 4 (-500 Gold)'],
  wisata: ['TEMPAT WISATA', 'Dibangun di Day 4 (-100 Gold)'],
  teknologi: ['PUSAT TEKNOLOGI', 'Teknologi modern negeri (-80 Gold)'],
  sekolah: ['SEKOLAH', 'Kepala Sekolah: $Wan$'],
  gudang: ['GUDANG GOLD', 'Kas negeri, tempat semua Gold disimpan'],
  rumah_ucil: ['RUMAH UCIL', 'Rumah sahabat Slime'],
  rumah_ucup: ['RUMAH UCUP', 'Rumah sahabat Slime'],
  pos_ronda: ['POS RONDA', 'Penjaga malam negeri'],
  rumah_sakit: ['RUMAH SAKIT', 'Tempat warga berobat'],
  pos_damkar: ['POS DAMKAR', 'Siap memadamkan api'],
  warkop: ['WARKOP', 'Permintaan deeeaaaa28'],
  ladang: ['LADANG', 'Permintaan CAT LOVERSS'],
  ladang2: ['LADANG', 'Permintaan CAT LOVERSS'],
  kolam_lele: ['KOLAM LELE', 'Permintaan darkness'],
};
const BIG = { stadion: 9, tambang: 7, markas: 6, wisata: 7, teknologi: 6, hotel: 6, kantor_polisi: 5.5, balai_kota: 5.5 };

// ------------------------------------------------------------------ loading
const bar = $('#load .bar i'), lp = $('#lp');
const manager = new THREE.LoadingManager();
manager.onProgress = (_u, a, b) => { bar.style.width = `${Math.round((a / b) * 100)}%`; };
const loader = new GLTFLoader(manager);
const loadGLB = (u) => new Promise((res, rej) => loader.load(u, res, undefined, rej));

const L = await (await fetch('./layout.json')).json();
L.items = L.items.filter((it) => Math.min(...it.s) > 0.02);   // buang benda yang sudah 'tenggelam' (pagar lama Day 3)
const names = [...new Set([...L.assets, 'slime'])];
const [terrain, ...glbs] = await Promise.all([loadGLB('./terrain.glb'), ...names.map((n) => loadGLB(`./assets/${n}.glb`))]);
const ASSET = Object.fromEntries(names.map((n, i) => [n, glbs[i]]));

// tanah & benda prosedural
// ------------------------------------------------------------------ penggabung: banyak bagian berwarna polos -> 1 geometri berwarna-verteks
const VC_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 });
const special = (m) => m.transparent || m.opacity < 1 || m.map || (m.emissive && m.emissive.getHex() !== 0 && (m.emissiveIntensity ?? 1) > 0);
function prep(geo, m4, color) {
  let g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  if (!g.attributes.normal) g.computeVertexNormals();
  g.applyMatrix4(m4);
  if (color) { const n = g.attributes.position.count, c = new Float32Array(n * 3); for (let i = 0; i < n; i++) { c[i * 3] = color.r; c[i * 3 + 1] = color.g; c[i * 3 + 2] = color.b; } g.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
  return g;
}
// parts: [{geo, mat, m}] -> [{geo, mat}] (satu untuk semua bagian polos + satu per material khusus)
function mergeParts(list, vcMat = VC_MAT) {
  const plain = [], spec = new Map();
  for (const p of list) {
    if (special(p.mat)) { if (!spec.has(p.mat)) spec.set(p.mat, []); spec.get(p.mat).push(prep(p.geo, p.m)); }
    else plain.push(prep(p.geo, p.m, p.mat.color || new THREE.Color(1, 1, 1)));
  }
  const out = [];
  if (plain.length) out.push({ geo: mergeGeometries(plain), mat: vcMat });
  for (const [mat, gs] of spec) out.push({ geo: mergeGeometries(gs), mat });
  return out;
}

// tanah & benda prosedural: digabung jadi beberapa mesh saja
{
  terrain.scene.updateMatrixWorld(true);
  const flat = [], tall = [];
  terrain.scene.traverse((o) => { if (o.isMesh) (/ground|tepi|air|road|disc|zb|Sphere|Icosphere|cloud|riak/.test(o.name + (o.parent?.name || '')) ? flat : tall).push({ geo: o.geometry, mat: o.material, m: o.matrixWorld }); });
  const VC2 = VC_MAT.clone(); VC2.side = THREE.DoubleSide;
  for (const [list, cast] of [[flat, false], [tall, true]]) for (const { geo, mat } of mergeParts(list, VC2)) {
    if (mat !== VC2) mat.side = THREE.DoubleSide;
    const me = new THREE.Mesh(geo, mat); me.receiveShadow = true; me.castShadow = cast; scene.add(me);
  }
}

// ------------------------------------------------------------------ model -> InstancedMesh (satu draw call per bagian model)
function rootOf(gltf) { const r = gltf.scene.children.length === 1 ? gltf.scene.children[0] : gltf.scene; gltf.scene.updateMatrixWorld(true); return r; }
function parts(gltf) {
  const root = rootOf(gltf), inv = root.matrixWorld.clone().invert(), out = [];
  root.traverse((o) => { if (o.isMesh) out.push({ geo: o.geometry, mat: o.material, m: inv.clone().multiply(o.matrixWorld) }); });
  return out;
}
function placeMatrix(it) {
  const p = B2T(it.p[0], it.p[1], it.p[2]);
  return new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.r), new THREE.Vector3(it.s[0], it.s[2], it.s[1]));
}
const byAsset = {};
for (const it of L.items) (byAsset[it.a] ??= []).push(it);
const bridgeMeshes = [];
for (const [name, list] of Object.entries(byAsset)) {
  const small = list.length > 0 && /^(pot|tong|hydrant|kotak_pos|rambu|lampu|bangku)/.test(name);
  for (const pt of mergeParts(parts(ASSET[name]))) {
    const im = new THREE.InstancedMesh(pt.geo, pt.mat, list.length);
    list.forEach((it, i) => im.setMatrixAt(i, placeMatrix(it)));
    im.castShadow = !small || !touch; im.receiveShadow = true; im.computeBoundingSphere(); scene.add(im);
    if (name === 'jembatan') bridgeMeshes.push(im);
  }
}

// ------------------------------------------------------------------ rumput & bunga (dibuat di sini, bukan diunduh)
const ROADS = L.roads;
const segDist = (px, py, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l2));
  return Math.hypot(px - a[0] - dx * t, py - a[1] - dy * t);
};
const onRoad = (x, y, pad = 0) => ROADS.some(([a, b, w]) => segDist(x, y, a, b) < w / 2 + pad);
const riverX = (y) => -21 + 1.6 * Math.sin(y / 7);
const inRiver = (x, y, pad = 0) => Math.abs(x - riverX(y)) < 1.6 + pad;
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
function scatter(n, geo, color, yOff, avoid) {
  const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 1 }), n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  let k = 0;
  for (let i = 0; i < n * 3 && k < n; i++) {
    const x = -40 + rnd() * 80, y = -32 + rnd() * 82;
    if (avoid(x, y)) continue;
    const sc = 0.6 + rnd() * 0.7; s.set(sc, sc, sc); q.setFromAxisAngle(up, rnd() * 6.3);
    m.compose(B2T(x, y, yOff * sc), q, s); im.setMatrixAt(k++, m);
  }
  im.count = k; im.receiveShadow = true; im.computeBoundingSphere(); scene.add(im);
}
const avoidG = (x, y) => onRoad(x, y, 0.05) || inRiver(x, y, 1.0) || x * x + (y - 0.4) ** 2 < 6;
const cone = new THREE.ConeGeometry(0.045, 0.24, 3);
scatter(touch ? 9000 : 16000, cone, '#6fbf4f', 0.12, avoidG);
scatter(touch ? 5000 : 9000, cone, '#86d663', 0.12, avoidG);
const ball = new THREE.IcosahedronGeometry(0.05, 0);
scatter(450, ball, '#ffe066', 0.05, avoidG); scatter(450, ball, '#ff9ec4', 0.05, avoidG);

// ------------------------------------------------------------------ tabrakan (bidang XY Blender)
const COLL = L.items.filter((it) => it.c).map((it) => ({ x: it.p[0], y: it.p[1], r: it.r, c: it.c, cos: Math.cos(-it.r), sin: Math.sin(-it.r) }));
const BRIDGES = L.items.filter((it) => it.a === 'jembatan').map((it) => ({ x: it.p[0], y: it.p[1] }));
const FC = L.fence.c, FR = L.fence.r - 0.9;
function collide(px, py, R) {
  for (let pass = 0; pass < 2; pass++) {
    for (const o of COLL) {
      const dx = px - o.x, dy = py - o.y;
      if (dx * dx + dy * dy > 400) continue;
      if (o.c.r !== undefined) {
        const d = Math.hypot(dx, dy), m = o.c.r + R;
        if (d < m && d > 1e-6) { px = o.x + (dx / d) * m; py = o.y + (dy / d) * m; }
        continue;
      }
      const lx = dx * o.cos - dy * o.sin, ly = dx * o.sin + dy * o.cos, [x0, x1, y0, y1] = o.c.b;
      const cx = Math.max(x0, Math.min(x1, lx)), cy = Math.max(y0, Math.min(y1, ly));
      let ex = lx - cx, ey = ly - cy, d = Math.hypot(ex, ey);
      if (d >= R) continue;
      let nx, ny;
      if (d < 1e-6) { // di dalam kotak: dorong ke sisi terdekat
        const opts = [[lx - x0, -1, 0], [x1 - lx, 1, 0], [ly - y0, 0, -1], [y1 - ly, 0, 1]].sort((a, b) => a[0] - b[0])[0];
        nx = opts[1]; ny = opts[2]; d = -opts[0];
      } else { nx = ex / d; ny = ey / d; }
      const push = R - d, qx = lx + nx * push, qy = ly + ny * push;
      // balik ke dunia (rotasi +r)
      const c = Math.cos(o.r), s = Math.sin(o.r);
      px = o.x + qx * c - qy * s; py = o.y + qx * s + qy * c;
    }
  }
  // sungai: hanya bisa lewat jembatan
  if (inRiver(px, py, R * 0.6) && !BRIDGES.some((b) => Math.abs(py - b.y) < 1.0)) {
    const rx = riverX(py), side = px < rx ? -1 : 1; px = rx + side * (1.6 + R * 0.6 + 0.01);
  }
  // pagar negeri
  const fx = px - FC[0], fy = py - FC[1], fd = Math.hypot(fx, fy);
  if (fd > FR) { px = FC[0] + (fx / fd) * FR; py = FC[1] + (fy / fd) * FR; }
  return [px, py];
}

// ------------------------------------------------------------------ pemain: Slime
const slime = rootOf(ASSET.slime).clone(true);
slime.position.set(0, 0, 0); slime.rotation.set(0, 0, 0); slime.scale.setScalar(1);
slime.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
const body = new THREE.Group(); body.add(slime); scene.add(body);
const sbox = new THREE.Box3().setFromObject(slime), ssize = sbox.getSize(new THREE.Vector3());
const PR = Math.max(ssize.x, ssize.z) * 0.42;
const P = { x: 0, y: -1.2, vz: 0, z: 0, yaw: Math.PI, face: Math.PI };   // posisi Blender, mulai di alun-alun

// ------------------------------------------------------------------ warga berjalan (NPC)
const wargaNames = names.filter((n) => /^warga/.test(n));
const lanes = [];
for (const [a, b, w] of ROADS) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]); if (len < 4) continue;
  const dx = (b[0] - a[0]) / len, dy = (b[1] - a[1]) / len, nx = -dy, ny = dx, off = w / 2 - 0.25;
  for (const s of [1, -1]) lanes.push({ a: [a[0] + dx * 1.2 + nx * s * off, a[1] + dy * 1.2 + ny * s * off], b: [b[0] - dx * 1.2 + nx * s * off, b[1] - dy * 1.2 + ny * s * off], len: len - 2.4 });
}
const NPC = [], MERGED = {};
for (let i = 0; i < (touch ? 18 : 30); i++) {
  const lane = lanes[Math.floor(rnd() * lanes.length)], n = wargaNames[i % wargaNames.length];
  const h = new THREE.Group(); scene.add(h);
  for (const { geo, mat } of (MERGED[n] ??= mergeParts(parts(ASSET[n])))) { const me = new THREE.Mesh(geo, mat); me.castShadow = true; h.add(me); }
  NPC.push({ h, lane, t: rnd(), dir: rnd() < 0.5 ? 1 : -1, sp: (0.8 + rnd() * 0.5) / lane.len, ph: rnd() * 6 });
}

// ------------------------------------------------------------------ input
// Tombol bisa "nyangkut" kalau browser tidak mengirim keyup (fokus pindah, Alt, klik di luar).
// Pengaman: (1) lepas semua saat fokus hilang, (2) lepas kalau sinyal "tahan" dari OS berhenti, (3) cocokkan kode & huruf.
const keys = {}, seen = {}, rep = {};
const KEYMAP = { w: 'KeyW', a: 'KeyA', s: 'KeyS', d: 'KeyD' };
const codeOf = (e) => KEYMAP[(e.key || '').toLowerCase()] || e.code;
addEventListener('keydown', (e) => {
  const c = codeOf(e); keys[c] = true; seen[c] = performance.now(); if (e.repeat) rep[c] = true;
  if (e.code === 'Space') { if (!e.repeat) jump(); e.preventDefault(); }
});
addEventListener('keyup', (e) => { for (const c of new Set([codeOf(e), e.code])) { keys[c] = false; rep[c] = false; } });
const releaseAll = () => { for (const c in keys) { keys[c] = false; rep[c] = false; } };
addEventListener('blur', releaseAll);
addEventListener('contextmenu', releaseAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
function keyWatchdog() {   // OS mengirim keydown berulang selama tombol ditahan; kalau berhenti > 0,6 dtk, anggap sudah dilepas
  const now = performance.now();
  for (const c in keys) if (keys[c] && rep[c] && now - seen[c] > 600) { keys[c] = false; rep[c] = false; }
}
let camYaw = 0, camPitch = 0.42, camDist = 7.5;
const joyEl = $('#joy'), knob = joyEl.querySelector('i');
const joy = { id: null, x0: 0, y0: 0, x: 0, y: 0 };
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
  if (drags.size === 2) {   // cubit = zoom
    const [p1, p2] = [...drags.values()], before = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    d.x = e.clientX; d.y = e.clientY; const after = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    camDist = THREE.MathUtils.clamp(camDist * (before / (after || 1)), 3.5, 18); return;
  }
  camYaw -= (e.clientX - d.x) * 0.006; camPitch = THREE.MathUtils.clamp(camPitch + (e.clientY - d.y) * 0.004, 0.08, 1.25);
  d.x = e.clientX; d.y = e.clientY;
});
const endPtr = (e) => { if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; joyEl.style.display = 'none'; } drags.delete(e.pointerId); };
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('wheel', (e) => { camDist = THREE.MathUtils.clamp(camDist * (1 + Math.sign(e.deltaY) * 0.1), 3.5, 18); }, { passive: true });
$('#jump').addEventListener('pointerdown', (e) => { e.stopPropagation(); jump(); });
function jump() { if (P.z <= 0.001) P.vz = 4.2; }
let helpHidden = false; function hideHelp() { if (!helpHidden) { helpHidden = true; setTimeout(() => ($('#help').style.opacity = 0), 4000); } }

// ------------------------------------------------------------------ peta kecil
const mini = $('#mini'), mctx = mini.getContext('2d');
const MS = 260 / 72, mx = (x) => 130 + (x - P.x) * MS, my = (y) => 130 - (y - P.y) * MS;
function drawMini() {
  mctx.clearRect(0, 0, 260, 260); mctx.save(); mctx.beginPath(); mctx.arc(130, 130, 130, 0, Math.PI * 2); mctx.clip();
  mctx.fillStyle = '#8fd06b'; mctx.fillRect(0, 0, 260, 260);
  mctx.strokeStyle = '#4aa8e0'; mctx.lineWidth = 3.2 * MS; mctx.beginPath();
  for (let y = -40; y <= 60; y += 2) { const X = mx(riverX(y)), Y = my(y); y === -40 ? mctx.moveTo(X, Y) : mctx.lineTo(X, Y); } mctx.stroke();
  mctx.strokeStyle = '#e8d6a8'; mctx.lineCap = 'round';
  for (const [a, b, w] of ROADS) { mctx.lineWidth = w * MS; mctx.beginPath(); mctx.moveTo(mx(a[0]), my(a[1])); mctx.lineTo(mx(b[0]), my(b[1])); mctx.stroke(); }
  mctx.fillStyle = '#e07a5f';
  for (const o of COLL) if (o.c.b && (o.c.b[1] - o.c.b[0]) > 1.2) { const s = Math.max(2.5, (o.c.b[1] - o.c.b[0]) * MS * 0.7); mctx.fillRect(mx(o.x) - s / 2, my(o.y) - s / 2, s, s); }
  mctx.fillStyle = '#ffd84a';
  for (const k of Object.keys(BIG)) { const v = L.new[k] || L.old[k]; if (v) { mctx.beginPath(); mctx.arc(mx(v[0]), my(v[1]), 6, 0, 7); mctx.fill(); } }
  mctx.strokeStyle = 'rgba(120,70,20,0.8)'; mctx.lineWidth = 2; mctx.beginPath(); mctx.arc(mx(FC[0]), my(FC[1]), L.fence.r * MS, 0, 7); mctx.stroke();
  mctx.restore();
  // pemain (panah sesuai arah hadap)
  mctx.save(); mctx.translate(130, 130); mctx.rotate(-P.face + Math.PI);
  mctx.fillStyle = '#2f7cff'; mctx.strokeStyle = '#fff'; mctx.lineWidth = 3; mctx.beginPath(); mctx.moveTo(0, -13); mctx.lineTo(9, 9); mctx.lineTo(0, 4); mctx.lineTo(-9, 9); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.restore();
}

// ------------------------------------------------------------------ info bangunan terdekat
const infoEl = $('#info'), POI = Object.entries({ ...L.old, ...L.new }).filter(([k]) => INFO[k]);
let infoKey = null;
function updateInfo() {
  let best = null, bd = 1e9;
  for (const [k, v] of POI) { const d = Math.hypot(P.x - v[0], P.y - v[1]) - (BIG[k] || 4); if (d < 0 && d < bd) { bd = d; best = k; } }
  if (best !== infoKey) {
    infoKey = best;
    if (best) { infoEl.querySelector('h3').textContent = INFO[best][0]; infoEl.querySelector('p').textContent = INFO[best][1]; infoEl.classList.add('on'); }
    else infoEl.classList.remove('on');
  }
}

// ------------------------------------------------------------------ loop
const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0);
function groundAt(x, y) {
  if (!BRIDGES.some((b) => Math.abs(x - b.x) < 3.5 && Math.abs(y - b.y) < 1.6)) return 0;
  ray.set(B2T(x, y, 5), down); const hit = ray.intersectObjects(bridgeMeshes, false)[0];
  return hit ? hit.point.y : 0;
}
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 68 : 55; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const clock = new THREE.Clock(); let walkPh = 0, miniT = 0, gZ = 0;
const camPos = new THREE.Vector3(), look = new THREE.Vector3();
let simT = 0;
function tick() { frame(Math.min(clock.getDelta(), 0.05)); requestAnimationFrame(tick); }
function frame(dt) {
  const t = (simT += dt);
  // arah gerak relatif kamera
  keyWatchdog();
  let ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
  let iy = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - joy.y;
  const mag = Math.min(1, Math.hypot(ix, iy));
  if (mag > 0.08) {
    const run = keys.ShiftLeft || keys.ShiftRight ? 1.6 : 1, sp = 4.2 * mag * run / Math.max(1, Math.hypot(ix, iy));
    const sy = Math.sin(camYaw), cy = Math.cos(camYaw);
    const vx = (-sy * iy + cy * ix) * sp, vy = (cy * iy + sy * ix) * sp;      // arah Blender: maju = menjauhi kamera
    [P.x, P.y] = collide(P.x + vx * dt, P.y + vy * dt, PR);
    let df = Math.atan2(vx, -vy) - P.face; df = Math.atan2(Math.sin(df), Math.cos(df)); P.face += df * Math.min(1, dt * 12);
    walkPh += dt * 11 * mag;
  } else walkPh *= 0.9;
  // lompat + tinggi tanah (jembatan)
  gZ = THREE.MathUtils.lerp(gZ, groundAt(P.x, P.y), Math.min(1, dt * 14));
  P.vz -= 12 * dt; P.z = Math.max(0, P.z + P.vz * dt); if (P.z === 0) P.vz = Math.max(0, P.vz);
  const bob = Math.abs(Math.sin(walkPh)) * 0.16 * (mag > 0.08 ? 1 : 0), sq = 1 + Math.sin(walkPh * 2) * 0.05 * (mag > 0.08 ? 1 : 0);
  body.position.copy(B2T(P.x, P.y, gZ + P.z + bob)); body.rotation.y = P.face; slime.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
  // NPC
  for (const n of NPC) {
    n.t += n.sp * dt * n.dir; if (n.t > 1) { n.t = 1; n.dir = -1; } else if (n.t < 0) { n.t = 0; n.dir = 1; }
    const { a, b } = n.lane, x = a[0] + (b[0] - a[0]) * n.t, y = a[1] + (b[1] - a[1]) * n.t;
    const near = Math.hypot(x - P.x, y - P.y) < 1.2;
    if (near) n.t -= n.sp * dt * n.dir;
    n.h.position.copy(B2T(x, y, near ? 0 : Math.abs(Math.sin(t * 7 + n.ph)) * 0.05));
    n.h.rotation.y = Math.atan2((b[0] - a[0]) * n.dir, -(b[1] - a[1]) * n.dir);
  }
  // kamera orbit mengikuti
  const target = B2T(P.x, P.y, gZ + 0.7);
  camPos.set(target.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist, target.y + Math.sin(camPitch) * camDist, target.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist);
  camera.position.lerp(camPos, Math.min(1, dt * 8)); look.lerp(target, Math.min(1, dt * 10)); camera.lookAt(look);
  sun.position.copy(target).add(SUN_OFF); sun.target.position.copy(target);
  if ((miniT += dt) > 0.1) { miniT = 0; drawMini(); updateInfo(); }
  renderer.render(scene, camera);
}
look.copy(B2T(P.x, P.y, 0.7));
camera.position.copy(B2T(P.x, P.y - 30, 18));
lp.textContent = 'Negeri siap dijelajahi!';
const go = $('#go'); go.style.display = 'block';
go.onclick = () => { $('#load').style.opacity = 0; setTimeout(() => $('#load').remove(), 500); };
window.__game = { renderer, P, scene, camera, keys, frame, cam: (y, p, d) => { camYaw = y ?? camYaw; camPitch = p ?? camPitch; camDist = d ?? camDist; } };
tick();
