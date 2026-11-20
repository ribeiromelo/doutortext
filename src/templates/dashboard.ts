import { brandLogo } from './brand'
import { escapeHtml, scriptJson } from '../lib/security'
// Dashboard template - Main app interface (responsive + polished)

export function dashboardPage(username: string, isAdmin: boolean = false) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - DoutorText</title>
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
    .sb::-webkit-scrollbar-thumb:hover{background:#9ca3af}
    #editor{font-family:'Manrope',monospace;font-size:14px;line-height:1.8;resize:none;outline:none}
    #editor:focus{box-shadow:none}
    .tab-btn.active{background:linear-gradient(135deg,#078663,#006c50);color:white;border-color:#078663}
    .tab-btn{transition:all .2s ease}
    .tab-btn:hover:not(.active){background:#f3f4f6}
    .folder-item:hover .fa-act{opacity:1}
    .fa-act{opacity:0;transition:opacity .15s}
    .note-item.active{background:linear-gradient(90deg,#eff9f5,#d7f1e5);border-left:3px solid #078663}
    .note-item{border-left:3px solid transparent;transition:all .15s}
    .note-item:hover{background:#f9fafb}
    .note-item:hover .note-del{opacity:1}
    .note-del{opacity:0;transition:opacity .15s}
    .save-ind{transition:all .3s ease}
    .ctx-menu{z-index:9999}
    .modal-bg{background:rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
    .tree-ch{overflow:hidden;transition:max-height .25s ease}
    .ft{transition:transform .2s}.ft.open{transform:rotate(90deg)}
    .gradient-brand{background:linear-gradient(135deg,#078663 0%,#006c50 50%,#00523e 100%)}
    @keyframes fadeIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
    @keyframes slideIn{from{transform:translateX(-100%)}to{transform:none}}
    .anim-in{animation:fadeIn .2s ease both}
    .anim-slide{animation:slideIn .25s ease both}
    /* Mobile sidebar overlay */
    .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:40;backdrop-filter:blur(2px)}
    .sidebar-overlay.show{display:block}
    @media(max-width:768px){
      #sidebar{position:fixed;left:0;top:0;bottom:0;z-index:50;transform:translateX(-100%);transition:transform .25s ease;width:280px}
      #sidebar.open{transform:none;box-shadow:4px 0 24px rgba(0,0,0,.15)}
      #notesPanel{width:100%!important;max-width:100%}
      #editor{font-size:15px}
      .note-del{opacity:.7}
      .fa-act{opacity:.7}
    }
    @media(min-width:769px) and (max-width:1024px){
      #sidebar{width:220px}
      #notesPanel{width:200px!important}
    }
    /* Toast */
    .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(80px);opacity:0;transition:all .3s ease;z-index:9999;pointer-events:none}
    .toast.show{transform:translateX(-50%) translateY(0);opacity:1}
  </style>
  <link rel="stylesheet" href="/static/emerald.css">
  <link rel="stylesheet" href="/static/notebook.css">
  <link rel="stylesheet" href="/static/editor.css">
  <link rel="stylesheet" href="/static/brand.css">
</head>
<body class="dt-workspace dt-notebook bg-dark-50 h-screen flex flex-col overflow-hidden">
  <!-- Toast notification -->
  <div id="toast" class="toast bg-dark-800 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2">
    <i id="toastIcon" class="fas fa-check-circle text-green-400"></i>
    <span id="toastMsg">Salvo!</span>
  </div>

  <!-- Top Bar -->
  <header class="bg-white border-b border-dark-200 px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 relative z-30">
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Mobile menu button -->
      <button id="menuBtn" data-dt-click="toggleSidebar()" class="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-100 transition text-dark-500">
        <i class="fas fa-bars"></i>
      </button>
      <a href="/app" aria-label="DoutorText, início">${brandLogo('white')}</a>
    </div>
    <div class="flex items-center gap-2 sm:gap-4">
      <span id="saveStatus" role="status" aria-live="polite" class="text-xs text-dark-400 save-ind">
        <i class="fas fa-check-circle text-green-500"></i> Salvo
      </span>
      <div class="flex items-center gap-1.5 text-sm text-dark-600">
        <div class="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
          ${escapeHtml(username.charAt(0).toUpperCase())}
        </div>
        <span class="font-medium hidden sm:inline">${escapeHtml(username)}</span>
      </div>
      ${isAdmin ? `<a href="/admin" class="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-50 transition" title="Painel Admin">
        <i class="fas fa-shield-halved text-sm"></i>
      </a>` : ''}
      <form method="post" action="/logout"><button type="submit" class="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-red-500 hover:bg-red-50 transition" title="Sair" aria-label="Sair">
        <i class="fas fa-sign-out-alt text-sm"></i>
      </button></form>
    </div>
  </header>

  <!-- Mobile sidebar overlay -->
  <div id="sidebarOverlay" class="sidebar-overlay" data-dt-click="toggleSidebar()"></div>

  <!-- Main Content -->
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    <aside id="sidebar" aria-label="Biblioteca de notas">
      <div class="notebook-sidebar-top">
        <div class="notebook-sidebar-heading"><span>Biblioteca</span><button class="notebook-icon md:hidden" data-dt-click="toggleSidebar()" aria-label="Fechar navegação"><i class="fas fa-xmark" aria-hidden="true"></i></button></div>
        <button class="notebook-new" data-dt-click="createNote()"><i class="fas fa-plus" aria-hidden="true"></i> Nova anotação</button>
        <button id="allNotesBtn" class="notebook-library" data-dt-click="loadAllNotes()" aria-current="page"><i class="far fa-file-lines" aria-hidden="true"></i> Todas as notas</button>
      </div>
      <div class="notebook-folder-heading"><span>Pastas</span><div><button id="outlineToggle" class="notebook-icon" data-dt-click="toggleFolderOutline()" aria-label="Recolher pastas" title="Recolher pastas" aria-expanded="true" aria-controls="folderTree"><i class="fas fa-angles-up" aria-hidden="true"></i></button><button class="notebook-icon" data-dt-click="createFolder(null)" aria-label="Nova pasta" title="Nova pasta"><i class="fas fa-folder-plus" aria-hidden="true"></i></button></div></div>
      <div id="folderTree" class="sb" aria-label="Pastas e subpastas"></div>
      <section id="notesPanel" aria-label="Índice de anotações">
        <div class="notebook-index-heading"><span id="notesPanelTitle">Anotações</span><span id="notesCount">0</span></div>
        <div class="notebook-search"><i class="fas fa-search" aria-hidden="true"></i><input id="searchInput" type="search" aria-label="Buscar nas anotações" placeholder="Buscar anotações…" data-dt-input="filterNotes()"></div>
        <div id="notesList" class="sb"></div>
      </section>
      <div class="notebook-sidebar-footer"><i class="far fa-keyboard" aria-hidden="true"></i><span>Ctrl + S para salvar</span></div>
    </aside>

    <!-- Notes List + Editor -->
    <div id="mainArea" class="flex-1 flex overflow-hidden">
      <!-- Editor Area -->
      <div id="documentPanel" class="flex-1 flex flex-col overflow-hidden bg-white">
        <!-- Tabs Bar -->
        <div class="border-b border-dark-200 bg-dark-50/50 flex items-center shrink-0 overflow-x-auto sb" id="tabsBar">
          <div id="tabsContainer" class="flex items-center min-w-0" aria-label="Notas abertas"></div>
          <div class="workspace-tools">
            <button class="workspace-tool" data-dt-click="manageTabs()" title="Organizar abas" aria-label="Organizar abas"><i class="far fa-window-restore" aria-hidden="true"></i><span>Abas</span></button>
            <details id="layoutMenu" class="workspace-layout"><summary class="workspace-tool" aria-label="Dividir tela" title="Dividir tela"><i class="fas fa-table-columns" aria-hidden="true"></i><span>Dividir tela</span></summary><div class="workspace-layout-options" aria-label="Divisão da tela">
              <button data-dt-click="setLayout(1)">Uma nota</button><button data-dt-click="setLayout(2)">2 notas</button><button data-dt-click="setLayout(3)">3 notas</button><button data-dt-click="setLayout(4)">4 notas</button>
            </div></details>
          </div>
        </div>

        <!-- Editor -->
        <div id="editorArea" class="flex-1 flex flex-col overflow-hidden">
          <div id="editorPlaceholder" class="flex-1 flex items-center justify-center text-dark-300">
            <div class="text-center px-6">
              <div class="w-20 h-20 mx-auto mb-5 rounded-2xl bg-dark-100 flex items-center justify-center">
                <i class="fas fa-file-pen text-3xl text-dark-300"></i>
              </div>
              <p class="text-lg font-semibold text-dark-400">Um espaço para suas ideias.</p>
              <p class="text-sm mt-1.5 text-dark-300">Abra uma nota ao lado ou comece uma nova história.</p>
              <button data-dt-click="createNote()" class="mt-5 gradient-brand text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md inline-flex items-center gap-2">
                <i class="fas fa-plus text-xs"></i> Criar nota
              </button>
            </div>
          </div>
          <div id="workspaceGrid" class="workspace-grid" hidden></div><template id="editorPaneTemplate"><section class="notebook-pane flex-1 flex flex-col overflow-hidden">
            <!-- Note title + actions -->
            <div id="noteBreadcrumb" class="notebook-breadcrumb">Meu espaço</div>
            <button data-dt-click="mobileBack()" class="md:hidden text-sm text-dark-500 text-left px-5 pt-4">Voltar às notas</button>
            <div id="noteHeading" class="px-4 sm:px-6 pt-4 pb-2 shrink-0 flex items-center gap-2">
              <input id="noteTitle" aria-label="Título da nota" type="text" placeholder="Título da nota..."
                class="flex-1 text-lg sm:text-xl font-bold text-dark-800 placeholder-dark-300 outline-none border-none bg-transparent"
                data-dt-input="onTitleChange()">
              <div class="notebook-document-actions">
                <button class="notebook-action" data-dt-click="copyActiveNote(state.activeTabId)" aria-label="Copiar anotação" title="Copiar anotação"><i class="far fa-copy" aria-hidden="true"></i><span>Copiar</span></button>
                <button class="notebook-action" data-dt-click="shareNote(state.activeTabId)" aria-label="Compartilhar anotação" title="Compartilhar"><i class="fas fa-share-nodes" aria-hidden="true"></i></button>
                <button class="notebook-action" data-dt-click="moveNote(state.activeTabId)" aria-label="Mover anotação" title="Mover"><i class="far fa-folder-open" aria-hidden="true"></i></button>
                <button class="notebook-action notebook-delete" data-dt-click="deleteNote(state.activeTabId)" aria-label="Excluir anotação" title="Excluir"><i class="far fa-trash-can" aria-hidden="true"></i></button>
              </div>
            </div>
            <div id="editorToolbar"></div>
            <!-- Text editor -->
            <div id="noteTextPanel" class="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
              <div id="editor"></div>
            </div>
            <!-- Bottom bar -->
            <div class="px-4 sm:px-6 py-2 border-t border-dark-100 flex items-center justify-between text-[11px] text-dark-400 shrink-0 bg-dark-50/50">
              <div class="flex items-center gap-3 sm:gap-4">
                <span id="charCount"><i class="fas fa-font"></i> 0</span>
                <span id="wordCount" class="hidden sm:inline"><i class="fas fa-paragraph"></i> 0 palavras</span>
                <span id="lineCount" class="hidden sm:inline"><i class="fas fa-list"></i> 0 linhas</span>
              </div>
              <span id="lastSaved" class="text-dark-300"></span>
            </div>
          </section></template>
        </div>
      </div>
    </div>
  </div>

  <!-- Context Menu -->
  <div id="ctxMenu" class="ctx-menu hidden fixed bg-white rounded-xl shadow-2xl border border-dark-200 py-1.5 min-w-48 text-sm anim-in"></div>

  <!-- Modal -->
  <div id="modal" class="hidden fixed inset-0 modal-bg z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md anim-in" id="modalContent"></div>
  </div>

  <!-- Mobile: floating new note button -->
  <button data-dt-click="createNote()" id="fabBtn"
    class="md:hidden fixed bottom-5 right-5 w-14 h-14 gradient-brand rounded-2xl shadow-lg flex items-center justify-center text-white text-lg z-30 hover:opacity-90 transition active:scale-95">
    <i class="fas fa-plus"></i>
  </button>

  <script src="/static/rich/editor.js"></script>
  <script data-dt-script>
  // ============================================================
  // STATE
  // ============================================================
  let state = {
    folders: [],
    notes: [],
    openTabs: [],
    activeTabId: null,
    activeFolderId: null,
    noteContents: {},
    collapsedFolders: new Set(), // Track which folders are collapsed
    mobileView: 'list', // 'list' | 'editor'
    layout: 1, paneIds: [null], activePane: 0, folderSectionCollapsed: false
  };
  const API = '/api';
  const paneViews = new Map();
  const workspaceStorageKey = 'dt-workspace:' + ${scriptJson(username)};
  const searchTextCache = new Map();
  const isMobile = () => window.innerWidth < 769;

  // ============================================================
  // API
  // ============================================================
  async function api(path, opts = {}) {
    const res = await fetch(API + path, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
      const error = new Error(err.error || 'Erro'); error.status = res.status; throw error;
    }
    return res.json();
  }

  // ============================================================
  // INIT
  // ============================================================
  async function init() {
    await Promise.all([loadFolders(), loadAllNotes()]);
    try {
      const saved = JSON.parse(sessionStorage.getItem(workspaceStorageKey) || 'null');
      if (saved && Array.isArray(saved.tabs)) {
        const ids = [...new Set(saved.tabs.filter(Number.isInteger))].slice(0,40);
        for (const id of ids) {
          try { await loadNoteTab(id); } catch (_) { /* Deleted or revoked notes are not restored. */ }
        }
        state.layout = [1,2,3,4].includes(saved.layout) ? saved.layout : 1;
        state.paneIds = Array.from({length:state.layout},(_,i)=>Number.isInteger(saved.panes?.[i]) && state.noteContents[saved.panes[i]] ? saved.panes[i] : null);
        state.paneIds = state.paneIds.map((id,i,all)=>id && all.indexOf(id)===i ? id : null);
        state.activePane = Number.isInteger(saved.activePane) ? Math.min(Math.max(saved.activePane,0),state.layout-1) : 0;
        state.activeTabId = state.paneIds[state.activePane] || null;
        state.folderSectionCollapsed = !!saved.foldersHidden;
      }
    } catch (_) { /* Session storage is optional. */ }
    renderFolderTree(); renderTabs(); renderEditor(); renderNotesList();
  }

  function persistWorkspace() {
    try { sessionStorage.setItem(workspaceStorageKey,JSON.stringify({tabs:state.openTabs.map(t=>t.noteId),layout:state.layout,panes:state.paneIds,activePane:state.activePane,foldersHidden:state.folderSectionCollapsed})); } catch (_) {}

  }

  // ============================================================
  // MOBILE
  // ============================================================
  function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebarOverlay');
    sb.classList.toggle('open');
    ov.classList.toggle('show');
  }

  function showMobileEditor() {
    if (!isMobile()) return;

    document.getElementById('fabBtn').style.display = 'none';
    state.mobileView = 'editor'; document.body.classList.add('editor-open');
  }

  function showMobileList() {
    if (!isMobile()) return;

    document.getElementById('fabBtn').style.display = '';
    state.mobileView = 'list'; document.body.classList.remove('editor-open');
  }

  // Back button for mobile editor
  function renderMobileBack() {
    if (!isMobile() || state.mobileView !== 'editor') return '';
    return '<button data-dt-click="mobileBack()" class="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:bg-dark-100 mr-1"><i class="fas fa-arrow-left text-sm"></i></button>';
  }

  function mobileBack() {
    showMobileList();
    state.activeTabId = null;
    renderTabs();
    renderEditor();
    renderNotesList();
  }

  window.addEventListener('resize', () => {
    if (!isMobile()) {

      document.getElementById('fabBtn').style.display = '';
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('show');
    } else if (state.activeTabId && state.mobileView === 'editor') {
      document.body.classList.add('editor-open');
    }
  });

  // ============================================================
  // TOAST
  // ============================================================
  let toastTimer;
  function showToast(msg, icon = 'fa-check-circle', color = 'text-green-400') {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    document.getElementById('toastIcon').className = 'fas ' + icon + ' ' + color;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }

  // ============================================================
  // FOLDERS
  // ============================================================
  async function loadFolders() {
    const isFirstLoad = state.folders.length === 0;
    const data = await api('/folders');
    state.folders = data.folders;
    // Keep larger folder trees compact on first load.
    if (isFirstLoad) {
      state.folders.forEach(f => {
        // Collapse folders that have children and are not root-level
        if ((f.parent_id !== null || state.folders.length > 5) && state.folders.some(c => c.parent_id === f.id)) {
          state.collapsedFolders.add(f.id);
        }
      });
    }
    renderFolderTree();
  }

  function renderFolderTree() {
    const tree = document.getElementById('folderTree');
    tree.innerHTML = buildTree(state.folders, null, 0);
    tree.hidden = state.folderSectionCollapsed;
    const toggle = document.getElementById('outlineToggle');
    const label = state.folderSectionCollapsed ? 'Expandir pastas' : 'Recolher pastas';
    toggle.setAttribute('aria-expanded',String(!state.folderSectionCollapsed));
    toggle.setAttribute('aria-label',label); toggle.title=label;
    toggle.querySelector('i').className='fas fa-angles-' + (state.folderSectionCollapsed ? 'down' : 'up');
  }

  function buildTree(folders, pid, depth) {
    if (depth > 32) return '';
    return folders.filter(f => f.parent_id === pid).map(f => {
      const hasChildren = folders.some(child => child.parent_id === f.id);
      const isCollapsed = state.collapsedFolders.has(f.id);
      const active = state.activeFolderId === f.id;
      const childMarkup = hasChildren ? buildTree(folders, f.id, depth + 1) : '';
      return \`<div class="notebook-folder-branch">
        <div class="folder-item \${active ? 'is-active' : ''}" style="--folder-depth:\${Math.min(depth,8)}" data-dt-menu="showFolderMenu(event,\${f.id})">
          \${hasChildren ? \`<button class="folder-toggle" data-dt-click="event.stopPropagation();togCh(\${f.id})" aria-label="\${isCollapsed ? 'Expandir' : 'Recolher'} \${esc(f.name)}" aria-expanded="\${!isCollapsed}"><i class="fas fa-chevron-\${isCollapsed ? 'right' : 'down'}" aria-hidden="true"></i></button>\` : '<span class="folder-spacer"></span>'}
          <button class="folder-select" data-dt-click="selectFolder(\${f.id})" \${active ? 'aria-current="page"' : ''}><i class="far fa-folder\${active ? '-open' : ''}" aria-hidden="true"></i><span>\${esc(f.name)}</span></button>
          <button class="folder-more" data-dt-click="event.stopPropagation();showFolderMenu(event,\${f.id})" aria-label="Opções da pasta \${esc(f.name)}" title="Opções da pasta"><i class="fas fa-ellipsis" aria-hidden="true"></i></button>
        </div>
        \${childMarkup ? \`<div class="tree-ch" id="fc-\${f.id}" \${isCollapsed ? 'hidden' : ''}>\${childMarkup}</div>\` : ''}
      </div>\`;
    }).join('');
  }

  function toggleFolderOutline() {
    state.folderSectionCollapsed = !state.folderSectionCollapsed;
    renderFolderTree(); persistWorkspace();
  }

  async function createFolder(parentId) {
    showModal('Nova Pasta', \`
      <input id="mi" type="text" placeholder="Nome da pasta" autofocus
        class="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none text-sm bg-dark-50">
    \`, async () => {
      const name = document.getElementById('mi').value.trim();
      if (!name) return;
      await api('/folders', { method:'POST', body: JSON.stringify({ name, parent_id: parentId }) });
      await loadFolders();
      showToast('Pasta criada!');
    });
    setTimeout(() => document.getElementById('mi')?.focus(), 100);
  }

  async function renameFolder(id) {
    const f = state.folders.find(x => x.id === id);
    showModal('Renomear Pasta', \`
      <input id="mi" type="text" value="\${esc(f?.name||'')}" autofocus
        class="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none text-sm bg-dark-50">
    \`, async () => {
      const name = document.getElementById('mi').value.trim();
      if (!name) return;
      await api('/folders/' + id, { method:'PUT', body: JSON.stringify({ name }) });
      await loadFolders();
      showToast('Pasta renomeada!');
    });
    setTimeout(() => document.getElementById('mi')?.focus(), 100);
  }

  async function deleteFolder(id) {
    const f = state.folders.find(x => x.id === id);
    showModal('Excluir Pasta', \`
      <div class="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
        <i class="fas fa-triangle-exclamation text-red-400 text-lg"></i>
        <p class="text-dark-600 text-sm">Excluir <strong>"\${esc(f?.name||'')}"</strong> e todo o conteúdo?</p>
      </div>
    \`, async () => {
      await api('/folders/' + id, { method:'DELETE' });
      if (state.activeFolderId === id) state.activeFolderId = null;
      await Promise.all([loadFolders(), loadNotesByFolder(state.activeFolderId)]);
      showToast('Pasta excluída', 'fa-trash', 'text-red-400');
    }, true);
  }

  function selectFolder(id) {
    state.activeFolderId = id;
    state.folderSectionCollapsed = false;
    document.getElementById('allNotesBtn').removeAttribute('aria-current');
    // Expand parent folders when selecting a nested folder
    expandParents(id);
    renderFolderTree();
    loadNotesByFolder(id);
    if (isMobile()) {
      if (document.getElementById('sidebar').classList.contains('open')) toggleSidebar();
      showMobileList();
    }
  }

  // Ensure all ancestor folders of a given folder are expanded (not collapsed)
  function expandParents(folderId) {
    let folder = state.folders.find(f => f.id === folderId);
    const visited = new Set();
    while (folder && folder.parent_id && !visited.has(folder.id)) {
      visited.add(folder.id);
      state.collapsedFolders.delete(folder.parent_id);
      folder = state.folders.find(f => f.id === folder.parent_id);
    }
  }

  function togCh(id) {
    if (state.collapsedFolders.has(id)) state.collapsedFolders.delete(id);
    else state.collapsedFolders.add(id);
    renderFolderTree();
  }

  // ============================================================
  // NOTES
  // ============================================================
  async function loadAllNotes() {
    state.activeFolderId = null;
    if (isMobile()) { if (document.getElementById('sidebar').classList.contains('open')) toggleSidebar(); showMobileList(); }
    document.getElementById('allNotesBtn').setAttribute('aria-current','page');
    renderFolderTree();
    const data = await api('/notes');
    state.notes = data.notes;
    renderNotesList();
    document.getElementById('notesPanelTitle').textContent = 'Anotações';
  }

  // Toggle all folders open or collapsed
  function toggleAllFolders(collapse) {
    if (collapse) {
      state.folders.forEach(f => {
        if (state.folders.some(c => c.parent_id === f.id)) {
          state.collapsedFolders.add(f.id);
        }
      });
    } else {
      state.collapsedFolders.clear();
    }
    renderFolderTree();
  }

  async function loadNotesByFolder(folderId) {
    const url = folderId ? '/notes?folder_id=' + folderId : '/notes';
    const data = await api(url);
    state.notes = data.notes;
    renderNotesList();
    const f = state.folders.find(x => x.id === folderId);
    document.getElementById('notesPanelTitle').textContent = f ? f.name : 'Anotações';
  }

  function filterNotes() {
    const q = document.getElementById('searchInput').value.toLocaleLowerCase('pt-BR').trim();
    let shown = 0;
    document.querySelectorAll('#notesList .notebook-note-row').forEach(el => {
      const note = state.notes.find(n => n.id === Number(el.dataset.noteId));
      if (!q) { el.hidden = false; shown++; return; }
      const cached = searchTextCache.get(note?.id);
      const plain = cached?.content === note?.content ? cached.plain : DTRichText.text(note?.content || '');
      if (note) searchTextCache.set(note.id, {content:note.content, plain});
      const searchable = ((note?.title || '') + ' ' + plain).toLocaleLowerCase('pt-BR');
      el.hidden = !!q && !searchable.includes(q); if (!el.hidden) shown++;
    });
    document.getElementById('notesSearchEmpty').hidden = !state.notes.length || shown > 0;
  }

  function renderNotesList() {
    const list = document.getElementById('notesList');
    document.getElementById('notesCount').textContent = state.notes.length;
    if (!state.notes.length) {
      list.innerHTML = '<div class="notebook-index-empty">Nenhuma anotação aqui.<br>Crie uma para começar.</div><div id="notesSearchEmpty" hidden></div>';
      return;
    }
    list.innerHTML = state.notes.map(n => {
      const active = state.activeTabId === n.id;
      return \`<div class="notebook-note-row" data-note-id="\${n.id}" data-dt-menu="showNoteMenu(event,\${n.id})">
        <button type="button" class="note-item \${active ? 'active' : ''}" data-dt-click="openNote(\${n.id})" aria-pressed="\${active}"><i class="far fa-file-lines" aria-hidden="true"></i><span>\${esc(n.title || 'Sem título')}</span>\${state.noteContents[n.id]?.dirty ? '<span class="notebook-unsaved" aria-label="Alterações pendentes"></span>' : ''}</button>
        <button class="note-more" data-dt-click="event.stopPropagation();showNoteMenu(event,\${n.id})" aria-label="Opções da anotação \${esc(n.title || 'Sem título')}" title="Opções"><i class="fas fa-ellipsis" aria-hidden="true"></i></button>
      </div>\`;
    }).join('') + '<div id="notesSearchEmpty" class="notebook-index-empty" hidden>Nenhuma anotação encontrada.</div>';
    filterNotes();
  }

  async function createNote() {
    const body = { title: 'Nova nota', content: '' };
    if (state.activeFolderId) body.folder_id = state.activeFolderId;
    const data = await api('/notes', { method:'POST', body: JSON.stringify(body) });
    await loadNotesByFolder(state.activeFolderId);
    openNote(data.note.id);
    showToast('Nota criada!');
  }

  async function loadNoteTab(id) {
    let tab = state.openTabs.find(t => t.noteId === id);
    if (!tab) {
      const data = await api('/notes/' + id);
      if(state.openTabs.some(t=>t.noteId===id))return;
      const note = data.note;
      tab = { noteId: id, title: note.title };
      state.openTabs.push(tab);
      state.noteContents[id] = { title: note.title, content: note.content || '', dirty: false, timer: null, version: note.version, saving: null, conflict: false, folderId: note.folder_id, savedAt: note.updated_at };
    }
  }

  async function openNote(id) {
    await loadNoteTab(id);
    const existing = state.paneIds.indexOf(id);
    const empty = state.paneIds.indexOf(null);
    state.activePane = existing >= 0 ? existing : state.paneIds[state.activePane] === null ? state.activePane : empty >= 0 ? empty : state.activePane;
    state.paneIds[state.activePane] = id; state.activeTabId = id;
    renderTabs(); renderEditor(); renderNotesList(); showMobileEditor();
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  }

  async function deleteNote(id) {
    showModal('Excluir Nota', \`
      <div class="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
        <i class="fas fa-triangle-exclamation text-red-400 text-lg"></i>
        <p class="text-dark-600 text-sm">Tem certeza que deseja excluir esta nota permanentemente?</p>
      </div>
    \`, async () => {
      await api('/notes/' + id, { method:'DELETE' });
      closeTab(id, true);
      await loadNotesByFolder(state.activeFolderId);
      showToast('Nota excluída', 'fa-trash', 'text-red-400');
    }, true);
  }

  async function moveNote(noteId) {
    const opts = state.folders.map(f =>
      \`<option value="\${f.id}">\${'\\u2014'.repeat(getDepth(f.id))} \${esc(f.name)}</option>\`
    ).join('');
    showModal('Mover Nota', \`
      <select id="ms" class="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none text-sm bg-dark-50">
        <option value="">Sem pasta (raiz)</option>
        \${opts}
      </select>
    \`, async () => {
      const fid = document.getElementById('ms').value || null;
      const nc = state.noteContents[noteId];
      if (nc?.dirty) await saveNote(noteId);
      if (nc?.dirty) throw new Error('Salve ou resolva o conflito antes de mover.');
      const version = nc ? nc.version : (await api('/notes/' + noteId)).note.version;
      const result = await api('/notes/' + noteId, { method:'PUT', body: JSON.stringify({ folder_id: fid ? parseInt(fid) : null, version }) });
      if (nc) { nc.version = result.version; nc.folderId = fid ? parseInt(fid) : null; renderEditor(); }
      await loadNotesByFolder(state.activeFolderId);
      showToast('Nota movida!', 'fa-folder-open', 'text-brand-400');
    });
  }

  function getDepth(fid) {
    let d = 0, c = state.folders.find(f => f.id === fid);
    const visited = new Set();
    while (c?.parent_id && !visited.has(c.id) && d < 32) { visited.add(c.id); d++; c = state.folders.find(f => f.id === c.parent_id); }
    return d;
  }

  // ============================================================
  // TABS
  // ============================================================
  function renderTabs() {
    const c = document.getElementById('tabsContainer');
    c.innerHTML = state.openTabs.map(t => {
      const nc = state.noteContents[t.noteId];
      const title = nc?.title || t.title || 'Sem título';
      return \`<div class="workspace-tab \${state.activeTabId === t.noteId ? 'active' : ''}" draggable="true" data-tab-id="\${t.noteId}">
        <button type="button" class="tab-btn" data-dt-click="switchTab(\${t.noteId})" aria-pressed="\${state.activeTabId === t.noteId}" title="\${esc(title)} — arraste para reordenar ou use Alt + setas">
          <i class="far fa-file-lines" aria-hidden="true"></i><span>\${esc(title)}</span>\${nc?.dirty ? '<span class="notebook-unsaved" aria-label="Alterações pendentes"></span>' : ''}
        </button><button class="tab-close" data-dt-click="closeTab(\${t.noteId})" aria-label="Fechar aba \${esc(title)}"><i class="fas fa-xmark" aria-hidden="true"></i></button></div>\`;
    }).join('');
    c.querySelectorAll('[data-tab-id]').forEach(tab => {
      const id=Number(tab.dataset.tabId);
      tab.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',String(id));e.dataTransfer.effectAllowed='move';});
      tab.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';});
      tab.addEventListener('drop',e=>{e.preventDefault();moveTabTo(Number(e.dataTransfer.getData('text/plain')),id);});
      tab.querySelector('.tab-btn').addEventListener('keydown',e=>{
        if(e.altKey && ['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();reorderTab(id,e.key==='ArrowLeft'?0:1);document.querySelector('[data-tab-id="'+id+'"] .tab-btn')?.focus();}
      });
    });
    const active=c.querySelector('.workspace-tab.active'); active?.scrollIntoView({block:'nearest',inline:'nearest'});
    persistWorkspace();
    updatePanePickers();
  }

  function moveTabTo(id,targetId) {
    const from=state.openTabs.findIndex(t=>t.noteId===id),to=state.openTabs.findIndex(t=>t.noteId===targetId);
    if(from<0 || to<0 || from===to)return;
    const [tab]=state.openTabs.splice(from,1);state.openTabs.splice(to,0,tab);renderTabs();
  }

  function reorderTab(id,direction) {
    const index=state.openTabs.findIndex(t=>t.noteId===id),target=index+(direction?1:-1);
    if(target>=0 && target<state.openTabs.length)moveTabTo(id,state.openTabs[target].noteId);
    if(document.getElementById('tabOrganizer'))manageTabs();
  }

  function manageTabs() {
    showModal('Organizar abas',\`<div id="tabOrganizer" class="tab-organizer">\${state.openTabs.map((t,i)=>\`<div><span>\${esc(state.noteContents[t.noteId]?.title || 'Sem título')}</span><button data-dt-click="reorderTab(\${t.noteId},0)" aria-label="Mover \${esc(state.noteContents[t.noteId]?.title || 'aba')} para a esquerda" \${i===0?'disabled':''}><i class="fas fa-arrow-up" aria-hidden="true"></i></button><button data-dt-click="reorderTab(\${t.noteId},1)" aria-label="Mover \${esc(state.noteContents[t.noteId]?.title || 'aba')} para a direita" \${i===state.openTabs.length-1?'disabled':''}><i class="fas fa-arrow-down" aria-hidden="true"></i></button></div>\`).join('') || '<p>Abra uma nota na biblioteca para começar.</p>'}</div>\`,()=>{});
    document.getElementById('mc').textContent='Concluir';
  }

  function switchTab(noteId) {
    const existing=state.paneIds.indexOf(noteId);
    if(existing>=0)state.activePane=existing;
    state.paneIds[state.activePane]=noteId;state.activeTabId=noteId;
    renderTabs(); renderEditor(); renderNotesList(); showMobileEditor();
  }

  function setLayout(count) {
    if(![1,2,3,4].includes(count))return;
    document.getElementById('layoutMenu').open=false;
    let ids=state.paneIds.filter(Boolean);
    if(count===1)ids=state.activeTabId?[state.activeTabId]:[];
    else if(ids.length>count && state.activeTabId && !ids.slice(0,count).includes(state.activeTabId))ids=[state.activeTabId,...ids.filter(id=>id!==state.activeTabId)];
    for(const tab of state.openTabs)if(!ids.includes(tab.noteId))ids.push(tab.noteId);
    state.layout=count;state.paneIds=Array.from({length:count},(_,i)=>ids[i] || null);
    state.activePane=Math.max(0,state.paneIds.indexOf(state.activeTabId));
    state.activeTabId=state.paneIds[state.activePane];
    renderTabs();renderEditor();renderNotesList();
  }

  function activatePane(slot) {
    state.activePane=slot;state.activeTabId=state.paneIds[slot];
    document.querySelectorAll('.workspace-slot').forEach(el=>el.classList.toggle('is-focused',Number(el.dataset.slot)===slot));
    renderTabs();renderNotesList();
  }

  function choosePane(slot,id) {
    const previous=state.paneIds[slot],other=state.paneIds.indexOf(id);
    if(other>=0 && other!==slot)state.paneIds[other]=previous;
    state.paneIds[slot]=id;state.activePane=slot;state.activeTabId=id;
    renderTabs();renderEditor();renderNotesList();
  }

  function updatePanePickers() {
    document.querySelectorAll('.pane-note-select').forEach(select=>{
      const slot=Number(select.dataset.slot);
      select.innerHTML='<option value="">Escolher nota aberta…</option>'+state.openTabs.map(t=>\`<option value="\${t.noteId}">\${esc(state.noteContents[t.noteId]?.title || 'Sem título')}</option>\`).join('');
      select.value=state.paneIds[slot] || '';
    });
  }

  async function closeTab(noteId, skipSave) {
    const nc = state.noteContents[noteId];
    if (nc?.dirty && !skipSave) { clearTimeout(nc.timer); await saveNote(noteId); if (nc.dirty) { showToast('Texto pendente. A aba foi mantida aberta.', 'fa-exclamation-circle', 'text-red-400'); return; } }
    state.openTabs = state.openTabs.filter(t => t.noteId !== noteId);
    delete state.noteContents[noteId];
    state.paneIds=state.paneIds.map(id=>id===noteId?null:id);
    if (state.activeTabId === noteId) {
      state.activeTabId = state.paneIds.find(Boolean) || state.openTabs[state.openTabs.length-1]?.noteId || null;
      const visible=state.paneIds.indexOf(state.activeTabId);if(visible>=0)state.activePane=visible;
      if (!state.activeTabId && isMobile()) showMobileList();
    }
    if(state.activeTabId && !state.paneIds.includes(state.activeTabId))state.paneIds[state.activePane]=state.activeTabId;
    renderTabs(); renderEditor(); renderNotesList();
  }

  // ============================================================
  // EDITOR
  // ============================================================
  function field(view,name) { return view?.element.querySelector('[data-field="'+name+'"]'); }

  function renderEditor() {
    const grid=document.getElementById('workspaceGrid');
    const show=state.openTabs.length>0 || state.layout>1;
    document.getElementById('editorPlaceholder').classList.toggle('hidden',show);
    grid.hidden=!show; grid.dataset.layout=state.layout;
    for(const [id,view] of paneViews) {
      if(!state.paneIds.includes(id) || !show){view.editor.destroy();view.element.remove();paneViews.delete(id);}
    }
    // Keep mounted editors when changing focus or layout, preserving selection and undo.
    const slots=[];
    if(show)for(let slot=0;slot<state.layout;slot++) {
      const holder=document.createElement('div');holder.className='workspace-slot';holder.dataset.slot=slot;
      holder.classList.toggle('is-focused',state.activePane===slot);
      const bar=document.createElement('div');bar.className='pane-topline';
      const label=document.createElement('span');label.textContent='Painel '+(slot+1);bar.append(label);
      const select=document.createElement('select');select.className='pane-note-select';select.dataset.slot=slot;select.setAttribute('aria-label','Nota do painel '+(slot+1));
      select.addEventListener('change',()=>choosePane(slot,Number(select.value)||null));bar.append(select);
      const expand=document.createElement('button');expand.type='button';expand.title='Exibir apenas esta nota';expand.setAttribute('aria-label','Ampliar painel '+(slot+1));expand.innerHTML='<i class="fas fa-expand" aria-hidden="true"></i>';
      expand.addEventListener('click',()=>{activatePane(slot);setLayout(1);});bar.append(expand);holder.append(bar);
      const id=state.paneIds[slot],nc=state.noteContents[id];
      if(nc) {
        let view=paneViews.get(id);
        if(!view) {
          const element=document.getElementById('editorPaneTemplate').content.firstElementChild.cloneNode(true);
          element.setAttribute('aria-label','Editor: '+(nc.title || 'Sem título'));element.setAttribute('role','region');element.dataset.noteId=id;
          element.querySelectorAll('[id]').forEach(el=>{el.dataset.field=el.id;el.id=el.id+'-'+id;});
          element.querySelectorAll('[data-dt-click]').forEach(el=>el.setAttribute('data-dt-click',el.getAttribute('data-dt-click').replaceAll('state.activeTabId',String(id))));
          const title=element.querySelector('[data-field="noteTitle"]');title.removeAttribute('data-dt-input');title.value=nc.title || '';title.addEventListener('input',()=>onTitleChange(id,title.value));
          view={element,editor:null};paneViews.set(id,view);
          view.editor=DTRichText.create({element:field(view,'editor'),toolbar:field(view,'editorToolbar'),content:nc.content || '',label:'Conteúdo: '+(nc.title || 'Sem título'),onChange:(html,plain)=>onContentChange(id,html,plain)});
          updateCounts(id,view.editor.getText());
          element.addEventListener('focusin',()=>{const index=state.paneIds.indexOf(id);if(index>=0 && state.activePane!==index)activatePane(index);});
          element.addEventListener('pointerdown',()=>{const index=state.paneIds.indexOf(id);if(index>=0 && state.activePane!==index)activatePane(index);});
        }
        const path=[];let folder=state.folders.find(f=>f.id===nc.folderId);const visited=new Set();
        while(folder && !visited.has(folder.id)){visited.add(folder.id);path.unshift(folder.name);folder=state.folders.find(f=>f.id===folder.parent_id);}
        field(view,'noteBreadcrumb').textContent=['Meu espaço',...path].join(' / ');
        field(view,'lastSaved').textContent=nc.conflict?'Conflito — copie o texto antes de recarregar':nc.dirty?'Alterações pendentes':'Salvamento automático';
        holder.append(view.element);
      } else {
        const empty=document.createElement('div');empty.className='pane-empty';
        empty.innerHTML='<i class="far fa-file-lines" aria-hidden="true"></i><h3>Uma nota neste espaço</h3><p>Escolha uma aba acima ou abra uma nota na biblioteca.</p>';
        const button=document.createElement('button');button.textContent='Escolher na biblioteca';button.addEventListener('click',()=>{activatePane(slot);if(isMobile()){document.getElementById('sidebar').classList.add('open');document.getElementById('sidebarOverlay').classList.add('show');}else document.getElementById('searchInput').focus();});empty.append(button);holder.append(empty);
      }
      slots.push(holder);
    }
    grid.replaceChildren(...slots);updatePanePickers();persistWorkspace();
  }

  async function copyActiveNote(noteId = state.activeTabId) {
    const nc = state.noteContents[noteId]; if (!nc) return;
    const plain = DTRichText.text(nc.content);
    if (window.ClipboardItem && navigator.clipboard.write) await navigator.clipboard.write([new ClipboardItem({
      'text/plain': new Blob([plain], {type:'text/plain'}),
      'text/html': new Blob([DTRichText.prepareHTML(nc.content)], {type:'text/html'})
    })]);
    else await navigator.clipboard.writeText(plain);
    showToast('Anotação copiada', 'fa-copy', 'text-green-400');
  }

  function onTitleChange(id,title) {
    const nc=state.noteContents[id];if(!nc)return;
    nc.title=title;nc.dirty=true;nc.saveError=false;
    const tab=state.openTabs.find(t=>t.noteId===id);if(tab)tab.title=title;
    const view=paneViews.get(id);if(view)view.element.setAttribute('aria-label','Editor: '+(title || 'Sem título'));
    renderTabs();scheduleAutoSave(id);refreshSaveStatus();
  }

  function onContentChange(id,html,plain) {
    const nc=state.noteContents[id];if(!nc)return;
    nc.content=html;nc.dirty=true;nc.saveError=false;updateCounts(id,plain);renderTabs();scheduleAutoSave(id);refreshSaveStatus();
  }

  function updateCounts(id,text) {
    const view=paneViews.get(id);if(!view)return;
    field(view,'charCount').textContent=text.length+' caracteres';
    field(view,'wordCount').textContent=(text.trim()?text.trim().split(/\\s+/).length:0)+' palavras';
    field(view,'lineCount').textContent=(text?text.split('\\n').length:0)+' linhas';
  }

  // ============================================================
  // AUTO-SAVE
  // ============================================================
  function scheduleAutoSave(noteId) {
    const nc = state.noteContents[noteId];
    if (!nc) return;
    if (nc.timer) clearTimeout(nc.timer);
    nc.timer = setTimeout(() => saveNote(noteId), 800);
  }

  async function saveNote(noteId) {
    const nc = state.noteContents[noteId];
    if (!nc || !nc.dirty || nc.conflict) return;
    if (nc.saving) { await nc.saving; if (nc.dirty && !nc.conflict) return saveNote(noteId); return; }
    nc.saving = (async () => {
      try {
        while (nc.dirty && !nc.conflict) {
          const title = nc.title, content = nc.content;
          updateSaveStatus('saving');
          const data = await api('/notes/' + noteId, { method:'PUT', body: JSON.stringify({ title, content, version: nc.version }) });
          nc.version = data.version;
          nc.dirty = nc.title !== title || nc.content !== content;
          const n = state.notes.find(x => x.id === noteId);
          if (n) { n.title = title; n.content = content; n.version = data.version; n.updated_at = new Date().toISOString(); }
        }
        renderTabs(); renderNotesList();
        nc.saveError=false;
        refreshSaveStatus();
        const savedField=field(paneViews.get(noteId),'lastSaved');
        if(savedField && !nc.dirty)savedField.textContent='Salvo às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      } catch (e) {
        if (e.status === 409) { nc.conflict = true; showToast('Conflito: copie seu texto antes de recarregar.', 'fa-exclamation-circle', 'text-red-400'); }
        nc.saveError=true;refreshSaveStatus();
      }
    })();
    try { await nc.saving; } finally { nc.saving = null; }
  }
  window.addEventListener('online', () => Object.keys(state.noteContents).forEach(id => saveNote(Number(id))));

  function refreshSaveStatus() {
    const notes=Object.values(state.noteContents);
    for(const [id,view] of paneViews){const note=state.noteContents[id];if(note && (note.dirty || note.conflict || note.saveError))field(view,'lastSaved').textContent=note.conflict?'Conflito — copie o texto antes de recarregar':note.saveError?'Falha ao salvar — tente Ctrl+S':'Salvando alterações…';}
    updateSaveStatus(notes.some(n=>n.conflict || n.saveError)?'error':notes.some(n=>n.dirty)?'saving':'saved');
  }

  function updateSaveStatus(s) {
    const el = document.getElementById('saveStatus');
    if (s === 'saving') {
      el.innerHTML = '<i class="fas fa-circle-notch fa-spin text-brand-400"></i> Salvando...';
      el.className = 'text-xs text-brand-500 save-ind';
    } else if (s === 'saved') {
      el.innerHTML = '<i class="fas fa-check-circle text-green-500"></i> Salvo';
      el.className = 'text-xs text-green-600 save-ind';
    } else {
      el.innerHTML = '<i class="fas fa-exclamation-circle text-red-500"></i> Alterações pendentes — Ctrl+S para tentar';
      el.className = 'text-xs text-red-500 save-ind';
    }
  }

  // ============================================================
  // CONTEXT MENUS
  // ============================================================
  function showFolderMenu(e, fid) {
    e.preventDefault(); e.stopPropagation();
    showCtx(e.clientX, e.clientY, [
      { icon:'fa-folder-plus', label:'Nova subpasta', fn:()=>createFolder(fid) },
      { icon:'fa-pen', label:'Renomear', fn:()=>renameFolder(fid) },
      { icon:'fa-file-circle-plus', label:'Nova nota aqui', fn:async()=>{ state.activeFolderId=fid; await createNote(); }},
      null,
      { icon:'fa-trash', label:'Excluir pasta', fn:()=>deleteFolder(fid), danger:1 },
    ]);
  }

  function showNoteMenu(e, nid) {
    e.preventDefault(); e.stopPropagation();
    showCtx(e.clientX, e.clientY, [
      { icon:'fa-up-right-from-square', label:'Abrir', fn:()=>openNote(nid) },
      { icon:'fa-share-nodes', label:'Compartilhar', fn:()=>shareNote(nid) },
      { icon:'fa-folder-open', label:'Mover', fn:()=>moveNote(nid) },
      null,
      { icon:'fa-trash', label:'Excluir', fn:()=>deleteNote(nid), danger:1 },
    ]);
  }

  function showCtx(x, y, items) {
    const m = document.getElementById('ctxMenu');
    m.innerHTML = items.map(i => {
      if (!i) return '<div class="border-t border-dark-100 my-1"></div>';
      return \`<button data-a class="w-full text-left px-4 py-2.5 hover:bg-dark-50 flex items-center gap-2.5 transition rounded-lg mx-1
        \${i.danger ? 'text-red-500 hover:bg-red-50' : 'text-dark-600'}">
        <i class="fas \${i.icon} w-4 text-center text-xs"></i>
        <span class="text-sm">\${i.label}</span>
      </button>\`;
    }).join('');
    const btns = m.querySelectorAll('[data-a]');
    const acts = items.filter(Boolean);
    btns.forEach((b,i) => { b.onclick = () => { hideCtx(); acts[i].fn(); }; });
    m.style.left = Math.min(x, innerWidth - 200) + 'px';
    m.style.top = Math.min(y, innerHeight - 250) + 'px';
    m.classList.remove('hidden');
  }

  function hideCtx() { document.getElementById('ctxMenu').classList.add('hidden'); }
  document.addEventListener('click', hideCtx);

  // ============================================================
  // MODAL
  // ============================================================
  function showModal(title, body, onOk, isDanger) {
    const m = document.getElementById('modal');
    document.getElementById('modalContent').innerHTML = \`
      <h3 class="text-lg font-bold text-dark-800 mb-4">\${title}</h3>
      <div class="mb-6">\${body}</div>
      <div class="flex justify-end gap-2">
        <button data-dt-click="hideModal()" class="px-4 py-2.5 text-sm text-dark-500 hover:text-dark-700 font-medium rounded-xl hover:bg-dark-50 transition">Cancelar</button>
        <button id="mc" class="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition shadow-sm
          \${isDanger ? 'bg-red-500 hover:bg-red-600' : 'gradient-brand hover:opacity-90'}">Confirmar</button>
      </div>\`;
    document.getElementById('mc').onclick = async () => { await onOk(); hideModal(); };
    m.classList.remove('hidden');
  }

  function hideModal() { document.getElementById('modal').classList.add('hidden'); }
  document.getElementById('modal').addEventListener('click', e => { if (e.target === e.currentTarget) hideModal(); });

  // ============================================================
  // UTILS
  // ============================================================
  function esc(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function timeAgo(d) {
    if (!d) return '';
    const diff = (Date.now() - new Date(d).getTime()) / 1e3;
    if (diff < 60) return 'agora';
    if (diff < 3600) return Math.floor(diff/60) + 'min';
    if (diff < 86400) return Math.floor(diff/3600) + 'h';
    return new Date(d).toLocaleDateString('pt-BR');
  }

  // ============================================================
  // SHARING
  // ============================================================
  async function shareNote(noteId) {
    if (!noteId) return;
    try {
      const data = await api('/notes/' + noteId + '/shares');
      const shares = data.shares || [];
      renderShareModal(noteId, shares);
    } catch (e) {
      showToast('Erro ao carregar compartilhamentos', 'fa-exclamation-circle', 'text-red-400');
    }
  }

  function renderShareModal(noteId, shares) {
    const activeShares = shares.filter(s => s.is_active && (!s.expires_at || Date.parse(s.expires_at.replace(' ', 'T') + 'Z') > Date.now()));
    const baseUrl = window.location.origin;

    let sharesHtml = '';
    if (activeShares.length) {
      sharesHtml = activeShares.map(s => {
        const url = baseUrl + '/s/' + s.share_token;
        const permColor = s.permission === 'edit' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
        const permLabel = s.permission === 'edit' ? 'Edição' : 'Visualização';
        return \`
        <div class="flex items-center gap-2 p-3 bg-dark-50 rounded-xl text-sm">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${permColor}">\${permLabel}</span>
              \${s.shared_with_email ? \`<span class="text-xs text-dark-400">\${esc(s.shared_with_email)}</span>\` : '<span class="text-xs text-dark-400">Qualquer um com o link</span>'}
            </div>
            <div class="flex items-center gap-1">
              <input type="text" value="\${esc(url)}" readonly class="flex-1 text-xs text-dark-500 bg-white border border-dark-200 rounded-lg px-2 py-1 truncate" id="shareUrl-\${s.id}">
              <button data-dt-click="copyShareUrl('shareUrl-\${s.id}')" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-400 hover:text-brand-500 hover:bg-brand-50 transition shrink-0" title="Copiar">
                <i class="far fa-copy text-xs"></i>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button data-dt-click="toggleSharePerm(\${s.id},'\${s.permission === 'edit' ? 'view' : 'edit'}',\${noteId})" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-300 hover:text-brand-500 hover:bg-brand-50 transition" title="Alterar permissão">
              <i class="fas fa-\${s.permission === 'edit' ? 'eye' : 'pen'} text-[10px]"></i>
            </button>
            <button data-dt-click="revokeShare(\${s.id},\${noteId})" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition" title="Revogar">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>\`;
      }).join('');
    } else {
      sharesHtml = \`<div class="text-center py-4 text-sm text-dark-400">
        <i class="fas fa-link text-dark-300 text-lg mb-2"></i>
        <p>Nenhum link de compartilhamento ativo</p>
      </div>\`;
    }

    const m = document.getElementById('modal');
    document.getElementById('modalContent').innerHTML = \`
      <h3 class="text-lg font-bold text-dark-800 mb-1"><i class="fas fa-share-nodes text-brand-400 mr-2"></i>Compartilhar Nota</h3>
      <p class="text-xs text-dark-400 mb-4">Qualquer pessoa com o link poderá acessar. Novos links valem 7 dias.</p>
      <div class="mb-4">
        <label class="text-xs font-semibold text-dark-600 mb-2 block">Criar novo link</label>
        <div class="flex gap-2">
          <select id="newSharePerm" class="flex-1 px-3 py-2.5 border border-dark-200 rounded-xl text-sm bg-dark-50 outline-none focus:ring-2 focus:ring-brand-400">
            <option value="view">👁 Apenas visualização</option>
            <option value="edit">✏️ Pode editar (requer login)</option>
          </select>
          <button data-dt-click="createShare(\${noteId})" class="gradient-brand text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-sm whitespace-nowrap">
            <i class="fas fa-plus text-xs"></i> Criar
          </button>
        </div>
      </div>
      <div class="space-y-2 max-h-56 overflow-y-auto sb" id="sharesList">
        \${sharesHtml}
      </div>
      <div class="mt-4 flex justify-end">
        <button data-dt-click="hideModal()" class="px-4 py-2.5 text-sm text-dark-500 hover:text-dark-700 font-medium rounded-xl hover:bg-dark-50 transition">Fechar</button>
      </div>\`;
    m.classList.remove('hidden');
  }

  async function createShare(noteId) {
    const perm = document.getElementById('newSharePerm').value;
    try {
      const data = await api('/notes/' + noteId + '/shares', {
        method: 'POST',
        body: JSON.stringify({ permission: perm })
      });
      showToast('Link criado!', 'fa-link', 'text-blue-400');
      // Refresh the modal
      await shareNote(noteId);
    } catch (e) {
      showToast('Erro ao criar link', 'fa-exclamation-circle', 'text-red-400');
    }
  }

  function copyShareUrl(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value).then(() => {
        showToast('Link copiado!', 'fa-copy', 'text-blue-400');
      });
    }
  }

  async function toggleSharePerm(shareId, newPerm, noteId) {
    try {
      await api('/shares/' + shareId, { method:'PUT', body: JSON.stringify({ permission: newPerm }) });
      showToast('Permissão alterada!', 'fa-pen', 'text-brand-400');
      await shareNote(noteId);
    } catch (e) {
      showToast('Erro ao alterar', 'fa-exclamation-circle', 'text-red-400');
    }
  }

  async function revokeShare(shareId, noteId) {
    try {
      await api('/shares/' + shareId, { method:'DELETE' });
      showToast('Link revogado', 'fa-link-slash', 'text-red-400');
      await shareNote(noteId);
    } catch (e) {
      showToast('Erro ao revogar', 'fa-exclamation-circle', 'text-red-400');
    }
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); Object.keys(state.noteContents).forEach(id=>saveNote(Number(id))); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') { e.preventDefault(); if (state.activeTabId) closeTab(state.activeTabId); }
    if (e.key === 'Escape') { hideModal(); hideCtx(); document.getElementById('layoutMenu').open=false; }
  });

  // Save dirty notes before leaving
  window.addEventListener('beforeunload', e => {
    const dirty = Object.entries(state.noteContents).filter(([,nc]) => nc.dirty);
    if (dirty.length) {
      dirty.forEach(([id]) => saveNote(parseInt(id)));
      e.preventDefault(); e.returnValue = '';
    }
  });

  init();

  // Declarative action routing. No eval, Function, or inline event handlers.
  const actions = { setLayout, manageTabs, reorderTab, copyActiveNote, toggleFolderOutline, closeTab: typeof closeTab === "function" ? closeTab : null, copyShareUrl: typeof copyShareUrl === "function" ? copyShareUrl : null, createFolder: typeof createFolder === "function" ? createFolder : null, createNote: typeof createNote === "function" ? createNote : null, createShare: typeof createShare === "function" ? createShare : null, deleteNote: typeof deleteNote === "function" ? deleteNote : null, filterNotes: typeof filterNotes === "function" ? filterNotes : null, hideModal: typeof hideModal === "function" ? hideModal : null, loadAllNotes: typeof loadAllNotes === "function" ? loadAllNotes : null, mobileBack: typeof mobileBack === "function" ? mobileBack : null, moveNote: typeof moveNote === "function" ? moveNote : null, onContentChange: typeof onContentChange === "function" ? onContentChange : null, onTitleChange: typeof onTitleChange === "function" ? onTitleChange : null, openNote: typeof openNote === "function" ? openNote : null, revokeShare: typeof revokeShare === "function" ? revokeShare : null, selectFolder: typeof selectFolder === "function" ? selectFolder : null, shareNote: typeof shareNote === "function" ? shareNote : null, showFolderMenu: typeof showFolderMenu === "function" ? showFolderMenu : null, showNoteMenu: typeof showNoteMenu === "function" ? showNoteMenu : null, switchTab: typeof switchTab === "function" ? switchTab : null, togCh: typeof togCh === "function" ? togCh : null, toggleAllFolders: typeof toggleAllFolders === "function" ? toggleAllFolders : null, toggleSharePerm: typeof toggleSharePerm === "function" ? toggleSharePerm : null, toggleSidebar: typeof toggleSidebar === "function" ? toggleSidebar : null };
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
  document.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role=button][data-dt-click]')) { event.preventDefault(); event.target.click(); } });
  </script>
</body>
</html>`;
}
