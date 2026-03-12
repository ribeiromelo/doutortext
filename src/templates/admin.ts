// Admin Panel template

export function adminPage(username: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - DoutorText</title>
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
    .gradient-brand{background:linear-gradient(135deg,#F5A623 0%,#E8971A 50%,#d97706 100%)}
    .gradient-dark{background:linear-gradient(135deg,#1f2937 0%,#111827 100%)}
    .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(80px);opacity:0;transition:all .3s ease;z-index:9999;pointer-events:none}
    .toast.show{transform:translateX(-50%) translateY(0);opacity:1}
    .modal-bg{background:rgba(0,0,0,.45);backdrop-filter:blur(6px)}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .fade-in{animation:fadeIn .3s ease both}
    .stat-card{transition:all .2s ease}
    .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,.08)}
    tr:hover td{background:#f9fafb}
    .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
  </style>
</head>
<body class="bg-dark-50 min-h-screen">
  <!-- Toast -->
  <div id="toast" class="toast bg-dark-800 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2">
    <i id="toastIcon" class="fas fa-check-circle text-green-400"></i>
    <span id="toastMsg">OK</span>
  </div>

  <!-- Modal -->
  <div id="modal" class="hidden fixed inset-0 modal-bg z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md fade-in" id="modalContent"></div>
  </div>

  <!-- Header -->
  <header class="gradient-dark text-white px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
    <div class="flex items-center gap-3">
      <a href="/app" class="flex items-center gap-2 hover:opacity-80 transition">
        <div class="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center shadow-sm">
          <i class="fas fa-file-medical text-white text-xs"></i>
        </div>
        <span class="text-lg font-bold hidden sm:inline">Doutor<span class="text-brand-400">Text</span></span>
      </a>
      <div class="h-5 w-px bg-dark-600 hidden sm:block"></div>
      <div class="flex items-center gap-2">
        <span class="badge bg-red-500/20 text-red-300 border border-red-500/30"><i class="fas fa-shield-halved text-[8px]"></i> Admin</span>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <a href="/app" class="text-sm text-dark-300 hover:text-white transition flex items-center gap-1.5">
        <i class="fas fa-arrow-left text-xs"></i> <span class="hidden sm:inline">Dashboard</span>
      </a>
      <div class="flex items-center gap-1.5 text-sm">
        <div class="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
          ${username.charAt(0).toUpperCase()}
        </div>
        <span class="font-medium hidden sm:inline">${username}</span>
      </div>
    </div>
  </header>

  <!-- Main -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
    <!-- Navigation tabs -->
    <div class="flex items-center gap-1 mb-6 bg-white rounded-xl border border-dark-200 p-1 overflow-x-auto sb">
      <button onclick="switchTab('overview')" id="tab-overview" class="admin-tab px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 bg-dark-800 text-white">
        <i class="fas fa-chart-pie text-xs"></i> Vis\u00e3o Geral
      </button>
      <button onclick="switchTab('users')" id="tab-users" class="admin-tab px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 text-dark-500 hover:bg-dark-50">
        <i class="fas fa-users text-xs"></i> Usu\u00e1rios
      </button>
      <button onclick="switchTab('activity')" id="tab-activity" class="admin-tab px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 text-dark-500 hover:bg-dark-50">
        <i class="fas fa-clock-rotate-left text-xs"></i> Atividade
      </button>
    </div>

    <!-- Tab Content -->
    <div id="content-overview" class="tab-content"></div>
    <div id="content-users" class="tab-content hidden"></div>
    <div id="content-activity" class="tab-content hidden"></div>
  </main>

  <script>
  let adminData = { stats: {}, users: [], activity: [] };
  let currentTab = 'overview';

  // ============ TOAST ============
  let toastTimer;
  function showToast(msg, icon='fa-check-circle', color='text-green-400') {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    document.getElementById('toastIcon').className = 'fas ' + icon + ' ' + color;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ============ MODAL ============
  function showModal(title, body, onOk, isDanger) {
    const m = document.getElementById('modal');
    document.getElementById('modalContent').innerHTML =
      '<h3 class="text-lg font-bold text-dark-800 mb-4">' + title + '</h3>' +
      '<div class="mb-6">' + body + '</div>' +
      '<div class="flex justify-end gap-2">' +
        '<button onclick="hideModal()" class="px-4 py-2.5 text-sm text-dark-500 hover:text-dark-700 font-medium rounded-xl hover:bg-dark-50 transition">Cancelar</button>' +
        '<button id="mc" class="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition shadow-sm ' +
          (isDanger ? 'bg-red-500 hover:bg-red-600' : 'gradient-brand hover:opacity-90') + '">Confirmar</button>' +
      '</div>';
    document.getElementById('mc').onclick = async () => { await onOk(); hideModal(); };
    m.classList.remove('hidden');
  }
  function hideModal() { document.getElementById('modal').classList.add('hidden'); }
  document.getElementById('modal').addEventListener('click', e => { if (e.target === e.currentTarget) hideModal(); });

  // ============ API ============
  async function api(path, opts = {}) {
    const res = await fetch('/api/admin' + path, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro' }));
      throw new Error(err.error || 'Erro');
    }
    return res.json();
  }

  // ============ TABS ============
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(b => {
      b.classList.remove('bg-dark-800','text-white');
      b.classList.add('text-dark-500','hover:bg-dark-50');
    });
    const active = document.getElementById('tab-' + tab);
    if (active) {
      active.classList.add('bg-dark-800','text-white');
      active.classList.remove('text-dark-500','hover:bg-dark-50');
    }
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById('content-' + tab).classList.remove('hidden');

    if (tab === 'overview') loadOverview();
    if (tab === 'users') loadUsers();
    if (tab === 'activity') loadActivity();
  }

  // ============ OVERVIEW ============
  async function loadOverview() {
    const data = await api('/stats');
    adminData.stats = data;
    renderOverview(data);
  }

  function renderOverview(s) {
    const el = document.getElementById('content-overview');
    el.innerHTML = \`
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      \${statCard('fa-users', 'Usu\u00e1rios', s.total_users, 'blue')}
      \${statCard('fa-sticky-note', 'Notas', s.total_notes, 'amber')}
      \${statCard('fa-folder', 'Pastas', s.total_folders, 'purple')}
      \${statCard('fa-share-nodes', 'Compart.', s.total_shares, 'green')}
      \${statCard('fa-pen-nib', 'Edi\u00e7\u00f5es', s.total_edits, 'pink')}
      \${statCard('fa-key', 'Sess\u00f5es', s.active_sessions, 'cyan')}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <!-- Recent registrations -->
      <div class="bg-white rounded-xl border border-dark-200 overflow-hidden">
        <div class="px-4 py-3 border-b border-dark-100 flex items-center justify-between">
          <span class="text-sm font-bold text-dark-700"><i class="fas fa-user-plus text-brand-400 mr-2"></i>Registros recentes</span>
        </div>
        <div class="divide-y divide-dark-100 max-h-72 overflow-y-auto sb">
          \${(s.recent_users || []).map(u => \`
            <div class="px-4 py-2.5 flex items-center gap-3 text-sm">
              <div class="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center text-dark-500 text-xs font-bold shrink-0">
                \${u.username.charAt(0).toUpperCase()}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-dark-700 truncate">\${esc(u.username)}</div>
                <div class="text-[11px] text-dark-400 truncate">\${esc(u.email)}</div>
              </div>
              <span class="text-[10px] text-dark-300 shrink-0">\${u.created_at}</span>
            </div>
          \`).join('') || '<div class="p-4 text-sm text-dark-400 text-center">Nenhum registro</div>'}
        </div>
      </div>

      <!-- Top users by notes -->
      <div class="bg-white rounded-xl border border-dark-200 overflow-hidden">
        <div class="px-4 py-3 border-b border-dark-100">
          <span class="text-sm font-bold text-dark-700"><i class="fas fa-trophy text-brand-400 mr-2"></i>Top usu\u00e1rios (por notas)</span>
        </div>
        <div class="divide-y divide-dark-100 max-h-72 overflow-y-auto sb">
          \${(s.top_users || []).map((u, i) => \`
            <div class="px-4 py-2.5 flex items-center gap-3 text-sm">
              <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                \${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-dark-50 text-dark-400'}">
                \${i + 1}
              </span>
              <div class="flex-1 min-w-0">
                <span class="font-medium text-dark-700">\${esc(u.username)}</span>
                \${u.is_admin ? '<span class="badge bg-red-100 text-red-600 ml-1">Admin</span>' : ''}
              </div>
              <div class="text-right shrink-0">
                <span class="text-xs font-bold text-dark-700">\${u.note_count}</span>
                <span class="text-[10px] text-dark-400"> notas</span>
              </div>
            </div>
          \`).join('') || '<div class="p-4 text-sm text-dark-400 text-center">Sem dados</div>'}
        </div>
      </div>
    </div>

    <!-- DB size info -->
    <div class="bg-white rounded-xl border border-dark-200 p-4">
      <h3 class="text-sm font-bold text-dark-700 mb-3"><i class="fas fa-database text-brand-400 mr-2"></i>Informa\u00e7\u00f5es do sistema</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div class="bg-dark-50 rounded-lg p-3">
          <div class="text-[10px] text-dark-400 uppercase font-bold">Plataforma</div>
          <div class="font-semibold text-dark-700 mt-0.5">Cloudflare D1</div>
        </div>
        <div class="bg-dark-50 rounded-lg p-3">
          <div class="text-[10px] text-dark-400 uppercase font-bold">Total caracteres</div>
          <div class="font-semibold text-dark-700 mt-0.5">\${formatNum(s.total_content_length || 0)}</div>
        </div>
        <div class="bg-dark-50 rounded-lg p-3">
          <div class="text-[10px] text-dark-400 uppercase font-bold">Admins</div>
          <div class="font-semibold text-dark-700 mt-0.5">\${s.admin_count || 0}</div>
        </div>
        <div class="bg-dark-50 rounded-lg p-3">
          <div class="text-[10px] text-dark-400 uppercase font-bold">Shares ativos</div>
          <div class="font-semibold text-dark-700 mt-0.5">\${s.active_shares || 0}</div>
        </div>
      </div>
    </div>
    \`;
  }

  function statCard(icon, label, value, color) {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100',
      green: 'bg-green-50 text-green-600 border-green-100',
      pink: 'bg-pink-50 text-pink-600 border-pink-100',
      cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    };
    const c = colors[color] || colors.blue;
    return \`<div class="stat-card bg-white rounded-xl border border-dark-200 p-4 text-center">
      <div class="w-10 h-10 rounded-xl \${c} flex items-center justify-center mx-auto mb-2">
        <i class="fas \${icon} text-sm"></i>
      </div>
      <div class="text-xl font-bold text-dark-800">\${formatNum(value || 0)}</div>
      <div class="text-[11px] text-dark-400 font-medium mt-0.5">\${label}</div>
    </div>\`;
  }

  // ============ USERS ============
  async function loadUsers() {
    const data = await api('/users');
    adminData.users = data.users;
    renderUsers(data.users);
  }

  function renderUsers(users) {
    const el = document.getElementById('content-users');
    el.innerHTML = \`
    <div class="bg-white rounded-xl border border-dark-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-dark-100 flex items-center justify-between flex-wrap gap-2">
        <span class="text-sm font-bold text-dark-700"><i class="fas fa-users text-brand-400 mr-2"></i>Usu\u00e1rios cadastrados (\${users.length})</span>
        <div class="relative">
          <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-300 text-xs"></i>
          <input id="userSearch" type="text" placeholder="Buscar usu\u00e1rio..." oninput="filterUsers()"
            class="pl-8 pr-3 py-2 text-xs border border-dark-200 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none bg-dark-50 w-48">
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-dark-200 bg-dark-50/50">
              <th class="text-left px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase">ID</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase">Usu\u00e1rio</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase hidden sm:table-cell">Email</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase">Notas</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase hidden md:table-cell">Pastas</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase hidden md:table-cell">Shares</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase">Role</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase hidden lg:table-cell">Registrado</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase">A\u00e7\u00f5es</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            \${users.map(u => userRow(u)).join('')}
          </tbody>
        </table>
      </div>
    </div>\`;
  }

  function userRow(u) {
    const isAdmin = u.is_admin === 1;
    return \`<tr class="border-b border-dark-100 user-row" data-search="\${esc(u.username + ' ' + u.email).toLowerCase()}">
      <td class="px-4 py-3 text-dark-400 font-mono text-xs">#\${u.id}</td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full \${isAdmin ? 'gradient-brand' : 'bg-dark-100'} flex items-center justify-center text-\${isAdmin ? 'white' : 'dark-500'} text-xs font-bold shrink-0">
            \${u.username.charAt(0).toUpperCase()}
          </div>
          <span class="font-medium text-dark-700">\${esc(u.username)}</span>
        </div>
      </td>
      <td class="px-4 py-3 text-dark-500 text-xs hidden sm:table-cell">\${esc(u.email)}</td>
      <td class="px-4 py-3 text-center"><span class="text-xs font-bold text-dark-700">\${u.note_count || 0}</span></td>
      <td class="px-4 py-3 text-center hidden md:table-cell"><span class="text-xs text-dark-500">\${u.folder_count || 0}</span></td>
      <td class="px-4 py-3 text-center hidden md:table-cell"><span class="text-xs text-dark-500">\${u.share_count || 0}</span></td>
      <td class="px-4 py-3 text-center">
        \${isAdmin
          ? '<span class="badge bg-red-100 text-red-600"><i class="fas fa-shield-halved text-[8px]"></i> Admin</span>'
          : '<span class="badge bg-dark-100 text-dark-500">User</span>'}
      </td>
      <td class="px-4 py-3 text-[11px] text-dark-400 hidden lg:table-cell">\${u.created_at}</td>
      <td class="px-4 py-3 text-center">
        <div class="flex items-center justify-center gap-1">
          \${isAdmin
            ? \`<button onclick="toggleAdmin(\${u.id}, false, '\${esc(u.username)}')" class="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition" title="Remover admin">
                <i class="fas fa-shield-xmark text-xs"></i>
              </button>\`
            : \`<button onclick="toggleAdmin(\${u.id}, true, '\${esc(u.username)}')" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-300 hover:text-brand-500 hover:bg-brand-50 transition" title="Tornar admin">
                <i class="fas fa-shield-halved text-xs"></i>
              </button>\`}
          <button onclick="deleteUser(\${u.id}, '\${esc(u.username)}')" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition" title="Excluir usu\u00e1rio">
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>
      </td>
    </tr>\`;
  }

  function filterUsers() {
    const q = document.getElementById('userSearch').value.toLowerCase().trim();
    document.querySelectorAll('.user-row').forEach(r => {
      r.style.display = !q || r.dataset.search.includes(q) ? '' : 'none';
    });
  }

  async function toggleAdmin(userId, makeAdmin, username) {
    const action = makeAdmin ? 'promover a Admin' : 'remover de Admin';
    showModal(
      (makeAdmin ? 'Promover' : 'Rebaixar') + ' usu\u00e1rio',
      '<div class="flex items-center gap-3 p-3 ' + (makeAdmin ? 'bg-brand-50' : 'bg-red-50') + ' rounded-xl">' +
        '<i class="fas fa-shield-halved text-lg ' + (makeAdmin ? 'text-brand-400' : 'text-red-400') + '"></i>' +
        '<p class="text-dark-600 text-sm">Deseja ' + action + ' <strong>"' + username + '"</strong>?</p>' +
      '</div>',
      async () => {
        try {
          await api('/users/' + userId + '/admin', {
            method: 'PUT',
            body: JSON.stringify({ is_admin: makeAdmin })
          });
          showToast(makeAdmin ? 'Usu\u00e1rio promovido a Admin!' : 'Admin removido!', makeAdmin ? 'fa-shield-halved' : 'fa-shield-xmark', makeAdmin ? 'text-brand-400' : 'text-red-400');
          await loadUsers();
        } catch (e) {
          showToast('Erro: ' + e.message, 'fa-exclamation-circle', 'text-red-400');
        }
      },
      !makeAdmin
    );
  }

  async function deleteUser(userId, username) {
    showModal(
      'Excluir usu\u00e1rio',
      '<div class="flex items-center gap-3 p-3 bg-red-50 rounded-xl">' +
        '<i class="fas fa-triangle-exclamation text-red-400 text-lg"></i>' +
        '<div class="text-sm text-dark-600"><p>Excluir <strong>"' + username + '"</strong> e TODO o conte\u00fado?</p><p class="text-xs text-dark-400 mt-1">Notas, pastas, compartilhamentos e hist\u00f3rico ser\u00e3o apagados permanentemente.</p></div>' +
      '</div>',
      async () => {
        try {
          await api('/users/' + userId, { method: 'DELETE' });
          showToast('Usu\u00e1rio exclu\u00eddo', 'fa-trash', 'text-red-400');
          await loadUsers();
        } catch (e) {
          showToast('Erro: ' + e.message, 'fa-exclamation-circle', 'text-red-400');
        }
      },
      true
    );
  }

  // ============ ACTIVITY ============
  async function loadActivity() {
    const data = await api('/activity');
    adminData.activity = data.activity;
    renderActivity(data.activity);
  }

  function renderActivity(items) {
    const el = document.getElementById('content-activity');
    if (!items.length) {
      el.innerHTML = '<div class="bg-white rounded-xl border border-dark-200 p-8 text-center text-sm text-dark-400"><i class="fas fa-clock-rotate-left text-2xl text-dark-300 mb-3"></i><p>Nenhuma atividade registrada</p></div>';
      return;
    }
    el.innerHTML = \`
    <div class="bg-white rounded-xl border border-dark-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-dark-100">
        <span class="text-sm font-bold text-dark-700"><i class="fas fa-clock-rotate-left text-brand-400 mr-2"></i>\u00daltimas edi\u00e7\u00f5es (todas as notas)</span>
      </div>
      <div class="divide-y divide-dark-100 max-h-[600px] overflow-y-auto sb">
        \${items.map(a => \`
          <div class="px-4 py-3 flex items-center gap-3 text-sm">
            <div class="w-8 h-8 rounded-full \${a.action === 'share' ? 'bg-blue-100 text-blue-600' : a.action === 'edit' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'} flex items-center justify-center text-xs shrink-0">
              <i class="fas \${a.action === 'share' ? 'fa-share-nodes' : a.action === 'edit' ? 'fa-pen' : 'fa-plus'}"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div>
                <span class="font-medium text-dark-700">\${esc(a.username)}</span>
                <span class="text-dark-400"> \${a.action === 'share' ? 'compartilhou' : a.action === 'edit' ? 'editou' : a.action}</span>
                <span class="text-dark-500 font-medium"> \${esc(a.note_title || 'nota #' + a.note_id)}</span>
              </div>
              \${a.summary ? '<div class="text-[11px] text-dark-300 truncate mt-0.5">' + esc(a.summary) + '</div>' : ''}
            </div>
            <span class="text-[10px] text-dark-300 shrink-0 whitespace-nowrap">\${a.created_at}</span>
          </div>
        \`).join('')}
      </div>
    </div>\`;
  }

  // ============ UTILS ============
  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  // ============ INIT ============
  loadOverview();
  </script>
</body>
</html>`;
}
