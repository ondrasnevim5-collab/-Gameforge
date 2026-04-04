// ============================================================
// GAMEFORGE v5 – script.js
// AI Chat, Notifications, Button helpers, Utilities
// ============================================================

// ── NOTIFICATION SYSTEM ──────────────────────────────────────
const NOTIFICATIONS = [
  { msg: "Pojď si udělat hru přes GameForge Engine! 🚀", delay: 3000 },
  { msg: "Nová funkce: Editor postav a malování! 🎨", delay: 30000 },
  { msg: "Sdílej svůj projekt přes export HTML! 🌐", delay: 90000 },
  { msg: "Přidej 3D objekty a hraj v Three.js režimu! 🖥️", delay: 180000 },
];

let notifIndex = 0;
function showNotification(msg, duration = 6000) {
  const el = document.getElementById('gf-notification');
  const msgEl = document.getElementById('notif-msg');
  if (!el || !msgEl) return;
  msgEl.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}
function closeNotification() {
  document.getElementById('gf-notification')?.classList.remove('show');
}
function openGithub() {
  window.open('https://github.com/', '_blank');
  closeNotification();
}
function scheduleNotifications() {
  NOTIFICATIONS.forEach(({ msg, delay }) => {
    setTimeout(() => showNotification(msg), delay);
  });
}

// ── AI CHAT SYSTEM ──────────────────────────────────────────
let aiHistory = [];
let aiTyping = false;

// GameForge knowledge base for offline fallback
const GF_KB = {
  'nepřítel': "Nepřítele přidáš v záložce **📦 OBJEKTY** → kategorie Postavy → klikni na **👾 NEPŘÍTEL**. Ve hře se automaticky pohybuje tam a zpět a pronásleduje hráče, pokud je blízko. Chování AI nastavíš v Editoru postav (🧑 POSTAVY).",
  'hráč': "Hráče přidáš v **📦 OBJEKTY** → 🧑 HRÁČ. Ovládáš ho D-padem (mobilní) nebo šipkami (klávesnice). Vlastnosti jako rychlost, skok a životy nastavíš v **🧑 POSTAVY** editoru.",
  'skok': "Skok funguje přes D-pad ▲ nebo tlačítko **A** ve hře. Dvojitý skok zapneš v editoru postav (🧑 POSTAVY → Mechaniky → Dvojitý skok: ZAP). V kódu: `if((keys.up||keys.a)&&p.onGround){ p.vy=-(p.jump||9); }`",
  'shop': "Shopy přidáš v **📦 OBJEKTY** → 🏪 SHOPY. Ve hře stiskni **E** když stojíš u obchodu. Ceny nastavíš v záložce **💵 PENÍZE** → Ceny v shopech. Po koupi Počítače se otevře PC Builder!",
  'peníze': "Peněžní systém: přidej **💵 PENÍZE** nebo **🪙 MINCE** objekty do scény. Hráč je sbírá automaticky. Globální nastavení je v záložce **💵 PENÍZE**. Předvolby: Chudák/Normální/Boháč/Milionář.",
  '3d': "3D mód spustíš přes tlačítko **▶ Spustit 3D** nebo v nastavení (⚙️ NASTAVENÍ → Herní režim: 3D). Editor scény přepneš na 3D v záložce 🗺 SCÉNA → tlačítko **3D EDITOR**. Kamera se dá přepínat: Follow/Vršek/Bok/Free.",
  'export': "Export najdeš v záložce **💾 ULOŽIT**. Možnosti:\n• **HTML** – hotová hra jako soubor, otevři v prohlížeči\n• **JSON** – data projektu pro zálohu\n• **Unity C#** – skript pro Unity engine",
  'malování': "Malování objektů je v záložce **🎨 MALOVÁNÍ**. Nástroje: štětec, výplň, guma, čára, obdélník, kruh. Hotový výkres přidáš do scény tlačítkem **+ Do scény** nebo stáhneš jako PNG.",
  'auto': "Auta přidáš v **📦 OBJEKTY** → 🚗 AUTA. Kategorie: Auto, Truck, Závoďák, Bus, Motorka. Ve hře je ovládáš D-padem + tlačítkem ⛽ (plyn). 3D fyzika: zrychlení, tření, zatáčení.",
  'script': "Skripty píšeš v záložce **💻 KÓD**. K dispozici jsou soubory:\n• `game.js` – hlavní logika\n• `player.js` – pohyb hráče\n• `car.js` – fyzika vozidla\n• `enemy.js` – AI nepřítele\n• `money.js` – systém peněz\nLze vytvořit vlastní skripty tlačítkem **+**.",
  'uložit': "Projekt uložíš v záložce **💾 ULOŽIT** → tlačítko ULOŽIT. Ukládá se do paměti prohlížeče (localStorage). Načteš ho z části **Uložené projekty**. Pro zálohu použij export JSON.",
  'postava': "Vlastní postavu vytvoříš v záložce **🧑 POSTAVY**: nastav typ (hráč/NPC/nepřítel), výšku, šířku, barvy těla/hlavy/nohou, rychlost, skok, životy a mechaniky. Pak klikni **Přidat do scény**.",
  'mechaniky': "Mechaniky zapneš/vypneš v **🧑 POSTAVY** → sekce Mechaniky:\n• **Dvojitý skok** – skok ve vzduchu\n• **Dash** – rychlý pohyb (tlačítko B)\n• **Létání** – stiskni šipku nahoru ve vzduchu\n• **Útok** – tlačítko B\n• **Plavání** – pohyb pod vodou\n• **Šplhání** – lezení po zdech",
  'pc builder': "PC Builder se otevře po koupi **Počítače** nebo **Notebooku** v obchodě 💻 Elektronika. Vyber CPU, GPU, RAM, SSD, chlazení – vše v rámci svého rozpočtu. Po sestavení dostaneš hodnocení S/A/B/C a bonus skóre.",
  'kamera': "Kameru ve 3D hře přepínáš tlačítky vpravo nahoře:\n• **Follow** – kamera jde za hráčem\n• **Vršek** – pohled shora\n• **Bok** – boční pohled\n• **Free** – volná orbit kamera\nVzdálenost kamery nastav v ⚙️ NASTAVENÍ.",
  'nastavení': "Nastavení najdeš v záložce **⚙️ NASTAVENÍ**. Možnosti: herní režim 2D/3D, pohled kamery, gravitace, životy, stíny, mlha, kvalita renderu, hlasitost, PC Builder on/off.",
};

