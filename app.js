'use strict';
dayjs.extend(window.dayjs_plugin_isoWeek);

// ===== STATE =====
let trades   = JSON.parse(localStorage.getItem('ict_trades')   || '[]');
let journals = JSON.parse(localStorage.getItem('ict_journals') || '[]');
let coinNotes = JSON.parse(localStorage.getItem('ict_coinnotes') || '[]');
let riskSettings = JSON.parse(localStorage.getItem('ict_risk') || '{}');
let charts = {};
let equityRange = 'all';
let activeMistakeFilter = 'all';
let deleteTarget = null;

// ===== SYMBOLS =====
const SYMBOLS = [
  // Forex Majors
  { name:'EURUSD', cat:'Forex' }, { name:'GBPUSD', cat:'Forex' },
  { name:'USDJPY', cat:'Forex' }, { name:'AUDUSD', cat:'Forex' },
  { name:'USDCAD', cat:'Forex' }, { name:'NZDUSD', cat:'Forex' },
  { name:'USDCHF', cat:'Forex' }, { name:'EURCAD', cat:'Forex' },
  { name:'EURGBP', cat:'Forex' }, { name:'EURJPY', cat:'Forex' },
  { name:'GBPJPY', cat:'Forex' }, { name:'AUDJPY', cat:'Forex' },
  { name:'GBPCAD', cat:'Forex' }, { name:'CADJPY', cat:'Forex' },
  { name:'CHFJPY', cat:'Forex' }, { name:'EURCHF', cat:'Forex' },
  { name:'AUDCAD', cat:'Forex' }, { name:'AUDNZD', cat:'Forex' },
  // Indices
  { name:'NAS100', cat:'Endeks' }, { name:'US30',   cat:'Endeks' },
  { name:'SPX500', cat:'Endeks' }, { name:'GER40',  cat:'Endeks' },
  { name:'UK100',  cat:'Endeks' }, { name:'JP225',  cat:'Endeks' },
  { name:'AUS200', cat:'Endeks' }, { name:'FRA40',  cat:'Endeks' },
  { name:'HK50',   cat:'Endeks' }, { name:'INDIA50',cat:'Endeks' },
  // Metals / Commodities
  { name:'XAUUSD', cat:'Metal'  }, { name:'XAGUSD', cat:'Metal' },
  { name:'USOIL',  cat:'Emtia'  }, { name:'UKOIL',  cat:'Emtia' },
  { name:'NATGAS', cat:'Emtia'  }, { name:'COPPER',  cat:'Emtia' },
  // Crypto — Large Cap
  { name:'BTCUSD', cat:'Kripto'  }, { name:'ETHUSD', cat:'Kripto' },
  { name:'BNBUSD', cat:'Kripto'  }, { name:'SOLUSD', cat:'Kripto' },
  { name:'XRPUSD', cat:'Kripto'  }, { name:'ADAUSD', cat:'Kripto' },
  { name:'AVAXUSD',cat:'Kripto'  }, { name:'DOTUSD', cat:'Kripto' },
  { name:'LINKUSD',cat:'Kripto'  }, { name:'MATICUSD',cat:'Kripto'},
  { name:'LTCUSD', cat:'Kripto'  }, { name:'ATOMUSD', cat:'Kripto'},
  { name:'UNIUSD', cat:'Kripto'  }, { name:'BCHUSD',  cat:'Kripto'},
  // Crypto — Mid Cap / Alt
  { name:'NEARUSD', cat:'Alt'  }, { name:'FTMUSD',  cat:'Alt'   },
  { name:'INJUSD',  cat:'Alt'  }, { name:'SUIUSD',  cat:'Alt'   },
  { name:'APTUSD',  cat:'Alt'  }, { name:'ARBUSD',  cat:'Alt'   },
  { name:'OPUSD',   cat:'Alt'  }, { name:'TIAUSD',  cat:'Alt'   },
  { name:'SEIUSD',  cat:'Alt'  }, { name:'STXUSD',  cat:'Alt'   },
  { name:'RUNEUSD', cat:'Alt'  }, { name:'AAVEUSD', cat:'Alt'   },
  { name:'MKRUSD',  cat:'Alt'  }, { name:'SNXUSD',  cat:'Alt'   },
  { name:'LDOUSD',  cat:'Alt'  }, { name:'CRVUSD',  cat:'Alt'   },
  { name:'GMXUSD',  cat:'Alt'  }, { name:'JUPUSD',  cat:'Alt'   },
  { name:'WIFUSD',  cat:'Alt'  }, { name:'BONKUSD', cat:'Alt'   },
  { name:'PEPEUSD', cat:'Alt'  }, { name:'FLOKIUSD',cat:'Alt'   },
  { name:'WLDUSD',  cat:'Alt'  }, { name:'CFXUSD',  cat:'Alt'   },
  { name:'TONUSD',  cat:'Alt'  }, { name:'TRXUSD',  cat:'Alt'   },
  { name:'ICPUSD',  cat:'Alt'  }, { name:'HBARUSD', cat:'Alt'   },
  { name:'VETUSD',  cat:'Alt'  }, { name:'ALGOUSD', cat:'Alt'   },
  { name:'XTZUSD',  cat:'Alt'  }, { name:'EOSUSD',  cat:'Alt'   },
  { name:'FTTUSD',  cat:'Alt'  }, { name:'MANAUSD', cat:'Alt'   },
  { name:'SANDUSD', cat:'Alt'  }, { name:'AXSUSD',  cat:'Alt'   },
  { name:'GALAUSD', cat:'Alt'  }, { name:'IMXUSD',  cat:'Alt'   },
  { name:'APEBUSD', cat:'Alt'  }, { name:'ILVUSD',  cat:'Alt'   },
  { name:'DYDXUSD', cat:'Alt'  }, { name:'COMPUSD', cat:'Alt'   },
  { name:'ZRXUSD',  cat:'Alt'  }, { name:'BALUSD',  cat:'Alt'   },
  { name:'YFIUSD',  cat:'Alt'  }, { name:'SUSHIUSD',cat:'Alt'   },
  { name:'1INCHUSD',cat:'Alt'  }, { name:'ENSDUSD', cat:'Alt'   },
  { name:'GMUSD',   cat:'Alt'  }, { name:'PENDLEUSD',cat:'Alt'  },
  { name:'EIGENSDX',cat:'Alt'  }, { name:'ETHFIUSD',cat:'Alt'   },
  { name:'REZUSD',  cat:'Alt'  }, { name:'SAGAUSD', cat:'Alt'   },
  { name:'PORTALUSD',cat:'Alt' }, { name:'ALTUSD',  cat:'Alt'   },
  { name:'ZKUSD',   cat:'Alt'  }, { name:'ZROUSD',  cat:'Alt'   },
  { name:'STRKUSD', cat:'Alt'  }, { name:'BLASTUS', cat:'Alt'   },
  // Crypto — Meme / Speculative
  { name:'DOGEUSD', cat:'Meme' }, { name:'SHIBUSD', cat:'Meme'  },
  { name:'TRUMPUSD',cat:'Meme' }, { name:'FARTCUSD',cat:'Meme'  },
];

const MISTAKE_LABELS = {
  fomo:'FOMO Girişi', revenge:'Revenge Trade', overleverage:'Aşırı Lot',
  early:'Erken Giriş', late:'Geç Giriş', no_confluence:'Confluence Yok',
  sl_moved:'SL Taşıdı', tp_early:'Erken TP', news:'Haberde İşlem',
  no_stop:'Stop Koyulmadı', chase:'Fiyat Kovaladı', no_plan:'Plansız Giriş'
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupForm();
  setupScreenshot();
  setupCalNav();
  setupKeyboard();
  setupSymbolAC('symbol-autocomplete', 'f-symbol-input', 'symbol-dropdown', 'f-symbol');
  setupSymbolAC('calc-symbol-ac', 'calc-symbol-input', 'calc-symbol-dropdown', 'calc-symbol');
  setupSymbolAC('coin-symbol-ac', 'coin-symbol-input', 'coin-symbol-dropdown', 'coin-symbol');
  setupCoinNotes();

  document.getElementById('header-date').textContent =
    dayjs().format('DD MMMM YYYY').toUpperCase();
  document.getElementById('f-date').value = dayjs().format('YYYY-MM-DDTHH:mm');
  document.getElementById('j-date').value = dayjs().format('YYYY-MM-DD');

  // Equity range tabs
  document.querySelectorAll('.ctab').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      equityRange = btn.dataset.range;
      renderEquityChart();
    })
  );

  // Trade log filters
  ['trade-search','trade-filter-result','trade-filter-setup'].forEach(id =>
    document.getElementById(id).addEventListener('input', renderTradeLog)
  );
  document.getElementById('trade-filter-setup').addEventListener('change', renderTradeLog);

  // Delete confirm
  document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (deleteTarget !== null) {
      trades = trades.filter(t => t.id !== deleteTarget);
      save(); refreshAll(); closeDeleteModal();
    }
  });

  // Risk calc inputs
  ['f-entry','f-sl','f-tp','f-risk-pct'].forEach(id =>
    document.getElementById(id).addEventListener('input', updateRiskCalc)
  );

  loadRiskSettings();
  renderDashboard();
});

// ===== NAVIGATION =====
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(btn =>
    btn.addEventListener('click', () => goToPage(btn.dataset.page))
  );
}

function goToPage(name) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${name}"]`)?.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelector('.main').scrollTop = 0;
  if (name === 'dashboard') renderDashboard();
  if (name === 'trades')    renderTradeLog();
  if (name === 'analytics') renderAnalytics();
  if (name === 'journal')   renderJournal();
  if (name === 'calendar')  renderCalendar();
  if (name === 'risk')      renderRiskPage();
  if (name === 'mistakes')  renderMistakePage();
}

function setupKeyboard() {
  const pages = ['dashboard','trades','add','risk','mistakes','analytics','journal','calendar'];
  document.addEventListener('keydown', e => {
    // Ignore while typing or with modifier keys
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input','textarea','select'].includes(tag) || e.target.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Lightbox controls take priority when open
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open')) {
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft')  { lbStep(-1); return; }
      if (e.key === 'ArrowRight') { lbStep(1);  return; }
    }
    // Esc closes any open modal
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal:not(.hidden)').forEach(m => m.classList.add('hidden'));
      document.getElementById('shortcut-help')?.remove();
      return;
    }
    // 1-8 → pages
    if (e.key >= '1' && e.key <= '8') { goToPage(pages[+e.key - 1]); return; }
    // n → new trade
    if (e.key === 'n' || e.key === 'N') { goToPage('add'); return; }
    // / → focus trade search
    if (e.key === '/') {
      goToPage('trades');
      setTimeout(() => document.getElementById('trade-search')?.focus(), 50);
      e.preventDefault(); return;
    }
    // ? → shortcuts help
    if (e.key === '?') { toggleShortcutHelp(); return; }
  });
}

