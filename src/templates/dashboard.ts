// Dashboard template - Main app interface

export function dashboardPage(username: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - TextVault</title>
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
    .scrollbar-thin::-webkit-scrollbar{width:5px}
    .scrollbar-thin::-webkit-scrollbar-track{background:transparent}
    .scrollbar-thin::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
    .scrollbar-thin::-webkit-scrollbar-thumb:hover{background:#9ca3af}
    #editor{font-family:'JetBrains Mono',monospace;font-size:14px;line-height:1.7;resize:none;outline:none}
    #editor:focus{box-shadow:none}
    .tab-btn.active{background:#F5A623;color:white;border-color:#F5A623}
    .tab-btn{transition:all .15s ease}
    .folder-item:hover .folder-actions{opacity:1}
    .folder-actions{opacity:0;transition:opacity .15s}
    .note-item.active{background:#fffbeb;border-left:3px solid #F5A623}
    .note-item{border-left:3px solid transparent;transition:all .15s}
    .save-indicator{transition:all .3s ease}
    .ctx-menu{z-index:9999}
    .modal-overlay{background:rgba(0,0,0,0.4);backdrop-filter:blur(4px)}
    .tree-children{overflow:hidden;transition:max-height .2s ease}
    .folder-toggle{transition:transform .2s}
    .folder-toggle.open{transform:rotate(90deg)}
  </style>
</head>
<body class="bg-dark-50 h-screen flex flex-col overflow-hidden">
  <!-- Top Bar -->
  <header class="bg-white border-b border-dark-200 px-4 py-2 flex items-center justify-between shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center">
        <i class="fas fa-vault text-white text-xs"></i>
      </div>
      <span class="text-lg font-bold text-dark-800">Text<span class="text-brand-400">Vault</span></span>
    </div>
    <div class="flex items-center gap-4">
      <span id="saveStatus" class="text-xs text-dark-400 save-indicator">
        <i class="fas fa-check-circle text-green-500"></i> Salvo
      </span>
      <div class="flex items-center gap-2 text-sm text-dark-600">
        <i class="fas fa-user-circle text-brand-400"></i>
        <span class="font-medium">${username}</span>
      </div>
      <a href="/logout" class="text-dark-400 hover:text-red-500 transition text-sm" title="Sair">
        <i class="fas fa-sign-out-alt"></i>
      </a>
    </div>
  </header>

  <!-- Main Content -->
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    <aside id="sidebar" class="w-64 bg-white border-r border-dark-200 flex flex-col shrink-0">
      <!-- Sidebar Header -->
      <div class="p-3 border-b border-dark-100 flex items-center justify-between">
        <span class="text-xs font-bold text-dark-500 uppercase tracking-wider">Pastas</span>
        <button onclick="createFolder(null)" class="text-brand-400 hover:text-brand-500 transition" title="Nova pasta">
          <i class="fas fa-folder-plus text-sm"></i>
        </button>
      </div>

      <!-- All Notes -->
      <div class="p-2 border-b border-dark-100">
        <button onclick="loadAllNotes()" id="allNotesBtn"
          class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-dark-600 hover:bg-brand-50 hover:text-brand-600 transition flex items-center gap-2">
          <i class="fas fa-file-lines text-brand-400"></i> Todas as notas
        </button>
      </div>

      <!-- Folder Tree -->
      <div id="folderTree" class="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
      </div>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-dark-100">
        <button onclick="createNote()" class="w-full bg-brand-400 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-brand-500 transition flex items-center justify-center gap-2">
          <i class="fas fa-plus"></i> Nova Nota
        </button>
      </div>
    </aside>

    <!-- Notes List + Editor -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Notes List Panel -->
      <div id="notesPanel" class="w-56 bg-dark-50 border-r border-dark-200 flex flex-col shrink-0">
        <div class="p-3 border-b border-dark-200 flex items-center justify-between">
          <span id="notesPanelTitle" class="text-xs font-bold text-dark-500 uppercase tracking-wider">Notas</span>
          <span id="notesCount" class="text-xs text-dark-400 bg-dark-200 px-2 py-0.5 rounded-full">0</span>
        </div>
        <div id="notesList" class="flex-1 overflow-y-auto scrollbar-thin">
        </div>
      </div>

      <!-- Editor Area -->
      <div class="flex-1 flex flex-col overflow-hidden bg-white">
        <!-- Tabs Bar -->
        <div class="border-b border-dark-200 bg-dark-50 flex items-center shrink-0 overflow-x-auto scrollbar-thin" id="tabsBar">
          <div id="tabsContainer" class="flex items-center min-w-0">
          </div>
        </div>

        <!-- Editor -->
        <div id="editorArea" class="flex-1 flex flex-col overflow-hidden">
          <div id="editorPlaceholder" class="flex-1 flex items-center justify-center text-dark-300">
            <div class="text-center">
              <i class="fas fa-file-pen text-5xl mb-4"></i>
              <p class="text-lg font-medium">Selecione ou crie uma nota</p>
              <p class="text-sm mt-1">Suas anotações aparecem aqui</p>
            </div>
          </div>
          <div id="editorWrapper" class="flex-1 flex flex-col overflow-hidden hidden">
            <!-- Note title -->
            <div class="px-6 pt-4 pb-2 shrink-0">
              <input id="noteTitle" type="text" placeholder="Título da nota..."
                class="w-full text-xl font-bold text-dark-800 placeholder-dark-300 outline-none border-none bg-transparent"
                oninput="onTitleChange()">
            </div>
            <!-- Text editor -->
            <div class="flex-1 overflow-y-auto px-6 pb-6">
              <textarea id="editor" class="w-full h-full bg-transparent text-dark-700 placeholder-dark-300"
                placeholder="Comece a escrever..."
                oninput="onContentChange()"></textarea>
            </div>
            <!-- Bottom bar -->
            <div class="px-6 py-2 border-t border-dark-100 flex items-center justify-between text-xs text-dark-400 shrink-0 bg-dark-50">
              <div class="flex items-center gap-4">
                <span id="charCount"><i class="fas fa-font"></i> 0 caracteres</span>
                <span id="wordCount"><i class="fas fa-paragraph"></i> 0 palavras</span>
                <span id="lineCount"><i class="fas fa-list"></i> 0 linhas</span>
              </div>
              <span id="lastSaved" class="text-dark-300"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Context Menu -->
  <div id="ctxMenu" class="ctx-menu hidden fixed bg-white rounded-xl shadow-2xl border border-dark-200 py-2 min-w-48 text-sm">
  </div>

  <!-- Modal -->
  <div id="modal" class="hidden fixed inset-0 modal-overlay z-50 flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" id="modalContent">
    </div>
  </div>

  <script>
  // ============================================================
  // STATE
  // ============================================================
  let state = {
    folders: [],
    notes: [],
    openTabs: [],        // [{noteId, title}]
    activeTabId: null,
    activeFolderId: null, // null = all notes
    noteContents: {},     // noteId -> {title, content, dirty, timer}
    sidebarCollapsed: false
  };

  const API = '/api';

  // ============================================================
  // API HELPERS
  // ============================================================
  async function api(path, opts = {}) {
    const res = await fetch(API + path, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(err.error || 'Erro na requisição');
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
  // FOLDERS
  // ============================================================
  async function loadFolders() {
    const data = await api('/folders');
    state.folders = data.folders;
    renderFolderTree();
  }

  function renderFolderTree() {
    const tree = document.getElementById('folderTree');
    tree.innerHTML = buildFolderTreeHTML(state.folders, null, 0);
  }

  function buildFolderTreeHTML(folders, parentId, depth) {
    const children = folders.filter(f => f.parent_id === parentId);
    if (!children.length) return '';
    
    return children.map(f => {
      const hasChildren = folders.some(c => c.parent_id === f.id);
      const sub = buildFolderTreeHTML(folders, f.id, depth + 1);
      const isActive = state.activeFolderId === f.id;
      const pad = depth * 12;
      
      return \`
        <div class="folder-group">
          <div class="folder-item flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer group text-sm
            \${isActive ? 'bg-brand-50 text-brand-700' : 'text-dark-600 hover:bg-dark-100'}"
            style="padding-left:\${8 + pad}px"
            onclick="selectFolder(\${f.id})"
            oncontextmenu="showFolderMenu(event, \${f.id})">
            \${hasChildren ? \`<i class="fas fa-caret-right folder-toggle text-dark-400 text-xs cursor-pointer \${isActive?'open':''}"
              onclick="event.stopPropagation();toggleFolderChildren(\${f.id},this)"></i>\` : '<span class="w-3"></span>'}
            <i class="fas fa-folder \${isActive ? 'text-brand-400' : 'text-dark-300'} text-xs"></i>
            <span class="truncate flex-1 font-medium text-xs">\${escHtml(f.name)}</span>
            <div class="folder-actions flex items-center gap-1">
              <button onclick="event.stopPropagation();createFolder(\${f.id})" class="text-dark-300 hover:text-brand-400" title="Subpasta">
                <i class="fas fa-folder-plus text-xs"></i>
              </button>
              <button onclick="event.stopPropagation();showFolderMenu(event,\${f.id})" class="text-dark-300 hover:text-dark-500">
                <i class="fas fa-ellipsis-v text-xs"></i>
              </button>
            </div>
          </div>
          \${sub ? \`<div class="tree-children" id="fc-\${f.id}" style="max-height:\${isActive||true?'1000px':'1000px'}">\${sub}</div>\` : ''}
        </div>
      \`;
    }).join('');
  }

  async function createFolder(parentId) {
    showModal('Nova Pasta', \`
      <input id="modalInput" type="text" placeholder="Nome da pasta" autofocus
        class="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none text-sm">
    \`, async () => {
      const name = document.getElementById('modalInput').value.trim();
      if (!name) return;
      await api('/folders', { method:'POST', body: JSON.stringify({ name, parent_id: parentId }) });
      await loadFolders();
    });
    setTimeout(() => document.getElementById('modalInput')?.focus(), 100);
  }

  async function renameFolder(id) {
    const f = state.folders.find(x => x.id === id);
    showModal('Renomear Pasta', \`
      <input id="modalInput" type="text" value="\${escHtml(f?.name||'')}" autofocus
        class="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none text-sm">
    \`, async () => {
      const name = document.getElementById('modalInput').value.trim();
      if (!name) return;
      await api('/folders/' + id, { method:'PUT', body: JSON.stringify({ name }) });
      await loadFolders();
    });
    setTimeout(() => document.getElementById('modalInput')?.focus(), 100);
  }

  async function deleteFolder(id) {
    const f = state.folders.find(x => x.id === id);
    showModal('Excluir Pasta', \`
      <p class="text-dark-600 text-sm">Tem certeza que deseja excluir <strong>"\${escHtml(f?.name||'')}"</strong> e todo o conteúdo?</p>
    \`, async () => {
      await api('/folders/' + id, { method:'DELETE' });
      if (state.activeFolderId === id) state.activeFolderId = null;
      await Promise.all([loadFolders(), loadNotesByFolder(state.activeFolderId)]);
    }, true);
  }

  function selectFolder(id) {
    state.activeFolderId = id;
    renderFolderTree();
    loadNotesByFolder(id);
    document.getElementById('allNotesBtn').classList.remove('bg-brand-50','text-brand-600');
  }

  function toggleFolderChildren(id, el) {
    const container = document.getElementById('fc-' + id);
    if (!container) return;
    const isOpen = el.classList.contains('open');
    el.classList.toggle('open');
    container.style.maxHeight = isOpen ? '0px' : '1000px';
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

  async function loadNotesByFolder(folderId) {
    const url = folderId ? '/notes?folder_id=' + folderId : '/notes';
    const data = await api(url);
    state.notes = data.notes;
    renderNotesList();
    const f = state.folders.find(x => x.id === folderId);
    document.getElementById('notesPanelTitle').textContent = f ? f.name : 'Todas as notas';
  }

  function renderNotesList() {
    const list = document.getElementById('notesList');
    document.getElementById('notesCount').textContent = state.notes.length;
    
    if (!state.notes.length) {
      list.innerHTML = '<div class="p-4 text-center text-dark-300 text-xs"><i class="fas fa-sticky-note text-2xl mb-2"></i><p>Nenhuma nota aqui</p></div>';
      return;
    }

    list.innerHTML = state.notes.map(n => \`
      <div class="note-item px-3 py-2.5 cursor-pointer hover:bg-dark-100 \${state.activeTabId===n.id?'active':''}"
        onclick="openNote(\${n.id})"
        oncontextmenu="showNoteMenu(event,\${n.id})">
        <div class="font-medium text-xs text-dark-700 truncate">\${escHtml(n.title || 'Sem título')}</div>
        <div class="text-xs text-dark-400 mt-0.5 truncate">\${escHtml((n.content||'').substring(0,60)) || 'Nota vazia...'}</div>
        <div class="text-xs text-dark-300 mt-1">\${timeAgo(n.updated_at)}</div>
      </div>
    \`).join('');
  }

  async function createNote() {
    const body = { title: 'Nova nota', content: '' };
    if (state.activeFolderId) body.folder_id = state.activeFolderId;
    const data = await api('/notes', { method:'POST', body: JSON.stringify(body) });
    await loadNotesByFolder(state.activeFolderId);
    openNote(data.note.id);
  }

  async function openNote(id) {
    // Check if already in tabs
    let tab = state.openTabs.find(t => t.noteId === id);
    if (!tab) {
      // Load note data
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
  }

  async function deleteNote(id) {
    showModal('Excluir Nota', \`
      <p class="text-dark-600 text-sm">Tem certeza que deseja excluir esta nota?</p>
    \`, async () => {
      await api('/notes/' + id, { method:'DELETE' });
      closeTab(id);
      await loadNotesByFolder(state.activeFolderId);
    }, true);
  }

  async function moveNote(noteId) {
    const folderOpts = state.folders.map(f =>
      \`<option value="\${f.id}">\${'—'.repeat(getDepth(f.id))} \${escHtml(f.name)}</option>\`
    ).join('');
    
    showModal('Mover Nota', \`
      <select id="modalSelect" class="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none text-sm">
        <option value="">Sem pasta (raiz)</option>
        \${folderOpts}
      </select>
    \`, async () => {
      const folderId = document.getElementById('modalSelect').value || null;
      await api('/notes/' + noteId, { method:'PUT', body: JSON.stringify({ folder_id: folderId ? parseInt(folderId) : null }) });
      await loadNotesByFolder(state.activeFolderId);
    });
  }

  function getDepth(folderId) {
    let depth = 0;
    let current = state.folders.find(f => f.id === folderId);
    while (current?.parent_id) {
      depth++;
      current = state.folders.find(f => f.id === current.parent_id);
    }
    return depth;
  }

  // ============================================================
  // TABS
  // ============================================================
  function renderTabs() {
    const container = document.getElementById('tabsContainer');
    container.innerHTML = state.openTabs.map(t => {
      const isActive = state.activeTabId === t.noteId;
      const nc = state.noteContents[t.noteId];
      const dirty = nc?.dirty ? ' *' : '';
      return \`
        <div class="tab-btn flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer border-r border-dark-200 whitespace-nowrap
          \${isActive ? 'active bg-brand-400 text-white' : 'bg-white text-dark-500 hover:bg-dark-50'}"
          onclick="switchTab(\${t.noteId})">
          <span class="max-w-24 truncate">\${escHtml(nc?.title || t.title || 'Sem título')}\${dirty}</span>
          <button onclick="event.stopPropagation();closeTab(\${t.noteId})" class="ml-1 hover:text-red-400 transition">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      \`;
    }).join('');
  }

  function switchTab(noteId) {
    state.activeTabId = noteId;
    renderTabs();
    renderEditor();
    renderNotesList();
  }

  function closeTab(noteId) {
    // Save before closing if dirty
    const nc = state.noteContents[noteId];
    if (nc?.dirty) {
      clearTimeout(nc.timer);
      saveNote(noteId);
    }
    
    state.openTabs = state.openTabs.filter(t => t.noteId !== noteId);
    delete state.noteContents[noteId];
    
    if (state.activeTabId === noteId) {
      state.activeTabId = state.openTabs.length ? state.openTabs[state.openTabs.length - 1].noteId : null;
    }
    renderTabs();
    renderEditor();
    renderNotesList();
  }

  // ============================================================
  // EDITOR
  // ============================================================
  function renderEditor() {
    const placeholder = document.getElementById('editorPlaceholder');
    const wrapper = document.getElementById('editorWrapper');
    
    if (!state.activeTabId || !state.noteContents[state.activeTabId]) {
      placeholder.classList.remove('hidden');
      wrapper.classList.add('hidden');
      return;
    }
    
    placeholder.classList.add('hidden');
    wrapper.classList.remove('hidden');
    
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
    // Update tab title
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

  function updateCounts(text) {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
    const lines = text ? text.split('\\n').length : 0;
    document.getElementById('charCount').innerHTML = \`<i class="fas fa-font"></i> \${chars} caracteres\`;
    document.getElementById('wordCount').innerHTML = \`<i class="fas fa-paragraph"></i> \${words} palavras\`;
    document.getElementById('lineCount').innerHTML = \`<i class="fas fa-list"></i> \${lines} linhas\`;
  }

  // ============================================================
  // AUTO-SAVE
  // ============================================================
  function scheduleAutoSave(noteId) {
    const nc = state.noteContents[noteId];
    if (!nc) return;
    if (nc.timer) clearTimeout(nc.timer);
    nc.timer = setTimeout(() => saveNote(noteId), 1000); // Save after 1s of no typing
  }

  async function saveNote(noteId) {
    const nc = state.noteContents[noteId];
    if (!nc || !nc.dirty) return;
    
    try {
      updateSaveStatus('saving');
      await api('/notes/' + noteId, {
        method: 'PUT',
        body: JSON.stringify({ title: nc.title, content: nc.content })
      });
      nc.dirty = false;
      renderTabs();
      updateSaveStatus('saved');
      document.getElementById('lastSaved').textContent = 'Salvo às ' + new Date().toLocaleTimeString('pt-BR');
      
      // Update note in list
      const noteInList = state.notes.find(n => n.id === noteId);
      if (noteInList) {
        noteInList.title = nc.title;
        noteInList.content = nc.content;
        noteInList.updated_at = new Date().toISOString();
        renderNotesList();
      }
    } catch (e) {
      updateSaveStatus('error');
      console.error('Save error:', e);
    }
  }

  function updateSaveStatus(status) {
    const el = document.getElementById('saveStatus');
    if (status === 'saving') {
      el.innerHTML = '<i class="fas fa-spinner fa-spin text-brand-400"></i> Salvando...';
      el.className = 'text-xs text-brand-500 save-indicator';
    } else if (status === 'saved') {
      el.innerHTML = '<i class="fas fa-check-circle text-green-500"></i> Salvo';
      el.className = 'text-xs text-green-600 save-indicator';
    } else if (status === 'error') {
      el.innerHTML = '<i class="fas fa-exclamation-circle text-red-500"></i> Erro ao salvar';
      el.className = 'text-xs text-red-500 save-indicator';
    }
  }

  // ============================================================
  // CONTEXT MENUS
  // ============================================================
  function showFolderMenu(e, folderId) {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, [
      { icon:'fa-folder-plus', label:'Nova subpasta', action:()=>createFolder(folderId) },
      { icon:'fa-pen', label:'Renomear', action:()=>renameFolder(folderId) },
      { icon:'fa-file-circle-plus', label:'Nova nota aqui', action:async()=>{ state.activeFolderId=folderId; await createNote(); }},
      { divider: true },
      { icon:'fa-trash', label:'Excluir pasta', action:()=>deleteFolder(folderId), danger:true },
    ]);
  }

  function showNoteMenu(e, noteId) {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, [
      { icon:'fa-up-right-from-square', label:'Abrir', action:()=>openNote(noteId) },
      { icon:'fa-folder-arrow-up', label:'Mover para pasta', action:()=>moveNote(noteId) },
      { divider: true },
      { icon:'fa-trash', label:'Excluir', action:()=>deleteNote(noteId), danger:true },
    ]);
  }

  function showContextMenu(x, y, items) {
    const menu = document.getElementById('ctxMenu');
    menu.innerHTML = items.map(item => {
      if (item.divider) return '<div class="border-t border-dark-100 my-1"></div>';
      return \`<button onclick="hideContextMenu();\${item.action ? '' : ''}" data-action="true"
        class="w-full text-left px-4 py-2 hover:bg-dark-50 flex items-center gap-2.5 transition
        \${item.danger ? 'text-red-500 hover:bg-red-50' : 'text-dark-600'}">
        <i class="fas \${item.icon} w-4 text-center text-xs"></i>
        <span class="text-sm">\${item.label}</span>
      </button>\`;
    }).join('');

    // Bind actions
    const btns = menu.querySelectorAll('[data-action]');
    const actionItems = items.filter(i => !i.divider);
    btns.forEach((btn, i) => {
      btn.onclick = () => { hideContextMenu(); actionItems[i].action(); };
    });

    // Position
    menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 200) + 'px';
    menu.classList.remove('hidden');
  }

  function hideContextMenu() {
    document.getElementById('ctxMenu').classList.add('hidden');
  }

  document.addEventListener('click', hideContextMenu);

  // ============================================================
  // MODAL
  // ============================================================
  function showModal(title, bodyHtml, onConfirm, isDanger) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    content.innerHTML = \`
      <h3 class="text-lg font-bold text-dark-800 mb-4">\${title}</h3>
      <div class="mb-6">\${bodyHtml}</div>
      <div class="flex justify-end gap-3">
        <button onclick="hideModal()" class="px-4 py-2 text-sm text-dark-500 hover:text-dark-700 font-medium">Cancelar</button>
        <button id="modalConfirm" class="px-5 py-2 text-sm font-bold text-white rounded-xl transition
          \${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-400 hover:bg-brand-500'}">Confirmar</button>
      </div>
    \`;
    document.getElementById('modalConfirm').onclick = async () => {
      await onConfirm();
      hideModal();
    };
    modal.classList.remove('hidden');
  }

  function hideModal() {
    document.getElementById('modal').classList.add('hidden');
  }

  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal();
  });

  // ============================================================
  // UTILS
  // ============================================================
  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'agora';
    if (diff < 3600) return Math.floor(diff/60) + 'min atrás';
    if (diff < 86400) return Math.floor(diff/3600) + 'h atrás';
    return d.toLocaleDateString('pt-BR');
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (state.activeTabId) saveNote(state.activeTabId);
    }
    if (e.ctrlKey && e.key === 'w') {
      e.preventDefault();
      if (state.activeTabId) closeTab(state.activeTabId);
    }
  });

  // Save all dirty notes before leaving
  window.addEventListener('beforeunload', (e) => {
    const hasDirty = Object.values(state.noteContents).some(nc => nc.dirty);
    if (hasDirty) {
      Object.keys(state.noteContents).forEach(id => {
        if (state.noteContents[id].dirty) saveNote(parseInt(id));
      });
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // INIT
  init();
  </script>
</body>
</html>`;
}
