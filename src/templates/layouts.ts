// HTML Layout templates

export function baseLayout(title: string, content: string, opts?: { noNav?: boolean; scripts?: string; styles?: string }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - TextVault</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: { 50:'#fffbeb', 100:'#fef3c7', 200:'#fde68a', 300:'#fcd34d', 400:'#F5A623', 500:'#E8971A', 600:'#d97706', 700:'#b45309', 800:'#92400e', 900:'#78350f' },
            dark: { 50:'#f9fafb', 100:'#f3f4f6', 200:'#e5e7eb', 300:'#d1d5db', 400:'#9ca3af', 500:'#6b7280', 600:'#4b5563', 700:'#374151', 800:'#1f2937', 900:'#111827' }
          },
          fontFamily: { sans: ['Poppins', 'sans-serif'] }
        }
      }
    }
  </script>
  <style>
    * { font-family: 'Poppins', sans-serif; }
    .scrollbar-thin::-webkit-scrollbar { width: 6px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
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
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-dark-200">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 bg-brand-400 rounded-lg flex items-center justify-center">
          <i class="fas fa-vault text-white text-sm"></i>
        </div>
        <span class="text-xl font-bold text-dark-800">Text<span class="text-brand-400">Vault</span></span>
      </div>
      <div class="flex items-center gap-4">
        <a href="/login" class="text-dark-600 hover:text-dark-800 font-medium transition">Entrar</a>
        <a href="/register" class="bg-brand-400 text-white px-5 py-2 rounded-full font-semibold hover:bg-brand-500 transition shadow-md hover:shadow-lg">
          Criar Conta
        </a>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="min-h-screen flex items-center relative overflow-hidden">
    <!-- Decorative elements -->
    <div class="absolute top-20 right-0 w-1/2 h-full">
      <div class="absolute top-1/4 right-10 w-80 h-80 bg-brand-100 rounded-full opacity-40 blur-3xl"></div>
      <div class="absolute bottom-1/4 right-40 w-60 h-60 bg-brand-200 rounded-full opacity-30 blur-2xl"></div>
    </div>
    <div class="absolute top-32 left-10 w-2 h-20 bg-brand-400 rounded-full"></div>
    <div class="absolute top-44 left-16 w-2 h-12 bg-dark-300 rounded-full"></div>

    <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 pt-20">
      <!-- Left Content -->
      <div>
        <div class="inline-block bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
          <i class="fas fa-star mr-1"></i> Seus textos, organizados e seguros
        </div>
        <h1 class="text-5xl lg:text-6xl font-black text-dark-900 leading-tight mb-6">
          Seu cofre<br>
          <span class="text-brand-400">digital</span> de<br>
          textos
        </h1>
        <p class="text-dark-500 text-lg mb-8 max-w-md leading-relaxed">
          Organize suas anotações em pastas e abas. Salvamento automático para que nada se perca. Simples, rápido e seguro.
        </p>
        <div class="flex items-center gap-4">
          <a href="/register" class="bg-brand-400 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-brand-500 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            COMEÇAR AGORA <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        <div class="flex items-center gap-6 mt-10">
          <div class="flex items-center gap-2 text-dark-400">
            <i class="fas fa-lock text-brand-400"></i>
            <span class="text-sm">Dados protegidos</span>
          </div>
          <div class="flex items-center gap-2 text-dark-400">
            <i class="fas fa-save text-brand-400"></i>
            <span class="text-sm">Auto-save</span>
          </div>
          <div class="flex items-center gap-2 text-dark-400">
            <i class="fas fa-folder-tree text-brand-400"></i>
            <span class="text-sm">Pastas ilimitadas</span>
          </div>
        </div>
      </div>

      <!-- Right Visual -->
      <div class="relative hidden lg:block">
        <div class="relative bg-white rounded-2xl shadow-2xl p-6 border border-dark-200">
          <!-- Fake app preview -->
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 rounded-full bg-red-400"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div class="w-3 h-3 rounded-full bg-green-400"></div>
            <span class="ml-4 text-sm text-dark-400">TextVault — Dashboard</span>
          </div>
          <div class="grid grid-cols-4 gap-3">
            <!-- Sidebar mock -->
            <div class="col-span-1 bg-dark-50 rounded-lg p-3 space-y-2">
              <div class="flex items-center gap-2 text-xs text-dark-600 font-semibold"><i class="fas fa-folder text-brand-400"></i> Trabalho</div>
              <div class="flex items-center gap-2 text-xs text-dark-400 pl-3"><i class="fas fa-folder text-dark-300"></i> Projetos</div>
              <div class="flex items-center gap-2 text-xs text-dark-400 pl-3"><i class="fas fa-folder text-dark-300"></i> Reuniões</div>
              <div class="flex items-center gap-2 text-xs text-dark-600 font-semibold mt-2"><i class="fas fa-folder text-brand-400"></i> Pessoal</div>
              <div class="flex items-center gap-2 text-xs text-dark-400 pl-3"><i class="fas fa-folder text-dark-300"></i> Diário</div>
            </div>
            <!-- Content mock -->
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
        <!-- Floating badges -->
        <div class="absolute -top-4 -right-4 bg-brand-400 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm">
          <i class="fas fa-shield-halved mr-1"></i> Seguro
        </div>
        <div class="absolute -bottom-4 -left-4 bg-dark-800 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm">
          <i class="fas fa-bolt mr-1"></i> Auto-save
        </div>
      </div>
    </div>

    <!-- Social icons -->
    <div class="absolute bottom-8 left-6 flex items-center gap-4">
      <a href="#" class="text-dark-400 hover:text-dark-600 transition"><i class="fab fa-facebook-f"></i></a>
      <a href="#" class="text-dark-400 hover:text-dark-600 transition"><i class="fab fa-twitter"></i></a>
      <a href="#" class="text-dark-400 hover:text-dark-600 transition"><i class="fab fa-instagram"></i></a>
    </div>
  </section>
  `);
}

export function loginPage(error?: string) {
  return baseLayout('Entrar', `
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <a href="/" class="inline-flex items-center gap-2">
          <div class="w-10 h-10 bg-brand-400 rounded-lg flex items-center justify-center">
            <i class="fas fa-vault text-white"></i>
          </div>
          <span class="text-2xl font-bold text-dark-800">Text<span class="text-brand-400">Vault</span></span>
        </a>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8 border border-dark-200">
        <h2 class="text-2xl font-bold text-dark-800 mb-2">Bem-vindo de volta</h2>
        <p class="text-dark-400 mb-6">Entre com sua conta para continuar</p>

        ${error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"><i class="fas fa-exclamation-circle mr-2"></i>${error}</div>` : ''}

        <form method="POST" action="/login" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-dark-700 mb-1">Email ou Usuário</label>
            <div class="relative">
              <i class="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"></i>
              <input type="text" name="login" required placeholder="seu@email.com"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-dark-700 mb-1">Senha</label>
            <div class="relative">
              <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"></i>
              <input type="password" name="password" required placeholder="••••••••"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition">
            </div>
          </div>
          <button type="submit" class="w-full bg-brand-400 text-white py-3 rounded-xl font-bold hover:bg-brand-500 transition shadow-md hover:shadow-lg">
            Entrar <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </form>

        <p class="text-center text-dark-400 text-sm mt-6">
          Não tem conta? <a href="/register" class="text-brand-500 font-semibold hover:text-brand-600">Criar conta</a>
        </p>
      </div>
    </div>
  </div>
  `);
}

export function registerPage(error?: string) {
  return baseLayout('Criar Conta', `
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <a href="/" class="inline-flex items-center gap-2">
          <div class="w-10 h-10 bg-brand-400 rounded-lg flex items-center justify-center">
            <i class="fas fa-vault text-white"></i>
          </div>
          <span class="text-2xl font-bold text-dark-800">Text<span class="text-brand-400">Vault</span></span>
        </a>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8 border border-dark-200">
        <h2 class="text-2xl font-bold text-dark-800 mb-2">Crie sua conta</h2>
        <p class="text-dark-400 mb-6">Comece a organizar seus textos agora</p>

        ${error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"><i class="fas fa-exclamation-circle mr-2"></i>${error}</div>` : ''}

        <form method="POST" action="/register" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-dark-700 mb-1">Nome de usuário</label>
            <div class="relative">
              <i class="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"></i>
              <input type="text" name="username" required placeholder="meuusuario" minlength="3"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-dark-700 mb-1">Email</label>
            <div class="relative">
              <i class="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"></i>
              <input type="email" name="email" required placeholder="seu@email.com"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-dark-700 mb-1">Senha</label>
            <div class="relative">
              <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"></i>
              <input type="password" name="password" required placeholder="Mínimo 6 caracteres" minlength="6"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-dark-700 mb-1">Confirmar Senha</label>
            <div class="relative">
              <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"></i>
              <input type="password" name="password_confirm" required placeholder="Repita a senha" minlength="6"
                class="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition">
            </div>
          </div>
          <button type="submit" class="w-full bg-brand-400 text-white py-3 rounded-xl font-bold hover:bg-brand-500 transition shadow-md hover:shadow-lg">
            Criar Conta <i class="fas fa-check ml-2"></i>
          </button>
        </form>

        <p class="text-center text-dark-400 text-sm mt-6">
          Já tem conta? <a href="/login" class="text-brand-500 font-semibold hover:text-brand-600">Entrar</a>
        </p>
      </div>
    </div>
  </div>
  `);
}