function toggleShortcutHelp() {
  let el = document.getElementById('shortcut-help');
  if (el) { el.remove(); return; }
  el = document.createElement('div');
  el.id = 'shortcut-help';
  el.className = 'shortcut-help';
  el.innerHTML = `
    <div class="sh-title">Klavye Kısayolları</div>
    <div class="sh-row"><kbd>1</kbd>–<kbd>8</kbd><span>Sayfalar arası geçiş</span></div>
    <div class="sh-row"><kbd>N</kbd><span>Yeni trade ekle</span></div>
    <div class="sh-row"><kbd>/</kbd><span>Trade ara</span></div>
    <div class="sh-row"><kbd>Esc</kbd><span>Pencereyi kapat</span></div>
    <div class="sh-row"><kbd>?</kbd><span>Bu menüyü aç / kapat</span></div>`;
  el.onclick = () => el.remove();
  document.body.appendChild(el);
}

function refreshAll() {
  const id = document.querySelector('.page.active')?.id.replace('page-','');
  if (id === 'dashboard') renderDashboard();
  if (id === 'trades')    renderTradeLog();
  if (id === 'analytics') renderAnalytics();
  if (id === 'risk')      renderRiskPage();
  if (id === 'mistakes')  renderMistakePage();
}

function save() {
  localStorage.setItem('ict_trades', JSON.stringify(trades));
  localStorage.setItem('ict_journals', JSON.stringify(journals));
  localStorage.setItem('ict_coinnotes', JSON.stringify(coinNotes));
}

// ===== SYMBOL AUTOCOMPLETE =====
function setupSymbolAC(wrapperId, inputId, dropdownId, hiddenId) {
  const input    = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const hidden   = document.getElementById(hiddenId);
  let idx = -1;

  function render(list) {
    dropdown.innerHTML = list.map((s, i) =>
      `<div class="symbol-option" data-name="${s.name}" data-i="${i}">
        <span class="symbol-name">${s.name}</span>
        <span class="symbol-cat">${s.cat}</span>
      </div>`
    ).join('');
    dropdown.classList.toggle('hidden', !list.length);
    idx = -1;
    dropdown.querySelectorAll('.symbol-option').forEach(el =>
      el.addEventListener('mousedown', e => {
        e.preventDefault();
        selectSymbol(el.dataset.name, input, hidden, dropdown);
      })
    );
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toUpperCase();
    if (!q) { dropdown.classList.add('hidden'); hidden.value = ''; return; }
    render(SYMBOLS.filter(s => s.name.includes(q)).slice(0, 12));
  });

  input.addEventListener('keydown', e => {
    const opts = dropdown.querySelectorAll('.symbol-option');
    if (e.key === 'ArrowDown') { idx = Math.min(idx+1, opts.length-1); highlight(opts); e.preventDefault(); }
    if (e.key === 'ArrowUp')   { idx = Math.max(idx-1, 0);             highlight(opts); e.preventDefault(); }
    if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); selectSymbol(opts[idx].dataset.name, input, hidden, dropdown); }
    if (e.key === 'Escape') dropdown.classList.add('hidden');
  });

  input.addEventListener('blur', () => setTimeout(() => dropdown.classList.add('hidden'), 150));
  input.addEventListener('focus', () => {
    const q = input.value.trim().toUpperCase();
    if (q) render(SYMBOLS.filter(s => s.name.includes(q)).slice(0, 12));
  });

  function highlight(opts) {
    opts.forEach((o, i) => o.classList.toggle('highlighted', i === idx));
  }
}

function selectSymbol(name, input, hidden, dropdown) {
  input.value  = name;
  hidden.value = name;
  dropdown.classList.add('hidden');
}

// ===== FORM SETUP =====
function setupForm() {
  // Direction
  document.querySelectorAll('.dir-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('f-direction').value = btn.dataset.dir;
    })
  );

  // Result
  document.querySelectorAll('.res-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.res-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('f-result').value = btn.dataset.res;
      if (btn.dataset.res === 'be') document.getElementById('f-pnl').value = 0;
    })
  );

  // Entry model
  document.querySelectorAll('.em-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.em-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('f-entry-model').value = btn.dataset.val;
    })
  );

  // Mistake pills — "İhlal Yok" is mutually exclusive with the rest
  document.querySelectorAll('#mistake-checkboxes input').forEach(cb =>
    cb.addEventListener('change', () => {
      if (cb.value === 'none' && cb.checked) {
        document.querySelectorAll('#mistake-checkboxes input').forEach(o => { if (o !== cb) o.checked = false; });
      } else if (cb.value !== 'none' && cb.checked) {
        const none = document.querySelector('#mistake-checkboxes input[value="none"]');
        if (none) none.checked = false;
      }
    })
  );

  setupEmoBtns('#emotion-btns', 'f-emotion');
  document.getElementById('trade-form').addEventListener('submit', saveTrade);
}

function setupEmoBtns(sel, hid) {
  document.querySelectorAll(`${sel} .emo-btn`).forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll(`${sel} .emo-btn`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(hid).value = btn.dataset.val;
    })
  );
}
setupEmoBtns('#j-emotion-btns', 'j-emotion');

// ===== RISK CALC (form) =====
function updateRiskCalc() {
  const entry   = parseFloat(document.getElementById('f-entry').value);
  const sl      = parseFloat(document.getElementById('f-sl').value);
  const tp      = parseFloat(document.getElementById('f-tp').value);
  const riskInput = document.getElementById('f-risk-pct');
  let riskPct   = parseFloat(riskInput.value) || riskSettings.riskPct || 1;
  const balance = riskSettings.balance || 0;

  const rrEl    = document.getElementById('rc-rr');
  const riskEl  = document.getElementById('rc-risk-usd');
  const lotEl   = document.getElementById('rc-lot');
  const rewardEl= document.getElementById('rc-reward');
  const alertEl = document.getElementById('rc-alert');

  // Risk level warning — never blocks input, only informs.
  const maxSafe = riskSettings.maxRisk || 2;
  if (riskPct > maxSafe) {
    const lvl = riskPct >= 10 ? 'danger' : 'warn';
    const msg = riskPct >= 10
      ? `🚨 Aşırı risk! %${riskPct} — bu işlem kasanın %${riskPct}'ini riske atıyor. Üst üste birkaç kayıp hesabı bitirir.`
      : `⚠️ Yüksek risk: %${riskPct} (önerilen maks %${maxSafe}). Emin değilsen pozisyonu küçült.`;
    alertEl.textContent = msg;
    alertEl.className   = `rc-alert rc-alert-${lvl}`;
    alertEl.classList.remove('hidden');
  } else {
    alertEl.classList.add('hidden');
  }

  if (!entry || !sl) return;

  const riskPip = Math.abs(entry - sl);
  const rr      = tp ? (Math.abs(tp - entry) / riskPip).toFixed(2) : '—';
  rrEl.textContent = tp ? `1:${rr}` : '—';

  if (balance > 0) {
    const riskUSD = (balance * riskPct / 100).toFixed(2);
    const pipVal  = estimatePipVal(document.getElementById('f-symbol').value);
    const lot     = pipVal > 0
      ? (riskUSD / (riskPip * 10000 * pipVal)).toFixed(2)
      : '—';
    riskEl.textContent  = `$${riskUSD}`;
    lotEl.textContent   = lot !== '—' ? `${lot} lot` : '—';
    rewardEl.textContent = tp && rr !== '—'
      ? `+$${(parseFloat(riskUSD) * parseFloat(rr)).toFixed(2)}` : '—';
  } else {
    riskEl.textContent  = '— (bakiye girin)';
    lotEl.textContent   = '—';
    rewardEl.textContent= '—';
  }
}

function estimatePipVal(symbol) {
  if (!symbol) return 0;
  if (symbol.includes('JPY'))  return 9.3;
  if (symbol.includes('GBP'))  return 13;
  if (symbol === 'XAUUSD')     return 10;
  if (symbol === 'NAS100' || symbol === 'US30') return 1;
  return 10; // default
}

// ===== SAVE TRADE =====
function saveTrade(e) {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;

  const setups = Array.from(
    document.querySelectorAll('#setup-checkboxes input:checked')
  ).map(cb => cb.value);

  if (!setups.length) { alert('En az bir setup seçin'); return; }

  const dir = document.getElementById('f-direction').value;
  if (!dir) { alert('Yön seçin'); return; }
  const result = document.getElementById('f-result').value;
  if (!result) { alert('Sonuç seçin'); return; }
  const symbol = document.getElementById('f-symbol').value;
  if (!symbol) { alert('Sembol seçin'); return; }

  const entry   = parseFloat(document.getElementById('f-entry').value);
  const sl      = parseFloat(document.getElementById('f-sl').value);
  const tp      = parseFloat(document.getElementById('f-tp').value);
  const riskPip = Math.abs(entry - sl);
  const rr      = tp && riskPip > 0
    ? parseFloat((Math.abs(tp - entry) / riskPip).toFixed(2)) : 0;

  const mistakes = Array.from(
    document.querySelectorAll('#mistake-checkboxes input:checked')
  ).map(cb => cb.value);

  const trade = {
    id:          id || Date.now().toString(),
    date:        document.getElementById('f-date').value,
    symbol,
    direction:   dir,
    htf:         document.getElementById('f-htf').value,
    setups,
    entryModel:  document.getElementById('f-entry-model').value,
    entry, sl, tp, rr,
    lot:         parseFloat(document.getElementById('f-lot').value) || 0,
    riskPct:     parseFloat(document.getElementById('f-risk-pct').value) || riskSettings.riskPct || 1,
    result,
    pnl:         parseFloat(document.getElementById('f-pnl').value) || 0,
    emotion:     parseInt(document.getElementById('f-emotion').value) || 3,
    mistakes,
    plan:        document.getElementById('f-plan').value,
    lesson:      document.getElementById('f-lesson').value,
    screenshots: [...formShots],
    screenshot:  formShots[0] || '',   // backward-compat
    weeklyTP:    document.getElementById('f-weekly-tp').checked,
  };

  if (id) {
    const idx = trades.findIndex(t => t.id === id);
    if (idx > -1) trades[idx] = trade;
  } else {
    trades.push(trade);
  }
  save(); resetForm(); goToPage('trades'); renderTradeLog();
}

