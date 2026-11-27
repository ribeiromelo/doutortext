import { brandLogo } from './brand'
import { escapeHtml, scriptJson } from '../lib/security'
// Admin Panel template

export function adminPage(username: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - DoutorText</title>
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
    .gradient-brand{background:linear-gradient(135deg,#078663 0%,#006c50 50%,#00523e 100%)}
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
  <link rel="stylesheet" href="/static/emerald.css">
  <link rel="stylesheet" href="/static/admin.css">
  <link rel="stylesheet" href="/static/brand.css">
  <link rel="stylesheet" href="/static/admin-slides.css">
</head>
<body class="admin-app bg-dark-50 min-h-screen">
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
        ${brandLogo('white')}
      </a>
      <div class="h-5 w-px bg-dark-600 hidden sm:block"></div>
      <div class="flex items-center gap-2">
        <span class="admin-role badge"><i class="fas fa-shield-halved text-[8px]"></i> Admin</span>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <a href="/app" class="text-sm text-dark-300 hover:text-white transition flex items-center gap-1.5">
        <i class="fas fa-arrow-left text-xs"></i> <span class="hidden sm:inline">Minhas notas</span>
      </a>
      <div class="flex items-center gap-1.5 text-sm">
        <div class="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
          ${escapeHtml(username.charAt(0).toUpperCase())}
        </div>
        <span class="font-medium hidden sm:inline">${escapeHtml(username)}</span>
      </div>
    </div>
  </header>

  <div class="admin-shell">
  <aside class="admin-sidebar">
    <div class="admin-nav-label">Administração</div>
    <nav class="admin-nav" aria-label="Administração">
      <button data-dt-click="switchTab('overview')" id="tab-overview" class="admin-tab px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 bg-dark-800 text-white">
        <i class="fas fa-chart-pie text-xs"></i> Vis\u00e3o Geral
      </button>
      <button data-dt-click="switchTab('users')" id="tab-users" class="admin-tab px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 text-dark-500 hover:bg-dark-50">
        <i class="fas fa-users text-xs"></i> Usu\u00e1rios
      </button>
      <button data-dt-click="switchTab('activity')" id="tab-activity" class="admin-tab px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 text-dark-500 hover:bg-dark-50">
        <i class="fas fa-clock-rotate-left text-xs"></i> Atividade
      </button>
      <div class="ds-nav-group">Dashboard</div>
      <button data-dt-click="switchTab('slides')" id="tab-slides" class="admin-tab"><i class="far fa-images" aria-hidden="true"></i><span class="ds-nav-full">Slides e comunicados</span><span class="ds-nav-short">Slides</span></button>
    </nav>
    <div class="admin-sidebar-bottom"><div class="admin-sidebar-icon"><i class="fas fa-layer-group" aria-hidden="true"></i></div><p>Seu espaço,<br>em perspectiva.</p><span>Acompanhe a comunidade e a organização do DoutorText.</span><a href="/app"><i class="fas fa-arrow-left" aria-hidden="true"></i> Voltar às notas</a></div>
  </aside>
  <main class="admin-main">
    <div class="admin-page-heading"><div><span class="admin-eyebrow">DOUTORTEXT / ADMINISTRAÇÃO</span><h1 id="adminPageTitle">Visão geral</h1><p id="adminPageDescription">Uma visão clara do seu espaço e de quem faz parte dele.</p></div><div class="admin-heading-actions"><span id="adminUpdated" role="status" aria-live="polite"></span><button data-dt-click="refreshAdmin()" class="admin-refresh"><i class="fas fa-arrows-rotate" aria-hidden="true"></i> Atualizar</button></div></div>
    <!-- Tab Content -->
    <div id="content-overview" class="tab-content"></div>
    <div id="content-users" class="tab-content hidden"></div>
    <div id="content-activity" class="tab-content hidden"></div>
    <div id="content-slides" class="tab-content hidden"></div>
  </main></div>

  <script src="/static/dashboard-app/dashboard.js"></script>
  <script data-dt-script>
  let adminData = { stats: {}, users: [], activity: [] };
  let currentTab = 'overview';
  let slidesManager=null;
  async function loadSlides(){slidesManager ||= DTDashboard.mountSlidesAdmin(document.getElementById('content-slides'));await slidesManager.refresh();}

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
        '<button data-dt-click="hideModal()" class="px-4 py-2.5 text-sm text-dark-500 hover:text-dark-700 font-medium rounded-xl hover:bg-dark-50 transition">Cancelar</button>' +
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
  async function switchTab(tab) {
    if (!['overview','users','activity','slides'].includes(tab)) return;
    currentTab = tab;
    const labels={slides:['Slides e comunicados','Dashboard / Conteúdo institucional e publicações agendadas.'],overview:['Visão geral','Uma visão clara do seu espaço e de quem faz parte dele.'],users:['Usuários','Pessoas, permissões e organização da comunidade.'],activity:['Atividade','Acompanhe as edições e os compartilhamentos recentes.']};
    document.getElementById('adminPageTitle').textContent=labels[tab][0];
    document.getElementById('adminPageDescription').textContent=labels[tab][1];
    document.querySelectorAll('.admin-tab').forEach(b=>{if(b.id==='tab-'+tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.toggle('hidden',c.id!=='content-'+tab));
    await refreshAdmin();
  }

  async function refreshAdmin() {
    const tab=currentTab,container=document.getElementById('content-'+tab);
    const loaders={overview:loadOverview,users:loadUsers,activity:loadActivity,slides:loadSlides};
    container.setAttribute('aria-busy','true');
    document.getElementById('adminUpdated').textContent='Atualizando…';
    try {
      await loaders[tab]();
      if(currentTab===tab)document.getElementById('adminUpdated').textContent='Atualizado às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    } catch (_) {
      container.innerHTML='<div class="admin-empty" role="alert"><i class="fas fa-cloud-arrow-down" aria-hidden="true"></i><h2>Não foi possível carregar os dados.</h2><p>Tente atualizar novamente.</p><button data-dt-click="refreshAdmin()">Tentar novamente</button></div>';
      if(currentTab===tab)document.getElementById('adminUpdated').textContent='Falha ao atualizar';
    } finally {container.removeAttribute('aria-busy');}
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
    <div class="admin-metrics">
      \${statCard('fa-users', 'Usu\u00e1rios', s.total_users, 'blue')}
      \${statCard('fa-sticky-note', 'Notas', s.total_notes, 'amber')}
      \${statCard('fa-folder', 'Pastas', s.total_folders, 'purple')}
      \${statCard('fa-share-nodes', 'Compartilhamentos', s.total_shares, 'green')}
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
                \${esc(u.username.charAt(0).toUpperCase())}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-dark-700 truncate">\${esc(u.username)}</div>
                <div class="text-[11px] text-dark-400 truncate">\${esc(u.email)}</div>
              </div>
              <span class="text-[10px] text-dark-300 shrink-0">\${esc(formatDate(u.created_at))}</span>
            </div>
          \`).join('') || '<div class="p-4 text-sm text-dark-400 text-center">Nenhum registro</div>'}
        </div>
      </div>

      <!-- Top users by notes -->
      <div class="bg-white rounded-xl border border-dark-200 overflow-hidden">
        <div class="px-4 py-3 border-b border-dark-100">
          <span class="text-sm font-bold text-dark-700"><i class="fas fa-trophy text-brand-400 mr-2"></i>Organização por usuário</span>
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
          <div class="text-[10px] text-dark-400 uppercase font-bold">Links ativos</div>
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
    return \`<div class="stat-card admin-metric bg-white rounded-xl border border-dark-200 p-4 text-center">
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
          <input id="userSearch" type="search" aria-label="Buscar usuário" placeholder="Buscar usuário..." data-dt-input="filterUsers()"
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
              <th class="text-center px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase hidden md:table-cell">Links</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase">Permissão</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase hidden lg:table-cell">Registrado</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-bold text-dark-400 uppercase">A\u00e7\u00f5es</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            \${users.map(u => userRow(u)).join('')}
            <tr id="usersEmpty" \${users.length ? 'hidden' : ''}><td colspan="9" class="admin-table-empty">Nenhum usuário encontrado.</td></tr>
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
            \${esc(u.username.charAt(0).toUpperCase())}
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
          : '<span class="badge bg-dark-100 text-dark-500">Usuário</span>'}
      </td>
      <td class="px-4 py-3 text-[11px] text-dark-400 hidden lg:table-cell">\${esc(formatDate(u.created_at))}</td>
      <td class="px-4 py-3 text-center">
        <div class="flex items-center justify-center gap-1">
          \${isAdmin
            ? \`<button data-dt-click="toggleAdmin(\${u.id}, false)" class="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition" title="Remover admin">
                <i class="fas fa-shield-xmark text-xs"></i>
              </button>\`
            : \`<button data-dt-click="toggleAdmin(\${u.id}, true)" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-300 hover:text-brand-500 hover:bg-brand-50 transition" title="Tornar admin">
                <i class="fas fa-shield-halved text-xs"></i>
              </button>\`}
          <button data-dt-click="deleteUser(\${u.id})" class="w-7 h-7 flex items-center justify-center rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition" title="Excluir usu\u00e1rio">
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>
      </td>
    </tr>\`;
  }

  function filterUsers() {
    const q = document.getElementById('userSearch').value.toLowerCase().trim();
    let count=0;document.querySelectorAll('.user-row').forEach(r => {
      r.hidden=!!q && !r.dataset.search.includes(q);if(!r.hidden)count++;
    });
    const empty=document.getElementById('usersEmpty');if(empty)empty.hidden=count>0;
  }

  async function toggleAdmin(userId, makeAdmin) {
    const username = adminData.users.find(x => x.id === userId)?.username || "";
    const action = makeAdmin ? 'promover a Admin' : 'remover de Admin';
    showModal(
      (makeAdmin ? 'Promover' : 'Rebaixar') + ' usu\u00e1rio',
      '<div class="flex items-center gap-3 p-3 ' + (makeAdmin ? 'bg-brand-50' : 'bg-red-50') + ' rounded-xl">' +
        '<i class="fas fa-shield-halved text-lg ' + (makeAdmin ? 'text-brand-400' : 'text-red-400') + '"></i>' +
        '<p class="text-dark-600 text-sm">Deseja ' + action + ' <strong>"' + esc(username) + '"</strong>?</p>' +
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

  async function deleteUser(userId) {
    const username = adminData.users.find(x => x.id === userId)?.username || "";
    showModal(
      'Excluir usu\u00e1rio',
      '<div class="flex items-center gap-3 p-3 bg-red-50 rounded-xl">' +
        '<i class="fas fa-triangle-exclamation text-red-400 text-lg"></i>' +
        '<div class="text-sm text-dark-600"><p>Excluir <strong>"' + esc(username) + '"</strong> e TODO o conte\u00fado?</p><p class="text-xs text-dark-400 mt-1">Notas, pastas, compartilhamentos e hist\u00f3rico ser\u00e3o apagados permanentemente.</p></div>' +
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
                <span class="text-dark-400"> \${a.action === 'share' ? 'compartilhou' : a.action === 'edit' ? 'editou' : esc(a.action)}</span>
                <span class="text-dark-500 font-medium"> \${esc(a.note_title || 'nota #' + a.note_id)}</span>
              </div>
              \${a.summary ? '<div class="text-[11px] text-dark-300 truncate mt-0.5">' + esc(a.summary) + '</div>' : ''}
            </div>
            <span class="text-[10px] text-dark-300 shrink-0 whitespace-nowrap">\${esc(formatDate(a.created_at))}</span>
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

  function formatDate(value) {
    if(!value)return '—';
    const date=new Date(value.includes('T')?value:value.replace(' ','T')+'Z');
    return Number.isNaN(date.getTime())?'—':date.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }

  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  // ============ INIT ============
  switchTab('overview');

  // Declarative action routing. No eval, Function, or inline event handlers.
  const actions = { refreshAdmin, deleteUser: typeof deleteUser === "function" ? deleteUser : null, filterUsers: typeof filterUsers === "function" ? filterUsers : null, hideModal: typeof hideModal === "function" ? hideModal : null, switchTab: typeof switchTab === "function" ? switchTab : null, toggleAdmin: typeof toggleAdmin === "function" ? toggleAdmin : null };
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
