import { brandLogo } from './brand'
import { scriptJson } from '../lib/security'
// Shared note page template (view / edit)

export function sharedNotePage(note: any, share: any, currentUser: any, editHistory: any[]) {
  const canEdit = share.permission === 'edit' && currentUser;
  const isOwner = currentUser && currentUser.id === note.user_id;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(note.title || 'Sem título')} - DoutorText</title>
  <link rel="icon" type="image/svg+xml" href="/static/favicon-emerald.svg">
  <link rel="stylesheet" href="/static/manrope.css">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/static/utilities.css">
  <link href="/static/icons/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="/static/manrope.css">

  <style>
    *{font-family:'Manrope',sans-serif;margin:0;padding:0;box-sizing:border-box}
    .sb::-webkit-scrollbar{width:4px;height:4px}
    .sb::-webkit-scrollbar-track{background:transparent}
    .sb::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}
    #sharedEditor{font-family:'Manrope',monospace;font-size:15px;line-height:1.8;resize:none;outline:none}
    .gradient-brand{background:linear-gradient(135deg,#078663 0%,#006c50 50%,#00523e 100%)}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .pulse{animation:pulse 2s infinite}
    .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(80px);opacity:0;transition:all .3s ease;z-index:9999;pointer-events:none}
    .toast.show{transform:translateX(-50%) translateY(0);opacity:1}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    .fade-in{animation:fadeIn .3s ease both}
  </style>
  <link rel="stylesheet" href="/static/emerald.css">
  <link rel="stylesheet" href="/static/editor.css">
  <link rel="stylesheet" href="/static/brand.css">
</head>
<body class="bg-dark-50 min-h-screen flex flex-col">
  <!-- Toast -->
  <div id="toast" class="toast bg-dark-800 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2">
    <i id="toastIcon" class="fas fa-check-circle text-green-400"></i>
    <span id="toastMsg">Salvo!</span>
  </div>

  <!-- Header -->
  <header class="bg-white border-b border-dark-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
    <div class="flex items-center gap-3">
      <a href="/" aria-label="DoutorText, início" class="dt-shared-logo flex items-center gap-2 hover:opacity-80 transition">
        ${brandLogo('green')}
      </a>
      <div class="h-5 w-px bg-dark-200 hidden sm:block"></div>
      <div class="flex items-center gap-2 text-sm text-dark-500">
        <i class="fas fa-share-nodes text-brand-400"></i>
        <span class="hidden sm:inline">Nota compartilhada</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
          ${canEdit ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}">
          ${canEdit ? 'Edição' : 'Visualização'}
        </span>
      </div>
    </div>
    <div class="flex items-center gap-2 sm:gap-3">
      ${canEdit ? `
      <span id="saveStatus" role="status" aria-live="polite" class="text-xs text-dark-400">
        <i class="fas fa-check-circle text-green-500"></i> Salvo
      </span>` : ''}
      ${currentUser ? `
      <div class="flex items-center gap-1.5 text-sm text-dark-600">
        <div class="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
          ${currentUser.username.charAt(0).toUpperCase()}
        </div>
        <span class="font-medium hidden sm:inline">${escHtml(currentUser.username)}</span>
      </div>
      <a href="/app" class="text-xs text-brand-500 hover:text-brand-600 font-medium hidden sm:inline" title="Ir para Dashboard">
        <i class="fas fa-arrow-right"></i> Dashboard
      </a>` : `
      <a href="/login" class="text-sm font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1.5 transition">
        <i class="fas fa-sign-in-alt text-xs"></i> Entrar
      </a>
      <a href="/register" class="gradient-brand text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-sm hidden sm:inline-flex items-center gap-1.5">
        Criar conta
      </a>`}
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
    <!-- Note Header -->
    <div class="mb-4 fade-in">
      ${canEdit ? `
      <input id="sharedTitle" type="text" value="${escHtml(note.title || '')}"
        class="w-full text-2xl sm:text-3xl font-bold text-dark-800 placeholder-dark-300 outline-none border-none bg-transparent mb-2"
        placeholder="Título da nota..." data-dt-input="onSharedTitleChange()">
      ` : `
      <h1 class="text-2xl sm:text-3xl font-bold text-dark-800 mb-2">${escHtml(note.title || 'Sem título')}</h1>
      `}
      <div class="flex flex-wrap items-center gap-3 text-xs text-dark-400">
        <span><i class="far fa-user"></i> Criada por <strong class="text-dark-600">${escHtml(note.owner_name || 'Desconhecido')}</strong></span>
        <span><i class="far fa-clock"></i> ${note.updated_at || ''}</span>
        ${note.last_edited_by ? `<span><i class="fas fa-pen-nib"></i> Última edição: <strong class="text-dark-600">${escHtml(note.last_edited_by)}</strong></span>` : ''}
        <span class="hidden sm:inline"><i class="fas fa-eye"></i> v${note.version || 1}</span>
      </div>
    </div>

    <!-- Editor / Viewer -->
    <div class="flex-1 bg-white rounded-2xl border border-dark-200 shadow-sm flex flex-col overflow-hidden fade-in" style="animation-delay:.1s">
      ${canEdit ? `
      <div id="sharedToolbar"></div>
      <div class="flex-1 p-4 sm:p-6">
        <div id="sharedEditor"></div>
      </div>
      <div class="px-4 sm:px-6 py-2 border-t border-dark-100 flex items-center justify-between text-[11px] text-dark-400 bg-dark-50/50">
        <div class="flex items-center gap-3 sm:gap-4">
          <span id="charCount"><i class="fas fa-font"></i> ${(note.content || '').length} chars</span>
          <span id="wordCount" class="hidden sm:inline"><i class="fas fa-paragraph"></i> ${(note.content || '').trim() ? (note.content || '').trim().split(/\\s+/).length : 0} palavras</span>
        </div>
        <span id="lastSaved" class="text-dark-300"></span>
      </div>` : `
      <div class="flex-1 p-4 sm:p-6 sb overflow-y-auto">
        <div id="noteContent" class="dt-rich-document">Carregando anotação…</div>
      </div>
      <div class="px-4 sm:px-6 py-2 border-t border-dark-100 flex items-center justify-between text-[11px] text-dark-400 bg-dark-50/50">
        <span id="sharedViewCount">${(note.content || '').length} caracteres</span>
        <button data-dt-click="copyContent()" class="text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition">
          <i class="far fa-copy"></i> Copiar texto
        </button>
      </div>`}
    </div>

    <!-- Edit History -->
    ${editHistory.length > 0 ? `
    <div class="mt-6 fade-in" style="animation-delay:.2s">
      <button data-dt-click="toggleHistory()" class="flex items-center gap-2 text-sm font-semibold text-dark-500 mb-3 hover:text-dark-700 transition">
        <i class="fas fa-clock-rotate-left text-brand-400"></i>
        Histórico de edições (${editHistory.length})
        <i id="histArrow" class="fas fa-chevron-down text-[10px] transition-transform"></i>
      </button>
      <div id="historyPanel" class="hidden">
        <div class="bg-white rounded-xl border border-dark-200 divide-y divide-dark-100 overflow-hidden">
          ${editHistory.map(h => `
          <div class="px-4 py-3 flex items-center gap-3 text-sm">
            <div class="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center text-dark-500 text-xs font-bold shrink-0">
              ${(h.username || '?').charAt(0).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
              <span class="font-medium text-dark-700">${escHtml(h.username)}</span>
              <span class="text-dark-400"> ${escHtml(h.action === 'edit' ? 'editou' : h.action === 'create' ? 'criou' : h.action)}</span>
              ${h.summary ? `<span class="text-dark-300 hidden sm:inline"> — ${escHtml(h.summary)}</span>` : ''}
            </div>
            <span class="text-[11px] text-dark-300 shrink-0">${h.created_at || ''}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>` : ''}

    <!-- CTA for non-logged-in users -->
    ${!currentUser ? `
    <div class="mt-8 text-center fade-in" style="animation-delay:.3s">
      <div class="bg-white rounded-2xl border border-dark-200 p-8 max-w-md mx-auto">
        <div class="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
          <i class="fas fa-file-medical text-white text-xl"></i>
        </div>
        <h3 class="text-lg font-bold text-dark-800 mb-2">Gostou? Crie suas notas!</h3>
        <p class="text-sm text-dark-500 mb-5">DoutorText é gratuito. Organize textos, compartilhe e colabore em tempo real.</p>
        <a href="/register" class="gradient-brand text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-md inline-flex items-center gap-2">
          <i class="fas fa-rocket text-xs"></i> Criar conta grátis
        </a>
      </div>
    </div>` : ''}
  </main>

  <script src="/static/rich/editor.js"></script>
  <script data-dt-script>
  const SHARE_TOKEN = '${share.share_token}';
  const NOTE_ID = ${note.id};
  const CAN_EDIT = ${canEdit ? 'true' : 'false'};
  const IS_LOGGED_IN = ${currentUser ? 'true' : 'false'};
  let currentVersion = ${note.version || 1};
  let saveTimer = null;
  let dirty = false;
  let saving = false;
  let conflict = false;
  let pollTimer = null;
  let lastContent = ${scriptJson(note.content || '')};
  let lastTitle = ${scriptJson(note.title || '')};
  let sharedDraftContent = lastContent;
  let sharedRichEditor = null;
  if (CAN_EDIT) {
    sharedRichEditor = DTRichText.create({element:document.getElementById('sharedEditor'),toolbar:document.getElementById('sharedToolbar'),content:lastContent,label:'Conteúdo da nota compartilhada',onChange:(html)=>{sharedDraftContent=html;onSharedContentChange();}});
    updateCounts();
  } else {
    DTRichText.render(document.getElementById('noteContent'), lastContent || 'Nota vazia…');
    document.getElementById('sharedViewCount').textContent = DTRichText.text(lastContent).length + ' caracteres';
  }


  // Toast
  let toastTimeout;
  function showToast(msg, icon = 'fa-check-circle', color = 'text-green-400') {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    document.getElementById('toastIcon').className = 'fas ' + icon + ' ' + color;
    t.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => t.classList.remove('show'), 2000);
  }

  // Copy
  function copyContent() {
    const text = DTRichText.text(lastContent);
    navigator.clipboard.writeText(text).then(() => showToast('Texto copiado!', 'fa-copy', 'text-blue-400'));
  }

  // History toggle
  function toggleHistory() {
    const p = document.getElementById('historyPanel');
    const a = document.getElementById('histArrow');
    if (p) { p.classList.toggle('hidden'); a?.classList.toggle('rotate-180'); }
  }

  ${canEdit ? `
  // ============ EDIT MODE ============
  function onSharedTitleChange() { dirty = true; scheduleAutoSave(); }
  function onSharedContentChange() { dirty = true; updateCounts(); scheduleAutoSave(); updateSaveStatus('saving'); }

  function updateCounts() {
    const t = sharedRichEditor.getText();
    const ch = t.length, w = t.trim() ? t.trim().split(/\\s+/).length : 0;
    document.getElementById('charCount').innerHTML = '<i class="fas fa-font"></i> ' + ch + ' chars';
    document.getElementById('wordCount').innerHTML = '<i class="fas fa-paragraph"></i> ' + w + ' palavras';
  }

  function scheduleAutoSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveSharedNote(), 1000);
  }

  async function saveSharedNote() {
    if (!dirty || saving || conflict) return;
    saving = true;
    try {
      while (dirty) {
        const title = document.getElementById('sharedTitle').value;
        const content = sharedDraftContent;
        updateSaveStatus('saving');
        const res = await fetch('/api/shared/' + SHARE_TOKEN, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, version: currentVersion })
        });
        if (res.status === 409) { conflict = true; showToast('Conflito: copie seu texto antes de recarregar.', 'fa-exclamation-circle', 'text-red-400'); }
        if (!res.ok) throw new Error('Save failed');
        const data = await res.json(); currentVersion = data.version;
        lastContent = content; lastTitle = title;
        dirty = content !== sharedDraftContent || title !== document.getElementById('sharedTitle').value;
      }
      updateSaveStatus('saved');
    } catch (e) { updateSaveStatus('error'); }
    finally { saving = false; }
  }
  window.addEventListener('online', saveSharedNote);

  function updateSaveStatus(s) {
    const el = document.getElementById('saveStatus');
    if (!el) return;
    if (s === 'saving') {
      el.innerHTML = '<i class="fas fa-circle-notch fa-spin text-brand-400"></i> Salvando...';
    } else if (s === 'saved') {
      el.innerHTML = '<i class="fas fa-check-circle text-green-500"></i> Salvo';
    } else {
      el.innerHTML = '<i class="fas fa-exclamation-circle text-red-500"></i> Erro ao salvar';
    }
  }

  // Polling for collaborative editing
  async function pollForChanges() {
    if (dirty || saving || conflict) return; // Don't overwrite while user is typing
    try {
      const res = await fetch('/api/shared/' + SHARE_TOKEN + '/poll?version=' + currentVersion);
      if (!res.ok) return;
      const data = await res.json();
      if (dirty || saving || conflict) return;
      if (data.changed) {
        currentVersion = data.version;
        const editor = document.getElementById('sharedEditor');
        const titleEl = document.getElementById('sharedTitle');
        // Only update if content is different and user isn't actively editing
        if (data.content !== lastContent || data.title !== lastTitle) {
          if (data.content !== lastContent) { sharedRichEditor.setContent(data.content); sharedDraftContent = data.content; lastContent = data.content; }
          if (data.title !== lastTitle) { titleEl.value = data.title; lastTitle = data.title; }

          currentVersion = data.version;
          updateCounts();
          if (data.last_edited_by) {
            showToast(data.last_edited_by + ' editou a nota', 'fa-pen-nib', 'text-blue-400');
          }
        }
      }
    } catch (e) {}
  }

  // Start polling every 3 seconds
  pollTimer = setInterval(pollForChanges, 3000);

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveSharedNote(); }
  });

  window.addEventListener('beforeunload', e => {
    if (dirty) { saveSharedNote(); e.preventDefault(); e.returnValue = ''; }
  });
  ` : `
  // ============ VIEW MODE - also poll for live updates ============
  async function pollForChanges() {
    try {
      const res = await fetch('/api/shared/' + SHARE_TOKEN + '/poll?version=' + currentVersion);
      if (!res.ok) return;
      const data = await res.json();
      if (data.changed) {
        const heading = document.querySelector('main h1'); if (heading) heading.textContent = data.title;
        const content = document.getElementById('noteContent');
        if (content && data.content !== lastContent) {
          DTRichText.render(content, data.content);
          lastContent = data.content;
          document.getElementById('sharedViewCount').textContent = DTRichText.text(lastContent).length + ' caracteres';
        }
        currentVersion = data.version;
        if (data.last_edited_by) {
          showToast(data.last_edited_by + ' atualizou a nota', 'fa-pen-nib', 'text-blue-400');
        }
      }
    } catch (e) {}
  }
  pollTimer = setInterval(pollForChanges, 5000);
  `}

  // Declarative action routing. No eval, Function, or inline event handlers.
  const actions = { copyContent: typeof copyContent === "function" ? copyContent : null, onSharedContentChange: typeof onSharedContentChange === "function" ? onSharedContentChange : null, onSharedTitleChange: typeof onSharedTitleChange === "function" ? onSharedTitleChange : null, toggleHistory: typeof toggleHistory === "function" ? toggleHistory : null };
  function routeAction(event, attribute) {
    const el = event.target.closest('[' + attribute + ']');
    if (!el) return;
    let expression = el.getAttribute(attribute);
    if (expression.startsWith('event.stopPropagation();')) { event.stopPropagation(); expression = expression.slice(24); }
    const match = expression.match(/^(\\w+)\\((.*)\\)$/);
    if (!match || !Object.hasOwn(actions, match[1]) || !actions[match[1]]) return;
    const tokens = match[2].trim() ? match[2].split(',').map(x => x.trim()) : [];
    const args = [];
    for (const token of tokens) {
      if (/^\\d+$/.test(token)) args.push(Number(token));
      else if (token === 'null') args.push(null);
      else if (token === 'true' || token === 'false') args.push(token === 'true');
      else if (token === 'event') args.push(event);
      else if (token === 'state.activeTabId' && typeof state !== 'undefined') args.push(state.activeTabId);
      else if (/^'[a-zA-Z0-9_-]*'$/.test(token)) args.push(token.slice(1,-1));
      else return;
    }
    Promise.resolve(actions[match[1]](...args)).catch(() => showToast('Não foi possível concluir a operação.', 'fa-exclamation-circle', 'text-red-400'));
  }
  document.addEventListener('click', event => routeAction(event, 'data-dt-click'));
  document.addEventListener('input', event => routeAction(event, 'data-dt-input'));
  document.addEventListener('contextmenu', event => routeAction(event, 'data-dt-menu'));
  </script>
</body>
</html>`;
}

function escHtml(s: string): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