function resetForm() {
  document.getElementById('trade-form').reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('form-title').textContent = 'Trade Ekle';
  document.querySelectorAll('.dir-btn,.res-btn,.em-btn,.emo-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('f-direction').value = '';
  document.getElementById('f-result').value = '';
  document.getElementById('f-entry-model').value = '';
  document.getElementById('f-emotion').value = '3';
  document.getElementById('f-symbol').value = '';
  document.getElementById('f-symbol-input').value = '';
  document.querySelectorAll('#setup-checkboxes input').forEach(cb => cb.checked = false);
  document.querySelectorAll('#mistake-checkboxes input').forEach(cb => cb.checked = false);
  document.getElementById('f-date').value = dayjs().format('YYYY-MM-DDTHH:mm');
  ['rc-rr','rc-risk-usd','rc-lot','rc-reward'].forEach(id => document.getElementById(id).textContent = '—');
  resetScreenshot();
}

function cancelEdit() { resetForm(); goToPage('trades'); }

function editTrade(id) {
  const t = trades.find(t => t.id === id);
  if (!t) return;
  document.getElementById('edit-id').value = t.id;
  document.getElementById('form-title').textContent = 'Trade Düzenle';
  document.getElementById('f-date').value    = t.date;
  document.getElementById('f-symbol').value  = t.symbol;
  document.getElementById('f-symbol-input').value = t.symbol;
  document.getElementById('f-htf').value     = t.htf;
  document.getElementById('f-entry').value   = t.entry;
  document.getElementById('f-sl').value      = t.sl;
  document.getElementById('f-tp').value      = t.tp;
  document.getElementById('f-lot').value     = t.lot;
  document.getElementById('f-risk-pct').value= t.riskPct || '';
  document.getElementById('f-result').value  = t.result;
  document.getElementById('f-pnl').value     = t.pnl;
  document.getElementById('f-emotion').value = t.emotion;
  document.getElementById('f-plan').value    = t.plan || '';
  document.getElementById('f-lesson').value  = t.lesson || '';
  document.getElementById('f-weekly-tp').checked = t.weeklyTP || false;

  document.querySelectorAll('.dir-btn').forEach(b => b.classList.toggle('active', b.dataset.dir === t.direction));
  document.querySelectorAll('.res-btn').forEach(b => b.classList.toggle('active', b.dataset.res === t.result));
  document.querySelectorAll('.em-btn').forEach(b => b.classList.toggle('active', b.dataset.val === t.entryModel));
  document.querySelectorAll('#emotion-btns .emo-btn').forEach(b => b.classList.toggle('active', b.dataset.val == t.emotion));
  document.getElementById('f-direction').value    = t.direction;
  document.getElementById('f-entry-model').value  = t.entryModel || '';

  document.querySelectorAll('#setup-checkboxes input').forEach(cb =>
    cb.checked = (t.setups || []).includes(cb.value)
  );

  document.querySelectorAll('#mistake-checkboxes input').forEach(cb =>
    cb.checked = (t.mistakes || []).includes(cb.value)
  );

  formShots = tradeShots(t);
  renderShotThumbs();

  updateRiskCalc();
  goToPage('add');
}

// Normalize a trade's images to an array (handles old single-screenshot trades).
function tradeShots(t) {
  if (Array.isArray(t.screenshots) && t.screenshots.length) return [...t.screenshots];
  if (t.screenshot) return [t.screenshot];
  return [];
}

function confirmDelete(id) {
  deleteTarget = id;
  document.getElementById('delete-modal').classList.remove('hidden');
}
function closeDeleteModal() {
  deleteTarget = null;
  document.getElementById('delete-modal').classList.add('hidden');
}

// ===== DASHBOARD =====
function renderDashboard() {
  const sorted = [...trades].sort((a,b) => new Date(a.date)-new Date(b.date));
  const wins   = trades.filter(t => t.result === 'win');
  const losses = trades.filter(t => t.result === 'loss');
  const total  = trades.length;
  const wr     = total ? ((wins.length/total)*100).toFixed(1) : 0;
  const totalPNL = trades.reduce((s,t) => s+(t.pnl||0), 0);
  const avgPNL   = total ? totalPNL/total : 0;
  const grossW   = wins.reduce((s,t)   => s+(t.pnl||0), 0);
  const grossL   = Math.abs(losses.reduce((s,t) => s+(t.pnl||0), 0));
  const pf       = grossL > 0 ? (grossW/grossL).toFixed(2) : grossW > 0 ? '∞' : 0;
  const avgRR    = total ? (trades.reduce((s,t) => s+(t.rr||0),0)/total).toFixed(2) : 0;

  let maxStreak = 0, cur = 0;
  sorted.forEach(t => { if (t.result==='win'){cur++;maxStreak=Math.max(maxStreak,cur);}else cur=0; });

  let peak=0, eq=0, maxDD=0;
  sorted.forEach(t => { eq+=t.pnl||0; if(eq>peak)peak=eq; maxDD=Math.max(maxDD,peak-eq); });

  const wkCount = renderWeekHub();

  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-total-sub').textContent= `Bu hafta: ${wkCount}`;
  document.getElementById('stat-winrate').textContent  = wr + '%';
  document.getElementById('stat-wr-sub').textContent   = `W: ${wins.length} / L: ${losses.length}`;
  const pnlEl = document.getElementById('stat-pnl');
  pnlEl.textContent  = fmtPNL(totalPNL);
  pnlEl.className    = 'stat-value ' + (totalPNL >= 0 ? 'up' : 'down');
  document.getElementById('stat-pnl-sub').textContent  = `Ortalama: ${fmtPNL(avgPNL)}`;
  document.getElementById('stat-pf').textContent       = pf;
  document.getElementById('stat-pf-sub').textContent   = `Avg RR: ${avgRR}`;
  document.getElementById('stat-streak').textContent   = maxStreak;
  document.getElementById('stat-dd').textContent       = '-' + fmtPNL(maxDD);

  renderEquityChart();
  renderSetupChart();
  renderDailyChart();
  renderEntryModelChartDash();
  renderMistakeChartDash();
  renderRecentTrades();
}

// Realized R-multiple for a trade. Uses risk amount from balance,
// falls back to planned RR / -1 when balance is unknown.
function tradeR(t) {
  const bal = riskSettings.balance || 0;
  const riskAmt = bal && t.riskPct ? bal * t.riskPct / 100 : 0;
  if (riskAmt > 0) return (t.pnl || 0) / riskAmt;
  if (t.result === 'win')  return t.rr || 1;
  if (t.result === 'loss') return -1;
  return 0;
}

function renderWeekHub() {
  const wkStart  = dayjs().startOf('isoWeek');
  const wkEnd    = dayjs().endOf('isoWeek');
  const wkTrades = trades.filter(t => dayjs(t.date).isAfter(wkStart) && dayjs(t.date).isBefore(wkEnd));
  const wkCount  = wkTrades.length;
  const wkPNL    = wkTrades.reduce((s,t)=>s+(t.pnl||0),0);
  const wkWins   = wkTrades.filter(t=>t.result==='win').length;
  const wkWR     = wkCount ? Math.round(wkWins/wkCount*100) : 0;
  const wkR      = wkTrades.reduce((s,t)=>s+tradeR(t),0);
  const wkTP     = wkTrades.filter(t=>t.weeklyTP).length;
  const wkClean  = wkTrades.filter(t => !(t.mistakes||[]).some(m => m && m!=='none')).length;
  const wkDisc   = wkCount ? Math.round(wkClean/wkCount*100) : 0;

  const goal = riskSettings.weeklyGoal || 0;

  document.getElementById('wh-range').textContent =
    `${wkStart.format('DD MMM')} – ${wkEnd.format('DD MMM')}`;

  const curEl = document.getElementById('wh-current');
  curEl.textContent = fmtPNL(wkPNL);

  const fill   = document.getElementById('wh-bar-fill');
  const pctEl  = document.getElementById('wh-pct');
  const tgtEl  = document.getElementById('wh-target');
  const goalWrap = document.querySelector('.wh-goal-val');

  if (goal > 0) {
    tgtEl.textContent = fmtPNL(goal);
    const pct = Math.max(0, Math.min(100, (wkPNL / goal) * 100));
    fill.style.width = (wkPNL < 0 ? Math.min(100, Math.abs(wkPNL/goal)*100) : pct) + '%';
    fill.classList.toggle('reached', wkPNL >= goal);
    fill.classList.toggle('negative', wkPNL < 0);
    goalWrap.classList.toggle('reached', wkPNL >= goal);
    pctEl.textContent = wkPNL < 0 ? '' : Math.round(pct) + '%';
  } else {
    tgtEl.innerHTML = `<button class="wh-set-goal" onclick="goToPage('risk')">hedef belirle →</button>`;
    fill.style.width = '0%';
    fill.classList.remove('reached','negative');
    goalWrap.classList.remove('reached');
    pctEl.textContent = '';
  }

  const setVal = (id, val, cls) => {
    const el = document.getElementById(id);
    el.textContent = val;
    el.className = 'wh-stat-val' + (cls ? ' ' + cls : '');
  };
  setVal('wh-count', wkCount || '0');
  setVal('wh-wr', wkCount ? '%'+wkWR : '—', wkCount ? (wkWR>=50?'up':'down') : '');
  setVal('wh-r', wkCount ? (wkR>=0?'+':'')+wkR.toFixed(1)+'R' : '—', wkCount ? (wkR>=0?'up':'down') : '');
  setVal('wh-tp', wkTP, wkTP>0?'gold':'');
  setVal('wh-disc', wkCount ? '%'+wkDisc : '—', wkCount ? (wkDisc>=70?'up':wkDisc>=40?'gold':'down') : '');

  return wkCount;
}

function renderEquityChart() {
  let sorted = [...trades].sort((a,b) => new Date(a.date)-new Date(b.date));
  if (equityRange === 'week')  sorted = sorted.filter(t => dayjs(t.date).isAfter(dayjs().startOf('isoWeek')));
  if (equityRange === 'month') sorted = sorted.filter(t => dayjs(t.date).isAfter(dayjs().startOf('month')));
  let eq = 0;
  const labels = ['Start'];
  const data   = [0];
  sorted.forEach(t => { eq += t.pnl||0; labels.push(dayjs(t.date).format('DD/MM')); data.push(+eq.toFixed(2)); });
  const ctx = document.getElementById('equityChart').getContext('2d');
  if (charts.equity) charts.equity.destroy();
  const color = data[data.length-1] >= 0 ? '#c9a84c' : '#e05050';
  const g = ctx.createLinearGradient(0,0,0,200);
  g.addColorStop(0, color+'33'); g.addColorStop(1, color+'00');
  charts.equity = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets:[{ data, borderColor:color, backgroundColor:g, borderWidth:2, pointRadius: sorted.length<40?3:0, tension:.35, fill:true }] },
    options: chartOpts({ yPrefix:'$' })
  });
}

