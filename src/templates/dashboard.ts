// Dashboard template - Main app interface (responsive + polished)

export function dashboardPage(username: string, isAdmin: boolean = false) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Dashboard - DoutorText</title>
  <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: { 50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#F5A623',500:'#E8971A',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f' },
            dark: { 50:'#f9fafb',100:'#f3f4f6',200:'#e5e7eb',300:'#d1d5db',400:'#9ca3af',500:'#6b7280',600:'#4b5563',700:'#374151',800:'#1f2937',900:'#111827' }
          },
          fontFamily: { sans:['Poppins','sans-serif'], mono:['JetBrains Mono','monospace'] }
        }
      }
    }
  </script>
  <style>
    *{font-family:'Poppins',sans-serif;margin:0;padding:0;box-sizing:border-box}
    .sb::-webkit-scrollbar{width:4px;height:4px}
    .sb::-webkit-scrollbar-track{background:transparent}
    .sb::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}
    .sb::-webkit-scrollbar-thumb:hover{background:#9ca3af}
    #editor{font-family:'JetBrains Mono',monospace;font-size:14px;line-height:1.8;resize:none;outline:none}
    #editor:focus{box-shadow:none}
    .tab-btn.active{background:linear-gradient(135deg,#F5A623,#E8971A);color:white;border-color:#F5A623}
    .tab-btn{transition:all .2s ease}
    .tab-btn:hover:not(.active){background:#f3f4f6}
    .folder-item:hover .fa-act{opacity:1}
    .fa-act{opacity:0;transition:opacity .15s}
    .note-item.active{background:linear-gradient(90deg,#fffbeb,#fef3c7);border-left:3px solid #F5A623}
    .note-item{border-left:3px solid transparent;transition:all .15s}
    .note-item:hover{background:#f9fafb}
    .note-item:hover .note-del{opacity:1}
    .note-del{opacity:0;transition:opacity .15s}
    .save-ind{transition:all .3s ease}
    .ctx-menu{z-index:9999}
    .modal-bg{background:rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
    .tree-ch{overflow:hidden;transition:max-height .25s ease}
    .ft{transition:transform .2s}.ft.open{transform:rotate(90deg)}
    .gradient-brand{background:linear-gradient(135deg,#F5A623 0%,#E8971A 50%,#d97706 100%)}
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
</head>
<body class="bg-dark-50 h-screen flex flex-col overflow-hidden">
  <!-- Toast notification -->
  <div id="toast" class="toast bg-dark-800 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2">
    <i id="toastIcon" class="fas fa-check-circle text-green-400"></i>
    <span id="toastMsg">Salvo!</span>
  </div>

  <!-- Top Bar -->
  <header class="bg-white border-b border-dark-200 px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 relative z-30">
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Mobile menu button -->
      <button id="menuBtn" onclick="toggleSidebar()" class="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-100 transition text-dark-500">
        <i class="fas fa-bars"></i>
      </button>
      <div class="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center shadow-sm">
        <i class="fas fa-file-medical text-white text-xs"></i>
      </div>
      <span class="text-base sm:text-lg font-bold text-dark-800 hidden sm:inline">Doutor<span class="text-brand-400">Text</span></span>
    </div>
    <div class="flex items-center gap-2 sm:gap-4">
      <span id="saveStatus" class="text-xs text-dark-400 save-ind hidden sm:inline">
        <i class="fas fa-check-circle text-green-500"></i> Salvo
      </span>
      <div class="flex items-center gap-1.5 text-sm text-dark-600">
        <div class="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
          ${username.charAt(0).toUpperCase()}
        </div>
        <span class="font-medium hidden sm:inline">${username}</span>
      </div>
      ${isAdmin ? `<a href="/admin" class="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-50 transition" title="Painel Admin">
        <i class="fas fa-shield-halved text-sm"></i>
      </a>` : ''}
      <a href="/logout" class="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-red-500 hover:bg-red-50 transition" title="Sair">
        <i class="fas fa-sign-out-alt text-sm"></i>
      </a>
    </div>
  </header>

  <!-- Mobile sidebar overlay -->
  <div id="sidebarOverlay" class="sidebar-overlay" onclick="toggleSidebar()"></div>

  <!-- Main Content -->
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    <aside id="sidebar" class="w-64 bg-white border-r border-dark-200 flex flex-col shrink-0">
      <!-- Mobile close -->
      <div class="md:hidden p-3 border-b border-dark-100 flex items-center justify-between">
        <span class="text-sm font-bold text-dark-800">Doutor<span class="text-brand-400">Text</span></span>
        <button onclick="toggleSidebar()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-100 text-dark-400">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <!-- Sidebar Header -->
      <div class="p-3 border-b border-dark-100 flex items-center justify-between">
        <span class="text-xs font-bold text-dark-500 uppercase tracking-wider">Pastas</span>
        <div class="flex items-center gap-0.5">
          <button onclick="toggleAllFolders(true)" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-400 hover:bg-dark-100 transition" title="Recolher todas">
            <i class="fas fa-compress-alt text-[10px]"></i>
          </button>
          <button onclick="toggleAllFolders(false)" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-400 hover:bg-dark-100 transition" title="Expandir todas">
            <i class="fas fa-expand-alt text-[10px]"></i>
          </button>
          <button onclick="createFolder(null)" class="w-7 h-7 flex items-center justify-center rounded-lg text-brand-400 hover:bg-brand-50 transition" title="Nova pasta">
            <i class="fas fa-folder-plus text-sm"></i>
          </button>
        </div>
      </div>

      <!-- All Notes -->
      <div class="p-2 border-b border-dark-100">
        <button onclick="loadAllNotes()" id="allNotesBtn"
          class="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-dark-600 hover:bg-brand-50 hover:text-brand-600 transition flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
            <i class="fas fa-file-lines text-brand-400 text-xs"></i>
          </div>
          <span>Todas as notas</span>
        </button>
      </div>

      <!-- Folder Tree -->
      <div id="folderTree" class="flex-1 overflow-y-auto sb p-2 space-y-0.5"></div>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-dark-100">
        <button onclick="createNote()" class="w-full gradient-brand text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md">
          <i class="fas fa-plus text-xs"></i> Nova Nota
        </button>
      </div>
    </aside>

    <!-- Notes List + Editor -->
    <div id="mainArea" class="flex-1 flex overflow-hidden">
      <!-- Notes List Panel -->
      <div id="notesPanel" class="w-56 bg-white border-r border-dark-200 flex flex-col shrink-0">
        <div class="p-3 border-b border-dark-200 flex items-center justify-between">
          <span id="notesPanelTitle" class="text-xs font-bold text-dark-500 uppercase tracking-wider truncate">Notas</span>
          <span id="notesCount" class="text-[10px] text-dark-400 bg-dark-100 px-2 py-0.5 rounded-full font-semibold">0</span>
        </div>
        <!-- Search -->
        <div class="p-2 border-b border-dark-100">
          <div class="relative">
            <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-300 text-xs"></i>
            <input id="searchInput" type="text" placeholder="Buscar notas..." oninput="filterNotes()"
              class="w-full pl-8 pr-3 py-2 text-xs border border-dark-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none bg-dark-50 transition">
          </div>
        </div>
        <div id="notesList" class="flex-1 overflow-y-auto sb"></div>
      </div>

      <!-- Editor Area -->
      <div class="flex-1 flex flex-col overflow-hidden bg-white">
        <!-- Tabs Bar -->
        <div class="border-b border-dark-200 bg-dark-50/50 flex items-center shrink-0 overflow-x-auto sb" id="tabsBar">
          <div id="tabsContainer" class="flex items-center min-w-0"></div>
        </div>

        <!-- Editor -->
        <div id="editorArea" class="flex-1 flex flex-col overflow-hidden">
          <div id="editorPlaceholder" class="flex-1 flex items-center justify-center text-dark-300">
            <div class="text-center px-6">
              <div class="w-20 h-20 mx-auto mb-5 rounded-2xl bg-dark-100 flex items-center justify-center">
                <i class="fas fa-file-pen text-3xl text-dark-300"></i>
              </div>
              <p class="text-lg font-semibold text-dark-400">Selecione ou crie uma nota</p>
              <p class="text-sm mt-1.5 text-dark-300">Suas anotações aparecem aqui</p>
              <button onclick="createNote()" class="mt-5 gradient-brand text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md inline-flex items-center gap-2">
                <i class="fas fa-plus text-xs"></i> Criar nota
              </button>
            </div>
          </div>
          <div id="editorWrapper" class="flex-1 flex flex-col overflow-hidden hidden">
            <!-- Note title + actions -->
            <div class="px-4 sm:px-6 pt-4 pb-2 shrink-0 flex items-center gap-2">
              <input id="noteTitle" type="text" placeholder="Título da nota..."
                class="flex-1 text-lg sm:text-xl font-bold text-dark-800 placeholder-dark-300 outline-none border-none bg-transparent"
                oninput="onTitleChange()">
              <div class="flex items-center gap-1 shrink-0">
                <button onclick="shareNote(state.activeTabId)" class="w-8 h-8 flex items-center justify-center rounded-lg text-dark-300 hover:text-blue-500 hover:bg-blue-50 transition" title="Compartilhar">
                  <i class="fas fa-share-nodes text-xs"></i>
                </button>
                <button onclick="moveNote(state.activeTabId)" class="w-8 h-8 flex items-center justify-center rounded-lg text-dark-300 hover:text-brand-500 hover:bg-brand-50 transition" title="Mover">
                  <i class="fas fa-folder-arrow-up text-xs"></i>
                </button>
                <button onclick="deleteNote(state.activeTabId)" class="w-8 h-8 flex items-center justify-center rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition" title="Excluir nota">
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
            <!-- Text editor -->
            <div class="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
              <textarea id="editor" class="w-full h-full bg-transparent text-dark-700 placeholder-dark-300"
                placeholder="Comece a escrever..."
                oninput="onContentChange()"></textarea>
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
          </div>
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
  <button onclick="createNote()" id="fabBtn"
    class="md:hidden fixed bottom-5 right-5 w-14 h-14 gradient-brand rounded-2xl shadow-lg flex items-center justify-center text-white text-lg z-30 hover:opacity-90 transition active:scale-95">
    <i class="fas fa-plus"></i>
  </button>

  <script>
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
    mobileView: 'list' // 'list' | 'editor'
  };
  const API = '/api';
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
      throw new Error(err.error || 'Erro');
    }
    return res.json();
  }

  // ============================================================
  // INIT
  // ============================================================
  async function init() {
    await Promise.all([loadFolders(), loadAllNotes()]);
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
    document.getElementById('notesPanel').style.display = 'none';
    document.getElementById('fabBtn').style.display = 'none';
    state.mobileView = 'editor';
  }

  function showMobileList() {
    if (!isMobile()) return;
    document.getElementById('notesPanel').style.display = '';
    document.getElementById('fabBtn').style.display = '';
    state.mobileView = 'list';
  }

  // Back button for mobile editor
  function renderMobileBack() {
    if (!isMobile() || state.mobileView !== 'editor') return '';
    return '<button onclick="mobileBack()" class="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:bg-dark-100 mr-1"><i class="fas fa-arrow-left text-sm"></i></button>';
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
      document.getElementById('notesPanel').style.display = '';
      document.getElementById('fabBtn').style.display = '';
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('show');
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
    // On first load, collapse all subfolders (only root folders visible expanded)
    if (isFirstLoad) {
      state.folders.forEach(f => {
        // Collapse folders that have children and are not root-level
        if (f.parent_id !== null && state.folders.some(c => c.parent_id === f.id)) {
          state.collapsedFolders.add(f.id);
        }
      });
    }
    renderFolderTree();
  }

  function renderFolderTree() {
    document.getElementById('folderTree').innerHTML = buildTree(state.folders, null, 0);
  }

  function buildTree(folders, pid, depth) {
    const ch = folders.filter(f => f.parent_id === pid);
    if (!ch.length) return '';
    return ch.map(f => {
      const hasCh = folders.some(c => c.parent_id === f.id);
      const sub = buildTree(folders, f.id, depth + 1);
      const act = state.activeFolderId === f.id;
      const pl = 10 + depth * 14;
      const isCollapsed = state.collapsedFolders.has(f.id);
      const isOpen = hasCh && !isCollapsed;
      return \`<div>
        <div class="folder-item flex items-center gap-1 px-2 py-2 rounded-xl cursor-pointer group text-sm
          \${act ? 'bg-brand-50 text-brand-700' : 'text-dark-600 hover:bg-dark-50'}"
          style="padding-left:\${pl}px"
          onclick="selectFolder(\${f.id})"
          oncontextmenu="showFolderMenu(event,\${f.id})">
          \${hasCh ? \`<i class="fas fa-caret-right ft text-dark-400 text-[10px] cursor-pointer \${isOpen?'open':''}" onclick="event.stopPropagation();togCh(\${f.id})"></i>\` : '<span class="w-2.5"></span>'}
          <i class="fas fa-folder \${act ? 'text-brand-400' : 'text-dark-300'} text-xs"></i>
          <span class="truncate flex-1 font-medium text-xs">\${esc(f.name)}</span>
          <div class="fa-act flex items-center gap-0.5">
            <button onclick="event.stopPropagation();createFolder(\${f.id})" class="w-6 h-6 flex items-center justify-center rounded text-dark-300 hover:text-brand-400" title="Subpasta">
              <i class="fas fa-folder-plus text-[10px]"></i>
            </button>
            <button onclick="event.stopPropagation();showFolderMenu(event,\${f.id})" class="w-6 h-6 flex items-center justify-center rounded text-dark-300 hover:text-dark-500">
              <i class="fas fa-ellipsis-v text-[10px]"></i>
            </button>
          </div>
        </div>
        \${sub ? \`<div class="tree-ch" id="fc-\${f.id}" style="max-height:\${isCollapsed ? '0' : '1000'}px">\${sub}</div>\` : ''}
      </div>\`;
    }).join('');
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
    // Expand parent folders when selecting a nested folder
    expandParents(id);
    renderFolderTree();
    loadNotesByFolder(id);
    document.getElementById('allNotesBtn').classList.remove('bg-brand-50','text-brand-600');
    // Close sidebar on mobile
    if (isMobile()) toggleSidebar();
  }

  // Ensure all ancestor folders of a given folder are expanded (not collapsed)
  function expandParents(folderId) {
    let folder = state.folders.find(f => f.id === folderId);
    while (folder && folder.parent_id) {
      state.collapsedFolders.delete(folder.parent_id);
      folder = state.folders.find(f => f.id === folder.parent_id);
    }
  }

  function togCh(id) {
    if (state.collapsedFolders.has(id)) {
      state.collapsedFolders.delete(id);
    } else {
      state.collapsedFolders.add(id);
    }
    // Update just the DOM for this folder instead of re-rendering entire tree
    const c = document.getElementById('fc-' + id);
    const arrow = document.querySelector('[onclick="event.stopPropagation();togCh(' + id + ')"]');
    if (c) {
      const isOpen = !state.collapsedFolders.has(id);
      c.style.maxHeight = isOpen ? '1000px' : '0px';
      if (arrow) {
        arrow.classList.toggle('open', isOpen);
      }
    }
  }

  // ============================================================
  // NOTES
  // ============================================================
  async function loadAllNotes() {
    state.activeFolderId = null;
    document.getElementById('allNotesBtn').classList.add('bg-brand-50','text-brand-600');
    renderFolderTree();
    const data = await api('/notes');
    state.notes = data.notes;
    renderNotesList();
    document.getElementById('notesPanelTitle').textContent = 'Todas as notas';
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
    document.getElementById('notesPanelTitle').textContent = f ? f.name : 'Todas as notas';
  }

  function filterNotes() {
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    const items = document.querySelectorAll('#notesList .note-item');
    items.forEach(el => {
      const text = el.textContent.toLowerCase();
      el.style.display = !q || text.includes(q) ? '' : 'none';
    });
  }

  function renderNotesList() {
    const list = document.getElementById('notesList');
    document.getElementById('notesCount').textContent = state.notes.length;
    document.getElementById('searchInput').value = '';

    if (!state.notes.length) {
      list.innerHTML = \`
        <div class="p-6 text-center">
          <div class="w-14 h-14 mx-auto mb-3 rounded-xl bg-dark-100 flex items-center justify-center">
            <i class="fas fa-sticky-note text-xl text-dark-300"></i>
          </div>
          <p class="text-sm font-medium text-dark-400">Nenhuma nota aqui</p>
          <p class="text-xs text-dark-300 mt-1">Crie uma nota para começar</p>
        </div>\`;
      return;
    }

    list.innerHTML = state.notes.map(n => {
      const hasShares = n.last_edited_by && n.last_edited_by !== '${username}';
      return \`
      <div class="note-item px-3 py-3 cursor-pointer relative group \${state.activeTabId===n.id?'active':''}"
        onclick="openNote(\${n.id})"
        oncontextmenu="showNoteMenu(event,\${n.id})">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-xs text-dark-700 truncate">\${esc(n.title || 'Sem título')}</div>
            <div class="text-[11px] text-dark-400 mt-0.5 truncate">\${esc((n.content||'').substring(0,80)) || 'Nota vazia...'}</div>
            <div class="text-[10px] text-dark-300 mt-1 flex items-center gap-2">
              <span><i class="far fa-clock"></i> \${timeAgo(n.updated_at)}</span>
              \${hasShares ? \`<span class="text-blue-400"><i class="fas fa-pen-nib"></i> \${esc(n.last_edited_by)}</span>\` : ''}
            </div>
          </div>
          <button onclick="event.stopPropagation();deleteNote(\${n.id})"
            class="note-del w-7 h-7 flex items-center justify-center rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition shrink-0 mt-0.5"
            title="Excluir nota">
            <i class="fas fa-trash text-[10px]"></i>
          </button>
        </div>
      </div>\`;
    }).join('');
  }

  async function createNote() {
    const body = { title: 'Nova nota', content: '' };
    if (state.activeFolderId) body.folder_id = state.activeFolderId;
    const data = await api('/notes', { method:'POST', body: JSON.stringify(body) });
    await loadNotesByFolder(state.activeFolderId);
    openNote(data.note.id);
    showToast('Nota criada!');
  }

  async function openNote(id) {
    let tab = state.openTabs.find(t => t.noteId === id);
    if (!tab) {
      const data = await api('/notes/' + id);
      const note = data.note;
      tab = { noteId: id, title: note.title };
      state.openTabs.push(tab);
      state.noteContents[id] = { title: note.title, content: note.content || '', dirty: false, timer: null };
    }
    state.activeTabId = id;
    renderTabs();
    renderEditor();
    renderNotesList();
    showMobileEditor();
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
      await api('/notes/' + noteId, { method:'PUT', body: JSON.stringify({ folder_id: fid ? parseInt(fid) : null }) });
      await loadNotesByFolder(state.activeFolderId);
      showToast('Nota movida!', 'fa-folder-arrow-up', 'text-brand-400');
    });
  }

  function getDepth(fid) {
    let d = 0, c = state.folders.find(f => f.id === fid);
    while (c?.parent_id) { d++; c = state.folders.find(f => f.id === c.parent_id); }
    return d;
  }

  // ============================================================
  // TABS
  // ============================================================
  function renderTabs() {
    const c = document.getElementById('tabsContainer');
    c.innerHTML = state.openTabs.map(t => {
      const act = state.activeTabId === t.noteId;
      const nc = state.noteContents[t.noteId];
      const dirty = nc?.dirty ? '<span class="w-1.5 h-1.5 rounded-full bg-brand-300 inline-block ml-1"></span>' : '';
      return \`
        <div class="tab-btn flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer border-r border-dark-200/50 whitespace-nowrap
          \${act ? 'active' : 'bg-white text-dark-500'}"
          onclick="switchTab(\${t.noteId})">
          <span class="max-w-28 truncate">\${esc(nc?.title || t.title || 'Sem título')}</span>\${dirty}
          <button onclick="event.stopPropagation();closeTab(\${t.noteId})"
            class="ml-1 w-4 h-4 flex items-center justify-center rounded hover:bg-black/10 transition">
            <i class="fas fa-times text-[9px]"></i>
          </button>
        </div>\`;
    }).join('');
  }

  function switchTab(noteId) {
    state.activeTabId = noteId;
    renderTabs(); renderEditor(); renderNotesList();
  }

  function closeTab(noteId, skipSave) {
    const nc = state.noteContents[noteId];
    if (nc?.dirty && !skipSave) { clearTimeout(nc.timer); saveNote(noteId); }
    state.openTabs = state.openTabs.filter(t => t.noteId !== noteId);
    delete state.noteContents[noteId];
    if (state.activeTabId === noteId) {
      state.activeTabId = state.openTabs.length ? state.openTabs[state.openTabs.length-1].noteId : null;
      if (!state.activeTabId && isMobile()) showMobileList();
    }
    renderTabs(); renderEditor(); renderNotesList();
  }

  // ============================================================
  // EDITOR
  // ============================================================
  function renderEditor() {
    const ph = document.getElementById('editorPlaceholder');
    const wr = document.getElementById('editorWrapper');
    if (!state.activeTabId || !state.noteContents[state.activeTabId]) {
      ph.classList.remove('hidden'); wr.classList.add('hidden'); return;
    }
    ph.classList.add('hidden'); wr.classList.remove('hidden');
    const nc = state.noteContents[state.activeTabId];
    document.getElementById('noteTitle').value = nc.title || '';
    document.getElementById('editor').value = nc.content || '';
    updateCounts(nc.content || '');
  }

  function onTitleChange() {
    const nc = state.noteContents[state.activeTabId];
    if (!nc) return;
    nc.title = document.getElementById('noteTitle').value;
    nc.dirty = true;
    const tab = state.openTabs.find(t => t.noteId === state.activeTabId);
    if (tab) tab.title = nc.title;
    renderTabs();
    scheduleAutoSave(state.activeTabId);
  }

  function onContentChange() {
    const nc = state.noteContents[state.activeTabId];
    if (!nc) return;
    nc.content = document.getElementById('editor').value;
    nc.dirty = true;
    updateCounts(nc.content);
    renderTabs();
    scheduleAutoSave(state.activeTabId);
    updateSaveStatus('saving');
  }

  function updateCounts(t) {
    const ch = t.length, w = t.trim() ? t.trim().split(/\\s+/).length : 0, l = t ? t.split('\\n').length : 0;
    document.getElementById('charCount').innerHTML = '<i class="fas fa-font"></i> ' + ch + ' chars';
    document.getElementById('wordCount').innerHTML = '<i class="fas fa-paragraph"></i> ' + w + ' palavras';
    document.getElementById('lineCount').innerHTML = '<i class="fas fa-list"></i> ' + l + ' linhas';
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
    if (!nc || !nc.dirty) return;
    try {
      updateSaveStatus('saving');
      await api('/notes/' + noteId, { method:'PUT', body: JSON.stringify({ title: nc.title, content: nc.content }) });
      nc.dirty = false;
      renderTabs();
      updateSaveStatus('saved');
      document.getElementById('lastSaved').textContent = 'Salvo ' + new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      const n = state.notes.find(x => x.id === noteId);
      if (n) { n.title = nc.title; n.content = nc.content; n.updated_at = new Date().toISOString(); renderNotesList(); }
    } catch (e) {
      updateSaveStatus('error');
    }
  }

  function updateSaveStatus(s) {
    const el = document.getElementById('saveStatus');
    if (s === 'saving') {
      el.innerHTML = '<i class="fas fa-circle-notch fa-spin text-brand-400"></i> Salvando...';
      el.className = 'text-xs text-brand-500 save-ind hidden sm:inline';
    } else if (s === 'saved') {
      el.innerHTML = '<i class="fas fa-check-circle text-green-500"></i> Salvo';
      el.className = 'text-xs text-green-600 save-ind hidden sm:inline';
    } else {
      el.innerHTML = '<i class="fas fa-exclamation-circle text-red-500"></i> Erro';
      el.className = 'text-xs text-red-500 save-ind hidden sm:inline';
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
      { icon:'fa-folder-arrow-up', label:'Mover', fn:()=>moveNote(nid) },
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
        <button onclick="hideModal()" class="px-4 py-2.5 text-sm text-dark-500 hover:text-dark-700 font-medium rounded-xl hover:bg-dark-50 transition">Cancelar</button>
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
    const activeShares = shares.filter(s => s.is_active);
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
              <button onclick="copyShareUrl('shareUrl-\${s.id}')" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-400 hover:text-brand-500 hover:bg-brand-50 transition shrink-0" title="Copiar">
                <i class="far fa-copy text-xs"></i>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button onclick="toggleSharePerm(\${s.id},'\${s.permission === 'edit' ? 'view' : 'edit'}',\${noteId})" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-300 hover:text-brand-500 hover:bg-brand-50 transition" title="Alterar permissão">
              <i class="fas fa-\${s.permission === 'edit' ? 'eye' : 'pen'} text-[10px]"></i>
            </button>
            <button onclick="revokeShare(\${s.id},\${noteId})" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition" title="Revogar">
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
      <p class="text-xs text-dark-400 mb-4">Crie links para compartilhar com outras pessoas</p>
      <div class="mb-4">
        <label class="text-xs font-semibold text-dark-600 mb-2 block">Criar novo link</label>
        <div class="flex gap-2">
          <select id="newSharePerm" class="flex-1 px-3 py-2.5 border border-dark-200 rounded-xl text-sm bg-dark-50 outline-none focus:ring-2 focus:ring-brand-400">
            <option value="view">👁 Apenas visualização</option>
            <option value="edit">✏️ Pode editar (requer login)</option>
          </select>
          <button onclick="createShare(\${noteId})" class="gradient-brand text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-sm whitespace-nowrap">
            <i class="fas fa-plus text-xs"></i> Criar
          </button>
        </div>
      </div>
      <div class="space-y-2 max-h-56 overflow-y-auto sb" id="sharesList">
        \${sharesHtml}
      </div>
      <div class="mt-4 flex justify-end">
        <button onclick="hideModal()" class="px-4 py-2.5 text-sm text-dark-500 hover:text-dark-700 font-medium rounded-xl hover:bg-dark-50 transition">Fechar</button>
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
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (state.activeTabId) saveNote(state.activeTabId); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') { e.preventDefault(); if (state.activeTabId) closeTab(state.activeTabId); }
    if (e.key === 'Escape') { hideModal(); hideCtx(); }
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
  </script>
</body>
</html>`;
}