async function sendAIMessage() {
  if (aiTyping) return;
  const input = document.getElementById('ai-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = 'auto';
  addAIMessage(text, 'user');
  await getAIResponse(text);
}

function askAI(text) {
  const input = document.getElementById('ai-input');
  input.value = text;
  sendAIMessage();
}

function addAIMessage(text, role) {
  const msgs = document.getElementById('ai-messages');
  const isBot = role === 'bot';
  const div = document.createElement('div');
  div.className = `ai-msg ${role}`;
  div.innerHTML = `
    <div class="ai-avatar ${role}">${isBot ? '🤖' : '👤'}</div>
    <div class="ai-bubble ${role}">${formatAIText(text)}</div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = 'ai-msg';
  div.id = 'ai-typing-indicator';
  div.innerHTML = `
    <div class="ai-avatar bot">🤖</div>
    <div class="ai-typing">
      <div class="ai-dot"></div>
      <div class="ai-dot"></div>
      <div class="ai-dot"></div>
    </div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping() {
  document.getElementById('ai-typing-indicator')?.remove();
}

function formatAIText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
    .replace(/•\s/g, '&nbsp;• ')
    .replace(/\n/g, '<br>');
}

// Local knowledge base lookup
function getLocalAnswer(question) {
  const q = question.toLowerCase();
  for (const [key, answer] of Object.entries(GF_KB)) {
    if (q.includes(key)) return answer;
  }
  return null;
}

async function getAIResponse(userMsg) {
  aiTyping = true;
  showTyping();

  // First try local KB for instant response
  const localAnswer = getLocalAnswer(userMsg);
  if (localAnswer) {
    await new Promise(r => setTimeout(r, 600));
    hideTyping();
    addAIMessage(localAnswer, 'bot');
    aiHistory.push({ role: 'user', content: userMsg });
    aiHistory.push({ role: 'assistant', content: localAnswer });
    aiTyping = false;
    return;
  }

  // Try Claude API
  try {
    const systemPrompt = `Jsi GF AI – asistent pro GameForge, mobilní herní engine. Pomáháš uživatelům s:
- Přidáváním objektů do scény (hráč, NPC, nepřátelé, auta, shopy, peníze)
- Psaním JavaScript kódu pro herní logiku
- Nastavením fyziky, mechanik postav a herního systému
- Exportem hry (HTML, JSON, Unity)
- 2D a 3D herním módem s Three.js
- PC Builderem, shop systémem a money systémem
Odpovídej stručně a prakticky v češtině. Pokud jde o kód, ukaž konkrétní příklad.`;

    const messages = [
      ...aiHistory.slice(-8),
      { role: 'user', content: userMsg }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Omlouvám se, nemohu odpovědět.';
    hideTyping();
    addAIMessage(reply, 'bot');
    aiHistory.push({ role: 'user', content: userMsg });
    aiHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    hideTyping();
    // Fallback generic response
    const fallbacks = [
      "Zkus se podívat do záložky **💻 KÓD** – tam jsou připravené skripty pro herní logiku!",
      "V záložce **📦 OBJEKTY** najdeš všechny dostupné objekty rozdělené do kategorií.",
      "Projekt uložíš v záložce **💾 ULOŽIT** – podporuje export do HTML, JSON i Unity!",
      "Pro 3D mód klikni na **▶ Spustit 3D** nebo nastav režim v ⚙️ NASTAVENÍ.",
      "Vlastní postavu vytvoříš v záložce **🧑 POSTAVY** s plným nastavením mechanik.",
    ];
    const fb = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    addAIMessage(fb, 'bot');
  }
  aiTyping = false;
}

// ── BUTTON FIX – ensure all interactive elements work on mobile ──
function fixMobileButtons() {
  // Prevent ghost clicks
  document.querySelectorAll('.btn, .tab, .tool-btn, .add-tile, .mode-btn, .toggle-opt, .paint-tool-btn, .char-type-btn, .mechanic-toggle, .dpad-btn, .action-btn').forEach(el => {
    if (el.dataset.mobilFixed) return;
    el.dataset.mobilFixed = '1';
    el.addEventListener('touchend', e => {
      e.preventDefault();
      el.click();
    }, { passive: false });
  });
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Schedule notifications
  scheduleNotifications();

  // Fix mobile buttons after a short delay
  setTimeout(fixMobileButtons, 500);

  // Re-apply fix when new elements appear (tabs switch)
  const observer = new MutationObserver(() => fixMobileButtons());
  observer.observe(document.body, { childList: true, subtree: true });

  // Prevent context menu on long press (mobile)
  document.addEventListener('contextmenu', e => {
    if (e.target.closest('#game-wrap, #scene-wrap, #paint-canvas-wrap')) {
      e.preventDefault();
    }
  });
});