function renderSetupChart() {
  const counts = {};
  trades.forEach(t => (t.setups||[]).forEach(s => counts[s]=(counts[s]||0)+1));
  destroyChart('setupChart');
  charts.setupChart = new Chart(document.getElementById('setupChart').getContext('2d'), {
    type:'doughnut',
    data:{ labels:Object.keys(counts), datasets:[{ data:Object.values(counts), backgroundColor:COLORS, borderWidth:0 }] },
    options:{ ...pieOpts(), plugins:{ legend:{ position:'right', labels:{ color:'#7f8caa', font:{size:11}, padding:8 } } } }
  });
}

function renderDailyChart() {
  const days = ['Pzt','Sal','Çar','Per','Cum'];
  const pnl = [0,0,0,0,0];
  trades.forEach(t => { const d=dayjs(t.date).day(); if(d>=1&&d<=5) pnl[d-1]+=(t.pnl||0); });
  destroyChart('dailyChart');
  charts.dailyChart = new Chart(document.getElementById('dailyChart').getContext('2d'), {
    type:'bar',
    data:{ labels:days, datasets:[{ data:pnl, backgroundColor:pnl.map(v=>v>=0?'#c9a84c55':'#e0505055'), borderRadius:4 }] },
    options: chartOpts({ yPrefix:'$' })
  });
}

function renderEntryModelChartDash() {
  const models = [...new Set(trades.map(t=>t.entryModel).filter(Boolean))];
  const wr = models.map(m => {
    const mt = trades.filter(t=>t.entryModel===m);
    return mt.length ? +(mt.filter(t=>t.result==='win').length/mt.length*100).toFixed(1) : 0;
  });
  destroyChart('entryModelChart');
  charts.entryModelChart = new Chart(document.getElementById('entryModelChart').getContext('2d'), {
    type:'bar',
    data:{ labels:models, datasets:[{ data:wr, backgroundColor:'#a78bfa55', borderRadius:5 }] },
    options: chartOpts({ ySuffix:'%' })
  });
}

function renderMistakeChartDash() {
  const counts = {};
  trades.forEach(t=>(t.mistakes||[]).forEach(m=>{if(m!=='none')counts[m]=(counts[m]||0)+1;}));
  const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  destroyChart('mistakeChartDash');
  charts.mistakeChartDash = new Chart(document.getElementById('mistakeChartDash').getContext('2d'), {
    type:'bar',
    data:{ labels:top.map(([k])=>MISTAKE_LABELS[k]||k), datasets:[{ data:top.map(([,v])=>v), backgroundColor:'#e0505055', borderRadius:5 }] },
    options:{ ...chartOpts(), indexAxis:'y' }
  });
}

function renderRecentTrades() {
  const recent = [...trades].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
  const el = document.getElementById('recent-trades');
  if (!recent.length) { el.innerHTML = emptyState('📊','Henüz trade yok','İlk işleminizi ekleyerek günlüğünüze başlayın.',{fn:"goToPage('add')",label:'Trade Ekle'}); return; }
  el.innerHTML = recent.map(tradeRowHTML).join('');
}

function tradeRowHTML(t) {
  const pnlCls = t.pnl>0?'pnl-positive':t.pnl<0?'pnl-negative':'pnl-zero';
  const setupBadges = (t.setups||[t.setup]).filter(Boolean).slice(0,2).map(s=>`<span class="badge setup">${s}</span>`).join(' ');
  return `
  <div class="trade-row ${t.result}" onclick="openTradeModal('${t.id}')">
    <span style="color:var(--text3);font-size:11px">${dayjs(t.date).format('DD/MM/YY HH:mm')}</span>
    <span style="font-weight:700;color:var(--text)">${t.symbol}</span>
    <span class="badge ${t.direction}">${(t.direction||'').toUpperCase()}</span>
    <span>${setupBadges}</span>
    <span class="badge em">${t.entryModel||'—'}</span>
    <span style="color:var(--accent2)">1:${t.rr}</span>
    <span class="${pnlCls}">${fmtPNL(t.pnl)}</span>
    <span class="badge ${t.result}-badge">${resLabel(t.result)}</span>
  </div>`;
}

// ===== TRADE LOG =====
function renderTradeLog() {
  const q  = document.getElementById('trade-search').value.toLowerCase();
  const fr = document.getElementById('trade-filter-result').value;
  const fs = document.getElementById('trade-filter-setup').value;
  let rows = [...trades].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if (q)  rows = rows.filter(t=>t.symbol?.toLowerCase().includes(q)||(t.setups||[]).some(s=>s.toLowerCase().includes(q)));
  if (fr) rows = rows.filter(t=>t.result===fr);
  if (fs) rows = rows.filter(t=>(t.setups||[]).includes(fs));
  const tbody = document.getElementById('trades-tbody');
  if (!rows.length) { tbody.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text3)">Trade bulunamadı</td></tr>`; return; }
  tbody.innerHTML = rows.map(t => {
    const pnlCls = t.pnl>0?'pnl-positive':t.pnl<0?'pnl-negative':'pnl-zero';
    const setupBadges = (t.setups||[t.setup]).filter(Boolean).map(s=>`<span class="badge setup">${s}</span>`).join(' ');
    return `<tr>
      <td>${dayjs(t.date).format('DD/MM/YY HH:mm')}</td>
      <td style="font-weight:700;color:var(--text)">${t.symbol}</td>
      <td><span class="badge ${t.direction}">${(t.direction||'').toUpperCase()}</span></td>
      <td>${setupBadges}</td>
      <td><span class="badge em">${t.entryModel||'—'}</span></td>
      <td style="color:var(--accent2)">1:${t.rr}</td>
      <td class="${pnlCls}">${fmtPNL(t.pnl)}</td>
      <td><span class="badge ${t.result}-badge">${resLabel(t.result)}</span></td>
      <td><div class="action-btns">
        <button class="btn-icon-sm" onclick="openTradeModal('${t.id}')">👁</button>
        <button class="btn-icon-sm" onclick="editTrade('${t.id}')">✏️</button>
        <button class="btn-icon-sm delete" onclick="confirmDelete('${t.id}')">🗑</button>
      </div></td>
    </tr>`;
  }).join('');
}

// ===== TRADE DETAIL (full-page report) =====
let detailReturnPage = 'trades';

function openTradeModal(id) {
  const t = trades.find(t=>t.id===id);
  if (!t) return;
  const active = document.querySelector('.page.active');
  if (active && active.id !== 'page-trade-detail') detailReturnPage = active.id.replace('page-','');
  renderTradeDetail(t);
  goToPage('trade-detail');
}
function closeModal() { document.getElementById('trade-modal')?.classList.add('hidden'); }

function renderTradeDetail(t) {
  const emos = ['','😰','😟','😐','🙂','😊'];
  const emoLabels = ['','Çok kötü','Endişeli','Nötr','İyi','Çok iyi'];
  const dirCls = t.direction === 'long' ? 'long' : 'short';
  const pnlCls = t.pnl>0?'up':t.pnl<0?'down':'';
  const setupBadges = (t.setups||[t.setup]).filter(Boolean)
    .map(s=>`<span class="badge setup">${s}</span>`).join(' ') || '<span style="color:var(--dim);font-size:12px">—</span>';
  const mlist = (t.mistakes||[]).filter(m=>m && m!=='none');
  const shots = tradeShots(t);
  const rVal = tradeR(t);

  // Price ladder — sort entry/sl/tp by price descending for a real ladder
  const rows = [
    { label:'Take Profit', v:t.tp,    role:'tp' },
    { label:'Giriş',       v:t.entry, role:'entry' },
    { label:'Stop Loss',   v:t.sl,    role:'sl' },
  ].filter(r => r.v != null && r.v !== '' && !isNaN(r.v))
   .sort((a,b)=> b.v - a.v);
  const ladder = rows.map(r =>
    `<div class="tr-rung ${r.role}">
       <span class="tr-rung-label">${r.label}</span>
       <span class="tr-rung-price">${r.v}</span>
     </div>`).join('');

  document.getElementById('trade-detail-body').innerHTML = `
  <div class="tr-report">
    <div class="tr-bar">
      <button class="tr-back" onclick="goToPage(detailReturnPage)">← Geri</button>
      <div class="tr-bar-actions">
        <button class="btn-secondary btn-sm" onclick="editTrade('${t.id}')">✏️ Düzenle</button>
        <button class="btn-ghost btn-sm" onclick="confirmDelete('${t.id}')" style="color:var(--loss);border-color:rgba(232,93,93,.25)">🗑 Sil</button>
      </div>
    </div>

    <div class="tr-head">
      <div>
        <div class="tr-symbol">${t.symbol} <span class="badge ${dirCls}">${(t.direction||'').toUpperCase()}</span></div>
        <div class="tr-sub">${dayjs(t.date).format('DD MMMM YYYY · HH:mm')} &nbsp;·&nbsp; ${t.htf||'—'} HTF &nbsp;·&nbsp; ${t.entryModel||'—'}</div>
        <div class="tr-confluence">${setupBadges}</div>
      </div>
      <div class="tr-head-right">
        <div class="tr-pnl ${pnlCls}">${fmtPNL(t.pnl)}</div>
        <div class="tr-result"><span class="badge ${t.result}-badge">${resLabel(t.result)}</span>
          <span class="tr-rmult ${rVal>=0?'up':'down'}">${rVal>=0?'+':''}${rVal.toFixed(2)}R</span>
        </div>
      </div>
    </div>

    <div class="tr-grid">
      <div class="tr-panel tr-ladder-panel">
        <div class="tr-panel-title">Pozisyon Kurgusu</div>
        <div class="tr-ladder">${ladder || '<span style="color:var(--dim)">Fiyat girilmemiş</span>'}</div>
        <div class="tr-rr-badge">Risk / Reward &nbsp; <b>1:${t.rr||'—'}</b></div>
      </div>

      <div class="tr-panel">
        <div class="tr-panel-title">Metrikler</div>
        <div class="tr-metrics">
          <div class="tr-metric"><span>R Sonuç</span><b class="${rVal>=0?'up':'down'}">${rVal>=0?'+':''}${rVal.toFixed(2)}R</b></div>
          <div class="tr-metric"><span>Risk %</span><b>${t.riskPct!=null?'%'+t.riskPct:'—'}</b></div>
          <div class="tr-metric"><span>Lot</span><b>${t.lot||'—'}</b></div>
          <div class="tr-metric"><span>Ruh Hali</span><b title="${emoLabels[t.emotion]||''}">${emos[t.emotion]||'😐'}</b></div>
          <div class="tr-metric"><span>Haftalık TP</span><b>${t.weeklyTP?'<span class="up">✓ Evet</span>':'<span style="color:var(--dim)">Hayır</span>'}</b></div>
          <div class="tr-metric"><span>P&L</span><b class="${pnlCls}">${fmtPNL(t.pnl)}</b></div>
        </div>
      </div>
    </div>

    <div class="tr-panel">
      <div class="tr-panel-title">Kural İhlali</div>
      ${mlist.length
        ? `<div class="tr-mistakes">${mlist.map(m=>`<span class="badge loss-badge">${MISTAKE_LABELS[m]||m}</span>`).join(' ')}</div>`
        : `<div class="tr-clean">✓ Temiz işlem — kurallara uyuldu</div>`}
    </div>

    ${(t.plan||t.lesson) ? `
    <div class="tr-notes-grid">
      ${t.plan?`<div class="tr-panel"><div class="tr-panel-title">Trade Planı</div><p class="tr-note-text">${escapeHtml(t.plan)}</p></div>`:''}
      ${t.lesson?`<div class="tr-panel"><div class="tr-panel-title">Ders / Çıkarım</div><p class="tr-note-text">${escapeHtml(t.lesson)}</p></div>`:''}
    </div>` : ''}

    ${shots.length ? `
    <div class="tr-panel">
      <div class="tr-panel-title">Grafikler <span style="color:var(--dim);font-weight:400;text-transform:none;letter-spacing:0">— ${shots.length} görsel, büyütmek için tıkla</span></div>
      <div class="tr-gallery">
        ${shots.map((src,i)=>`<div class="tr-shot"><img src="${src}" onclick='openTradeLightbox(${i}, ${JSON.stringify(shots.length)})' loading="lazy" /><span class="shot-num">${i+1}</span></div>`).join('')}
      </div>
    </div>` : ''}
  </div>`;

  // Stash this trade's images for the lightbox
  detailShots = shots;
}

