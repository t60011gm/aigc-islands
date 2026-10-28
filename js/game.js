/* 遊戲邏輯與 HUD：建造、擲骰、資源、交易、迷霧、成就與存檔；3D 畫面交給 world.js。 */
(function () {
  const D = window.AIGC;
  const KEY = "aigc-islands-v1";
  const RES = Object.keys(D.resources);
  const $ = id => document.getElementById(id);
  const unitOf = w => D.units.find(u => u.week === w);
  const wk = w => "W" + String(w).padStart(2, "0");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const has3D = { ok: false };

  function fresh() {
    return { built: {}, checks: {}, hw: {}, res: Object.fromEntries(RES.map(r => [r, 0])), cards: [], fog: null, fogRight: 0, fogQ: 0, rolls: 0, lit: [], last: null };
  }
  function normalize(s) {
    const base = fresh();
    if (!s || typeof s !== "object") return base;
    const out = Object.assign(base, s);
    out.res = Object.assign(fresh().res, s.res || {});
    return out;
  }
  function load() {
    try { return normalize(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return fresh(); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 無法儲存時仍可正常使用 */ }
  }
  let state = load();

  /* ---------- 計分 ---------- */
  function achievements() {
    let run = 0, best = 0;
    D.units.forEach(u => { run = state.built[u.week] ? run + 1 : 0; best = Math.max(best, run); });
    return [
      { name: "最長工作流", desc: "連續 5 週建有村莊", have: Math.min(best, 5), need: 5 },
      { name: "最大思辨者", desc: "驅散 3 次幻覺迷霧", have: Math.min(state.fogRight, 3), need: 3 },
      { name: "知識收藏家", desc: "收集 5 張知識卡", have: Math.min(state.cards.length, 5), need: 5 }
    ].map(a => Object.assign(a, { got: a.have >= a.need }));
  }
  const RANKS = [[0, "新手拓荒者"], [10, "群島建築師"], [20, "群島規劃師"], [30, "群島總設計師"]];
  function score() {
    const lv = Object.values(state.built);
    const villages = lv.filter(v => v === 1).length, cities = lv.filter(v => v === 2).length;
    const ach = achievements().filter(a => a.got).length;
    const vp = villages + cities * 2 + ach * 2;
    let i = RANKS.length - 1;
    while (vp < RANKS[i][0]) i--;
    return { villages, cities, ach, vp, rank: RANKS[i][1], next: RANKS[i + 1] };
  }

  /* ---------- HUD ---------- */
  function statusTag(w) {
    if (state.fog === w) return `<span class="tag fog">迷霧中</span>`;
    const lv = state.built[w] || 0;
    if (lv === 2) return `<span class="tag city">城市</span>`;
    if (lv === 1) return `<span class="tag village">村莊</span>`;
    return `<span class="tag neutral">未開拓</span>`;
  }
  function resTag(r) { const R = D.resources[r]; return `<span class="res-tag"><i style="background:${R.color}"></i>${R.name}</span>`; }

  function renderHud() {
    const s = score();
    $("vp").textContent = s.vp;
    $("rank").textContent = s.rank;
    $("resBar").innerHTML = RES.map(r => {
      const R = D.resources[r];
      return `<li title="${R.hint}"><i style="background:${R.color}"></i><span class="nm">${R.name}</span><span class="n">${state.res[r]}</span></li>`;
    }).join("");
    renderRoll();
  }

  function dieFace(el, n) {
    const spots = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] }[n] || [];
    el.innerHTML = spots.map(p => `<i style="grid-area:${Math.ceil(p / 3)}/${(p - 1) % 3 + 1}"></i>`).join("");
  }

  function renderRoll() {
    const L = state.last, box = $("rollResult");
    if (!L) { dieFace($("die1"), 1); dieFace($("die2"), 1); return; }
    dieFace($("die1"), L.d1); dieFace($("die2"), L.d2);
    $("die1").classList.toggle("seven", L.sum === 7);
    $("die2").classList.toggle("seven", L.sum === 7);
    if (L.sum === 7) {
      box.innerHTML = state.fog
        ? `擲出 <b>7</b>：幻覺迷霧籠罩了 <b>${wk(state.fog)} ${esc(unitOf(state.fog).short)}</b>，這座島暫停產出。<br><button type="button" class="btn primary sm" data-fog="1">回答思辨題驅散迷霧</button>`
        : `擲出 <b>7</b>：你已驅散這次的迷霧。`;
      return;
    }
    const names = L.matches.map(w => `${wk(w)} ${esc(unitOf(w).short)}`).join("、");
    const prod = L.produced.length
      ? "產出：" + L.produced.map(p => `${D.resources[p.res].name} +${p.n}`).join("、") + "。"
      : "這些島還沒有村莊，所以沒有產出。";
    let ch = "";
    if (L.challenge) {
      const u = unitOf(L.challenge);
      ch = `<br><b>隨堂挑戰｜${wk(u.week)}</b>　${esc(u.challenge)}<br>` + (L.claimed
        ? `已完成，獲得${D.resources[u.res].name} +1。`
        : `<button type="button" class="btn secondary sm" data-claim="1">我完成了，領取${D.resources[u.res].name} +1</button>`);
    }
    box.innerHTML = `擲出 <b>${L.sum}</b>：${names}（島上金框閃爍）。${prod}${ch}`;
  }

  function renderAll() {
    if (has3D.ok) World.sync(state);
    renderHud();
    save();
  }

  /* ---------- 腳下的島 ---------- */
  let here = null;
  function onIsland(key) {
    here = key;
    const box = $("interact");
    if (key == null) { box.hidden = true; $("help").hidden = false; return; }
    $("help").hidden = true;
    box.hidden = false;
    if (key === "hub") {
      $("interactEyebrow").textContent = "HARBOR · 出發點";
      $("interactTitle").textContent = "港灣總部：課程總覽與玩法";
      $("enterBtn").firstChild.textContent = "開啟總覽 ";
      return;
    }
    const u = unitOf(key);
    $("interactEyebrow").textContent = `${wk(key)} · ${D.resources[u.res].name} · 號碼 ${u.num}` + (state.fog === key ? " · 迷霧中" : "");
    $("interactTitle").textContent = u.title;
    $("enterBtn").firstChild.textContent = state.fog === key ? "驅散迷霧 " : "開啟單元 ";
  }

  /* ---------- 抽屜 ---------- */
  let lastFocus = null, current = null;
  function showDrawer(eyebrow, title, html, key) {
    current = key;
    $("drawerEyebrow").textContent = eyebrow;
    $("drawerTitle").textContent = title;
    $("drawerBody").innerHTML = html;
    $("drawerBody").scrollTop = 0;
    $("scrim").hidden = false;
    $("drawer").hidden = false;
    if (has3D.ok) World.setPaused(true);
    $("drawerClose").focus();
  }
  function closeDrawer() {
    $("drawer").hidden = true;
    $("scrim").hidden = true;
    current = null;
    if (has3D.ok) World.setPaused(false);
    if (lastFocus && document.contains(lastFocus) && lastFocus !== document.body) lastFocus.focus();
    else $("scene").focus();
  }
  function refreshDrawer() { if (current != null) open(current, true); }

  function open(key, keepFocus) {
    if (!keepFocus && $("drawer").hidden) lastFocus = document.activeElement;
    if (key === "hub") return hubView();
    if (key === "fog") return fogView();
    if (key === "list") return listView();
    if (key === "bag") return bagView();
    if (typeof key === "string" && key.startsWith("card:")) return cardView(key.slice(5));
    unitView(key);
  }

  function unitView(w) {
    const u = unitOf(w), R = D.resources[u.res];
    const lv = state.built[w] || 0;
    const checks = state.checks[w] || [];
    const allChecked = u.checks.every((_, i) => checks[i]);
    const hw = !!state.hw[w];
    const fogBox = state.fog === w ? `<div class="callout"><b>這座島被幻覺迷霧籠罩，暫停產出。</b><p class="small muted">回答一題 AI 思辨題就能驅散迷霧。</p><div class="row-btns" style="margin-top:8px"><button type="button" class="btn primary sm" data-fog="1">回答思辨題</button></div></div>` : "";
    const html = `
      ${fogBox}
      <div class="meta-row">${resTag(u.res)}<span class="tag neutral">產出號碼 ${u.num}</span>${statusTag(w)}</div>
      <section><h3>學習目標</h3><ul>${u.goals.map(g => `<li>${esc(g)}</li>`).join("")}</ul></section>
      <section><h3>課堂重點</h3><ul>${u.points.map(g => `<li>${esc(g)}</li>`).join("")}</ul></section>
      <section><h3>推薦工具</h3><ul class="tool-list">${u.tools.map(t => `<li>${esc(t)}</li>`).join("")}</ul></section>
      <section><h3>室內設計實作</h3><div class="callout">${esc(u.practice)}</div></section>
      <section><h3>範例提示詞</h3>${u.prompts.map((p, i) => `<div class="prompt"><p id="pr-${w}-${i}">${esc(p)}</p><button type="button" class="btn inverse sm" data-copy="pr-${w}-${i}">複製提示詞</button></div>`).join("")}</section>
      <section><h3>本週作業</h3><p>${esc(u.homework)}</p></section>
      <section>
        <h3>建造</h3>
        <div class="build-box">
          <ul class="checks">
            ${u.checks.map((c, i) => `<li><label><input type="checkbox" id="ck-${w}-${i}" data-check="${i}" ${checks[i] ? "checked" : ""}><span>${esc(c)}</span></label></li>`).join("")}
            <li><label><input type="checkbox" id="hw-${w}" data-hw="1" ${hw ? "checked" : ""}><span><b>作業已繳交</b></span></label></li>
          </ul>
          <div class="build-steps">
            ${lv === 0 ? `<button type="button" class="btn primary" data-build="1" ${allChecked ? "" : "disabled"}>建立村莊（+1 點，${R.name} +1）</button>` : ""}
            ${lv === 1 ? `<button type="button" class="btn primary" data-build="2" ${hw ? "" : "disabled"}>升級為城市（+1 點，${R.name} +1）</button>` : ""}
            ${lv === 2 ? `<span class="tag city">已建城市：擲中時產出 2 張${R.name}</span>` : ""}
          </div>
          <p class="small muted">${lv === 0 ? "勾完上面三項檢核就能建村莊，小屋會出現在島上。" : lv === 1 ? "勾選「作業已繳交」後可升級為城市，產出加倍。" : "這週完成了。"}</p>
        </div>
      </section>
      <section><h3>隨堂挑戰</h3><p>${esc(u.challenge)}</p><p class="small muted">擲骰擲中 ${u.num} 時，完成這題挑戰可以額外領取一張${R.name}。</p></section>`;
    showDrawer(`${wk(w)} · ${R.name} · 號碼 ${u.num}`, u.title, html, w);
  }

  function listView() {
    const rows = D.units.map((u, i) => {
      const route = i > 0 && i % 6 === 0 ? `<li class="route">— 過橋轉入第 ${i / 6 + 1} 條航線 —</li>` : "";
      return `${route}<li>
        <span class="no">${wk(u.week)}</span>
        <span class="t"><b>${esc(u.title)}</b><span>${resTag(u.res)}<span>號碼 ${u.num}</span>${statusTag(u.week)}</span></span>
        <span class="acts">${has3D.ok ? `<button type="button" class="btn secondary sm" data-go="${u.week}">前往</button>` : ""}<button type="button" class="btn primary sm" data-week="${u.week}">開啟</button></span>
      </li>`;
    }).join("");
    const hub = `<li><span class="no">港</span><span class="t"><b>港灣總部</b><span>出發點 · 課程總覽</span></span>
      <span class="acts">${has3D.ok ? `<button type="button" class="btn secondary sm" data-go="hub">前往</button>` : ""}<button type="button" class="btn primary sm" data-hub="1">開啟</button></span></li>`;
    showDrawer("ROUTE · 18 週航線", "週次地圖",
      `<p class="muted">島嶼依週次由木橋串成一條航線：港灣總部 → W01 … W06，過橋轉彎接 W07 … W12，再接 W13 … W18。「前往」會把你直接送到該島。</p>
       <ul class="weeks">${hub}${rows}</ul>`, "list");
  }

  function bagView() {
    const s = score(), left = D.cards.length - state.cards.length;
    const html = `
      <section><h3>進度</h3>
        <div class="stat-row">
          <div class="stat"><b>${s.vp}</b><span>勝利點</span></div>
          <div class="stat"><b>${s.villages}</b><span>村莊</span></div>
          <div class="stat"><b>${s.cities}</b><span>城市</span></div>
          <div class="stat"><b>${s.ach}</b><span>成就</span></div>
        </div>
        <div class="meter" aria-hidden="true"><span style="width:${Math.min(100, s.vp / 30 * 100)}%"></span></div>
        <p class="small muted">目前稱號「${s.rank}」。${s.next ? `再 ${s.next[0] - s.vp} 點升為「${s.next[1]}」。` : "你已是群島總設計師。"}已擲骰 ${state.rolls} 次。</p></section>
      <section><h3>資源交易</h3>
        <p class="small muted">4 張同種資源可換 1 張知識卡（還剩 ${left} 張）。</p>
        <ul class="trade-list">${RES.map(r => { const R = D.resources[r], n = state.res[r]; return `<li><i style="background:${R.color}"></i><span>${R.name}<span class="small muted">　${R.hint}</span></span><span class="n">${n}</span><button type="button" class="btn secondary sm" data-trade="${r}" ${n >= 4 && left > 0 ? "" : "disabled"}>換卡</button></li>`; }).join("")}</ul></section>
      <section><h3>成就</h3>
        <ul class="ach-list">${achievements().map(a => `<li class="${a.got ? "got" : ""}"><span><b>${a.name}</b>　${a.desc}</span><span class="st">${a.got ? "+2 點" : a.have + " / " + a.need}</span></li>`).join("")}</ul></section>
      <section><h3>知識卡 ${state.cards.length} / ${D.cards.length}</h3>
        ${state.cards.length ? `<ul class="card-list">${state.cards.map(id => { const c = D.cards.find(x => x.id === id); return `<li><button type="button" data-card="${id}">${esc(c.title)}</button></li>`; }).join("")}</ul>` : `<p class="empty">還沒有知識卡。累積 4 張同種資源就能交換。</p>`}</section>`;
    showDrawer("BACKPACK · 背包", "我的背包", html, "bag");
  }

  function fogView() {
    if (!state.fog) { showDrawer("HALLUCINATION FOG", "迷霧已散", `<p>目前沒有島嶼被迷霧籠罩。擲出 7 時會再出現。</p>`, "fog"); return; }
    const Q = D.fog[state.fogQ % D.fog.length], u = unitOf(state.fog);
    const html = `
      <div class="meta-row"><span class="tag fog">${wk(u.week)} ${esc(u.short)}</span></div>
      <section><h3>思辨題</h3><p>${esc(Q.q)}</p></section>
      <div class="quiz" id="quiz">${Q.options.map((o, i) => `<button type="button" data-ans="${i}">${String.fromCharCode(65 + i)}. ${esc(o)}</button>`).join("")}</div>
      <div id="verdict" aria-live="polite"></div>`;
    showDrawer("HALLUCINATION FOG · 幻覺迷霧", "辨識 AI 幻覺", html, "fog");
  }

  function answerFog(i) {
    const Q = D.fog[state.fogQ % D.fog.length];
    document.querySelectorAll("#quiz button").forEach((b, k) => {
      b.disabled = true;
      if (k === Q.answer) b.classList.add("right");
      else if (k === i) b.classList.add("wrong");
    });
    state.fogQ = (state.fogQ + 1) % D.fog.length;
    if (i === Q.answer) {
      const w = state.fog;
      state.fog = null; state.fogRight++; state.res.ethics++;
      $("verdict").innerHTML = `<p class="verdict ok">答對了，${wk(w)} 的迷霧散去，獲得思辨羊毛 +1。</p><p>${esc(Q.why)}</p>`;
      renderAll();
      if (here === w) onIsland(w);
    } else {
      save();
      $("verdict").innerHTML = `<p class="verdict no">這個選項有風險，迷霧還在。</p><p>${esc(Q.why)}</p><div class="row-btns" style="margin-top:8px"><button type="button" class="btn primary sm" data-fog="1">換一題再試</button></div>`;
    }
  }

  function cardView(id) {
    const c = D.cards.find(x => x.id === id);
    showDrawer("KNOWLEDGE CARD · 知識卡", c.title, `<div class="callout"><p>${esc(c.body)}</p></div><div class="row-btns"><button type="button" class="btn secondary sm" data-bag="1">回到背包</button></div>`, "card:" + id);
  }

  function code() { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); }

  function hubView() {
    const C = D.course;
    const html = `
      <section><p class="lede">${esc(C.summary)}</p></section>
      <section><h3>課程資訊</h3><ul>
        <li>對象：${esc(C.audience)}</li><li>學分：${esc(C.credits)}</li><li>時數：${esc(C.hours)}</li><li>授課：${esc(C.teacher)}</li></ul></section>
      <section><h3>評分方式</h3><table class="grade"><tbody>${C.grading.map(g => `<tr><td>${esc(g.item)}</td><td>${g.weight}%</td></tr>`).join("")}</tbody></table>
        <p class="small muted">群島上的勝利點不直接計分，是讓你看見自己進度的工具。</p></section>
      <section><h3>怎麼玩</h3><ol class="rules">
        <li>從港灣總部出發，沿著木橋依週次走到每一座島。島上的石碑就是該週課程，走上島按 <b>E</b>（或點畫面下方按鈕）開啟。</li>
        <li><b>移動</b>：WASD 或方向鍵，Shift 奔跑，空白鍵跳；拖曳畫面轉視角，滾輪縮放。手機用左下搖桿。</li>
        <li>勾完三項檢核就能<b>建村莊</b>（1 點）；作業繳交後<b>升級城市</b>（2 點）。建築會出現在島上。</li>
        <li><b>擲骰</b>：數字與島上號碼相同、且已建村莊的島產出資源，城市產出 2 張；擲中的島會亮起金框，並給你一題隨堂挑戰。</li>
        <li>擲到 <b>7</b>：幻覺迷霧籠罩一座島，答對 AI 思辨題才會散去。</li>
        <li>4 張同種資源可在背包換 1 張<b>知識卡</b>，裡面是進階技巧。</li>
        <li>三項成就各加 2 點。10 點群島建築師、20 點群島規劃師、30 點群島總設計師。</li></ol></section>
      <section><h3>進度碼</h3>
        <p class="small muted">進度只存在這台裝置的瀏覽器。換電腦或要交給老師時，複製進度碼即可。</p>
        <textarea id="codeOut" readonly aria-label="我的進度碼">${code()}</textarea>
        <div class="row-btns"><button type="button" class="btn secondary sm" data-copy="codeOut">複製進度碼</button></div>
        <label class="small" for="codeIn">貼上進度碼來載入</label>
        <textarea id="codeIn" placeholder="在這裡貼上進度碼"></textarea>
        <div class="row-btns"><button type="button" class="btn primary sm" data-import="1">載入進度</button></div>
        <div id="resetArea" class="row-btns"><button type="button" class="btn secondary sm" data-reset="ask">重設全部進度</button></div></section>`;
    showDrawer("HARBOR · 港灣總部", C.name, html, "hub");
  }

  /* ---------- 動作 ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  function copy(id) {
    const node = $(id);
    const txt = node.value !== undefined ? node.value : node.textContent;
    const fallback = () => {
      if (node.select) node.select();
      else { const r = document.createRange(); r.selectNodeContents(node); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      toast("已選取文字，請按 Ctrl+C 複製");
    };
    try { navigator.clipboard.writeText(txt).then(() => toast("已複製"), fallback); } catch (e) { fallback(); }
  }

  function roll() {
    const btn = $("rollBtn");
    btn.disabled = true;
    const d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6);
    const finish = () => { resolve(d1, d2); btn.disabled = false; };
    if (reduced) return finish();
    let f = 0;
    const iv = setInterval(() => {
      dieFace($("die1"), 1 + Math.floor(Math.random() * 6));
      dieFace($("die2"), 1 + Math.floor(Math.random() * 6));
      if (++f >= 7) { clearInterval(iv); finish(); }
    }, 70);
  }

  function resolve(d1, d2) {
    const sum = d1 + d2;
    state.rolls++;
    if (sum === 7) {
      const pool = D.units.map(u => u.week).filter(w => w !== state.fog);
      state.fog = pool[Math.floor(Math.random() * pool.length)];
      state.lit = [];
      state.last = { d1, d2, sum, matches: [], produced: [] };
      renderAll();
      if (here === state.fog) onIsland(here);
      toast(`幻覺迷霧籠罩了 ${wk(state.fog)} ${unitOf(state.fog).short}`);
      return;
    }
    const matches = D.units.filter(u => u.num === sum).map(u => u.week);
    const produced = [];
    matches.forEach(w => {
      const lv = state.built[w] || 0;
      if (lv && state.fog !== w) {
        const r = unitOf(w).res;
        state.res[r] += lv;
        produced.push({ res: r, n: lv });
      }
    });
    state.lit = matches;
    state.last = { d1, d2, sum, matches, produced, challenge: matches[Math.floor(Math.random() * matches.length)], claimed: false };
    renderAll();
  }

  function build(level) {
    const w = current, u = unitOf(w);
    state.built[w] = level;
    state.res[u.res]++;
    renderAll();
    refreshDrawer();
    toast(level === 1 ? `${wk(w)} 建立了村莊` : `${wk(w)} 升級為城市`);
  }

  function trade(r) {
    const left = D.cards.filter(c => !state.cards.includes(c.id));
    if (state.res[r] < 4 || !left.length) return;
    state.res[r] -= 4;
    const c = left[Math.floor(Math.random() * left.length)];
    state.cards.push(c.id);
    renderAll();
    open("card:" + c.id, true);
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("button");
    if (!t) return;
    const ds = t.dataset;
    if (t.id === "rollBtn") roll();
    else if (t.id === "openHub") open("hub");
    else if (t.id === "openList") open("list");
    else if (t.id === "openBag") open("bag");
    else if (t.id === "enterBtn") { if (here != null) open(here); }
    else if (t.id === "drawerClose") closeDrawer();
    else if (ds.go) { World.teleport(ds.go === "hub" ? "hub" : +ds.go); closeDrawer(); }
    else if (ds.hub) open("hub", true);
    else if (ds.bag) open("bag", true);
    else if (ds.trade) trade(ds.trade);
    else if (ds.card) open("card:" + ds.card, true);
    else if (ds.fog) open("fog", !$("drawer").hidden);
    else if (ds.ans !== undefined) answerFog(+ds.ans);
    else if (ds.build) build(+ds.build);
    else if (ds.copy) copy(ds.copy);
    else if (ds.claim && state.last && !state.last.claimed) {
      state.last.claimed = true;
      state.res[unitOf(state.last.challenge).res]++;
      renderAll();
    }
    else if (ds.import) {
      try {
        state = normalize(JSON.parse(decodeURIComponent(escape(atob($("codeIn").value.trim())))));
        renderAll(); hubView(); toast("已載入進度");
      } catch (err) { toast("進度碼格式不正確，請確認整段都有貼上"); }
    }
    else if (ds.reset === "ask") {
      $("resetArea").innerHTML = `<span class="danger-note">所有建造、資源與知識卡都會清除。</span><button type="button" class="btn primary sm" data-reset="yes">確定重設</button><button type="button" class="btn secondary sm" data-reset="no">取消</button>`;
    }
    else if (ds.reset === "yes") { state = fresh(); renderAll(); hubView(); toast("進度已重設"); }
    else if (ds.reset === "no") hubView();
    else if (ds.week) open(+ds.week, true);
  });

  document.addEventListener("change", e => {
    const t = e.target;
    if (typeof current !== "number") return;
    if (t.dataset.check !== undefined) {
      const arr = state.checks[current] || [];
      arr[+t.dataset.check] = t.checked;
      state.checks[current] = arr;
    } else if (t.dataset.hw) {
      state.hw[current] = t.checked;
    } else return;
    save();
    const focusId = t.id;
    unitView(current);
    const back = $(focusId); if (back) back.focus();
  });

  $("scrim").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !$("drawer").hidden) { closeDrawer(); return; }
    if (e.code === "KeyE" && $("drawer").hidden && here != null && !/INPUT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); open(here); }
  });

  /* ---------- 啟動 ---------- */
  $("scene").tabIndex = 0;
  has3D.ok = !!(window.THREE && window.World && World.init($("scene"), D, { onIsland }, { minimap: $("minimap"), joystick: $("joystick") }));
  if (!has3D.ok) { $("nogl").hidden = false; $("minimap").hidden = true; $("help").hidden = true; }
  renderAll();
  const m = /^#w(\d{1,2})$/.exec(location.hash);
  if (m && unitOf(+m[1])) { if (has3D.ok) World.teleport(+m[1]); open(+m[1]); }
  else if (location.hash === "#hub") open("hub");
})();
