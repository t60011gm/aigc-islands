/* 3D 群島世界：島嶼依週次排成蛇形航線（W01–W06 → W07–W12 → W13–W18），
   相鄰週次以木橋相連；港灣總部是出生點，以橋連到 W01。玩家以第三人稱視角自由行走。 */
(function () {
  const T = window.THREE;
  const R = 12, INR = R * Math.cos(Math.PI / 6), HUB_R = 14, HUB_INR = HUB_R * Math.cos(Math.PI / 6);
  const GAP = 44, ROW = 52, BRIDGE_HW = 1.9;
  const TERRAIN = { prompt: "#d4b45e", image: "#c46a3c", model: "#5e8a6f", data: "#7d879b", ethics: "#a3bb7f" };
  const COL = {
    navy: "#1f2a44", paper: "#f4f1ea", surface: "#fbfaf6", muted: "#5b6272", terracotta: "#c2602f",
    terracottaInk: "#9e4a20", earth: "#9a8466", sand: "#e3d3ad", sandDeep: "#bfae86", wood: "#a07850",
    woodDark: "#6b4f35", sea: "#2f5d7c", sky: "#d9e4e6", gold: "#f2c14e"
  };

  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer, scene, camera, sun, clock, data, cb = {};
  let player, rig = {}, mm, mmCtx;
  const islands = [];   // { key, x, z, inr, res, unit, build, fog, ring, label }
  const bridges = [];   // { ax, az, bx, bz }
  const keys = {}, joy = { x: 0, y: 0 };
  const pos = new T.Vector3();
  let yaw = -Math.PI / 2, pitch = 0.42, dist = 18;
  let vy = 0, heading = Math.PI / 2, walkPhase = 0, paused = false, currentKey, t = 0, frame = 0;
  let water, waterBase;

  function rng(seed) {
    return function () {
      seed = seed + 0x6D2B79F5 | 0;
      let x = Math.imul(seed ^ seed >>> 15, 1 | seed);
      x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
      return ((x ^ x >>> 14) >>> 0) / 4294967296;
    };
  }
  const mat = (color, extra) => new T.MeshLambertMaterial(Object.assign({ color, flatShading: true }, extra || {}));
  function mesh(geo, m, x, y, z, shadow) {
    const o = new T.Mesh(geo, m);
    o.position.set(x || 0, y || 0, z || 0);
    if (shadow !== false) { o.castShadow = true; o.receiveShadow = true; }
    return o;
  }
  function M4(x, y, z, sx, sy, sz, ry) {
    return new T.Matrix4().compose(new T.Vector3(x, y, z), new T.Quaternion().setFromEuler(new T.Euler(0, ry || 0, 0)), new T.Vector3(sx, sy, sz));
  }
  function inst(geo, m, list, colors) {
    const o = new T.InstancedMesh(geo, m, list.length);
    list.forEach((mx, i) => { o.setMatrixAt(i, mx); if (colors) o.setColorAt(i, new T.Color(colors[i])); });
    o.castShadow = true; o.receiveShadow = true;
    return o;
  }

  /* ---------- 版面 ---------- */
  function layout(units) {
    return units.map((u, i) => {
      const row = Math.floor(i / 6), col = i % 6;
      const c = row % 2 === 0 ? col : 5 - col;
      return { x: c * GAP + ((i * 53) % 5 - 2) * 1.4, z: row * ROW + ((i * 37) % 7 - 3) * 1.3 };
    });
  }

  /* ---------- 標籤 ---------- */
  function drawLabel(cv, info) {
    const g = cv.getContext("2d"), W = cv.width, H = cv.height;
    g.clearRect(0, 0, W, H);
    g.fillStyle = COL.surface; g.strokeStyle = COL.navy; g.lineWidth = 6;
    const r = 16;
    g.beginPath();
    g.moveTo(r + 3, 3); g.arcTo(W - 3, 3, W - 3, H - 3, r); g.arcTo(W - 3, H - 3, 3, H - 3, r);
    g.arcTo(3, H - 3, 3, 3, r); g.arcTo(3, 3, W - 3, 3, r); g.closePath(); g.fill(); g.stroke();
    if (info.res) { g.fillStyle = info.res; g.fillRect(3, 3, 18, H - 6); }
    g.textBaseline = "middle";
    g.fillStyle = COL.muted; g.font = '500 30px "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    g.fillText(info.eyebrow, 44, 50);
    g.fillStyle = COL.navy; g.font = '700 56px "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    g.fillText(info.title, 44, 114, info.num ? W - 190 : W - 70);
    if (info.num) {
      const cx = W - 84, cy = H / 2, hot = info.num === 6 || info.num === 8;
      g.beginPath(); g.arc(cx, cy, 56, 0, Math.PI * 2); g.fillStyle = COL.paper; g.fill();
      g.lineWidth = 4; g.strokeStyle = COL.navy; g.stroke();
      g.fillStyle = hot ? COL.terracottaInk : COL.navy;
      g.font = '700 54px "Noto Serif TC", "PMingLiU", serif'; g.textAlign = "center";
      g.fillText(String(info.num), cx, cy - 8);
      const n = 6 - Math.abs(7 - info.num);
      for (let k = 0; k < n; k++) { g.beginPath(); g.arc(cx + (k - (n - 1) / 2) * 12, cy + 32, 4, 0, Math.PI * 2); g.fill(); }
      g.textAlign = "left";
    }
  }
  function makeLabel(info, y) {
    const cv = document.createElement("canvas"); cv.width = 640; cv.height = 176;
    drawLabel(cv, info);
    const tex = new T.CanvasTexture(cv);
    tex.anisotropy = 4;
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true }));
    s.scale.set(12, 3.3, 1); s.position.set(0, y, -4);
    s.userData = { cv, info, tex };
    return s;
  }

  /* ---------- 島嶼 ---------- */
  const G = {};
  function geos() {
    G.wheat = new T.ConeGeometry(0.28, 1, 5);
    G.brick = new T.BoxGeometry(1.1, 0.5, 0.55);
    G.trunk = new T.CylinderGeometry(0.22, 0.32, 1.4, 5);
    G.leaf = new T.ConeGeometry(1.3, 3, 6);
    G.rock = new T.DodecahedronGeometry(1, 0);
    G.crystal = new T.OctahedronGeometry(0.45, 0);
    G.wool = new T.SphereGeometry(1, 7, 5);
    G.tuft = new T.ConeGeometry(0.18, 0.6, 4);
    G.plank = new T.BoxGeometry(BRIDGE_HW * 2, 0.22, 0.9);
    G.post = new T.CylinderGeometry(0.16, 0.16, 4.2, 5);
    G.fog = new T.SphereGeometry(1, 9, 7);
  }

  function spots(rand, n, rMin, rMax) {
    const out = [];
    let guard = 0;
    while (out.length < n && guard++ < n * 30) {
      const a = rand() * Math.PI * 2, r = rMin + rand() * (rMax - rMin);
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      if (Math.abs(x) < 3.2 && z < -1) continue;          // 課程石碑
      if (x > 1.5 && x < 7.5 && z > 0.5 && z < 7) continue; // 建築用地
      if (Math.abs(x) < 2.2 && z > 2 && z < 8) continue;    // 落腳點
      if (out.some(p => (p[0] - x) ** 2 + (p[1] - z) ** 2 < 2.2)) continue;
      out.push([x, z, rand()]);
    }
    return out;
  }

  function decorate(g, res, rand) {
    if (res === "prompt") {
      const s = spots(rand, 46, 3.5, INR - 1.2);
      g.add(inst(G.wheat, mat("#e3c46f"), s.map(([x, z, r]) => { const h = 1.1 + r * 0.9; return M4(x, h / 2, z, 1, h, 1); })));
    } else if (res === "image") {
      const list = [], cols = [];
      spots(rand, 8, 4, INR - 2).forEach(([x, z, r]) => {
        const layers = 2 + Math.floor(r * 4), ry = r * 3;
        for (let l = 0; l < layers; l++) for (let k = 0; k < 2; k++) {
          const off = (k - 0.5) * 0.58, rot = ry + (l % 2) * Math.PI / 2;
          list.push(M4(x + Math.sin(rot) * off, 0.25 + l * 0.5, z + Math.cos(rot) * off, 1, 1, 1, rot + Math.PI / 2));
          cols.push((l + k) % 3 ? "#b85a2e" : "#d98a5c");
        }
      });
      g.add(inst(G.brick, mat("#ffffff"), list, cols));
    } else if (res === "model") {
      const s = spots(rand, 13, 3.8, INR - 1.6);
      g.add(inst(G.trunk, mat(COL.woodDark), s.map(([x, z]) => M4(x, 0.7, z, 1, 1, 1))));
      g.add(inst(G.leaf, mat("#3f6b52"), s.map(([x, z, r]) => { const k = 0.8 + r * 0.5; return M4(x, 1.3 + 1.5 * k, z, k, k, k, r * 6); })));
    } else if (res === "data") {
      const s = spots(rand, 11, 3.6, INR - 1.5);
      g.add(inst(G.rock, mat("#7c8597"), s.map(([x, z, r]) => { const k = 0.6 + r * 0.9; return M4(x, k * 0.45, z, k, k * 0.8, k, r * 9); })));
      g.add(inst(G.crystal, mat("#cdd6ea", { emissive: "#3b4a6b" }), s.filter((_, i) => i % 2 === 0).map(([x, z, r]) => M4(x + 0.3, 1.2 + r * 0.4, z, 1, 1.8, 1, r * 4))));
    } else if (res === "ethics") {
      const s = spots(rand, 8, 4, INR - 1.8);
      g.add(inst(G.wool, mat(COL.paper), s.map(([x, z, r]) => M4(x, 0.9, z, 1.15, 0.8, 0.8, r * 6))));
      g.add(inst(G.wool, mat("#3b3f4a"), s.map(([x, z, r]) => { const a = r * 6; return M4(x + Math.sin(a + Math.PI / 2) * 1.1, 1.1, z + Math.cos(a + Math.PI / 2) * 1.1, 0.38, 0.38, 0.38); })));
      const tufts = spots(rand, 30, 3.4, INR - 1);
      g.add(inst(G.tuft, mat("#6f8f4f"), tufts.map(([x, z]) => M4(x, 0.3, z, 1, 1, 1))));
    }
  }

  function islandBase(g, r, top, side) {
    const sideM = mat(side || COL.earth);
    g.add(mesh(new T.CylinderGeometry(r, r, 2.4, 6), [sideM, mat(top), sideM], 0, -1.2, 0));
    g.add(mesh(new T.CylinderGeometry(r + 2.2, r + 3.4, 1.2, 6), mat(COL.sand), 0, -1.5, 0));
    g.add(mesh(new T.CylinderGeometry(r + 3.4, r + 6, 5, 6), mat(COL.sandDeep), 0, -4.6, 0, false));
  }

  function tablet(g) {
    g.add(mesh(new T.BoxGeometry(3.8, 0.6, 1.8), mat("#d9d3c6"), 0, 0.3, -4));
    g.add(mesh(new T.BoxGeometry(3, 3.6, 0.45), mat(COL.navy), 0, 2.4, -4));
    g.add(mesh(new T.BoxGeometry(2.4, 0.12, 0.5), mat(COL.terracotta), 0, 3.6, -3.98));
  }

  function makeIsland(u, p, i) {
    const g = new T.Group();
    g.position.set(p.x, 0, p.z);
    islandBase(g, R, TERRAIN[u.res]);
    decorate(g, u.res, rng(u.week * 7919));
    tablet(g);
    const R0 = data.resources[u.res];
    const label = makeLabel({ eyebrow: `W${String(u.week).padStart(2, "0")} · ${R0.name}`, title: u.short, num: u.num, res: R0.color }, 8.6);
    g.add(label);

    const build = new T.Group(); build.position.set(4.6, 0, 3.6); g.add(build);

    const fog = new T.Group(); fog.visible = false;
    const fr = rng(u.week * 131), fm = mat("#c9ccd3", { transparent: true, opacity: 0.82, depthWrite: false });
    for (let k = 0; k < 9; k++) {
      const a = fr() * Math.PI * 2, rr = fr() * R * 0.7, s = 2.4 + fr() * 2.4;
      const f = mesh(G.fog, fm, Math.sin(a) * rr, 2 + fr() * 3.5, Math.cos(a) * rr, false);
      f.scale.set(s, s * 0.7, s); fog.add(f);
    }
    g.add(fog);

    const ringWrap = new T.Group(); ringWrap.rotation.y = Math.PI / 6;
    const ring = new T.Mesh(new T.TorusGeometry(R + 1.6, 0.32, 5, 6), new T.MeshBasicMaterial({ color: COL.gold, transparent: true, opacity: 0.9 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.25;
    ringWrap.add(ring); ringWrap.visible = false; g.add(ringWrap);

    scene.add(g);
    islands.push({ key: u.week, x: p.x, z: p.z, inr: INR, res: u.res, unit: u, build, fog, ring: ringWrap, label, level: -1 });
  }

  function makeHub(p) {
    const g = new T.Group();
    g.position.set(p.x, 0, p.z);
    islandBase(g, HUB_R, "#d6ccb4");
    // 燈塔
    const white = mat(COL.surface), navy = mat(COL.navy);
    g.add(mesh(new T.CylinderGeometry(1.3, 1.9, 9, 10), white, -6, 4.5, -5));
    g.add(mesh(new T.CylinderGeometry(1.45, 1.6, 1.4, 10), navy, -6, 5.5, -5));
    g.add(mesh(new T.CylinderGeometry(1.1, 1.1, 1.6, 8), mat(COL.gold, { emissive: "#7a5a14" }), -6, 9.8, -5));
    g.add(mesh(new T.ConeGeometry(1.6, 1.6, 8), mat(COL.terracotta), -6, 11.4, -5));
    // 碼頭與木箱
    g.add(mesh(new T.BoxGeometry(6, 0.3, 3), mat(COL.wood), -3, -0.75, HUB_INR + 2.5));
    g.add(mesh(new T.BoxGeometry(1.2, 1.2, 1.2), mat(COL.wood), 5, 0.6, -6));
    g.add(mesh(new T.BoxGeometry(1, 1, 1), mat("#c9a54c"), 6.3, 0.5, -5.2));
    tablet(g);
    const label = makeLabel({ eyebrow: "HARBOR · 出發點", title: "港灣總部", num: 0 }, 13);
    label.position.x = -6; label.position.z = -5;
    g.add(label);
    scene.add(g);
    islands.push({ key: "hub", x: p.x, z: p.z, inr: HUB_INR, label });
  }

  function makeBridge(a, b) {
    const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
    const ax = a.x + ux * (a.inr - 1.5), az = a.z + uz * (a.inr - 1.5);
    const bx = b.x - ux * (b.inr - 1.5), bz = b.z - uz * (b.inr - 1.5);
    const len = Math.hypot(bx - ax, bz - az);
    bridges.push({ ax, az, bx, bz });
    const g = new T.Group();
    g.position.set((ax + bx) / 2, 0, (az + bz) / 2);
    g.rotation.y = Math.atan2(ux, uz);
    const n = Math.floor(len / 1.0);
    const planks = [], cols = [];
    for (let k = 0; k < n; k++) { planks.push(M4(0, -0.11, -len / 2 + 0.5 + k * (len - 1) / (n - 1), 1, 1, 1)); cols.push(k % 3 ? COL.wood : "#b48a5e"); }
    g.add(inst(G.plank, mat("#ffffff"), planks, cols));
    const rail = mat(COL.woodDark);
    [-1, 1].forEach(s => {
      g.add(mesh(new T.BoxGeometry(0.18, 0.18, len), rail, s * BRIDGE_HW, 0.95, 0));
      const posts = [];
      for (let z = -len / 2 + 1; z <= len / 2 - 0.5; z += 3) posts.push(M4(s * BRIDGE_HW, -1.2, z, 1, 1, 1));
      g.add(inst(G.post, rail, posts));
    });
    scene.add(g);
  }

  /* ---------- 角色 ---------- */
  function makePlayer() {
    player = new T.Group();
    const coat = mat(COL.navy), skin = mat("#e8c9a8"), accent = mat(COL.terracotta), dark = mat("#2b2b33");
    const body = new T.Group(); body.position.y = 1.15; player.add(body);
    body.add(mesh(new T.CylinderGeometry(0.55, 0.65, 1.3, 8), coat, 0, 0.35, 0));
    const scarf = mesh(new T.TorusGeometry(0.5, 0.16, 6, 10), accent, 0, 0.95, 0);
    scarf.rotation.x = Math.PI / 2; body.add(scarf);
    const head = mesh(new T.SphereGeometry(0.5, 10, 8), skin, 0, 1.45, 0); body.add(head);
    const beret = mesh(new T.SphereGeometry(0.55, 10, 6), accent, 0.08, 1.8, -0.02);
    beret.scale.set(1.05, 0.38, 1.05); beret.rotation.z = -0.25; body.add(beret);
    body.add(mesh(new T.BoxGeometry(0.75, 0.9, 0.35), mat("#c9a54c"), 0, 0.45, -0.55)); // 背包
    const limb = (geo, m, x, y) => { const piv = new T.Group(); piv.position.set(x, y, 0); const o = mesh(geo, m, 0, -geo.parameters.height / 2, 0); piv.add(o); return piv; };
    rig.armL = limb(new T.BoxGeometry(0.26, 1, 0.26), coat, -0.72, 1.6); rig.armR = limb(new T.BoxGeometry(0.26, 1, 0.26), coat, 0.72, 1.6);
    rig.legL = limb(new T.BoxGeometry(0.32, 1.05, 0.34), dark, -0.27, 1.05); rig.legR = limb(new T.BoxGeometry(0.32, 1.05, 0.34), dark, 0.27, 1.05);
    player.add(rig.armL, rig.armR, rig.legL, rig.legR);
    rig.body = body;
    const shadow = new T.Mesh(new T.CircleGeometry(0.8, 16), new T.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.18, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.03; rig.shadow = shadow;
    scene.add(player, shadow);
  }

  /* ---------- 行走判定 ---------- */
  function onIsland(x, z, pad) {
    for (const s of islands) if (Math.hypot(x - s.x, z - s.z) < s.inr - pad) return s;
    return null;
  }
  function onBridge(x, z) {
    for (const b of bridges) {
      const vx = b.bx - b.ax, vz = b.bz - b.az, L2 = vx * vx + vz * vz;
      const k = Math.max(0, Math.min(1, ((x - b.ax) * vx + (z - b.az) * vz) / L2));
      if (Math.hypot(x - (b.ax + vx * k), z - (b.az + vz * k)) < BRIDGE_HW - 0.45) return true;
    }
    return false;
  }
  const walkable = (x, z) => !!onIsland(x, z, 0.9) || onBridge(x, z);

  // 撞到橋邊時，沿著橋的方向滑動並往中線靠，走橋不會卡住
  function slideOnBridge(mx, mz) {
    for (const b of bridges) {
      const vx = b.bx - b.ax, vz = b.bz - b.az, L = Math.hypot(vx, vz), ux = vx / L, uz = vz / L;
      const along = (pos.x - b.ax) * ux + (pos.z - b.az) * uz;
      if (along < -2 || along > L + 2) continue;
      const side = (pos.x - b.ax) * -uz + (pos.z - b.az) * ux;
      if (Math.abs(side) > BRIDGE_HW + 1.2) continue;
      const d = mx * ux + mz * uz;
      if (Math.abs(d) < 1e-4) continue;
      const pull = -side * 0.25;
      const nx = pos.x + ux * d - uz * pull, nz = pos.z + uz * d + ux * pull;
      if (walkable(nx, nz)) { pos.x = nx; pos.z = nz; return true; }
    }
    return false;
  }

  /* ---------- 輸入 ---------- */
  function bindInput(canvas) {
    const typing = e => /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
    addEventListener("keydown", e => {
      if (typing(e) || paused) return;
      keys[e.code] = true;
      if (/^(Arrow|Space)/.test(e.code)) e.preventDefault();
    });
    addEventListener("keyup", e => { keys[e.code] = false; });
    addEventListener("blur", () => { for (const k in keys) keys[k] = false; });

    let drag = null;
    canvas.addEventListener("pointerdown", e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", e => {
      if (!drag || drag.id !== e.pointerId) return;
      yaw -= (e.clientX - drag.x) * 0.006;
      pitch = Math.max(0.12, Math.min(1.25, pitch + (e.clientY - drag.y) * 0.004));
      drag.x = e.clientX; drag.y = e.clientY;
    });
    const end = e => { if (drag && drag.id === e.pointerId) drag = null; };
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("wheel", e => { e.preventDefault(); dist = Math.max(8, Math.min(40, dist + e.deltaY * 0.02)); }, { passive: false });
  }

  function bindJoystick(el) {
    if (!el) return;
    const knob = el.firstElementChild;
    let id = null;
    const set = e => {
      const r = el.getBoundingClientRect(), max = r.width / 2;
      let dx = e.clientX - (r.left + max), dy = e.clientY - (r.top + max);
      const m = Math.hypot(dx, dy);
      if (m > max) { dx *= max / m; dy *= max / m; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      joy.x = dx / max; joy.y = -dy / max;
    };
    el.addEventListener("pointerdown", e => { id = e.pointerId; el.setPointerCapture(id); set(e); });
    el.addEventListener("pointermove", e => { if (e.pointerId === id) set(e); });
    const end = e => { if (e.pointerId !== id) return; id = null; joy.x = joy.y = 0; knob.style.transform = ""; };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  }

  /* ---------- 每幀 ---------- */
  function move(dt) {
    let ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
    let iy = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) + joy.y;
    const m = Math.hypot(ix, iy);
    if (m > 1) { ix /= m; iy /= m; }
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = -fz, rz = fx;
    const dx = fx * iy + rx * ix, dz = fz * iy + rz * ix;
    const amt = Math.hypot(dx, dz);
    const speed = (keys.ShiftLeft || keys.ShiftRight ? 15 : 9) * (joy.x || joy.y ? Math.min(1, Math.hypot(joy.x, joy.y) * 1.3) : 1);
    if (amt > 0.05) {
      const mx = dx / amt * Math.min(1, amt) * speed * dt, mz = dz / amt * Math.min(1, amt) * speed * dt;
      const nx = pos.x + mx, nz = pos.z + mz;
      if (walkable(nx, nz)) { pos.x = nx; pos.z = nz; }
      else if (slideOnBridge(mx, mz)) { /* 已沿橋移動 */ }
      else if (walkable(nx, pos.z)) pos.x = nx;
      else if (walkable(pos.x, nz)) pos.z = nz;
      const target = Math.atan2(dx, dz);
      let d = target - heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      heading += d * Math.min(1, dt * 12);
      walkPhase += dt * speed * 0.85;
    } else {
      walkPhase *= 0.85;
    }
    if (keys.Space && pos.y <= 0.001) vy = 7.5;
    vy -= 22 * dt; pos.y = Math.max(0, pos.y + vy * dt);
    if (pos.y === 0) vy = Math.max(vy, 0);
  }

  function animatePlayer() {
    player.position.copy(pos);
    player.rotation.y = heading;
    const s = Math.sin(walkPhase), air = pos.y > 0.01;
    rig.legL.rotation.x = air ? -0.5 : s * 0.7; rig.legR.rotation.x = air ? 0.3 : -s * 0.7;
    rig.armL.rotation.x = -s * 0.6; rig.armR.rotation.x = s * 0.6;
    rig.body.position.y = 1.15 + Math.abs(Math.cos(walkPhase)) * 0.08;
    rig.shadow.position.set(pos.x, 0.03, pos.z);
    rig.shadow.scale.setScalar(1 - Math.min(0.5, pos.y * 0.12));
  }

  function updateCamera(dt) {
    const cp = Math.cos(pitch);
    const want = new T.Vector3(pos.x + Math.sin(yaw) * cp * dist, pos.y + 2 + Math.sin(pitch) * dist, pos.z + Math.cos(yaw) * cp * dist);
    camera.position.lerp(want, 1 - Math.exp(-dt * 9));
    camera.lookAt(pos.x, pos.y + 2.2, pos.z);
    sun.position.set(pos.x + 30, 55, pos.z + 22);
    sun.target.position.set(pos.x, 0, pos.z);
    sun.target.updateMatrixWorld();
  }

  function checkIsland() {
    const s = onIsland(pos.x, pos.z, 0);
    const key = s ? s.key : null;
    if (key !== currentKey) {
      currentKey = key;
      islands.forEach(i => { i.label.visible = i.key !== key; });
      cb.onIsland && cb.onIsland(key);
    }
  }

  function animateWorld(dt) {
    if (!reduced && water) {
      const p = water.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = waterBase[i * 3], y = waterBase[i * 3 + 1];
        p.setZ(i, Math.sin(x * 0.08 + t * 1.1) * 0.25 + Math.cos(y * 0.07 + t * 0.8) * 0.25);
      }
      p.needsUpdate = true;
      water.geometry.computeVertexNormals();
    }
    for (const s of islands) {
      if (s.fog && s.fog.visible && !reduced) s.fog.rotation.y += dt * 0.15;
      if (s.ring && s.ring.visible) s.ring.children[0].material.opacity = reduced ? 0.9 : 0.55 + Math.sin(t * 4) * 0.35;
    }
  }

  function drawMinimap() {
    if (!mmCtx) return;
    const cv = mm, g = mmCtx, dpr = Math.min(2, devicePixelRatio || 1);
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const minX = -GAP - 6 - HUB_R - 4, maxX = 5 * GAP + R + 6, minZ = -R - 8, maxZ = 2 * ROW + R + 8;
    const k = Math.min(W / (maxX - minX), H / (maxZ - minZ));
    const ox = (W - (maxX - minX) * k) / 2, oz = (H - (maxZ - minZ) * k) / 2;
    const P = (x, z) => [ox + (x - minX) * k, oz + (z - minZ) * k];
    g.fillStyle = COL.sea; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#e8dcc4"; g.lineWidth = Math.max(1.5, k * 2.6);
    bridges.forEach(b => { const a = P(b.ax, b.az), c = P(b.bx, b.bz); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.stroke(); });
    islands.forEach(s => {
      const [cx, cy] = P(s.x, s.z), r = s.inr * k * 1.08;
      g.beginPath();
      for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i; g.lineTo(cx + Math.sin(a) * r, cy + Math.cos(a) * r); }
      g.closePath();
      g.fillStyle = s.key === "hub" ? "#d6ccb4" : (s.fog && s.fog.visible ? "#a9adb6" : TERRAIN[s.res]); g.fill();
      if (s.key === currentKey) { g.strokeStyle = COL.surface; g.lineWidth = 2; g.stroke(); }
      g.fillStyle = s.key === "hub" ? COL.navy : COL.surface;
      g.font = `700 ${Math.max(8, Math.round(r * 0.75))}px "Noto Sans TC", sans-serif`;
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(s.key === "hub" ? "港" : String(s.key), cx, cy);
      if (s.level > 0) { g.fillStyle = s.level === 2 ? COL.navy : COL.surface; g.fillRect(cx + r * 0.35, cy - r * 0.85, r * 0.45, r * 0.45); }
    });
    const [px, py] = P(pos.x, pos.z);
    g.save(); g.translate(px, py); g.rotate(-heading + Math.PI);
    g.fillStyle = COL.terracotta; g.strokeStyle = COL.surface; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(0, -7); g.lineTo(5, 5); g.lineTo(0, 2.5); g.lineTo(-5, 5); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }

  function resize() {
    const c = renderer.domElement, w = c.clientWidth, h = c.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function loop() {
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt; frame++;
    if (!paused) move(dt);
    animatePlayer(); updateCamera(dt); checkIsland(); animateWorld(dt);
    renderer.render(scene, camera);
    if (frame % 3 === 0) drawMinimap();
    requestAnimationFrame(loop);
  }

  window.World = {
    init(canvas, d, callbacks, opts) {
      data = d; cb = callbacks || {};
      try {
        renderer = new T.WebGLRenderer({ canvas, antialias: true });
      } catch (e) { return false; }
      renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      scene = new T.Scene();
      scene.background = new T.Color(COL.sky);
      scene.fog = new T.Fog(COL.sky, 90, 260);
      camera = new T.PerspectiveCamera(55, 1, 0.5, 600);
      clock = new T.Clock();

      scene.add(new T.HemisphereLight("#f6f1e6", "#4e7c74", 0.75));
      sun = new T.DirectionalLight("#fff1dc", 0.85);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 140 });
      sun.shadow.bias = -0.0008;
      scene.add(sun, sun.target);

      const wg = new T.PlaneGeometry(900, 900, 70, 70);
      water = new T.Mesh(wg, new T.MeshPhongMaterial({ color: COL.sea, flatShading: true, shininess: 40, transparent: true, opacity: 0.94 }));
      water.rotation.x = -Math.PI / 2; water.position.set(100, -1.25, 50); water.receiveShadow = true;
      waterBase = wg.attributes.position.array.slice();
      scene.add(water);

      geos();
      const P = layout(d.units);
      const hubP = { x: -GAP - 6, z: 0 };
      makeHub(hubP);
      d.units.forEach((u, i) => makeIsland(u, P[i], i));
      makeBridge(islands[0], islands[1]);
      for (let i = 1; i < islands.length - 1; i++) makeBridge(islands[i], islands[i + 1]);
      makePlayer();
      // 出生在總部，面向通往 W01 的橋
      const w1 = islands[1], L = Math.hypot(w1.x - hubP.x, w1.z - hubP.z), ux = (w1.x - hubP.x) / L, uz = (w1.z - hubP.z) / L;
      pos.set(hubP.x + ux * 3, 0, hubP.z + uz * 3);
      yaw = Math.atan2(-ux, -uz); heading = Math.atan2(ux, uz);
      camera.position.set(pos.x - ux * dist, 10, pos.z - uz * dist);

      mm = opts && opts.minimap;
      if (mm) mmCtx = mm.getContext("2d");
      bindInput(canvas);
      bindJoystick(opts && opts.joystick);
      addEventListener("resize", resize);
      resize();

      // 標籤用的中文字型載入後重畫
      if (document.fonts && document.fonts.load) {
        const text = d.units.map(u => u.short + d.resources[u.res].name).join("") + "港灣總部出發點HARBOR·W0123456789";
        Promise.all([
          document.fonts.load('700 56px "Noto Sans TC"', text),
          document.fonts.load('500 30px "Noto Sans TC"', text),
          document.fonts.load('700 54px "Noto Serif TC"', "0123456789")
        ]).then(() => islands.forEach(s => { drawLabel(s.label.userData.cv, s.label.userData.info); s.label.userData.tex.needsUpdate = true; })).catch(() => {});
      }
      loop();
      return true;
    },

    sync(state) {
      for (const s of islands) {
        if (s.key === "hub") continue;
        const lv = state.built[s.key] || 0;
        if (lv !== s.level) {
          s.level = lv;
          s.build.clear();
          if (lv >= 1) {
            const wall = mat(COL.surface), roof = mat(COL.terracotta);
            if (lv === 1) {
              s.build.add(mesh(new T.BoxGeometry(2.4, 1.8, 2.4), wall, 0, 0.9, 0));
              const r = mesh(new T.ConeGeometry(2.1, 1.5, 4), roof, 0, 2.55, 0); r.rotation.y = Math.PI / 4; s.build.add(r);
            } else {
              s.build.add(mesh(new T.BoxGeometry(3.6, 2.4, 3), wall, 0, 1.2, 0));
              const r = mesh(new T.ConeGeometry(2.6, 1.6, 4), roof, -0.4, 3.2, 0); r.rotation.y = Math.PI / 4; s.build.add(r);
              s.build.add(mesh(new T.BoxGeometry(1.4, 5.2, 1.4), mat(COL.navy), 1.6, 2.6, -0.6));
              const tr = mesh(new T.ConeGeometry(1.15, 1.4, 4), roof, 1.6, 5.9, -0.6); tr.rotation.y = Math.PI / 4; s.build.add(tr);
            }
          }
        }
        s.fog.visible = state.fog === s.key;
        s.ring.visible = (state.lit || []).includes(s.key) && state.fog !== s.key;
      }
    },

    teleport(key) {
      const s = islands.find(i => i.key === key);
      if (!s) return;
      pos.set(s.x, 0, s.z + 5.5); vy = 0;
      yaw = 0; heading = Math.PI;
      camera.position.set(pos.x, pos.y + 2 + Math.sin(pitch) * dist, pos.z + Math.cos(pitch) * dist);
    },

    where() { return { x: +pos.x.toFixed(2), z: +pos.z.toFixed(2), island: currentKey }; },

    // 測試用：不靠畫面更新，直接推進模擬
    simulate(sec, input) {
      if (input) { joy.x = input.x || 0; joy.y = input.y || 0; }
      for (let s = 0; s < sec; s += 1 / 60) { move(1 / 60); checkIsland(); }
      joy.x = joy.y = 0;
      animatePlayer(); updateCamera(1); renderer.render(scene, camera); drawMinimap();
      return this.where();
    },

    setPaused(p) {
      paused = p;
      for (const k in keys) keys[k] = false;
      joy.x = joy.y = 0;
    }
  };
})();