let detailShots = [];
function openTradeLightbox(i) { openLightbox(i, detailShots); }

function escapeHtml(s) {
  return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// ===== KASA & RİSK =====
function saveRiskSettings() {
  riskSettings = {
    name:      document.getElementById('acct-name').value,
    balance:   parseFloat(document.getElementById('acct-balance').value) || 0,
    riskPct:   parseFloat(document.getElementById('acct-risk-pct').value) || 1,
    dailyLimit:parseFloat(document.getElementById('acct-daily-limit').value) || 3,
    maxRisk:   parseFloat(document.getElementById('acct-risk-pct').value) || 2,
    weeklyGoal:parseFloat(document.getElementById('acct-weekly-goal').value) || 0,
  };
  localStorage.setItem('ict_risk', JSON.stringify(riskSettings));
  document.getElementById('sb-username').textContent = riskSettings.name || 'Trader';
  renderRiskPage();
}

function loadRiskSettings() {
  if (!riskSettings.balance) return;
  document.getElementById('acct-name').value        = riskSettings.name || '';
  document.getElementById('acct-balance').value     = riskSettings.balance || '';
  document.getElementById('acct-risk-pct').value    = riskSettings.riskPct || 1;
  document.getElementById('acct-daily-limit').value = riskSettings.dailyLimit || 3;
  document.getElementById('acct-weekly-goal').value = riskSettings.weeklyGoal || '';
  document.getElementById('sb-username').textContent= riskSettings.name || 'Trader';
}

function clearAllData() {
  if (!confirm('TÜM trade verileri, günlük girişleri ve coin notları silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) return;
  trades    = [];
  journals  = [];
  coinNotes = [];
  localStorage.removeItem('ict_trades');
  localStorage.removeItem('ict_journals');
  localStorage.removeItem('ict_coinnotes');
  save();
  refreshAll();
  renderDashboard();
  alert('Tüm veriler temizlendi. Risk ayarlarınız korundu.');
}

// ===== BACKUP: EXPORT / IMPORT =====
function exportData() {
  const backup = {
    app: 'ICT Trade Journal',
    version: 1,
    exportedAt: new Date().toISOString(),
    trades,
    journals,
    coinNotes,
    riskSettings,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ict-journal-yedek-${dayjs().format('YYYY-MM-DD-HHmm')}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data.trades)) throw new Error('Geçersiz yedek dosyası');
      const tCount = data.trades.length;
      const jCount = (data.journals || []).length;
      const cCount = (data.coinNotes || []).length;
      if (!confirm(`Yedek yüklenecek:\n• ${tCount} trade\n• ${jCount} günlük girişi\n• ${cCount} coin notu\n\nMevcut verilerin üzerine yazılacak. Devam edilsin mi?`)) {
        event.target.value = ''; return;
      }
      trades    = data.trades;
      journals  = data.journals || [];
      coinNotes = data.coinNotes || [];
      if (data.riskSettings && Object.keys(data.riskSettings).length) {
        riskSettings = data.riskSettings;
        localStorage.setItem('ict_risk', JSON.stringify(riskSettings));
        loadRiskSettings();
      }
      save();
      refreshAll();
      renderDashboard();
      alert(`Yedek başarıyla yüklendi — ${tCount} trade geri getirildi.`);
    } catch (err) {
      alert('Dosya okunamadı: ' + err.message);
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

function calcPosition() {
  const entry  = parseFloat(document.getElementById('calc-entry').value);
  const sl     = parseFloat(document.getElementById('calc-sl').value);
  const riskInput = document.getElementById('calc-risk');
  let risk     = parseFloat(riskInput.value) || riskSettings.riskPct || 1;
  const balance= riskSettings.balance || 0;
  const symbol = document.getElementById('calc-symbol').value;

  if (!entry || !sl || !balance) { alert('Giriş, SL ve hesap bakiyesi gerekli'); return; }

  const riskUSD  = balance * risk / 100;
  const riskPip  = Math.abs(entry - sl);
  const pipVal   = estimatePipVal(symbol);
  const lot      = pipVal > 0 ? (riskUSD / (riskPip * 10000 * pipVal)).toFixed(2) : 0;

  document.getElementById('pr-risk').textContent   = `$${riskUSD.toFixed(2)}`;
  document.getElementById('pr-pips').textContent   = (riskPip * 10000).toFixed(1) + ' pip';
  document.getElementById('pr-lot').textContent    = lot + ' lot';
  document.getElementById('pr-pipval').textContent = `$${pipVal}`;
  document.getElementById('pos-result').classList.remove('hidden');
}

function renderRiskPage() {
  const balance = riskSettings.balance || 0;
  const totalPNL = trades.reduce((s,t)=>s+(t.pnl||0),0);
  const curBalance = balance + totalPNL;

  document.getElementById('rs-balance').textContent  = `$${curBalance.toFixed(2)}`;
  const ev = trades.reduce((s,t)=>{
    const wr = trades.filter(x=>x.result==='win').length / (trades.length||1);
    const avgW = trades.filter(x=>x.result==='win').reduce((a,x)=>a+(x.pnl||0),0) / (trades.filter(x=>x.result==='win').length||1);
    const avgL = Math.abs(trades.filter(x=>x.result==='loss').reduce((a,x)=>a+(x.pnl||0),0)) / (trades.filter(x=>x.result==='loss').length||1);
    return wr*avgW - (1-wr)*avgL;
  }, 0);
  document.getElementById('rs-ev').textContent = `${ev>=0?'+':''}$${ev.toFixed(2)}/trade`;

  const avgRisk = trades.length
    ? (trades.reduce((s,t)=>s+(t.riskPct||riskSettings.riskPct||1),0)/trades.length).toFixed(2)
    : (riskSettings.riskPct||1);
  document.getElementById('rs-avg-risk').textContent = `%${avgRisk}`;

  const totalRisk = trades.reduce((s,t)=>s+(balance*(t.riskPct||riskSettings.riskPct||1)/100),0);
  document.getElementById('rs-total-risk').textContent = `$${totalRisk.toFixed(2)}`;

  // Tavsiyeleri üret
  const advices = [];
  const wr = trades.length ? trades.filter(t=>t.result==='win').length/trades.length : 0;
  const avgRR = trades.length ? trades.reduce((s,t)=>s+(t.rr||0),0)/trades.length : 0;

  if (parseFloat(avgRisk) > 2)
    advices.push({ type:'bad', icon:'⚠️', title:'Risk Oranı Yüksek', text:`Ortalama risk oranınız %${avgRisk}. ICT yaklaşımında genellikle trade başına %1 önerilir. Büyük kaybetme serileri hesabınızı ciddi şekilde etkileyebilir.` });
  else if (parseFloat(avgRisk) <= 1)
    advices.push({ type:'ok', icon:'✅', title:'Risk Disiplini İyi', text:`Trade başına ortalama %${avgRisk} risk — sağlıklı bir aralıkta.` });
  else
    advices.push({ type:'warn', icon:'ℹ️', title:'Risk Takip Edin', text:`%${avgRisk} oranında risk kullanıyorsunuz. Hesabınızın büyüklüğüne göre makul olabilir ama dizi kayıplara dikkat edin.` });

  if (avgRR < 1.5)
    advices.push({ type:'bad', icon:'📐', title:'RR Hedefleri Düşük', text:`Ortalama RR: 1:${avgRR.toFixed(2)}. Minimum 1:2 hedefleyin. Düşük RR, breakeven için çok yüksek win rate gerektirir.` });
  else if (avgRR >= 3)
    advices.push({ type:'ok', icon:'🎯', title:'Harika RR Hedefleri', text:`Ortalama 1:${avgRR.toFixed(2)} RR ile pozisyon alıyorsunuz — sürdürülebilir bir oran.` });

  if (wr < 0.4)
    advices.push({ type:'warn', icon:'📊', title:'Win Rate İyileştirme', text:`%${(wr*100).toFixed(0)} win rate. Setup disiplini ve entry kalitesine odaklanın. Yüksek RR ile %40 WR bile karlı olabilir.` });

  const todayLoss = trades.filter(t=>dayjs(t.date).isSame(dayjs(),'day')&&t.result==='loss').reduce((s,t)=>s+(t.pnl||0),0);
  if (balance && Math.abs(todayLoss)/balance*100 > (riskSettings.dailyLimit||3))
    advices.push({ type:'bad', icon:'🛑', title:'Günlük Kayıp Limitine Yakın', text:`Bugün $${Math.abs(todayLoss).toFixed(2)} kaybettiniz — günlük limit %${riskSettings.dailyLimit||3}'e yaklaşıyor. Bugünlük işlemi bırakmayı değerlendirin.` });

  if (!advices.length)
    advices.push({ type:'ok', icon:'💚', title:'Her Şey İyi Görünüyor', text:'Risk parametreleriniz sağlıklı bir aralıkta. Trade eklemeye devam edin.' });

  document.getElementById('advice-list').innerHTML = advices.map(a =>
    `<div class="advice-item ${a.type}">
      <div class="advice-icon">${a.icon}</div>
      <div class="advice-body"><div class="advice-title">${a.title}</div><div class="advice-text">${a.text}</div></div>
    </div>`
  ).join('');
}

// ===== HATA ANALİZİ =====
function renderMistakePage() {
  const counts = {}, costs = {};
  trades.forEach(t => (t.mistakes||[]).forEach(m => {
    if (m === 'none') return;
    counts[m] = (counts[m]||0) + 1;
    costs[m]  = (costs[m]||0) + (t.pnl < 0 ? Math.abs(t.pnl) : 0);
  }));

  const maxCount = Math.max(...Object.values(counts), 1);

  // Overview cards
  document.getElementById('mistake-overview-grid').innerHTML =
    Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v]) => `
      <div class="mistake-card">
        <div class="mc-name">${MISTAKE_LABELS[k]||k}</div>
        <div class="mc-count">${v}×</div>
        <div class="mc-cost">Maliyet: $${(costs[k]||0).toFixed(2)}</div>
        <div class="mc-bar-wrap"><div class="mc-bar" style="width:${(v/maxCount*100).toFixed(0)}%"></div></div>
      </div>
    `).join('') || `<div style="color:var(--dim);font-size:12px;padding:20px">Henüz hata kaydı yok — harika!</div>`;

  // Cost chart
  const sorted = Object.entries(costs).sort((a,b)=>b[1]-a[1]);
  destroyChart('mistakeCostChart');
  charts.mistakeCostChart = new Chart(document.getElementById('mistakeCostChart').getContext('2d'), {
    type:'bar',
    data:{ labels:sorted.map(([k])=>MISTAKE_LABELS[k]||k), datasets:[{ data:sorted.map(([,v])=>+v.toFixed(2)), backgroundColor:'#e0505055', borderRadius:5 }] },
    options:{ ...chartOpts({ yPrefix:'$' }), indexAxis:'y' }
  });

  // Trend chart — hataları haftalara böl
  const weeks = {};
  trades.forEach(t => {
    const wk = dayjs(t.date).startOf('isoWeek').format('DD/MM');
    if (!(wk in weeks)) weeks[wk] = 0;
    (t.mistakes||[]).forEach(m => { if (m!=='none') weeks[wk]++; });
  });
  const wkLabels = Object.keys(weeks).slice(-10);
  const wkData   = wkLabels.map(k => weeks[k]);
  destroyChart('mistakeTrendChart');
  charts.mistakeTrendChart = new Chart(document.getElementById('mistakeTrendChart').getContext('2d'), {
    type:'line',
    data:{ labels:wkLabels, datasets:[{ data:wkData, borderColor:'#ff4757', backgroundColor:'rgba(255,71,87,.1)', borderWidth:2, tension:.35, fill:true, pointRadius:3 }] },
    options: chartOpts()
  });

  // Filter tabs
  const allMistakes = Object.keys(counts);
  document.getElementById('mistake-filter-tabs').innerHTML =
    `<button class="mf-tab all ${activeMistakeFilter==='all'?'active':''}" onclick="filterMistakes('all')">Tümü</button>` +
    allMistakes.map(k =>
      `<button class="mf-tab ${activeMistakeFilter===k?'active':''}" onclick="filterMistakes('${k}')">${MISTAKE_LABELS[k]||k}</button>`
    ).join('');

  renderMistakeTrades();
}

