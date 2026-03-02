// HTML Layout templates

export function baseLayout(title: string, content: string, opts?: { scripts?: string; styles?: string }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - DoutorText</title>
  <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: { 50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#F5A623',500:'#E8971A',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f' },
            dark: { 50:'#f9fafb',100:'#f3f4f6',200:'#e5e7eb',300:'#d1d5db',400:'#9ca3af',500:'#6b7280',600:'#4b5563',700:'#374151',800:'#1f2937',900:'#111827' }
          },
          fontFamily: { sans:['Poppins','sans-serif'] }
        }
      }
    }
  </script>
  <style>
    *{font-family:'Poppins',sans-serif}
    .scrollbar-thin::-webkit-scrollbar{width:6px}
    .scrollbar-thin::-webkit-scrollbar-track{background:#f1f1f1;border-radius:3px}
    .scrollbar-thin::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
    .scrollbar-thin::-webkit-scrollbar-thumb:hover{background:#9ca3af}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes pulse-glow{0%,100%{box-shadow:0 0 0 0 rgba(245,166,35,.3)}50%{box-shadow:0 0 20px 6px rgba(245,166,35,.15)}}
    .anim-up{animation:fadeUp .7s ease both}
    .anim-up-d1{animation:fadeUp .7s .15s ease both}
    .anim-up-d2{animation:fadeUp .7s .3s ease both}
    .anim-up-d3{animation:fadeUp .7s .45s ease both}
    .anim-float{animation:float 4s ease-in-out infinite}
    .anim-glow{animation:pulse-glow 3s ease-in-out infinite}
    .gradient-brand{background:linear-gradient(135deg,#F5A623 0%,#E8971A 50%,#d97706 100%)}
    .gradient-dark{background:linear-gradient(135deg,#1f2937 0%,#111827 100%)}
    .glass{background:rgba(255,255,255,.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
    input:focus{box-shadow:0 0 0 3px rgba(245,166,35,.15)}
    ${opts?.styles || ''}
  </style>
</head>
<body class="bg-dark-50 min-h-screen">
  ${content}
  ${opts?.scripts || ''}
</body>
</html>`;
}

export function landingPage() {
  return baseLayout('Bem-vindo', `
  <!-- Navbar -->
  <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-md">
          <i class="fas fa-file-medical text-white text-sm"></i>
        </div>
        <span class="text-xl font-bold text-dark-800">Doutor<span class="text-brand-400">Text</span></span>
      </div>
      <div class="flex items-center gap-3 sm:gap-4">
        <a href="/login" class="text-dark-600 hover:text-dark-800 font-medium transition text-sm sm:text-base">Entrar</a>
        <a href="/register" class="gradient-brand text-white px-4 sm:px-5 py-2 rounded-full font-semibold hover:opacity-90 transition shadow-md hover:shadow-lg text-sm sm:text-base">
          Criar Conta
        </a>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-white via-brand-50/30 to-white">
    <!-- Background decorations -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 right-0 w-96 h-96 bg-brand-200 rounded-full opacity-20 blur-3xl"></div>
      <div class="absolute bottom-1/3 right-1/4 w-64 h-64 bg-brand-100 rounded-full opacity-30 blur-2xl"></div>
      <div class="absolute top-1/3 -left-20 w-40 h-40 bg-brand-100 rounded-full opacity-20 blur-2xl"></div>
      <div class="hidden sm:block absolute top-32 left-10 w-1.5 h-20 bg-brand-400 rounded-full opacity-60"></div>
      <div class="hidden sm:block absolute top-44 left-16 w-1.5 h-12 bg-dark-300 rounded-full opacity-40"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10 pt-24 sm:pt-28 pb-12">
      <!-- Left Content -->
      <div class="text-center lg:text-left">
        <div class="anim-up inline-block bg-brand-100/80 text-brand-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-5 sm:mb-6 backdrop-blur-sm">
          <i class="fas fa-star mr-1"></i> Seus textos, organizados e seguros
        </div>
        <h1 class="anim-up-d1 text-4xl sm:text-5xl lg:text-6xl font-black text-dark-900 leading-tight mb-5 sm:mb-6">
          Seu espaço<br>
          <span class="text-transparent bg-clip-text gradient-brand" style="background:linear-gradient(135deg,#F5A623,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent">digital</span> de<br>
          textos
        </h1>
        <p class="anim-up-d2 text-dark-500 text-base sm:text-lg mb-7 sm:mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
          Organize suas anotações em pastas e abas. Salvamento automático para que nada se perca. Simples, rápido e seguro.
        </p>
        <div class="anim-up-d3 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
          <a href="/register" class="gradient-brand text-white px-8 py-3.5 rounded-full font-bold text-base sm:text-lg hover:opacity-90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 anim-glow">
            COMEÇAR AGORA <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        <div class="anim-up-d3 flex items-center gap-4 sm:gap-6 mt-8 sm:mt-10 justify-center lg:justify-start">
          <div class="flex items-center gap-2 text-dark-400">
            <div class="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center"><i class="fas fa-lock text-brand-400 text-xs"></i></div>
            <span class="text-xs sm:text-sm">Protegido</span>
          </div>
          <div class="flex items-center gap-2 text-dark-400">
            <div class="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center"><i class="fas fa-save text-brand-400 text-xs"></i></div>
            <span class="text-xs sm:text-sm">Auto-save</span>
          </div>
          <div class="flex items-center gap-2 text-dark-400">
            <div class="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center"><i class="fas fa-folder-tree text-brand-400 text-xs"></i></div>
            <span class="text-xs sm:text-sm">Pastas</span>
          </div>
        </div>
      </div>

      <!-- Right Visual -->
      <div class="relative hidden lg:block anim-up-d2">
        <div class="relative bg-white rounded-2xl shadow-2xl p-6 border border-dark-100 anim-float">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 rounded-full bg-red-400"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div class="w-3 h-3 rounded-full bg-green-400"></div>
            <span class="ml-4 text-sm text-dark-400">DoutorText — Dashboard</span>
          </div>
          <div class="grid grid-cols-4 gap-3">
            <div class="col-span-1 bg-dark-50 rounded-lg p-3 space-y-2">
              <div class="flex items-center gap-2 text-xs text-dark-600 font-semibold"><i class="fas fa-folder text-brand-400"></i> Trabalho</div>
              <div class="flex items-center gap-2 text-xs text-dark-400 pl-3"><i class="fas fa-folder text-dark-300"></i> Projetos</div>
              <div class="flex items-center gap-2 text-xs text-dark-400 pl-3"><i class="fas fa-folder text-dark-300"></i> Reuniões</div>
              <div class="flex items-center gap-2 text-xs text-dark-600 font-semibold mt-2"><i class="fas fa-folder text-brand-400"></i> Pessoal</div>
              <div class="flex items-center gap-2 text-xs text-dark-400 pl-3"><i class="fas fa-folder text-dark-300"></i> Diário</div>
            </div>
            <div class="col-span-3 space-y-2">
              <div class="flex gap-1">
                <div class="bg-brand-400 text-white text-xs px-3 py-1 rounded-t-lg font-medium">Nota 1</div>
                <div class="bg-dark-100 text-dark-500 text-xs px-3 py-1 rounded-t-lg">Nota 2</div>
                <div class="bg-dark-100 text-dark-500 text-xs px-3 py-1 rounded-t-lg">Nota 3</div>
              </div>
              <div class="bg-dark-50 rounded-b-lg rounded-tr-lg p-4">
                <div class="h-2 bg-dark-200 rounded w-3/4 mb-2"></div>
                <div class="h-2 bg-dark-200 rounded w-full mb-2"></div>
                <div class="h-2 bg-dark-200 rounded w-5/6 mb-2"></div>
                <div class="h-2 bg-dark-200 rounded w-2/3 mb-4"></div>
                <div class="flex items-center gap-2 text-xs text-green-500">
                  <i class="fas fa-check-circle"></i> Salvo automaticamente
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="absolute -top-4 -right-4 gradient-brand text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm anim-float" style="animation-delay:.5s">
          <i class="fas fa-shield-halved mr-1"></i> Seguro
        </div>
        <div class="absolute -bottom-4 -left-4 gradient-dark text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm anim-float" style="animation-delay:1s">
          <i class="fas fa-bolt mr-1"></i> Auto-save
        </div>
      </div>
    </div>

    <!-- Footer social -->
    <div class="absolute bottom-6 left-0 right-0 flex justify-center lg:justify-start lg:left-6 gap-4">
      <a href="#" class="w-9 h-9 rounded-full bg-white border border-dark-200 flex items-center justify-center text-dark-400 hover:text-brand-500 hover:border-brand-300 transition shadow-sm"><i class="fab fa-facebook-f text-xs"></i></a>
      <a href="#" class="w-9 h-9 rounded-full bg-white border border-dark-200 flex items-center justify-center text-dark-400 hover:text-brand-500 hover:border-brand-300 transition shadow-sm"><i class="fab fa-twitter text-xs"></i></a>
      <a href="#" class="w-9 h-9 rounded-full bg-white border border-dark-200 flex items-center justify-center text-dark-400 hover:text-brand-500 hover:border-brand-300 transition shadow-sm"><i class="fab fa-instagram text-xs"></i></a>
    </div>
  </section>
  `);
}

export function loginPage(error?: string) {
  return baseLayout('Entrar', `
  <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-white via-brand-50/20 to-white relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/4 -right-20 w-80 h-80 bg-brand-100 rounded-full opacity-30 blur-3xl"></div>
      <div class="absolute bottom-1/4 -left-20 w-60 h-60 bg-brand-200 rounded-full opacity-20 blur-2xl"></div>
    </div>
    <div class="w-full max-w-md relative z-10 anim-up">
      <div class="text-center mb-8">
        <a href="/" class="inline-flex items-center gap-2 group">
          <div class="w-11 h-11 gradient-brand rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition">
            <i class="fas fa-file-medical text-white"></i>
          </div>
          <span class="text-2xl font-bold text-dark-800">Doutor<span class="text-brand-400">Text</span></span>
        </a>
      </div>

      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-7 sm:p-8 border border-white/50">
        <h2 class="text-2xl font-bold text-dark-800 mb-1">Bem-vindo de volta</h2>
        <p class="text-dark-400 mb-6 text-sm">Entre com sua conta para continuar</p>

        ${error ? `<div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2"><i class="fas fa-exclamation-circle"></i>${error}</div>` : ''}

        <form method="POST" action="/login" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-dark-600 mb-1.5">Email ou Usuário</label>
            <div class="relative">
              <i class="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300"></i>
              <input type="text" name="login" required placeholder="seu@email.com" autocomplete="username"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition bg-white/50 text-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-dark-600 mb-1.5">Senha</label>
            <div class="relative">
              <i class="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300"></i>
              <input type="password" name="password" required placeholder="••••••••" autocomplete="current-password"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition bg-white/50 text-sm">
            </div>
          </div>
          <button type="submit" class="w-full gradient-brand text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-md hover:shadow-lg text-sm">
            Entrar <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </form>

        <p class="text-center text-dark-400 text-sm mt-6">
          Não tem conta? <a href="/register" class="text-brand-500 font-semibold hover:text-brand-600 transition">Criar conta</a>
        </p>
      </div>
    </div>
  </div>
  `);
}

export function registerPage(error?: string) {
  return baseLayout('Criar Conta', `
  <div class="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-white via-brand-50/20 to-white relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/4 -right-20 w-80 h-80 bg-brand-100 rounded-full opacity-30 blur-3xl"></div>
      <div class="absolute bottom-1/4 -left-20 w-60 h-60 bg-brand-200 rounded-full opacity-20 blur-2xl"></div>
    </div>
    <div class="w-full max-w-md relative z-10 anim-up">
      <div class="text-center mb-8">
        <a href="/" class="inline-flex items-center gap-2 group">
          <div class="w-11 h-11 gradient-brand rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition">
            <i class="fas fa-file-medical text-white"></i>
          </div>
          <span class="text-2xl font-bold text-dark-800">Doutor<span class="text-brand-400">Text</span></span>
        </a>
      </div>

      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-7 sm:p-8 border border-white/50">
        <h2 class="text-2xl font-bold text-dark-800 mb-1">Crie sua conta</h2>
        <p class="text-dark-400 mb-6 text-sm">Comece a organizar seus textos agora</p>

        ${error ? `<div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2"><i class="fas fa-exclamation-circle"></i>${error}</div>` : ''}

        <form method="POST" action="/register" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-dark-600 mb-1.5">Nome de usuário</label>
            <div class="relative">
              <i class="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300"></i>
              <input type="text" name="username" required placeholder="meuusuario" minlength="3" autocomplete="username"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition bg-white/50 text-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-dark-600 mb-1.5">Email</label>
            <div class="relative">
              <i class="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300"></i>
              <input type="email" name="email" required placeholder="seu@email.com" autocomplete="email"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition bg-white/50 text-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-dark-600 mb-1.5">Senha</label>
            <div class="relative">
              <i class="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300"></i>
              <input type="password" name="password" required placeholder="Mínimo 6 caracteres" minlength="6" autocomplete="new-password"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition bg-white/50 text-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-dark-600 mb-1.5">Confirmar Senha</label>
            <div class="relative">
              <i class="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300"></i>
              <input type="password" name="password_confirm" required placeholder="Repita a senha" minlength="6" autocomplete="new-password"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition bg-white/50 text-sm">
            </div>
          </div>
          <button type="submit" class="w-full gradient-brand text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-md hover:shadow-lg text-sm">
            Criar Conta <i class="fas fa-check ml-2"></i>
          </button>
        </form>

        <p class="text-center text-dark-400 text-sm mt-6">
          Já tem conta? <a href="/login" class="text-brand-500 font-semibold hover:text-brand-600 transition">Entrar</a>
        </p>
      </div>
    </div>
  </div>
  `);
}