function filterMistakes(key) {
  activeMistakeFilter = key;
  document.querySelectorAll('.mf-tab').forEach(b => {
    b.classList.toggle('active', b.textContent === (MISTAKE_LABELS[key]||key) || (key==='all' && b.classList.contains('all')));
  });
  renderMistakeTrades();
}

function renderMistakeTrades() {
  let rows = trades.filter(t => (t.mistakes||[]).some(m=>m!=='none'));
  if (activeMistakeFilter !== 'all')
    rows = rows.filter(t => (t.mistakes||[]).includes(activeMistakeFilter));
  rows.sort((a,b)=>new Date(b.date)-new Date(a.date));
  const el = document.getElementById('mistake-trades-list');
  if (!rows.length) { el.innerHTML = `<div style="padding:32px;text-align:center;color:var(--dim);font-size:12px">Bu kategoride hatalı işlem yok ✓</div>`; return; }
  el.innerHTML = rows.map(tradeRowHTML).join('');
}

// ===== ANALİTİK =====
function renderAnalytics() {
  // Setup WR
  const setups = [...new Set(trades.flatMap(t=>t.setups||[t.setup]).filter(Boolean))];
  const setupWR = setups.map(s => {
    const st = trades.filter(t=>(t.setups||[t.setup]).includes(s));
    return st.length ? +(st.filter(t=>t.result==='win').length/st.length*100).toFixed(1) : 0;
  });
  renderBarChart('setupWRChart','setupWR',setups,setupWR,'%','#4f6ef7');

  // Entry model WR
  const models = [...new Set(trades.map(t=>t.entryModel).filter(Boolean))];
  const modelWR = models.map(m => {
    const mt = trades.filter(t=>t.entryModel===m);
    return mt.length ? +(mt.filter(t=>t.result==='win').length/mt.length*100).toFixed(1) : 0;
  });
  renderBarChart('entryWRChart','entryWR',models,modelWR,'%','#a855f7');

  // Emotion WR
  const emos = [1,2,3,4,5];
  const emoWR = emos.map(e => {
    const et = trades.filter(t=>t.emotion===e);
    return et.length ? +(et.filter(t=>t.result==='win').length/et.length*100).toFixed(1) : 0;
  });
  renderBarChart('emotionChart','emotion',['😰','😟','😐','🙂','😊'],emoWR,'%','#06b6d4');

  // RR distribution
  const rrB = {'0-1':0,'1-2':0,'2-3':0,'3-4':0,'4+':0};
  trades.forEach(t=>{ const r=t.rr||0; if(r<1)rrB['0-1']++; else if(r<2)rrB['1-2']++; else if(r<3)rrB['2-3']++; else if(r<4)rrB['3-4']++; else rrB['4+']++; });
  renderBarChart('rrChart','rr',Object.keys(rrB),Object.values(rrB),'','#ffa502');

  // Weekly TP
  const wtp = trades.filter(t=>t.weeklyTP);
  destroyChart('weeklyTPChart');
  charts.weeklyTPChart = new Chart(document.getElementById('weeklyTPChart').getContext('2d'), {
    type:'doughnut',
    data:{ labels:['Başarılı','Başarısız'], datasets:[{ data:[wtp.filter(t=>t.result==='win').length, wtp.filter(t=>t.result!=='win').length], backgroundColor:['#2dba7a66','#e0505066'], borderWidth:0 }] },
    options: pieOpts()
  });

  // Symbol performance
  const symbols = [...new Set(trades.map(t=>t.symbol))].slice(0,8);
  const symPNL  = symbols.map(s => +trades.filter(t=>t.symbol===s).reduce((a,t)=>a+(t.pnl||0),0).toFixed(2));
  renderBarChart('symbolChart','symbol',symbols,symPNL,'$','#06b6d4');

  renderInsights();
}

function renderBarChart(canvasId, key, labels, data, suffix, color, horiz=false) {
  destroyChart(canvasId);
  charts[canvasId] = new Chart(document.getElementById(canvasId).getContext('2d'), {
    type:'bar',
    data:{ labels, datasets:[{ data, backgroundColor: typeof color === 'string' ? color+'88' : color, borderRadius:4 }] },
    options:{ ...chartOpts({ ySuffix:suffix }), indexAxis: horiz?'y':'x' }
  });
}

function renderInsights() {
  const el = document.getElementById('insights-list');
  if (!trades.length) { el.innerHTML='<div class="insight-item"><div class="insight-icon">💡</div><div class="insight-text">Trade eklediğinizde burada analiz görünecek.</div></div>'; return; }
  const insights = [];
  const wins   = trades.filter(t=>t.result==='win');
  const total  = trades.length;
  const avgRR  = total ? trades.reduce((s,t)=>s+(t.rr||0),0)/total : 0;

  // Best setup combo
  const comboCounts = {};
  trades.forEach(t => {
    const key = (t.setups||[]).sort().join('+');
    if (!comboCounts[key]) comboCounts[key] = {wins:0,total:0};
    comboCounts[key].total++;
    if (t.result==='win') comboCounts[key].wins++;
  });
  const bestCombo = Object.entries(comboCounts).filter(([,v])=>v.total>1).sort((a,b)=>b[1].wins/b[1].total - a[1].wins/a[1].total)[0];
  if (bestCombo) insights.push({ icon:'⚡', text:`En yüksek win rate kombinasyon: <strong>${bestCombo[0]}</strong> — ${bestCombo[1].total} işlemde %${(bestCombo[1].wins/bestCombo[1].total*100).toFixed(0)} başarı.` });

  // Entry model
  const models = [...new Set(trades.map(t=>t.entryModel).filter(Boolean))];
  const modelStats = models.map(m => { const mt=trades.filter(t=>t.entryModel===m); return { m, wr:mt.filter(t=>t.result==='win').length/mt.length, n:mt.length }; }).filter(x=>x.n>1);
  if (modelStats.length) {
    const best = modelStats.sort((a,b)=>b.wr-a.wr)[0];
    insights.push({ icon:'🎯', text:`En güçlü entry modeliniz: <strong>${best.m}</strong> (%${(best.wr*100).toFixed(0)} WR). Bu modeli önceliklendirin.` });
  }

  // Top mistake
  const mkCounts = {};
  trades.filter(t=>t.result==='loss').forEach(t=>(t.mistakes||[]).forEach(m=>{ if(m!=='none') mkCounts[m]=(mkCounts[m]||0)+1; }));
  const topM = Object.entries(mkCounts).sort((a,b)=>b[1]-a[1])[0];
  if (topM) insights.push({ icon:'⚠️', text:`Kayıplarınızdaki en sık hata: <strong>${MISTAKE_LABELS[topM[0]]||topM[0]}</strong> (${topM[1]}×). Bu tek hatayı elimine etmek büyük fark yaratır.` });

  if (avgRR < 2) insights.push({ icon:'📐', text:`Ortalama RR hedefiniz <strong>1:${avgRR.toFixed(1)}</strong>. ICT metodolojisinde minimum 1:2 hedeflenir.` });

  const highEmo = trades.filter(t=>t.emotion>=4);
  const lowEmo  = trades.filter(t=>t.emotion<=2);
  if (highEmo.length>2 && lowEmo.length>2) {
    const hwR = highEmo.filter(t=>t.result==='win').length/highEmo.length;
    const lwR = lowEmo.filter(t=>t.result==='win').length/lowEmo.length;
    if (Math.abs(hwR-lwR)>.1)
      insights.push({ icon:'🧠', text:`Psikoloji önemli! İyi hissettiğinizde WR %${(hwR*100).toFixed(0)}, kötü hissettiğinizde %${(lwR*100).toFixed(0)}. Duygusal kontrolünüz performansınızı doğrudan etkiliyor.` });
  }

  // Discipline score — trades with no mistakes
  const clean = trades.filter(t => !(t.mistakes||[]).some(m => m && m!=='none')).length;
  const discPct = Math.round(clean/total*100);
  if (total >= 3) {
    if (discPct >= 80)      insights.push({ icon:'🛡️', text:`Disiplin skorunuz <strong>%${discPct}</strong> — işlemlerinizin çoğu hatasız. Mükemmel öz kontrol, böyle devam.` });
    else if (discPct >= 50) insights.push({ icon:'🛡️', text:`Disiplin skorunuz <strong>%${discPct}</strong>. İşlemlerin yarısında bir hata var — en sık tekrarlananı hedef alın.` });
    else                    insights.push({ icon:'🚨', text:`Disiplin skorunuz <strong>%${discPct}</strong>. İşlemlerin çoğunda kural ihlali var. Plan & checklist olmadan işleme girmeyin.` });
  }

  // Expectancy in R
  const expR = trades.reduce((s,t)=>s+tradeR(t),0)/total;
  if (total >= 5) {
    if (expR > 0) insights.push({ icon:'📈', text:`İşlem başına beklentiniz <strong>+${expR.toFixed(2)}R</strong>. Sisteminiz pozitif beklentiye sahip — uzun vadede kazandıran budur.` });
    else          insights.push({ icon:'📉', text:`İşlem başına beklentiniz <strong>${expR.toFixed(2)}R</strong>. Negatif beklenti — RR'yi yükseltin veya win rate'i artıracak filtreler ekleyin.` });
  }

  // Best day of week
  const dayPNL = {};
  trades.forEach(t => { const d=dayjs(t.date).day(); dayPNL[d]=(dayPNL[d]||0)+(t.pnl||0); });
  const dayNames = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const bestDay = Object.entries(dayPNL).sort((a,b)=>b[1]-a[1])[0];
  const worstDay = Object.entries(dayPNL).sort((a,b)=>a[1]-b[1])[0];
  if (bestDay && worstDay && bestDay[0]!==worstDay[0] && total >= 5) {
    insights.push({ icon:'📅', text:`En kârlı gününüz <strong>${dayNames[bestDay[0]]}</strong> (${fmtPNL(bestDay[1])}), en zayıfı <strong>${dayNames[worstDay[0]]}</strong> (${fmtPNL(worstDay[1])}). Güçlü günlerinize ağırlık verin.` });
  }

  el.innerHTML = insights.length
    ? insights.map(i=>`<div class="insight-item"><div class="insight-icon">${i.icon}</div><div class="insight-text">${i.text}</div></div>`).join('')
    : '<div class="insight-item"><div class="insight-text">Daha fazla trade ekledikçe burada derin analizler görünecek.</div></div>';
}

// ===== JOURNAL =====
function openJournalModal() {
  document.getElementById('j-date').value = dayjs().format('YYYY-MM-DD');
  document.getElementById('journal-modal').classList.remove('hidden');
}
function closeJournalModal() { document.getElementById('journal-modal').classList.add('hidden'); }

function saveJournal() {
  journals.push({
    id:      Date.now().toString(),
    date:    document.getElementById('j-date').value,
    bias:    document.getElementById('j-bias').value,
    emotion: parseInt(document.getElementById('j-emotion').value)||3,
    levels:  document.getElementById('j-levels').value,
    plan:    document.getElementById('j-plan').value,
    summary: document.getElementById('j-summary').value,
  });
  save(); closeJournalModal(); renderJournal();
}

function renderJournal() {
  const el = document.getElementById('journal-list');
  const sorted = [...journals].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if (!sorted.length) { el.innerHTML=emptyState('📓','Günlük boş','Her trading günü bir not bırakın — piyasa gözlemleri, duygular, öğrenilenler.'); return; }
  const emos = ['','😰','😟','😐','🙂','😊'];
  const bColor = { Bullish:'var(--green)', Bearish:'var(--red)', Nötr:'var(--yellow)' };
  el.innerHTML = sorted.map(j => `
    <div class="journal-card">
      <div class="journal-card-header">
        <div class="journal-card-date">${dayjs(j.date).format('DD MMMM YYYY, dddd')}</div>
        <div class="journal-card-meta">
          <span class="badge" style="color:${bColor[j.bias]||'var(--text2)'};border:1px solid;border-color:currentColor;background:transparent">${j.bias}</span>
          <span style="font-size:20px">${emos[j.emotion]||'😐'}</span>
          <button class="btn-icon-sm delete" onclick="deleteJournal('${j.id}')">🗑</button>
        </div>
      </div>
      <div class="journal-card-body">
        ${j.levels?`<div class="journal-card-section"><label>Önemli Seviyeler</label><span style="color:var(--accent2);font-family:monospace">${j.levels}</span></div>`:''}
        ${j.plan?`<div class="journal-card-section"><label>Haftalık Plan</label><p>${j.plan}</p></div>`:''}
        ${j.summary?`<div class="journal-card-section"><label>Özet</label><p>${j.summary}</p></div>`:''}
      </div>
    </div>`).join('');
}

function deleteJournal(id) { journals=journals.filter(j=>j.id!==id); save(); renderJournal(); }

// ===== COIN ANALİZ NOTLARI =====
let coinDetailId = null;

function setupCoinNotes() {
  document.querySelectorAll('#journal-seg .seg-btn').forEach(b =>
    b.addEventListener('click', () => switchJournalTab(b.dataset.tab))
  );
  setupBiasBtns('#coin-bias-btns', 'coin-bias');
}

function setupBiasBtns(sel, hiddenId) {
  document.querySelectorAll(`${sel} .bias-btn`).forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll(`${sel} .bias-btn`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(hiddenId).value = btn.dataset.bias;
    })
  );
}

function switchJournalTab(tab) {
  document.querySelectorAll('#journal-seg .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('tab-daily').classList.toggle('hidden', tab !== 'daily');
  document.getElementById('tab-coins').classList.toggle('hidden', tab !== 'coins');
  document.getElementById('journal-add-btn').style.display = tab === 'daily' ? '' : 'none';
  if (tab === 'coins') renderCoinNotes(); else renderJournal();
}

function biasBadge(bias) {
  return `<span class="bias-badge bias-${bias||'Nötr'}">${bias||'Nötr'}</span>`;
}

function lastUpdate(c) {
  if (!c.updates || !c.updates.length) return null;
  return [...c.updates].sort((a,b)=> new Date(b.date)-new Date(a.date))[0];
}

function renderCoinNotes() {
  const el = document.getElementById('coin-grid');
  if (!coinNotes.length) {
    el.innerHTML = emptyState('📊','Takip listesi boş','Bir coin ekle ve analiz notunu yaz. Her hafta güncelleyerek fikrinin nasıl değiştiğini izle.',{fn:'openCoinModal()',label:'+ Coin Ekle'});
    return;
  }
  const sorted = [...coinNotes].sort((a,b)=>{
    const la = lastUpdate(a), lb = lastUpdate(b);
    return new Date(lb?lb.date:b.createdAt) - new Date(la?la.date:a.createdAt);
  });
  el.innerHTML = sorted.map(c => {
    const last = lastUpdate(c);
    const snippet = last ? escapeHtml(last.text) : '<span style="color:var(--dim)">Henüz not yok</span>';
    return `<div class="coin-card" onclick="openCoinDetail('${c.id}')">
      <div class="coin-card-top">
        <span class="coin-card-sym">${c.symbol}</span>
        ${biasBadge(c.bias)}
      </div>
      <div class="coin-card-snippet">${snippet}</div>
      <div class="coin-card-foot">
        <span class="coin-card-meta">${last ? dayjs(last.date).format('DD MMM YYYY') : '—'}</span>
        <span class="coin-card-count">${(c.updates||[]).length} güncelleme</span>
      </div>
    </div>`;
  }).join('');
}

function openCoinModal() {
  document.getElementById('coin-symbol').value = '';
  document.getElementById('coin-symbol-input').value = '';
  document.getElementById('coin-bias').value = 'Nötr';
  document.getElementById('coin-note').value = '';
  document.querySelectorAll('#coin-bias-btns .bias-btn').forEach(b => b.classList.toggle('active', b.dataset.bias === 'Nötr'));
  document.getElementById('coin-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('coin-symbol-input').focus(), 50);
}
function closeCoinModal() { document.getElementById('coin-modal').classList.add('hidden'); }

function saveCoin() {
  const symbol = document.getElementById('coin-symbol').value
    || document.getElementById('coin-symbol-input').value.trim().toUpperCase();
  if (!symbol) { alert('Sembol seçin'); return; }
  const bias = document.getElementById('coin-bias').value || 'Nötr';
  const note = document.getElementById('coin-note').value.trim();

  let coin = coinNotes.find(c => c.symbol === symbol);
  if (!coin) {
    coin = { id: Date.now().toString(), symbol, bias, updates: [], createdAt: new Date().toISOString() };
    coinNotes.push(coin);
  }
  coin.bias = bias;
  if (note) coin.updates.push({ id: Date.now().toString(), date: dayjs().format('YYYY-MM-DD'), bias, text: note });
  save();
  closeCoinModal();
  renderCoinNotes();
}

function openCoinDetail(id) {
  const c = coinNotes.find(x => x.id === id);
  if (!c) return;
  coinDetailId = id;
  renderCoinDetail(c);
  document.getElementById('coin-detail-modal').classList.remove('hidden');
}
function closeCoinDetail() { document.getElementById('coin-detail-modal').classList.add('hidden'); coinDetailId = null; }

function renderCoinDetail(c) {
  const updates = [...(c.updates||[])].sort((a,b)=> new Date(b.date)-new Date(a.date));
  document.getElementById('coin-detail-body').innerHTML = `
    <div class="coin-detail-head">
      <span class="coin-detail-sym">${c.symbol}</span>
      ${biasBadge(c.bias)}
      <button class="btn-ghost btn-sm" style="margin-left:auto;color:var(--loss);border-color:rgba(232,93,93,.25)" onclick="deleteCoin('${c.id}')">🗑 Coini Sil</button>
    </div>
    <div class="coin-detail-sub">${(c.updates||[]).length} analiz güncellemesi · ${dayjs(c.createdAt).format('DD MMM YYYY')}'den beri takipte</div>

    <div class="coin-add-box">
      <label style="font-size:9px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:var(--gold)">Yeni Güncelleme</label>
      <div class="bias-btns" id="coin-update-bias-btns">
        <button type="button" class="bias-btn ${c.bias==='Bullish'?'active':''}" data-bias="Bullish">▲ Bullish</button>
        <button type="button" class="bias-btn ${c.bias==='Nötr'?'active':''}" data-bias="Nötr">● Nötr</button>
        <button type="button" class="bias-btn ${c.bias==='Bearish'?'active':''}" data-bias="Bearish">▼ Bearish</button>
      </div>
      <input type="hidden" id="coin-update-bias" value="${c.bias}" />
      <textarea id="coin-update-text" rows="3" placeholder="Bu haftaki analiz / güncelleme…" style="margin-bottom:10px"></textarea>
      <button class="btn-gold btn-sm" onclick="addCoinUpdate()">+ Güncelleme Kaydet</button>
    </div>

    <div class="coin-timeline">
      ${updates.length ? updates.map(u => `
        <div class="coin-tl-item">
          <div class="coin-tl-head">
            <span class="coin-tl-date">${dayjs(u.date).format('DD MMM YYYY')}</span>
            ${biasBadge(u.bias)}
            <button class="coin-tl-del" onclick="deleteCoinUpdate('${u.id}')">🗑</button>
          </div>
          <div class="coin-tl-text">${escapeHtml(u.text)}</div>
        </div>`).join('')
        : '<div style="color:var(--dim);font-size:12px">Henüz güncelleme yok — yukarıdan ilk notunu ekle.</div>'}
    </div>`;
  setupBiasBtns('#coin-update-bias-btns', 'coin-update-bias');
}

function addCoinUpdate() {
  const c = coinNotes.find(x => x.id === coinDetailId);
  if (!c) return;
  const text = document.getElementById('coin-update-text').value.trim();
  if (!text) { alert('Not yazın'); return; }
  const bias = document.getElementById('coin-update-bias').value || c.bias;
  c.updates.push({ id: Date.now().toString(), date: dayjs().format('YYYY-MM-DD'), bias, text });
  c.bias = bias;
  save();
  renderCoinDetail(c);
  renderCoinNotes();
}

function deleteCoinUpdate(uid) {
  const c = coinNotes.find(x => x.id === coinDetailId);
  if (!c) return;
  c.updates = c.updates.filter(u => u.id !== uid);
  save();
  renderCoinDetail(c);
  renderCoinNotes();
}

function deleteCoin(id) {
  if (!confirm('Bu coin ve tüm analiz geçmişi silinecek. Emin misiniz?')) return;
  coinNotes = coinNotes.filter(c => c.id !== id);
  save();
  closeCoinDetail();
  renderCoinNotes();
}

// ===== CALENDAR =====
let currentCalMonth = dayjs();
function setupCalNav() {
  document.getElementById('cal-prev').addEventListener('click', ()=>{ currentCalMonth=currentCalMonth.subtract(1,'month'); renderCalendar(); });
  document.getElementById('cal-next').addEventListener('click', ()=>{ currentCalMonth=currentCalMonth.add(1,'month'); renderCalendar(); });
}

function renderCalendar() {
  document.getElementById('cal-month-label').textContent = currentCalMonth.format('MMMM YYYY').toUpperCase();
  const daysInMonth = currentCalMonth.daysInMonth();
  const startDow    = currentCalMonth.startOf('month').day();
  const offset      = startDow === 0 ? 6 : startDow - 1;
  const today       = dayjs().format('YYYY-MM-DD');
  let html = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(d=>`<div class="cal-header-cell">${d}</div>`).join('');
  for (let i=0; i<offset; i++) html += `<div class="cal-cell empty"></div>`;
  for (let d=1; d<=daysInMonth; d++) {
    const ds  = currentCalMonth.format('YYYY-MM-') + String(d).padStart(2,'0');
    const dt  = trades.filter(t=>t.date.startsWith(ds));
    const pnl = dt.reduce((s,t)=>s+(t.pnl||0),0);
    const cls = dt.length===0?'': pnl>=0?'profit':'loss';
    html += `<div class="cal-cell ${cls} ${today===ds?'today':''}" onclick="showCalDay('${ds}')">
      <div class="cal-day-num">${d}</div>
      ${dt.length?`<div class="cal-cell-pnl">${pnl>=0?'+':''}${pnl.toFixed(0)}$</div><div class="cal-cell-count">${dt.length}t</div>`:''}
    </div>`;
  }
  document.getElementById('calendar-grid').innerHTML = html;
}

function showCalDay(ds) {
  const dt = trades.filter(t=>t.date.startsWith(ds));
  const detail = document.getElementById('cal-day-detail');
  if (!dt.length) { detail.classList.add('hidden'); return; }
  const pnl = dt.reduce((s,t)=>s+(t.pnl||0),0);
  detail.classList.remove('hidden');
  detail.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <h3>${dayjs(ds).format('DD MMMM YYYY')}</h3>
      <span style="font-weight:700;color:${pnl>=0?'var(--green)':'var(--red)'}">${pnl>=0?'+':''}${pnl.toFixed(2)}$</span>
    </div>
    <div class="recent-trades-list">${dt.map(tradeRowHTML).join('')}</div>`;
}

// ===== SCREENSHOT =====
// Holds the current form's images (base64) — supports multiple.
let formShots = [];

function setupScreenshot() {
  const fileInput = document.getElementById('f-screenshot-file');
  const dropArea  = document.getElementById('screenshot-drop-area');
  fileInput.addEventListener('change', e => { loadShots(e.target.files); fileInput.value=''; });
  document.getElementById('screenshot-placeholder').addEventListener('click', e => {
    if (!e.target.classList.contains('upload-link')) fileInput.click();
  });
  dropArea.addEventListener('dragover',  e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
  dropArea.addEventListener('drop', e => {
    e.preventDefault(); dropArea.classList.remove('drag-over');
    loadShots(e.dataTransfer.files);
  });
  document.addEventListener('paste', e => {
    if (!document.getElementById('page-add').classList.contains('active')) return;
    const imgs = Array.from(e.clipboardData.items).filter(i=>i.type.startsWith('image/')).map(i=>i.getAsFile());
    if (imgs.length) loadShots(imgs);
  });
}

function loadShots(fileList) {
  Array.from(fileList).filter(f => f && f.type.startsWith('image/')).forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => { formShots.push(ev.target.result); renderShotThumbs(); };
    reader.readAsDataURL(file);
  });
}

function renderShotThumbs() {
  const wrap = document.getElementById('screenshot-thumbs');
  wrap.innerHTML = formShots.map((src, i) => `
    <div class="shot-thumb">
      <img src="${src}" onclick="openLightbox(${i})" />
      <button type="button" class="shot-remove" onclick="removeShot(${i})" title="Kaldır">✕</button>
      <span class="shot-num">${i+1}</span>
    </div>`).join('');
  document.getElementById('screenshot-placeholder')
    .querySelector('.upload-hint').textContent = formShots.length
      ? `${formShots.length} görsel eklendi — daha ekleyebilirsin`
      : 'Birden fazla görsel ekleyebilirsin — HTF, LTF, giriş, sonuç…';
}

function removeShot(i) { formShots.splice(i,1); renderShotThumbs(); }
function resetScreenshot() { formShots = []; renderShotThumbs(); }

// Lightbox uses formShots when editing/adding; openTradeLightbox uses a passed array.
let lightboxImgs = [], lightboxIdx = 0;
function openLightbox(i, imgs) {
  lightboxImgs = imgs || formShots;
  lightboxIdx = i;
  showLightbox();
}
function showLightbox() {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox'; lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lb-close" onclick="closeLightbox()">✕</button>
      <button class="lb-nav lb-prev" onclick="lbStep(-1)">‹</button>
      <img class="lb-img" id="lb-img" />
      <button class="lb-nav lb-next" onclick="lbStep(1)">›</button>
      <div class="lb-counter" id="lb-counter"></div>`;
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.body.appendChild(lb);
  }
  lb.classList.add('open');
  document.getElementById('lb-img').src = lightboxImgs[lightboxIdx];
  document.getElementById('lb-counter').textContent = `${lightboxIdx+1} / ${lightboxImgs.length}`;
  const multi = lightboxImgs.length > 1;
  lb.querySelectorAll('.lb-nav').forEach(n => n.style.display = multi ? '' : 'none');
}
function lbStep(d) {
  lightboxIdx = (lightboxIdx + d + lightboxImgs.length) % lightboxImgs.length;
  showLightbox();
}
function closeLightbox() { document.getElementById('lightbox')?.classList.remove('open'); }

// ===== CHART HELPERS =====
const COLORS = ['#c9a84c','#2dba7a','#e05050','#c97a2d','#5b8cff','#a78bfa','#34d399','#fb923c'];

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function chartOpts({ yPrefix='', ySuffix='' }={}) {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161928',
        titleColor: '#dde3f4',
        bodyColor: '#52607e',
        borderColor: '#1c2032',
        borderWidth: 1,
        padding: 10,
        titleFont: { family: 'JetBrains Mono', size: 12 },
        bodyFont:  { family: 'JetBrains Mono', size: 11 },
        callbacks: { label: ctx => ` ${yPrefix}${ctx.parsed.y ?? ctx.parsed.x}${ySuffix}` }
      }
    },
    scales: {
      x: {
        ticks: { color: '#52607e', font: { size: 10, family: 'JetBrains Mono' }, maxRotation: 35 },
        grid:  { color: '#1c2032' },
        border: { color: '#1c2032' }
      },
      y: {
        ticks: { color: '#52607e', font: { size: 10, family: 'JetBrains Mono' }, callback: v => `${yPrefix}${v}${ySuffix}` },
        grid:  { color: '#1c2032' },
        border: { color: '#1c2032' }
      }
    }
  };
}

function pieOpts() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: '#52607e', font: { size: 11, family: 'Inter' }, padding: 12 } },
      tooltip: {
        backgroundColor: '#161928', titleColor: '#dde3f4', bodyColor: '#52607e',
        borderColor: '#1c2032', borderWidth: 1,
        titleFont: { family: 'JetBrains Mono' }, bodyFont: { family: 'JetBrains Mono' }
      }
    }
  };
}

// ===== UTILS =====
function fmtPNL(v) {
  if (v == null) return '—';
  return v >= 0 ? `+$${Math.abs(v).toFixed(2)}` : `-$${Math.abs(v).toFixed(2)}`;
}
function resLabel(r) { return r==='win'?'WIN':r==='loss'?'LOSS':'BE'; }
function emptyState(icon, title, msg, action) {
  const btn = action
    ? `<button class="btn-gold" onclick="${action.fn}">${action.label}</button>`
    : '';
  return `<div class="empty-state">
    <div class="empty-state-icon">${icon}</div>
    <h3>${title}</h3>
    <p>${msg}</p>
    ${btn}
  </div>`;
}

