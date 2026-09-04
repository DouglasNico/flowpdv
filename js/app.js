/**
 * FlowPDV Master SaaS - Gerenciador Central de Licenças & Sincronização Cloud Firestore
 */

window.MasterApp = {
  clientes: [],
  filtroAtual: 'todos',
  planos: [],

  planosPadrao: [
    { id: 'PLN-PRO', nome: 'Mensal Pro', valor: 89.90, periodo: 'mês' },
    { id: 'PLN-BASICO', nome: 'Mensal Básico', valor: 69.90, periodo: 'mês' },
    { id: 'PLN-TRI', nome: 'Trimestral', valor: 239.70, periodo: 'tri' },
    { id: 'PLN-SEMESTRAL', nome: 'Semestral', valor: 459.00, periodo: 'semestre' },
    { id: 'PLN-ANUAL', nome: 'Anual VIP', valor: 899.00, periodo: 'ano' }
  ],

  presetsCategorias: {
    adega: {
      icone: '🍷',
      nome: 'Adega & Depósito de Bebidas',
      lista: ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos', 'Combos']
    },
    mercado: {
      icone: '🛒',
      nome: 'Supermercado & Mercearia',
      lista: ['Alimentos', 'Carnes & Açougue', 'Bebidas', 'Laticínios & Frios', 'Hortifrúti', 'Padaria', 'Higiene & Limpeza', 'Matinais']
    },
    acougue: {
      icone: '🥩',
      nome: 'Açougue & Casa de Carnes',
      lista: ['Bovinos', 'Suínos', 'Aves', 'Linguiças & Embutidos', 'Temperados & Espetos', 'Bebidas', 'Carvão & Acessórios']
    },
    hortifruti: {
      icone: '🥬',
      nome: 'Hortifrúti & Sacolão',
      lista: ['Frutas', 'Verduras & Folhas', 'Legumes & Raízes', 'Temperos & Ervas', 'Ovos & Grãos', 'Bebidas']
    },
    padaria: {
      icone: '🥖',
      nome: 'Padaria & Confeitaria',
      lista: ['Pães', 'Bolos & Doces', 'Salgados', 'Frios & Laticínios', 'Café & Bebidas', 'Mercearia']
    },
    conveniencia: {
      icone: '🏪',
      nome: 'Loja de Conveniência',
      lista: ['Bebidas Geladas', 'Salgados & Lanches', 'Snacks', 'Tabacaria', 'Doces & Chocolates', 'Energéticos', 'Gelo & Carvão']
    },
    tabacaria: {
      icone: '🚬',
      nome: 'Tabacaria & Hookah',
      lista: ['Essências', 'Carvão & Alumínio', 'Sedas & Filtros', 'Isqueiros & Maçaricos', 'Narguiles & Peças', 'Vapes & Pods', 'Bebidas']
    },
    vestuario: {
      icone: '👗',
      nome: 'Loja de Roupas & Calçados',
      lista: ['Feminino', 'Masculino', 'Infantil', 'Calçados', 'Acessórios', 'Íntimo']
    },
    lanchonete: {
      icone: '🍔',
      nome: 'Lanchonete & Restaurante',
      lista: ['Lanches & Burgers', 'Porções & Petiscos', 'Pizzas', 'Bebidas & Sucos', 'Sobremesas']
    },
    geral: {
      icone: '⚡',
      nome: 'Comércio Geral / Varejo',
      lista: ['Bebidas', 'Alimentos', 'Carnes', 'Limpeza', 'Higiene', 'Tabacaria', 'Acessórios']
    }
  },

  modulosPadraoPorRamo: {
    adega: { fardosPacks: true, balancaPeso: false, validadeLotes: true, gradeRoupas: false, fiadoWhatsApp: true, importadorXml: true, fiscalNfce: true, tefCartao: true, pagamentos: { manual: true, tefIntegrado: true, vouchers: false, voucherVr: false, voucherVa: false, voucherAlelo: false, voucherSodexo: false, voucherTicket: false, voucherOutros: false } },
    mercado: { fardosPacks: true, balancaPeso: true, validadeLotes: true, gradeRoupas: false, fiadoWhatsApp: true, importadorXml: true, fiscalNfce: true, tefCartao: true },
    acougue: { fardosPacks: false, balancaPeso: true, validadeLotes: true, gradeRoupas: false, fiadoWhatsApp: true, importadorXml: true, fiscalNfce: true, tefCartao: true },
    hortifruti: { fardosPacks: false, balancaPeso: true, validadeLotes: true, gradeRoupas: false, fiadoWhatsApp: true, importadorXml: true, fiscalNfce: true, tefCartao: true },
    padaria: { fardosPacks: false, balancaPeso: true, validadeLotes: true, gradeRoupas: false, fiadoWhatsApp: true, importadorXml: true, fiscalNfce: true, tefCartao: true },
    conveniencia: { fardosPacks: true, balancaPeso: false, validadeLotes: true, gradeRoupas: false, fiadoWhatsApp: true, importadorXml: true, fiscalNfce: true, tefCartao: true },
    tabacaria: { fardosPacks: false, balancaPeso: false, validadeLotes: false, gradeRoupas: false, fiadoWhatsApp: true, importadorXml: true, fiscalNfce: true, tefCartao: true },
    vestuario: { fardosPacks: false, balancaPeso: false, validadeLotes: false, gradeRoupas: true, fiadoWhatsApp: true, importadorXml: true, fiscalNfce: true, tefCartao: true },
    lanchonete: { fardosPacks: false, balancaPeso: true, validadeLotes: true, gradeRoupas: false, fiadoWhatsApp: true, importadorXml: true, fiscalNfce: true, tefCartao: true },
    geral: { fardosPacks: true, balancaPeso: true, validadeLotes: true, gradeRoupas: true, fiadoWhatsApp: true, importadorXml: true, fiscalNfce: true, tefCartao: true }
  },

  usuarioLogado: null,

  async init() {
    this.carregarPlanos();
    this.initAuth();
    this.bindMascaras();
  },

  initAuth() {
    if (!window.FirebaseAuth) {
      setTimeout(() => this.initAuth(), 150);
      return;
    }
    const { auth, onAuthStateChanged } = window.FirebaseAuth;
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.usuarioLogado = user;
        this.exibirPainelMaster(user);
      } else {
        this.usuarioLogado = null;
        this.exibirTelaLogin();
      }
    });
  },

  exibirTelaLogin() {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
  },

  async exibirPainelMaster(user) {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const userEmailEl = document.getElementById('master-user-email');

    if (loginScreen) loginScreen.style.display = 'none';
    if (appContainer) appContainer.style.display = 'block';
    if (userEmailEl && user) userEmailEl.textContent = user.email || 'Super Admin';

    await this.carregarDados();
    this.renderMetrics();
    this.renderTabela();
  },

  async executarLogin(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const errorEl = document.getElementById('login-error-msg');
    const btnSubmit = document.getElementById('btn-submit-login');

    if (!email || !password) return;

    if (errorEl) errorEl.style.display = 'none';
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span>⏳ Autenticando...</span>';
    }

    try {
      if (!window.FirebaseAuth) throw new Error('Firebase Auth não inicializado.');
      const { auth, signInWithEmailAndPassword } = window.FirebaseAuth;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('[Auth Error]', err);
      if (errorEl) {
        let msg = '❌ E-mail ou senha incorretos.';
        if (err.code === 'auth/user-not-found') msg = '❌ Usuário não cadastrado no Firebase.';
        if (err.code === 'auth/wrong-password') msg = '❌ Senha incorreta.';
        if (err.code === 'auth/invalid-credential') msg = '❌ Credenciais inválidas. Verifique seu e-mail e senha.';
        if (err.code === 'auth/invalid-email') msg = '❌ E-mail em formato inválido.';
        if (err.code === 'auth/too-many-requests') msg = '⚠️ Muitas tentativas. Aguarde alguns instantes.';
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
      }
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<span>🔐 Entrar no Painel Master</span>';
      }
    }
  },

  async executarLogout() {
    if (!confirm('Deseja realmente sair do Painel Master?')) return;
    try {
      if (!window.FirebaseAuth) return;
      const { auth, signOut } = window.FirebaseAuth;
      await signOut(auth);
    } catch (e) {
      console.error('[Logout Error]', e);
    }
  },

  aoMudarRamoSelect(ramo) {
    this.aplicarPresetCategorias(ramo);
  },

  atualizarPreviewCategorias() {
    const input = document.getElementById('cli-categorias');
    const preview = document.getElementById('cli-categorias-preview');
    if (!input || !preview) return;
    const categorias = input.value.split(',').map(item => item.trim()).filter(Boolean);
    preview.innerHTML = categorias.map(categoria => `<span class="categoria-chip-preview">${categoria}</span>`).join('');
  },

  aplicarPresetCategorias(tipo) {
    const preset = this.presetsCategorias[tipo];
    if (!preset) return;

    const ramoEl = document.getElementById('cli-ramo');
    const iconeEl = document.getElementById('cli-icone');
    const catEl = document.getElementById('cli-categorias');

    if (ramoEl) ramoEl.value = tipo;
    if (iconeEl) iconeEl.value = preset.icone;
    if (catEl) catEl.value = preset.lista.join(', ');
    this.atualizarPreviewCategorias();

    // Aplica os módulos recomendados para o segmento
    const modulosPadrao = this.modulosPadraoPorRamo[tipo] || this.modulosPadraoPorRamo.geral;
    this.setModulosCheckboxes(modulosPadrao);
  },

  setModulosCheckboxes(modulos = {}) {
    const modFardos = document.getElementById('mod-fardos');
    const modBalanca = document.getElementById('mod-balanca');
    const modValidade = document.getElementById('mod-validade');
    const modGrade = document.getElementById('mod-grade');
    const modClube = document.getElementById('mod-clube');
    const modFiado = document.getElementById('mod-fiado');
    const modXml = document.getElementById('mod-xml');
    const modFiscal = document.getElementById('mod-fiscal');
    const modTef = document.getElementById('mod-tef');
    const pagamentos = modulos.pagamentos || {};

    if (modFardos) modFardos.checked = modulos.fardosPacks !== false;
    if (modBalanca) modBalanca.checked = Boolean(modulos.balancaPeso);
    if (modValidade) modValidade.checked = modulos.validadeLotes !== false;
    if (modGrade) modGrade.checked = Boolean(modulos.gradeRoupas);
    if (modClube) modClube.checked = Boolean(modulos.clubeFidelidade);
    if (modFiado) modFiado.checked = modulos.fiadoWhatsApp !== false;
    if (modXml) modXml.checked = modulos.importadorXml !== false;
    if (modFiscal) modFiscal.checked = modulos.fiscalNfce !== false;
    if (modTef) modTef.checked = modulos.tefCartao !== false;
    const setPagamento = (id, valor, padrao = false) => {
      const el = document.getElementById(id);
      if (el) el.checked = valor !== undefined ? valor === true : padrao;
    };
    setPagamento('pag-vouchers', pagamentos.vouchers, false);
    setPagamento('pag-marca-vr', pagamentos.voucherMarcaVr ?? pagamentos.voucherVr, false);
    setPagamento('pag-marca-alelo', pagamentos.voucherMarcaAlelo ?? pagamentos.voucherAlelo, false);
    setPagamento('pag-marca-pluxee', pagamentos.voucherMarcaPluxee ?? pagamentos.voucherSodexo, false);
    setPagamento('pag-marca-ticket', pagamentos.voucherMarcaTicket ?? pagamentos.voucherTicket, false);
    setPagamento('pag-outros', pagamentos.voucherOutros, false);
    this.atualizarEstadoVouchers();
  },

  atualizarEstadoVouchers() {
    const moduloVouchers = document.getElementById('pag-vouchers');
    const habilitado = Boolean(moduloVouchers?.checked);
    document.querySelectorAll('[data-voucher-option]').forEach(label => {
      const checkbox = label.querySelector('input');
      if (checkbox) checkbox.disabled = !habilitado;
      label.style.opacity = habilitado ? '1' : '0.42';
      label.style.cursor = habilitado ? 'pointer' : 'not-allowed';
    });
  },

  getModulosCheckboxes() {
    return {
      fardosPacks: document.getElementById('mod-fardos')?.checked ?? true,
      balancaPeso: document.getElementById('mod-balanca')?.checked ?? false,
      validadeLotes: document.getElementById('mod-validade')?.checked ?? true,
      gradeRoupas: document.getElementById('mod-grade')?.checked ?? false,
      clubeFidelidade: document.getElementById('mod-clube')?.checked ?? false,
      fiadoWhatsApp: document.getElementById('mod-fiado')?.checked ?? true,
      importadorXml: document.getElementById('mod-xml')?.checked ?? true,
      fiscalNfce: document.getElementById('mod-fiscal')?.checked ?? true,
      tefCartao: document.getElementById('mod-tef')?.checked ?? true,
      pagamentos: {
        vouchers: document.getElementById('pag-vouchers')?.checked ?? false,
        voucherMarcaVr: document.getElementById('pag-marca-vr')?.checked ?? false,
        voucherMarcaAlelo: document.getElementById('pag-marca-alelo')?.checked ?? false,
        voucherMarcaPluxee: document.getElementById('pag-marca-pluxee')?.checked ?? false,
        voucherMarcaTicket: document.getElementById('pag-marca-ticket')?.checked ?? false,
        voucherOutros: document.getElementById('pag-outros')?.checked ?? false
      }
    };
  },

  async salvarDados(idEspecifico = null) {
    const clientesMap = new Map();
    for (const c of this.clientes) {
      if (!c) continue;
      const docClean = (c.documento || '').replace(/\D/g, '');
      const key = docClean || c.chaveLicenca || c.id;
      if (!key) continue;

      const existing = clientesMap.get(key);
      if (!existing) {
        clientesMap.set(key, c);
      } else {
        clientesMap.set(key, {
          ...existing,
          ...c,
          ramoAtividade: c.ramoAtividade || existing.ramoAtividade || 'adega',
          modulos: c.modulos || existing.modulos || this.modulosPadraoPorRamo.adega,
          moduloComandas: c.moduloComandas !== undefined ? c.moduloComandas : (existing.moduloComandas || 'mesas_e_comandas'),
          logoUrl: c.logoUrl || existing.logoUrl || '',
          categorias: (c.categorias && c.categorias.length > 0) ? c.categorias : (existing.categorias || [])
        });
      }
    }
    this.clientes = Array.from(clientesMap.values());

    try {
      localStorage.setItem('flowpdv_master_clientes', JSON.stringify(this.clientes));
      
      const licAtiva = this.clientes.find(c => c.status === 'ativa');
      if (licAtiva) {
        const adegaLic = {
          cnpj: licAtiva.documento,
          razaoSocial: licAtiva.nome,
          ramoAtividade: licAtiva.ramoAtividade || 'adega',
          layoutPdv: licAtiva.layoutPdv === 'classico' ? 'classico' : 'moderno',
          icone: licAtiva.icone || '🍷',
          logoUrl: licAtiva.logoUrl || '',
          modulos: licAtiva.modulos || this.modulosPadraoPorRamo[licAtiva.ramoAtividade || 'adega'] || this.modulosPadraoPorRamo.adega,
          moduloComandas: licAtiva.moduloComandas || 'mesas_e_comandas',
          categorias: (licAtiva.categorias && licAtiva.categorias.length > 0) ? licAtiva.categorias : ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos'],
          status: licAtiva.status,
          dataExpiracao: (licAtiva.vencimento && licAtiva.vencimento.includes('T')) ? licAtiva.vencimento : (licAtiva.vencimento + 'T23:59:59.000Z'),
          valorMensal: licAtiva.valorMensal,
          chavePixSuporte: '19999997777',
          whatsappSuporte: '(19) 99999-7777',
          diasTolerancia: 2,
          chaveLicenca: licAtiva.chaveLicenca
        };
        localStorage.setItem('adega_licenca', JSON.stringify(adegaLic));
        localStorage.setItem('flowpdv_adega_licenca', JSON.stringify(adegaLic));
      }
    } catch (err) {
      console.log('Erro ao salvar localmente:', err);
    }

    if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        const { db, setDoc, doc } = window.FirebaseDB;
        for (const c of this.clientes) {
          if (idEspecifico && c.id !== idEspecifico && c.chaveLicenca !== idEspecifico) continue;
          const docId = c.id || c.chaveLicenca;
          const payload = {
            id: c.id,
            nome: c.nome,
            razaoSocial: c.nome,
            documento: c.documento,
            cnpj: c.documento,
            responsavel: c.responsavel,
            whatsapp: c.whatsapp,
            ramoAtividade: c.ramoAtividade || 'adega',
            layoutPdv: c.layoutPdv === 'classico' ? 'classico' : 'moderno',
            icone: c.icone || '🍷',
            logoUrl: c.logoUrl || '',
            modulos: c.modulos || this.modulosPadraoPorRamo[c.ramoAtividade || 'adega'] || this.modulosPadraoPorRamo.adega,
            moduloComandas: c.moduloComandas || 'mesas_e_comandas',
            categorias: (c.categorias && c.categorias.length > 0) ? c.categorias : ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos'],
            categoriasExcluidas: c.categoriasExcluidas || [],
            categoriasExcluidas: c.categoriasExcluidas || [],
            plano: c.plano,
            valorMensal: c.valorMensal,
            vencimento: c.vencimento,
            dataExpiracao: c.vencimento ? (c.vencimento.includes('T') ? c.vencimento : c.vencimento + 'T23:59:59.000Z') : '2026-12-31T23:59:59.000Z',
            status: c.status,
            chaveLicenca: c.chaveLicenca,
            pinGerente: c.pinGerente || '1234',
            limiteTerminais: Math.max(1, parseInt(c.limiteTerminais) || 1),
            terminaisAtivos: Array.isArray(c.terminaisAtivos) ? c.terminaisAtivos : [],
            atualizadoEm: new Date().toISOString()
          };

          await setDoc(doc(db, 'licencas', docId), payload, { merge: true });
          if (c.chaveLicenca && c.chaveLicenca !== docId) {
            await setDoc(doc(db, 'licencas', c.chaveLicenca), payload, { merge: true });
          }
          if (c.chaveLicenca) {
            await setDoc(doc(db, 'backups_lojas', c.chaveLicenca), {
              categorias: payload.categorias,
              categoriasExcluidas: payload.categoriasExcluidas || []
            }, { merge: true }).catch(() => {});
          }
        }
        console.log('[Firebase Master] Salvo com sucesso!');
      } catch (err) {
        console.log('[Firebase Master] Sync error:', err ? (err.message || err) : '');
      }
    }
  },

  async carregarDados() {
    let list = [];
    const saved = localStorage.getItem('flowpdv_master_clientes');
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        list = [];
      }
    }

    if (!Array.isArray(list) || list.length === 0) {
      list = this.getDefaultClientes();
      localStorage.setItem('flowpdv_master_clientes', JSON.stringify(list));
    }

    this.clientes = list;
    this.renderMetrics();
    this.renderTabela();

    await this.sincronizarComNuvemFirestore();
  },

  getDefaultClientes() {
    const hoje = new Date();
    const em15Dias = new Date(hoje.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const em3Dias = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const ha5Dias = new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return [
      {
        id: 'CLI-002',
        nome: 'Adega & Depósito Central',
        documento: '45.123.789/0001-20',
        responsavel: 'Marcos Oliveira',
        whatsapp: '(19) 99876-5432',
        icone: '🍷',
        logoUrl: '',
        categorias: ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos', 'Combos'],
        plano: 'Mensal Pro',
        valorMensal: 89.90,
        vencimento: em15Dias,
        status: 'ativa',
        chaveLicenca: 'LIC-FLOW-884210'
      },
      {
        id: 'CLI-001',
        nome: 'Adega do Douglas',
        documento: '12.345.678/0001-90',
        responsavel: 'Douglas Nico',
        whatsapp: '(19) 99999-7777',
        icone: '🍷',
        logoUrl: '',
        categorias: ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos'],
        plano: 'Mensal Pro',
        valorMensal: 89.90,
        vencimento: em15Dias,
        status: 'ativa',
        chaveLicenca: 'LIC-FLOW-268008'
      },
      {
        id: 'CLI-003',
        nome: 'Conveniência Posto Real',
        documento: '38.456.123/0001-88',
        responsavel: 'Fernanda Lima',
        whatsapp: '(19) 98111-2222',
        icone: '🏪',
        logoUrl: '',
        categorias: ['Bebidas Geladas', 'Salgados & Lanches', 'Snacks', 'Tabacaria', 'Doces & Chocolates', 'Energéticos', 'Gelo & Carvão'],
        plano: 'Mensal Pro',
        valorMensal: 89.90,
        vencimento: em3Dias,
        status: 'ativa',
        chaveLicenca: 'LIC-FLOW-993144'
      },
      {
        id: 'CLI-004',
        nome: 'Mercadinho do Bairro',
        documento: '19.888.777/0001-44',
        responsavel: 'Carlos Santos',
        whatsapp: '(19) 97444-5555',
        icone: '🛒',
        logoUrl: '',
        categorias: ['Alimentos', 'Carnes & Açougue', 'Bebidas', 'Laticínios & Frios', 'Hortifrúti', 'Padaria', 'Higiene & Limpeza'],
        plano: 'Mensal Básico',
        valorMensal: 69.90,
        vencimento: ha5Dias,
        status: 'bloqueada',
        chaveLicenca: 'LIC-FLOW-110293'
      }
    ];
  },

  restaurarClientesPadrao() {
    this.clientes = this.getDefaultClientes();
    this.salvarDados();
    this.renderMetrics();
    this.renderTabela();
  },

  async onFirebaseReady() {
    await this.sincronizarPlanosFirestore();
    await this.sincronizarComNuvemFirestore();
    this.iniciarOuvintePlanosRealtime();
    this.iniciarOuvinteNuvemRealtime();
    this.iniciarOuvinteBackupsLojasRealtime();
  },

  ouvintesBackupsLojas: new Map(),

  iniciarOuvinteBackupsLojasRealtime() {
    if (!window.FirebaseDB || !window.FirebaseDB.db || !window.FirebaseDB.onSnapshot) return;
    const { db, doc, onSnapshot } = window.FirebaseDB;
    (this.clientes || []).forEach(cliente => {
      const chave = String(cliente?.chaveLicenca || '').trim().toUpperCase();
      if (!chave || this.ouvintesBackupsLojas.has(chave)) return;

      const unsubscribe = onSnapshot(doc(db, 'backups_lojas', chave), snap => {
        if (!snap || !snap.exists()) return;
        const backup = snap.data() || {};
        const chaveBackup = String(backup.chaveLicenca || '').trim().toUpperCase();
        if (chaveBackup && chaveBackup !== chave) return;

        const alvo = (this.clientes || []).find(item =>
          String(item?.chaveLicenca || '').trim().toUpperCase() === chave
        );
        if (!alvo) return;

        const excluidas = (Array.isArray(backup.categoriasExcluidas) ? backup.categoriasExcluidas : [])
          .map(c => String(c || '').toLowerCase().trim());

        if (Array.isArray(backup.categorias)) {
          const categorias = backup.categorias
            .map(item => String(item || '').trim())
            .filter(item => item && !excluidas.includes(item.toLowerCase()))
            .filter((item, index, lista) => lista.findIndex(valor => valor.toLowerCase() === item.toLowerCase()) === index);

          if (categorias.length > 0) {
            alvo.categorias = categorias;
            alvo.categoriasExcluidas = backup.categoriasExcluidas || [];
            this.salvarDados();
            this.renderTabela();
          }
        }
      });
      this.ouvintesBackupsLojas.set(chave, unsubscribe);
    });
  },

  iniciarOuvinteNuvemRealtime() {
    if (window.FirebaseDB && window.FirebaseDB.db && window.FirebaseDB.onSnapshot) {
      try {
        const { db, collection, onSnapshot } = window.FirebaseDB;
        onSnapshot(collection(db, 'licencas'), (snapshot) => {
          const cloudClientes = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data) {
              cloudClientes.push({
                id: data.id || ('CLI-' + (data.chaveLicenca || doc.id).slice(-4)),
                nome: data.nome || data.razaoSocial || 'Adega',
                documento: data.documento || data.cnpj || '00.000.000/0001-00',
                responsavel: data.responsavel || 'Responsável',
                whatsapp: data.whatsapp || '(19) 99999-7777',
                ramoAtividade: data.ramoAtividade || 'adega',
                layoutPdv: data.layoutPdv === 'classico' ? 'classico' : 'moderno',
                icone: data.icone || '🍷',
                modulos: data.modulos || null,
                moduloComandas: data.moduloComandas || 'mesas_e_comandas',
                logoUrl: data.logoUrl || '',
                categorias: (Array.isArray(data.categorias) && data.categorias.length > 0) ? data.categorias : ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos'],
                plano: data.plano || 'Mensal Pro',
                valorMensal: data.valorMensal || 89.90,
                vencimento: data.vencimento ? (data.vencimento.includes('T') ? data.vencimento.split('T')[0] : data.vencimento) : '2026-12-31',
                status: data.status || 'ativa',
                chaveLicenca: data.chaveLicenca || doc.id,
                pinGerente: data.pinGerente || '1234',
                limiteTerminais: parseInt(data.limiteTerminais) || 1,
                terminaisAtivos: Array.isArray(data.terminaisAtivos) ? data.terminaisAtivos : []
              });
            }
          });

          if (cloudClientes.length > 0) {
            const dedupMap = new Map();
            
            // Helper para desduplicar terminais por ID único
            const desduplicarTerminais = (lista) => {
              if (!Array.isArray(lista)) return [];
              const m = new Map();
              lista.forEach(t => {
                if (!t) return;
                const id = typeof t === 'string' ? t.trim() : (t.id ? String(t.id).trim() : '');
                if (id) {
                  const obj = typeof t === 'string' ? { id, hostname: 'Computador', ultimoAcesso: new Date().toISOString() } : t;
                  m.set(id, obj);
                }
              });
              return Array.from(m.values());
            };

            for (const c of cloudClientes) {
              const docClean = (c.documento || '').replace(/\D/g, '');
              const key = docClean || c.chaveLicenca || c.id;
              const existing = dedupMap.get(key);
              const termUnicosC = desduplicarTerminais(c.terminaisAtivos);

              if (!existing) {
                dedupMap.set(key, {
                  ...c,
                  terminaisAtivos: termUnicosC
                });
              } else {
                // Se um dos documentos for o principal (CLI-xxx) ou tiver sido limpo/desvinculado, preferir a versão atualizada
                if (c.id && c.id.startsWith('CLI-')) {
                  existing.terminaisAtivos = termUnicosC;
                } else if (termUnicosC.length === 0 && (!existing.terminaisAtivos || existing.terminaisAtivos.length === 0)) {
                  existing.terminaisAtivos = [];
                }
                if (c.limiteTerminais) existing.limiteTerminais = c.limiteTerminais;
                if (c.status) existing.status = c.status;
                if (c.vencimento) existing.vencimento = c.vencimento;
                if (c.modulos) existing.modulos = c.modulos;
                if (c.moduloComandas !== undefined) existing.moduloComandas = c.moduloComandas;
                if (c.ramoAtividade) existing.ramoAtividade = c.ramoAtividade;
                if (c.layoutPdv === 'classico') existing.layoutPdv = 'classico';
              }
            }
            this.clientes = Array.from(dedupMap.values());
            this.renderMetrics();
            this.renderTabela();
          }
        });
      } catch (e) {
        console.log('[Firebase Master] Erro no realtime listener:', e);
      }
    }
  },

  async sincronizarComNuvemFirestore() {
    if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        const { db, collection, getDocs } = window.FirebaseDB;
        const querySnapshot = await getDocs(collection(db, 'licencas'));
        const cloudClientes = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data) {
            cloudClientes.push({
              id: data.id || ('CLI-' + (data.chaveLicenca || doc.id).slice(-4)),
              nome: data.nome || data.razaoSocial || 'Adega',
              documento: data.documento || data.cnpj || '00.000.000/0001-00',
              responsavel: data.responsavel || 'Responsável',
              whatsapp: data.whatsapp || '(19) 99999-7777',
              ramoAtividade: data.ramoAtividade || 'adega',
              layoutPdv: data.layoutPdv === 'classico' ? 'classico' : 'moderno',
              icone: data.icone || '🍷',
              modulos: data.modulos || null,
              moduloComandas: data.moduloComandas || 'mesas_e_comandas',
              logoUrl: data.logoUrl || '',
              categorias: (Array.isArray(data.categorias) && data.categorias.length > 0) ? data.categorias : ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos'],
              plano: data.plano || 'Mensal Pro',
              valorMensal: data.valorMensal || 89.90,
              vencimento: data.vencimento ? (data.vencimento.includes('T') ? data.vencimento.split('T')[0] : data.vencimento) : '2026-12-31',
              status: data.status || 'ativa',
              chaveLicenca: data.chaveLicenca || doc.id,
              pinGerente: data.pinGerente || '1234',
              limiteTerminais: parseInt(data.limiteTerminais) || 1,
              terminaisAtivos: Array.isArray(data.terminaisAtivos) ? data.terminaisAtivos : []
            });
          }
        });

        if (cloudClientes.length > 0) {
          const localLogosMap = new Map();
          const localCatsMap = new Map();
          const localModulosMap = new Map();
          (this.clientes || []).forEach(c => {
            if (c) {
              const k1 = (c.documento || '').replace(/\D/g, '');
              if (c.logoUrl) {
                if (k1) localLogosMap.set(k1, c.logoUrl);
                if (c.id) localLogosMap.set(c.id, c.logoUrl);
                if (c.chaveLicenca) localLogosMap.set(c.chaveLicenca, c.logoUrl);
              }
              if (c.categorias && c.categorias.length > 0) {
                if (k1) localCatsMap.set(k1, c.categorias);
                if (c.id) localCatsMap.set(c.id, c.categorias);
                if (c.chaveLicenca) localCatsMap.set(c.chaveLicenca, c.categorias);
              }
              if (c.modulos) {
                if (k1) localModulosMap.set(k1, c.modulos);
                if (c.id) localModulosMap.set(c.id, c.modulos);
                if (c.chaveLicenca) localModulosMap.set(c.chaveLicenca, c.modulos);
              }
            }
          });

          const dedupMap = new Map();
          for (const cCloud of cloudClientes) {
            const cnpjClean = (cCloud.documento || '').replace(/\D/g, '');
            const key = cnpjClean || cCloud.chaveLicenca || cCloud.id;

            const localLogo = localLogosMap.get(cCloud.chaveLicenca) || localLogosMap.get(cCloud.id) || localLogosMap.get(cnpjClean) || '';
            const logoUrlFinal = cCloud.logoUrl || localLogo || '';

            const localCats = localCatsMap.get(cCloud.chaveLicenca) || localCatsMap.get(cCloud.id) || localCatsMap.get(cnpjClean) || null;
            const catsFinal = (cCloud.categorias && cCloud.categorias.length > 0) ? cCloud.categorias : (localCats || ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos']);

            const localMods = localModulosMap.get(cCloud.chaveLicenca) || localModulosMap.get(cCloud.id) || localModulosMap.get(cnpjClean) || null;
            const modulosFinal = cCloud.modulos || localMods || this.modulosPadraoPorRamo[cCloud.ramoAtividade || 'adega'] || this.modulosPadraoPorRamo.adega;

            const itemFormatado = {
              ...cCloud,
              layoutPdv: cCloud.layoutPdv === 'classico' ? 'classico' : 'moderno',
              logoUrl: logoUrlFinal,
              categorias: catsFinal,
              modulos: modulosFinal
            };

            const existing = dedupMap.get(key);
            if (!existing) {
              dedupMap.set(key, {
                ...itemFormatado,
                terminaisAtivos: Array.isArray(itemFormatado.terminaisAtivos) ? [...itemFormatado.terminaisAtivos] : []
              });
            } else {
              if (!existing.logoUrl && itemFormatado.logoUrl) {
                existing.logoUrl = itemFormatado.logoUrl;
              }
              if ((!existing.categorias || existing.categorias.length === 0) && itemFormatado.categorias) {
                existing.categorias = itemFormatado.categorias;
              }
              if (itemFormatado.modulos) {
                existing.modulos = itemFormatado.modulos;
              }
              if (itemFormatado.moduloComandas !== undefined) {
                existing.moduloComandas = itemFormatado.moduloComandas;
              }
              if (itemFormatado.ramoAtividade) {
                existing.ramoAtividade = itemFormatado.ramoAtividade;
              }
              const combinedTerms = new Set([
                ...(Array.isArray(existing.terminaisAtivos) ? existing.terminaisAtivos : []),
                ...(Array.isArray(itemFormatado.terminaisAtivos) ? itemFormatado.terminaisAtivos : [])
              ]);
              existing.terminaisAtivos = Array.from(combinedTerms);
              if (itemFormatado.limiteTerminais) existing.limiteTerminais = itemFormatado.limiteTerminais;
            }
          }

          this.clientes = Array.from(dedupMap.values());
          this.renderMetrics();
          this.renderTabela();
        }
      } catch (err) {
        console.log('[Firebase Master] Erro ao carregar da nuvem:', err);
      }
    }
  },

  renderMetrics() {
    const ativas = this.clientes.filter(c => c && c.status === 'ativa');
    const bloqueadas = this.clientes.filter(c => c && c.status === 'bloqueada');
    const vencendo = this.clientes.filter(c => {
      if (!c || c.status !== 'ativa') return false;
      const dias = this.calcularDiasRestantes(c.vencimento);
      return dias <= 5 && dias >= 0;
    });
    const mrr = ativas.reduce((acc, c) => acc + (parseFloat(c.valorMensal) || 0), 0);

    const mrrEl = document.getElementById('metric-mrr');
    const ativasEl = document.getElementById('metric-ativas');
    const vencendoEl = document.getElementById('metric-vencendo');
    const bloqEl = document.getElementById('metric-bloqueadas');

    if (mrrEl) mrrEl.textContent = 'R$ ' + mrr.toFixed(2).replace('.', ',');
    if (ativasEl) ativasEl.textContent = ativas.length;
    if (vencendoEl) vencendoEl.textContent = vencendo.length;
    if (bloqEl) bloqEl.textContent = bloqueadas.length;
  },

  formatarDataExibicao(vencStr) {
    if (!vencStr) return 'Sem Data';
    try {
      const clean = vencStr.includes('T') ? vencStr.split('T')[0] : vencStr;
      const parts = clean.split('-');
      if (parts.length === 3) {
        return parts[2] + '/' + parts[1] + '/' + parts[0];
      }
      const d = new Date(vencStr);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
    } catch(e) {}
    return 'Data N/D';
  },

  calcularDiasRestantes(vencimentoStr) {
    if (!vencimentoStr) return 0;
    try {
      let clean = String(vencimentoStr).trim();
      if (clean.includes('T')) clean = clean.split('T')[0];

      let ano, mes, dia;
      if (clean.includes('-')) {
        const p = clean.split('-');
        ano = parseInt(p[0], 10);
        mes = parseInt(p[1], 10) - 1;
        dia = parseInt(p[2], 10);
      } else if (clean.includes('/')) {
        const p = clean.split('/');
        ano = parseInt(p[2], 10);
        mes = parseInt(p[1], 10) - 1;
        dia = parseInt(p[0], 10);
      } else {
        const d = new Date(clean);
        if (isNaN(d.getTime())) return 0;
        ano = d.getFullYear();
        mes = d.getMonth();
        dia = d.getDate();
      }

      const hoje = new Date();
      const dHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0);
      const dVenc = new Date(ano, mes, dia, 0, 0, 0, 0);

      const diffMs = dVenc.getTime() - dHoje.getTime();
      return Math.round(diffMs / (1000 * 60 * 60 * 24));
    } catch(e) {
      return 0;
    }
  },

  renderTabela() {
    const tbody = document.getElementById('master-table-tbody') || document.getElementById('tabela-clientes-tbody');
    if (!tbody) return;

    try {
      const termoBusca = (document.getElementById('master-search-input')?.value || document.getElementById('search-input')?.value || '').toLowerCase().trim();
      
      let lista = (this.clientes || []).filter(c => {
        if (!c) return false;
        if (this.filtroAtual === 'ativas') return c.status === 'ativa';
        if (this.filtroAtual === 'bloqueadas') return c.status === 'bloqueada';
        if (this.filtroAtual === 'vencendo') {
          const dias = this.calcularDiasRestantes(c.vencimento);
          return dias <= 5 && dias >= 0 && c.status === 'ativa';
        }
        return true;
      });

      if (termoBusca) {
        lista = lista.filter(c => 
          (c.nome && c.nome.toLowerCase().includes(termoBusca)) ||
          (c.documento && c.documento.includes(termoBusca)) ||
          (c.chaveLicenca && c.chaveLicenca.toLowerCase().includes(termoBusca))
        );
      }

      if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-dim);">Nenhum cliente encontrado.</td></tr>';
        return;
      }

      tbody.innerHTML = lista.map(c => {
        const diasRestantes = this.calcularDiasRestantes(c.vencimento);
        const isAtivo = c.status === 'ativa';

        let statusBadge = '';
        if (!isAtivo) {
          statusBadge = '<span class="badge badge-bloqueada">🛑 Bloqueada</span>';
        } else if (diasRestantes < 0) {
          statusBadge = '<span class="badge badge-bloqueada">⚠️ Vencida</span>';
        } else if (diasRestantes === 0) {
          statusBadge = '<span class="badge badge-vencendo" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); font-weight: 800;">⏳ Vence Hoje</span>';
        } else if (diasRestantes === 1) {
          statusBadge = '<span class="badge badge-vencendo" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-weight: 800;">⏳ Vence Amanhã</span>';
        } else if (diasRestantes <= 5) {
          statusBadge = '<span class="badge badge-vencendo">⏳ Vence em ' + diasRestantes + 'd</span>';
        } else {
          statusBadge = '<span class="badge badge-ativa">🟢 Ativa (' + diasRestantes + 'd)</span>';
        }

        const logoHtml = c.logoUrl && c.logoUrl.length > 5
          ? '<img src="' + c.logoUrl + '" style="width: 40px; height: 40px; object-fit: contain; border-radius: 8px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15);">'
          : '<div style="width: 40px; height: 40px; border-radius: 8px; background: #1e293b; display: flex; align-items: center; justify-content: center; font-size: 20px;">' + (c.icone || '🍷') + '</div>';

        const dataStr = this.formatarDataExibicao(c.vencimento);
        const maxTerm = parseInt(c.limiteTerminais) || 1;
        const terminaisUnicos = this.obterTerminaisDeduplicados(c.terminaisAtivos);
        const ativosTerm = terminaisUnicos.length;
        const isLotado = ativosTerm >= maxTerm;
        const termBadge = '<span class="badge-terminal ' + (isLotado ? 'lotado' : 'livre') + '">💻 ' + ativosTerm + '/' + maxTerm + ' PC(s)</span>';
        const exc = Array.isArray(c.categoriasExcluidas) ? c.categoriasExcluidas.map(s => s.toLowerCase().trim()) : [];
        const numCats = (c.categorias && Array.isArray(c.categorias)) ? c.categorias.filter(cat => !exc.includes(cat.toLowerCase().trim())).length : 0;

        return '<tr class="master-table-row">' +
            '<td class="cell-store">' +
              '<div style="display: flex; align-items: center; gap: 12px;">' +
                logoHtml +
                '<div>' +
                  '<strong style="color: var(--text-main); font-size: 14px; display: block;">' + c.nome + '</strong>' +
                  '<span style="font-size: 12px; color: var(--text-dim);">' + (c.documento || 'Sem Documento') + ' • <strong style="color: #a78bfa;">' + numCats + ' categorias</strong></span>' +
                '</div>' +
              '</div>' +
            '</td>' +
            '<td class="cell-chave" data-label="Chave">' +
              '<span class="mobile-td-label">🔑 Chave:</span>' +
              '<div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.08); padding: 4px 8px; border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2);">' +
                '<code style="font-family: monospace; font-size: 12px; font-weight: 700; color: #818cf8;">' + (c.chaveLicenca || c.id) + '</code>' +
                '<button type="button" onclick="MasterApp.copiarChaveLicenca(\'' + (c.chaveLicenca || c.id) + '\')" title="Copiar Chave de Licença" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #e2e8f0; border-radius: 6px; padding: 2px 6px; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.2s;" onmouseover="this.style.background=\'#4f46e5\'; this.style.color=\'#fff\';" onmouseout="this.style.background=\'rgba(255,255,255,0.08)\'; this.style.color=\'#e2e8f0\';">' +
                  '📋 Copiar' +
                '</button>' +
              '</div>' +
            '</td>' +
            '<td class="cell-contato" data-label="WhatsApp / Contato">' +
              '<span class="mobile-td-label">📱 Contato:</span>' +
              '<div>' +
                '<a href="https://wa.me/55' + (c.whatsapp || '').replace(/\D/g, '') + '" target="_blank" style="color: #38bdf8; font-size: 13px; font-weight: 700; text-decoration: none;">' + (c.whatsapp || '-') + '</a>' +
                '<span style="display: block; font-size: 11px; color: var(--text-dim);">' + (c.responsavel || '') + '</span>' +
              '</div>' +
            '</td>' +
            '<td class="cell-plano" data-label="Plano">' +
              '<span class="mobile-td-label">🏷️ Plano:</span>' +
              '<div>' +
                '<span style="font-size: 12px; color: var(--accent-cyan); font-weight: 700;">' + c.plano + '</span>' +
                '<span style="display: block; font-size: 11px; color: var(--text-dim);">R$ ' + parseFloat(c.valorMensal || 0).toFixed(2).replace('.', ',') + '/mês</span>' +
              '</div>' +
            '</td>' +
            '<td class="cell-venc" data-label="Vencimento">' +
              '<span class="mobile-td-label">📅 Vencimento:</span>' +
              '<strong style="font-family: monospace; font-size: 13px; color: var(--text-main);">' + dataStr + '</strong>' +
            '</td>' +
            '<td class="cell-status" data-label="Status">' +
              '<span class="mobile-td-label">⚡ Status:</span>' +
              '<div>' + statusBadge + '</div>' +
            '</td>' +
            '<td class="cell-term" data-label="Terminais">' +
              '<span class="mobile-td-label">💻 Terminais:</span>' +
              '<div>' + termBadge + '</div>' +
            '</td>' +
            '<td class="cell-acoes" style="text-align: right;">' +
              '<button type="button" class="btn-editar-modern" onclick="MasterApp.abrirModalEditarCliente(\'' + c.id + '\')">' +
                '✏️ Editar' +
              '</button>' +
            '</td>' +
          '</tr>';
      }).join('');
    } catch(err) {
      console.error('[MasterApp] Erro ao renderizar tabela:', err);
    }
  },

  abrirModalNovoCliente() {
    const modal = document.getElementById('modal-cliente');
    const form = document.getElementById('form-cliente');
    if (form) form.reset();

    const idInput = document.getElementById('cliente-id');
    const chaveInput = document.getElementById('cli-chave');
    const pinInput = document.getElementById('cli-pin-gerente');
    const limiteInput = document.getElementById('cli-limite-terminais');
    const termInfoBox = document.getElementById('cli-terminais-info-box');
    const vencInput = document.getElementById('cli-vencimento');
    const logoInput = document.getElementById('cli-logo-url');
    const catInput = document.getElementById('cli-categorias');
    const btnExcluir = document.getElementById('btn-excluir-cliente');

    const titleEl = document.getElementById('modal-cliente-title');
    if (titleEl) titleEl.innerText = '➕ Nova Licença / Cliente';
    if (idInput) idInput.value = '';
    if (btnExcluir) btnExcluir.style.display = 'none';
    if (chaveInput) chaveInput.value = 'LIC-FLOW-' + Math.floor(100000 + Math.random() * 900000);
    if (pinInput) pinInput.value = '1234';
    if (limiteInput) limiteInput.value = '1';
    if (termInfoBox) termInfoBox.style.display = 'none';
    if (logoInput) logoInput.value = '';
    
    const ramoSelect = document.getElementById('cli-ramo');
    if (ramoSelect) ramoSelect.value = 'adega';
    const layoutPdvSelect = document.getElementById('cli-layout-pdv');
    if (layoutPdvSelect) layoutPdvSelect.value = 'moderno';
    this.setModulosCheckboxes(this.modulosPadraoPorRamo.adega);

    if (catInput) catInput.value = this.presetsCategorias.adega.lista.join(', ');
    this.atualizarPreviewCategorias();
    
    this.renderSelectPlanos('Mensal Pro');

    const d = new Date();
    d.setDate(d.getDate() + 30);
    if (vencInput) vencInput.value = d.toISOString().split('T')[0];

    const moduloComandasSelect = document.getElementById('cli-modulo-comandas');
    if (moduloComandasSelect) moduloComandasSelect.value = 'mesas_e_comandas';

    this.previewLogo();
    if (modal) {
      document.body.classList.add('modal-open');
      modal.classList.add('active');
      const modalBody = modal.querySelector('.modal-body');
      if (modalBody) modalBody.scrollTop = 0;
    }
  },

  abrirModalEditarCliente(id) {
    const c = this.clientes.find(item => item && (item.id === id || item.chaveLicenca === id));
    if (!c) return;

    const modal = document.getElementById('modal-cliente');
    const idInput = document.getElementById('cliente-id');
    const nomeInput = document.getElementById('cli-nome');
    const docInput = document.getElementById('cli-documento');
    const respInput = document.getElementById('cli-responsavel');
    const zapInput = document.getElementById('cli-whatsapp');
    const ramoInput = document.getElementById('cli-ramo');
    const layoutPdvInput = document.getElementById('cli-layout-pdv');
    const iconeInput = document.getElementById('cli-icone');
    const logoInput = document.getElementById('cli-logo-url');
    const catInput = document.getElementById('cli-categorias');
    const valorInput = document.getElementById('cli-valor');
    const vencInput = document.getElementById('cli-vencimento');
    const chaveInput = document.getElementById('cli-chave');
    const pinInput = document.getElementById('cli-pin-gerente');
    const limiteInput = document.getElementById('cli-limite-terminais');
    const contagemTerm = document.getElementById('cli-terminais-contagem');
    const termInfoBox = document.getElementById('cli-terminais-info-box');
    const statusInput = document.getElementById('cli-status');
    const moduloComandasSelect = document.getElementById('cli-modulo-comandas');
    const btnExcluir = document.getElementById('btn-excluir-cliente');

    const titleEl = document.getElementById('modal-cliente-title');
    if (titleEl) titleEl.innerText = '✏️ Editar Cliente & Licença';
    if (idInput) idInput.value = c.id;
    if (nomeInput) nomeInput.value = c.nome || '';
    if (docInput) docInput.value = c.documento || '';
    if (respInput) respInput.value = c.responsavel || '';
    if (zapInput) zapInput.value = c.whatsapp || '';

    const ramo = c.ramoAtividade || 'adega';
    if (ramoInput) ramoInput.value = ramo;
    if (layoutPdvInput) layoutPdvInput.value = c.layoutPdv || 'moderno';
    if (iconeInput) iconeInput.value = c.icone || this.presetsCategorias[ramo]?.icone || '🍷';
    
    const modulos = c.modulos || this.modulosPadraoPorRamo[ramo] || this.modulosPadraoPorRamo.adega;
    this.setModulosCheckboxes(modulos);

    if (logoInput) logoInput.value = c.logoUrl || '';

    let catsAtuais = [];
    if (c.categorias && Array.isArray(c.categorias)) {
      const exc = Array.isArray(c.categoriasExcluidas) ? c.categoriasExcluidas.map(s => s.toLowerCase().trim()) : [];
      catsAtuais = c.categorias.filter(cat => !exc.includes(cat.toLowerCase().trim()));
    } else {
      catsAtuais = this.presetsCategorias[ramo]?.lista || this.presetsCategorias.adega.lista;
    }
    if (catInput) catInput.value = catsAtuais.join(', ');
    this.atualizarPreviewCategorias();
    
    this.renderSelectPlanos(c.plano || 'Mensal Pro');
    if (valorInput) valorInput.value = c.valorMensal || 89.90;
    if (vencInput) vencInput.value = c.vencimento ? (c.vencimento.includes('T') ? c.vencimento.split('T')[0] : c.vencimento) : '';
    if (chaveInput) chaveInput.value = c.chaveLicenca || c.id;
    if (pinInput) pinInput.value = c.pinGerente || '1234';
    if (limiteInput) limiteInput.value = c.limiteTerminais || 1;
    if (moduloComandasSelect) moduloComandasSelect.value = c.moduloComandas || 'mesas_e_comandas';
    
    const terminaisUnicos = this.obterTerminaisDeduplicados(c.terminaisAtivos);
    c.terminaisAtivos = terminaisUnicos;
    if (contagemTerm) contagemTerm.textContent = terminaisUnicos.length + ' / ' + (c.limiteTerminais || 1);
    if (termInfoBox) termInfoBox.style.display = 'block';

    if (statusInput) statusInput.value = c.status || 'ativa';
    if (btnExcluir) btnExcluir.style.display = 'block';

    this.renderListaTerminaisModal(c);
    this.previewLogo();
    this.atualizarFeedbackVencimentoModal();
    if (modal) {
      document.body.classList.add('modal-open');
      modal.classList.add('active');
      const modalBody = modal.querySelector('.modal-body');
      if (modalBody) modalBody.scrollTop = 0;
    }
  },

  fecharModalCliente() {
    const modal = document.getElementById('modal-cliente');
    if (modal) {
      modal.classList.remove('active');
      const modalBody = modal.querySelector('.modal-body');
      if (modalBody) modalBody.scrollTop = 0;
    }
    if (!document.querySelector('.modal-overlay.active')) {
      document.body.classList.remove('modal-open');
    }
  },

  async salvarCliente(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const idInput = document.getElementById('cliente-id');
    const id = idInput ? idInput.value : '';
    const chaveLicenca = document.getElementById('cli-chave')?.value.trim() || ('LIC-FLOW-' + Date.now().toString().slice(-6));
    const idFinal = id || ('CLI-' + chaveLicenca.slice(-4));

    const nome = document.getElementById('cli-nome')?.value.trim() || 'Cliente';
    const documento = document.getElementById('cli-documento')?.value.trim() || '';
    const responsavel = document.getElementById('cli-responsavel')?.value.trim() || '';
    const whatsapp = document.getElementById('cli-whatsapp')?.value.trim() || '';
    const ramoAtividade = document.getElementById('cli-ramo')?.value || 'adega';
    const layoutPdv = document.getElementById('cli-layout-pdv')?.value || 'moderno';
    const icone = document.getElementById('cli-icone')?.value || this.presetsCategorias[ramoAtividade]?.icone || '🍷';
    const modulos = this.getModulosCheckboxes();
    const logoUrl = document.getElementById('cli-logo-url')?.value.trim() || '';
    const categoriasRaw = document.getElementById('cli-categorias')?.value.trim() || '';
    const categorias = categoriasRaw ? categoriasRaw.split(',').map(s => s.trim()).filter(Boolean) : (this.presetsCategorias[ramoAtividade]?.lista || ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos']);

    const cExistente = this.clientes.find(item => item && (item.id === idFinal || item.chaveLicenca === chaveLicenca));

    const categoriasAnteriores = cExistente?.categorias || [];
    const removidas = categoriasAnteriores.filter(c => !categorias.some(nova => nova.toLowerCase() === c.toLowerCase()));
    let categoriasExcluidas = Array.isArray(cExistente?.categoriasExcluidas) ? [...cExistente.categoriasExcluidas] : [];
    removidas.forEach(r => {
      if (!categoriasExcluidas.some(x => x.toLowerCase() === r.toLowerCase())) {
        categoriasExcluidas.push(r);
      }
    });
    categoriasExcluidas = categoriasExcluidas.filter(c => !categorias.some(nova => nova.toLowerCase() === c.toLowerCase()));
    const plano = document.getElementById('cli-plano')?.value || 'Mensal Pro';
    const valorMensal = parseFloat(document.getElementById('cli-valor')?.value) || 89.90;
    const vencimento = document.getElementById('cli-vencimento')?.value || '2026-12-31';
    const status = document.getElementById('cli-status')?.value || 'ativa';
    const pinGerente = document.getElementById('cli-pin-gerente')?.value.trim() || '1234';
    const limiteTerminais = Math.max(1, parseInt(document.getElementById('cli-limite-terminais')?.value) || 1);
    const moduloComandas = document.getElementById('cli-modulo-comandas')?.value || 'mesas_e_comandas';

    const novoCliente = {
      id: idFinal,
      nome,
      razaoSocial: nome,
      documento,
      cnpj: documento,
      responsavel,
      whatsapp,
      ramoAtividade,
      layoutPdv,
      icone,
      modulos,
      moduloComandas,
      logoUrl,
      categorias,
      categoriasExcluidas,
      plano,
      valorMensal,
      vencimento,
      status,
      chaveLicenca,
      pinGerente,
      limiteTerminais,
      terminaisAtivos: Array.isArray(cExistente?.terminaisAtivos) ? cExistente.terminaisAtivos : []
    };

    const docClean = documento.replace(/\D/g, '');
    const idx = this.clientes.findIndex(c => 
      (id && c.id === id) ||
      (chaveLicenca && c.chaveLicenca === chaveLicenca) ||
      (docClean && (c.documento || '').replace(/\D/g, '') === docClean)
    );

    if (idx >= 0) {
      this.clientes[idx] = {
        ...this.clientes[idx],
        ...novoCliente
      };
    } else {
      this.clientes.unshift(novoCliente);
    }

    const btn = document.querySelector('#modal-cliente .btn-primary-action');
    const oldText = btn ? btn.innerHTML : 'Salvar Cliente';
    if (btn) btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;vertical-align:middle;"></span> Salvando...';

    await this.salvarDados(novoCliente.id);

    this.fecharModalCliente();
    this.renderMetrics();
    this.renderTabela();

    if (btn) btn.innerHTML = oldText;
    this.showToast('🎉 "' + nome + '" atualizada com sucesso!');
  },

  obterTerminaisDeduplicados(terminaisRaw) {
    if (!Array.isArray(terminaisRaw)) return [];
    
    const mapa = new Map();
    for (const term of terminaisRaw) {
      if (!term) continue;
      const isObjeto = typeof term === 'object';
      const id = isObjeto ? (term.id || term.deviceId || '').trim() : String(term).trim();
      if (!id) continue;

      if (!mapa.has(id)) {
        mapa.set(id, isObjeto ? term : { id: id, hostname: id, usuario: 'Operador', ultimoAcesso: null });
      } else {
        const existente = mapa.get(id);
        const existenteIsObjeto = existente && typeof existente === 'object';
        // Se o existente for string simples e o novo for objeto rico com hostname, atualiza!
        if (isObjeto && term.hostname && (!existenteIsObjeto || !existente.hostname || existente.hostname === id)) {
          mapa.set(id, term);
        }
      }
    }
    return Array.from(mapa.values());
  },

  async desvincularTerminaisClienteModal() {
    const idInput = document.getElementById('cliente-id');
    const id = idInput ? idInput.value : '';
    if (!id) return;

    const c = this.clientes.find(item => item && (item.id === id || item.chaveLicenca === id));
    if (!c) return;

    if (!confirm('Deseja realmente desvincular todos os computadores desta licença? Eles precisarão conectar novamente ao abrir o FlowPDV.')) {
      return;
    }

    c.terminaisAtivos = [];
    await this.salvarDados();
    
    const contagemTerm = document.getElementById('cli-terminais-contagem');
    if (contagemTerm) contagemTerm.textContent = '0 / ' + (c.limiteTerminais || 1);

    this.renderListaTerminaisModal(c);
    this.renderTabela();
    this.showToast('🔄 Computadores desvinculados com sucesso na nuvem!');
  },

  renderListaTerminaisModal(c) {
    const container = document.getElementById('cli-terminais-lista-cards');
    if (!container) return;

    const lista = this.obterTerminaisDeduplicados(c?.terminaisAtivos);
    c.terminaisAtivos = lista;

    if (lista.length === 0) {
      container.innerHTML = '<div style="font-size: 12px; color: var(--text-dim); padding: 8px 0; font-style: italic;">Nenhum computador conectado no momento.</div>';
      return;
    }

    container.innerHTML = lista.map((term, index) => {
      const isObjeto = term && typeof term === 'object';
      const termId = isObjeto ? (term.id || 'N/D') : term;
      const hostname = isObjeto && term.hostname && term.hostname !== termId && term.hostname !== 'Computador Local' ? term.hostname : `Computador ${index + 1}`;
      const usuario = isObjeto && term.usuario && term.usuario !== 'Operador' && term.usuario !== 'User' ? term.usuario : (index === 0 ? 'Douglas Batista' : 'Administrador');
      const dataStr = isObjeto && term.ultimoAcesso ? new Date(term.ultimoAcesso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Ativo';

      return `
        <div class="terminal-item-card">
          <div class="terminal-item-info">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 16px;">💻</span>
              <strong style="color: #38bdf8; font-size: 13px; font-family: 'JetBrains Mono'; font-weight: 800;">${hostname}</strong>
              <span class="badge-terminal-user">👤 ${usuario}</span>
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 3px; font-family: 'JetBrains Mono';">
              ID: <code style="color: #a5b4fc; background: rgba(255,255,255,0.06); padding: 1px 4px; border-radius: 3px;">${termId}</code> • <span style="color: #94a3b8;">${dataStr}</span>
            </div>
          </div>
          <button type="button" class="btn-desvincular-individual" onclick="MasterApp.desvincularTerminalIndividual('${c.id}', '${termId}')" title="Desvincular somente este computador">
            ❌ Desvincular
          </button>
        </div>
      `;
    }).join('');
  },

  async desvincularTerminalIndividual(clienteId, terminalId) {
    const c = this.clientes.find(item => item && (item.id === clienteId || item.chaveLicenca === clienteId));
    if (!c) return;

    if (!confirm('Deseja realmente desvincular este computador específico desta licença?')) {
      return;
    }

    let lista = this.obterTerminaisDeduplicados(c.terminaisAtivos);
    c.terminaisAtivos = lista.filter(t => {
      if (typeof t === 'string') return t !== terminalId;
      return t && t.id !== terminalId;
    });

    await this.salvarDados();
    this.renderTabela();
    this.renderListaTerminaisModal(c);

    const contagemTerm = document.getElementById('cli-terminais-contagem');
    if (contagemTerm) contagemTerm.textContent = (c.terminaisAtivos.length) + ' / ' + (c.limiteTerminais || 1);

    this.showToast('✅ Computador desvinculado com sucesso!');
  },

  async adicionarDias(id, dias) {
    const c = this.clientes.find(item => item.id === id || item.chaveLicenca === id);
    if (!c) return;

    const baseData = new Date(c.vencimento > new Date().toISOString().split('T')[0] ? c.vencimento : new Date());
    baseData.setDate(baseData.getDate() + dias);
    c.vencimento = baseData.toISOString().split('T')[0];
    c.status = 'ativa';

    this.renderMetrics();
    this.renderTabela();
    await this.salvarDados();

    // 🛡️ Registrar Log de Cortesia / Renovação de Licença no Firebase
    if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        const { db, collection, addDoc } = window.FirebaseDB;
        const tipoEvento = dias <= 15 ? 'cortesia_licenca' : 'renovacao_licenca';
        const dataFmt = this.formatarDataExibicao(c.vencimento);
        await addDoc(collection(db, "auditoria_lojas"), {
          chaveLicenca: c.chaveLicenca || c.id,
          razaoSocial: c.nome,
          tipo: tipoEvento,
          descricao: `Administrador concedeu +${dias} dias de ${dias <= 15 ? 'cortesia' : 'renovação'} (Novo Vencimento: ${dataFmt})`,
          operador: 'Painel Master Admin',
          terminalId: 'MASTER-ADMIN',
          criadoEm: new Date().toISOString(),
          dataHoraFormatada: new Date().toLocaleString('pt-BR')
        });
      } catch (errLog) {
        console.warn('Erro ao registrar log de auditoria:', errLog);
      }
    }

    this.renderMetrics();
    this.renderTabela();
    this.showToast('🎉 +' + dias + ' dias adicionados para "' + c.nome + '"!');
  },

  async toggleBloqueio(id) {
    const c = this.clientes.find(item => item.id === id || item.chaveLicenca === id);
    if (!c) return;

    c.status = c.status === 'ativa' ? 'bloqueada' : 'ativa';

    this.renderMetrics();
    this.renderTabela();
    await this.salvarDados();

    // 🛡️ Registrar Log de Bloqueio/Desbloqueio no Firebase
    if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        const { db, collection, addDoc } = window.FirebaseDB;
        await addDoc(collection(db, "auditoria_lojas"), {
          chaveLicenca: c.chaveLicenca || c.id,
          razaoSocial: c.nome,
          tipo: 'alteracao_status',
          descricao: `Status da licença alterado para ${c.status.toUpperCase()} pelo Administrador`,
          operador: 'Painel Master Admin',
          terminalId: 'MASTER-ADMIN',
          criadoEm: new Date().toISOString(),
          dataHoraFormatada: new Date().toLocaleString('pt-BR')
        });
      } catch (errLog) {}
    }

    this.renderMetrics();
    this.renderTabela();
    this.showToast('Status alterado para ' + c.status.toUpperCase());
  },

  async excluirClienteModal() {
    const idInput = document.getElementById('cliente-id');
    const chaveInput = document.getElementById('cli-chave');
    const id = (idInput ? idInput.value : '').trim();
    const chave = (chaveInput ? chaveInput.value : '').trim();
    
    if (!id && !chave) return;

    if (!confirm('Deseja realmente excluir esta licença permanentemente da nuvem e do sistema?')) return;

    const c = this.clientes.find(item => item && (item.id === id || item.chaveLicenca === id || item.chaveLicenca === chave || item.id === chave));
    const chaveAlvo = (c ? c.chaveLicenca : chave) || '';
    const idAlvo = (c ? c.id : id) || '';
    const docClean = c && c.documento ? c.documento.replace(/\D/g, '') : '';

    if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        const { db, deleteDoc, doc, collection, getDocs } = window.FirebaseDB;
        
        // 1. Tentar exclusão direta por ID e Chave
        const idsToDelete = new Set([id, chave, idAlvo, chaveAlvo].filter(Boolean));
        for (const docId of idsToDelete) {
          try {
            await deleteDoc(doc(db, 'licencas', docId));
          } catch(e) {}
        }

        // 2. Varrer a coleção do Firestore e deletar qualquer doc correspondente
        try {
          const snapshot = await getDocs(collection(db, 'licencas'));
          snapshot.forEach(async (d) => {
            const data = d.data() || {};
            const docId = d.id;
            const docCnpjClean = (data.documento || data.cnpj || '').replace(/\D/g, '');
            if (
              docId === id ||
              docId === chave ||
              docId === idAlvo ||
              docId === chaveAlvo ||
              (data.id && (data.id === id || data.id === idAlvo)) ||
              (data.chaveLicenca && (data.chaveLicenca === chave || data.chaveLicenca === chaveAlvo)) ||
              (docClean && docCnpjClean && docClean === docCnpjClean)
            ) {
              try {
                await deleteDoc(doc(db, 'licencas', docId));
              } catch(e) {}
            }
          });
        } catch(e) {}
      } catch (e) {
        console.error('Erro ao excluir no Firestore:', e);
      }
    }

    // 3. Remover localmente
    this.clientes = this.clientes.filter(item => {
      if (!item) return false;
      if (item.id === id || item.id === idAlvo) return false;
      if (item.chaveLicenca && (item.chaveLicenca === chave || item.chaveLicenca === chaveAlvo)) return false;
      if (docClean && item.documento && item.documento.replace(/\D/g, '') === docClean) return false;
      return true;
    });

    localStorage.setItem('flowpdv_master_clientes', JSON.stringify(this.clientes));
    this.fecharModalCliente();
    this.renderMetrics();
    this.renderTabela();
    this.showToast('🗑️ Licença excluída com sucesso da nuvem!');
  },

  previewLogo() {
    const url = document.getElementById('cli-logo-url')?.value.trim() || '';
    const box = document.getElementById('cli-logo-preview-box');
    const imgDiv = document.getElementById('cli-logo-img-preview');

    if (!box || !imgDiv) return;

    if (url && (url.startsWith('http') || url.startsWith('data:image'))) {
      imgDiv.innerHTML = '<img src="' + url + '" style="width: 100%; height: 100%; object-fit: contain;">';
      box.style.display = 'flex';
    } else {
      imgDiv.innerHTML = '';
      box.style.display = 'none';
    }
  },

  fazerUploadLogoComputador(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusTitle = document.getElementById('cli-logo-status-title');
    if (statusTitle) statusTitle.textContent = '⏳ Processando imagem...';

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 240;
        canvas.height = 240;

        ctx.clearRect(0, 0, 240, 240);
        const scale = Math.min(240 / img.width, 240 / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const dx = (240 - nw) / 2;
        const dy = (240 - nh) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, nw, nh);

        const dataUrl = canvas.toDataURL('image/png');
        
        const inputUrl = document.getElementById('cli-logo-url');
        if (inputUrl) {
          inputUrl.value = dataUrl;
        }

        if (statusTitle) statusTitle.textContent = '🎉 Foto do computador pronta!';
        this.previewLogo();
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  },

  showToast(msg) {
    let toast = document.getElementById('master-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'master-toast';
      toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 14px 22px; border-radius: 10px; font-weight: 800; font-size: 14px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4); z-index: 99999; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateY(100px); opacity: 0; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2);';
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 3500);
  },

  bindMascaras() {
    const docInput = document.getElementById('cli-documento');
    const zapInput = document.getElementById('cli-whatsapp');
    const searchInput = document.getElementById('master-search-input');

    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderTabela());
    }

    if (docInput) {
      docInput.addEventListener('input', (e) => {
        e.target.value = this.formatarDocumento(e.target.value);
      });
    }

    if (zapInput) {
      zapInput.addEventListener('input', (e) => {
        e.target.value = this.formatarTelefone(e.target.value);
      });
    }
  },

  formatarDocumento(v) {
    if (!v) return '';
    v = v.replace(/\D/g, '');
    if (v.length <= 11) {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
               .replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
               .replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else {
      v = v.substring(0, 14);
      return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
               .replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4')
               .replace(/^(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3')
               .replace(/^(\d{2})(\d{1,3})/, '$1.$2');
    }
  },

  formatarTelefone(v) {
    if (!v) return '';
    v = v.replace(/\D/g, '').substring(0, 11);
    if (v.length > 10) {
      return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (v.length > 6) {
      return v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (v.length > 2) {
      return v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
    return v;
  },

  setFiltro(filtro) {
    this.filtroAtual = filtro;
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.classList.remove('active'));
    if (window.event && window.event.target) window.event.target.classList.add('active');
    this.renderTabela();
  },

  setDiasRapidosForm(dias) {
    const input = document.getElementById('cli-vencimento');
    if (!input) return;
    const d = new Date();
    d.setDate(d.getDate() + dias);
    input.value = d.toISOString().split('T')[0];
    this.atualizarFeedbackVencimentoModal();
  },

  adicionarDiasPersonalizadosForm() {
    const inputDias = document.getElementById('cli-dias-add');
    const inputVenc = document.getElementById('cli-vencimento');
    const dias = parseInt(inputDias?.value) || 30;
    if (!inputVenc) return;

    const base = new Date(inputVenc.value > new Date().toISOString().split('T')[0] ? inputVenc.value : new Date());
    base.setDate(base.getDate() + dias);
    inputVenc.value = base.toISOString().split('T')[0];
    this.atualizarFeedbackVencimentoModal();
  },

  atualizarFeedbackVencimentoModal() {
    const inputVenc = document.getElementById('cli-vencimento');
    const feedbackEl = document.getElementById('modal-venc-feedback');
    if (!inputVenc || !feedbackEl) return;

    const val = inputVenc.value;
    if (!val) {
      feedbackEl.style.display = 'none';
      return;
    }

    const dias = this.calcularDiasRestantes(val);
    feedbackEl.style.display = 'inline-block';

    if (dias < 0) {
      feedbackEl.style.background = 'rgba(239, 68, 68, 0.2)';
      feedbackEl.style.color = '#f87171';
      feedbackEl.style.border = '1px solid rgba(239, 68, 68, 0.4)';
      feedbackEl.textContent = `⚠️ Vencida (há ${Math.abs(dias)}d)`;
    } else if (dias === 0) {
      feedbackEl.style.background = 'rgba(239, 68, 68, 0.2)';
      feedbackEl.style.color = '#f87171';
      feedbackEl.style.border = '1px solid rgba(239, 68, 68, 0.4)';
      feedbackEl.textContent = '⏳ Vence Hoje (23:59)';
    } else if (dias === 1) {
      feedbackEl.style.background = 'rgba(245, 158, 11, 0.2)';
      feedbackEl.style.color = '#fbbf24';
      feedbackEl.style.border = '1px solid rgba(245, 158, 11, 0.4)';
      feedbackEl.textContent = '⏳ Vence Amanhã';
    } else {
      feedbackEl.style.background = 'rgba(16, 185, 129, 0.2)';
      feedbackEl.style.color = '#34d399';
      feedbackEl.style.border = '1px solid rgba(16, 185, 129, 0.4)';
      feedbackEl.textContent = `🟢 Ativa (${dias}d restantes)`;
    }
  },

  // =========================================================================
  // GESTÃO DE PLANOS & MENSALIDADES (CONFIGURAÇÃO DINÂMICA)
  // =========================================================================
  carregarPlanos() {
    const saved = localStorage.getItem('flowpdv_master_planos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.planos = parsed;
          this.renderSelectPlanos();
          return;
        }
      } catch(e) {}
    }
    this.planos = [...this.planosPadrao];
    this.salvarPlanosLocal();
    this.renderSelectPlanos();
  },

  salvarPlanosLocal() {
    localStorage.setItem('flowpdv_master_planos', JSON.stringify(this.planos));
  },

  async sincronizarPlanosFirestore() {
    if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        const { db, doc, getDoc, setDoc } = window.FirebaseDB;
        const snap = await getDoc(doc(db, 'config_master', 'planos'));
        if (snap && snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.lista) && data.lista.length > 0) {
            this.planos = data.lista;
            this.salvarPlanosLocal();
            this.renderSelectPlanos();
            return;
          }
        }
        // Se a nuvem não tiver dados de planos, sobe os planos padrão
        await setDoc(doc(db, 'config_master', 'planos'), {
          lista: this.planos.length > 0 ? this.planos : this.planosPadrao,
          atualizadoEm: new Date().toISOString()
        }, { merge: true });
      } catch(e) {
        console.log('[Firebase Master] Erro ao sincronizar planos:', e);
      }
    }
  },

  iniciarOuvintePlanosRealtime() {
    if (window.FirebaseDB && window.FirebaseDB.db && window.FirebaseDB.onSnapshot) {
      try {
        const { db, doc, onSnapshot } = window.FirebaseDB;
        onSnapshot(doc(db, 'config_master', 'planos'), (snap) => {
          if (snap && snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.lista) && data.lista.length > 0) {
              this.planos = data.lista;
              this.salvarPlanosLocal();
              this.renderSelectPlanos();
              if (document.getElementById('modal-planos')?.classList.contains('active')) {
                this.renderListaPlanosModal();
              }
            }
          }
        });
      } catch(e) {}
    }
  },

  async salvarPlanosNuvem() {
    this.salvarPlanosLocal();
    this.renderSelectPlanos();
    if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        const { db, doc, setDoc } = window.FirebaseDB;
        await setDoc(doc(db, 'config_master', 'planos'), {
          lista: this.planos,
          atualizadoEm: new Date().toISOString()
        }, { merge: true });
      } catch(e) {
        console.log('[Firebase Master] Erro ao salvar planos na nuvem:', e);
      }
    }
  },

  renderSelectPlanos(selecionado = '') {
    const select = document.getElementById('cli-plano');
    if (!select) return;

    if (!Array.isArray(this.planos) || this.planos.length === 0) {
      this.planos = [...this.planosPadrao];
    }

    const valorAtual = selecionado || select.value;
    select.innerHTML = '';

    this.planos.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nome;
      opt.dataset.valor = p.valor;
      opt.dataset.periodo = p.periodo || 'mês';
      
      const valorFmt = (parseFloat(p.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const periodoTexto = p.periodo ? (p.periodo.startsWith('/') ? p.periodo : `/ ${p.periodo}`) : '/ mês';
      opt.textContent = `${p.nome} (R$ ${valorFmt} ${periodoTexto})`;

      if (valorAtual && (valorAtual === p.nome || valorAtual === p.id || valorAtual.startsWith(p.nome))) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    this.atualizarValorPlano();
  },

  atualizarValorPlano() {
    const select = document.getElementById('cli-plano');
    const inputValor = document.getElementById('cli-valor');
    if (!select || !inputValor) return;

    const opt = select.options[select.selectedIndex];
    if (opt && opt.dataset.valor) {
      inputValor.value = parseFloat(opt.dataset.valor) || 89.90;
    } else {
      const planoNome = select.value;
      const p = (this.planos || []).find(item => item.nome === planoNome || item.id === planoNome);
      inputValor.value = p ? p.valor : 89.90;
    }
  },

  abrirModalPlanos() {
    const modal = document.getElementById('modal-planos');
    if (!modal) return;
    this.cancelarEdicaoPlano();
    this.renderListaPlanosModal();
    document.body.classList.add('modal-open');
    modal.classList.add('active');
  },

  fecharModalPlanos() {
    const modal = document.getElementById('modal-planos');
    if (modal) modal.classList.remove('active');
    if (!document.querySelector('.modal-overlay.active')) {
      document.body.classList.remove('modal-open');
    }
    this.renderSelectPlanos();
  },

  renderListaPlanosModal() {
    const container = document.getElementById('lista-planos-container');
    if (!container) return;

    if (!this.planos || this.planos.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-dim); font-size: 13px;">
          Nenhum plano cadastrado. Crie um novo plano acima!
        </div>
      `;
      return;
    }

    container.innerHTML = this.planos.map(p => {
      const valorFmt = (parseFloat(p.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const periodoTexto = p.periodo ? (p.periodo.startsWith('/') ? p.periodo : `/ ${p.periodo}`) : '/ mês';
      
      return `
        <div class="plano-card-item">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
            <span style="font-size: 18px; flex-shrink: 0;">🏷️</span>
            <div style="min-width: 0; overflow: hidden;">
              <div style="font-weight: 800; font-size: 14px; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nome}</div>
              <div style="font-size: 11px; color: var(--text-dim);">${p.periodo === 'mês' ? 'Mensalidade Padrão' : 'Plano Recorrente'}</div>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
            <div style="text-align: right; min-width: 125px;">
              <div style="font-size: 15px; font-weight: 900; color: var(--accent-green); font-family: 'JetBrains Mono', monospace; line-height: 1.2;">
                R$ ${valorFmt}
              </div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; line-height: 1.2;">
                ${periodoTexto}
              </div>
            </div>
            <div style="display: flex; gap: 6px; flex-shrink: 0;">
              <button type="button" class="btn-action-icon edit" onclick="MasterApp.editarPlano('${p.id}')" title="Editar Plano">
                ✏️
              </button>
              <button type="button" class="btn-action-icon delete" onclick="MasterApp.excluirPlano('${p.id}')" title="Excluir Plano">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  salvarPlano(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const idInput = document.getElementById('plano-id');
    const nomeInput = document.getElementById('plano-nome');
    const valorInput = document.getElementById('plano-valor');
    const periodoSelect = document.getElementById('plano-periodo');

    const id = idInput ? idInput.value.trim() : '';
    const nome = nomeInput ? nomeInput.value.trim() : '';
    const valor = parseFloat(valorInput ? valorInput.value : 0) || 0;
    const periodo = periodoSelect ? periodoSelect.value : 'mês';

    if (!nome) {
      this.showToast('⚠️ Informe o nome do plano!', 'error');
      return;
    }
    if (valor <= 0) {
      this.showToast('⚠️ Informe um valor válido para o plano!', 'error');
      return;
    }

    if (id) {
      // Editar existente
      const idx = this.planos.findIndex(p => p.id === id);
      if (idx >= 0) {
        this.planos[idx] = { ...this.planos[idx], nome, valor, periodo };
        this.showToast(`✨ Plano "${nome}" atualizado com sucesso!`, 'success');
      }
    } else {
      // Criar novo
      const novoId = 'PLN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      this.planos.push({
        id: novoId,
        nome,
        valor,
        periodo
      });
      this.showToast(`🎉 Novo plano "${nome}" criado com sucesso!`, 'success');
    }

    this.salvarPlanosNuvem();
    this.cancelarEdicaoPlano();
    this.renderListaPlanosModal();
  },

  editarPlano(id) {
    const p = this.planos.find(item => item.id === id);
    if (!p) return;

    document.getElementById('plano-id').value = p.id;
    document.getElementById('plano-nome').value = p.nome;
    document.getElementById('plano-valor').value = p.valor;
    document.getElementById('plano-periodo').value = p.periodo || 'mês';

    document.getElementById('plano-form-title').innerHTML = '<span>✏️</span> Editar Plano: ' + p.nome;
    document.getElementById('btn-salvar-plano').textContent = '💾 Atualizar Plano';
    document.getElementById('btn-cancelar-edicao-plano').style.display = 'inline-block';
    
    document.getElementById('plano-nome').focus();
  },

  cancelarEdicaoPlano() {
    const form = document.getElementById('form-cadastrar-plano');
    if (form) form.reset();
    document.getElementById('plano-id').value = '';
    document.getElementById('plano-form-title').innerHTML = '<span>➕</span> Novo Plano';
    document.getElementById('btn-salvar-plano').textContent = '💾 Salvar Plano';
    document.getElementById('btn-cancelar-edicao-plano').style.display = 'none';
  },

  async excluirPlano(id) {
    const p = this.planos.find(item => item.id === id);
    if (!p) return;

    if (this.planos.length <= 1) {
      this.showToast('⚠️ Você precisa manter pelo menos 1 plano cadastrado no sistema.', 'warning');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o plano "${p.nome}" (R$ ${p.valor})?`)) {
      this.planos = this.planos.filter(item => item.id !== id);
      await this.salvarPlanosNuvem();
      this.cancelarEdicaoPlano();
      this.renderListaPlanosModal();
      this.showToast(`🗑️ Plano "${p.nome}" excluído.`, 'info');
    }
  },

  showToast(mensagem, tipo = 'success') {
    let toastContainer = document.getElementById('master-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'master-toast-container';
      toastContainer.style.cssText = 'position: fixed; top: 24px; right: 24px; z-index: 9999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none;';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const isSuccess = tipo === 'success';
    toast.style.cssText = `
      background: ${isSuccess ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #1e293b, #0f172a)'};
      color: #ffffff;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 20px ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'};
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid rgba(255,255,255,0.2);
      transform: translateY(-20px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto;
      max-width: 420px;
    `;
    toast.innerHTML = `<span>${mensagem}</span>`;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateY(-20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  copiarChaveLicenca(chave) {
    if (!chave) return;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(chave).then(() => {
          this.showToast('📋 Chave copiada: ' + chave, 'success');
        }).catch(() => {
          this.fallbackCopiar(chave);
        });
      } else {
        this.fallbackCopiar(chave);
      }
    } catch(e) {
      this.fallbackCopiar(chave);
    }
  },

  fallbackCopiar(texto) {
    const tempInput = document.createElement('input');
    tempInput.value = texto;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      this.showToast('📋 Chave copiada: ' + texto, 'success');
    } catch (err) {}
    document.body.removeChild(tempInput);
  },

  // ==========================================
  // GESTÃO DE AUDITORIA & LOGS EM TEMPO REAL
  // ==========================================
  logsAuditoria: [],

  abrirModalAuditoria() {
    try {
      const modal = document.getElementById('modal-auditoria');
      if (modal) modal.classList.add('active');
      this.preencherSelectLojasAuditoria();
      this.carregarLogsAuditoria();
    } catch (err) {
      console.error('Erro ao abrir modal de auditoria:', err);
    }
  },

  fecharModalAuditoria() {
    const modal = document.getElementById('modal-auditoria');
    if (modal) modal.classList.remove('active');
  },

  preencherSelectLojasAuditoria() {
    try {
      const select = document.getElementById('filtro-auditoria-loja');
      if (!select) return;
      const valorAtual = select.value || 'todas';

      let html = '<option value="todas">Todas as Lojas</option>';
      const listaClientes = Array.isArray(this.clientes) ? this.clientes : [];
      const clientesOrdenados = [...listaClientes].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
      clientesOrdenados.forEach(c => {
        const nome = c.nome || c.razaoSocial || c.id;
        const chave = c.chaveLicenca || c.id;
        html += `<option value="${chave}">${c.icone || '🏪'} ${nome} (${chave})</option>`;
      });

      select.innerHTML = html;
      select.value = valorAtual;
    } catch (err) {
      console.error('Erro ao preencher select de lojas:', err);
    }
  },

  async carregarLogsAuditoria() {
    const tbody = document.getElementById('tabela-auditoria-tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px; color: #94a3b8;">⏳ Carregando histórico de auditoria...</td></tr>`;
    }

    try {
      if (!window.FirebaseDB || !window.FirebaseDB.db) {
        throw new Error('Banco de dados Firebase não disponível.');
      }
      const { db, collection, getDocs, query, orderBy, limit } = window.FirebaseDB;
      const colRef = collection(db, "auditoria_lojas");
      let snap;

      try {
        if (typeof query === 'function' && typeof orderBy === 'function' && typeof limit === 'function') {
          const q = query(colRef, orderBy("criadoEm", "desc"), limit(200));
          snap = await getDocs(q);
        } else {
          snap = await getDocs(colRef);
        }
      } catch (errQ) {
        snap = await getDocs(colRef);
      }

      const lista = [];
      if (snap && typeof snap.forEach === 'function') {
        snap.forEach(d => {
          const data = d.data();
          if (data) lista.push({ id: d.id, ...data });
        });
      }

      // Ordenar por data decrescente
      lista.sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0));
      this.logsAuditoria = lista;

      this.filtrarLogsAuditoria();
    } catch (err) {
      console.error('Erro ao carregar auditoria:', err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px; color: #ef4444;">Erro ao carregar logs de auditoria: ${err.message}</td></tr>`;
      }
    }
  },

  filtrarLogsAuditoria() {
    try {
      const filtroLoja = document.getElementById('filtro-auditoria-loja')?.value || 'todas';
      const filtroTipo = document.getElementById('filtro-auditoria-tipo')?.value || 'todos';

      let filtrados = Array.isArray(this.logsAuditoria) ? [...this.logsAuditoria] : [];

      if (filtroLoja !== 'todas') {
        filtrados = filtrados.filter(l => (l.chaveLicenca || '').toUpperCase() === filtroLoja.toUpperCase());
      }

      if (filtroTipo !== 'todos') {
        filtrados = filtrados.filter(l => l.tipo === filtroTipo);
      }

      this.renderTabelaAuditoria(filtrados);
    } catch (err) {
      console.error('Erro ao filtrar logs:', err);
    }
  },

  getBadgeTipoAuditoria(tipo) {
    const mapa = {
      'cortesia': { label: '🎁 Cortesia PDV', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.35)' },
      'cortesia_licenca': { label: '🎁 Cortesia Licença', bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.35)' },
      'renovacao_licenca': { label: '🔄 Renovação', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
      'alteracao_status': { label: '🔒 Status', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
      'exclusao_produto': { label: '🗑️ Exclusão', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
      'cadastro_produto': { label: '➕ Cadastro', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
      'edicao_produto': { label: '✏️ Edição', bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' },
      'ajuste_estoque': { label: '📦 Ajuste Estoque', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
      'importacao_planilha': { label: '📊 Importação', bg: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: 'rgba(14, 165, 233, 0.35)' },
      'fechamento_caixa': { label: '💰 Fech. Caixa', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
      'abertura_caixa': { label: '🔓 Abert. Caixa', bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.35)' },
      'sangria_caixa': { label: '💸 Sangria', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
      'cancelamento_venda': { label: '⚡ Cancelamento', bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.35)' }
    };
    const b = mapa[tipo] || { label: 'ℹ️ ' + (tipo || 'Evento'), bg: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)' };
    return `<span style="font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; background: ${b.bg}; color: ${b.color}; border: 1px solid ${b.border}; display: inline-block; white-space: nowrap;">${b.label}</span>`;
  },

  renderTabelaAuditoria(logs) {
    const tbody = document.getElementById('tabela-auditoria-tbody');
    const countEl = document.getElementById('auditoria-total-count');
    if (countEl) countEl.textContent = logs ? logs.length : 0;

    if (!tbody) return;

    if (!logs || logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8;">Nenhum registro de auditoria encontrado para os filtros selecionados.</td></tr>`;
      return;
    }

    const MAX_DESC = 70;

    tbody.innerHTML = logs.map((l, idx) => {
      const dataHora = l.dataHoraFormatada || (l.criadoEm ? new Date(l.criadoEm).toLocaleString('pt-BR') : 'Data N/D');
      const badge = this.getBadgeTipoAuditoria(l.tipo);
      const descFull = l.descricao || 'Sem detalhes';
      
      // Conteúdo da descrição / botão
      let conteudoDescricao = '';
      if (l.tipo === 'cortesia') {
        conteudoDescricao = `<button type="button" onclick="MasterApp.abrirModalDetalheLog(${idx})" style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 11px; font-weight: 700; cursor: pointer; padding: 4px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='rgba(56,189,248,0.25)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='rgba(56,189,248,0.12)'; this.style.transform='none'">🔍 Ver detalhes</button>`;
      } else {
        conteudoDescricao = `<span>${descFull}</span>`;
      }

      return `
        <tr style="border-bottom: 1px solid #334155; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 10px 12px; font-family: 'JetBrains Mono'; font-size: 11.5px; color: #cbd5e1; white-space: nowrap;">${dataHora}</td>
          <td style="padding: 10px 12px;">
            <strong style="color: #fff; display: block; font-size: 12.5px;">${l.razaoSocial || 'Loja'}</strong>
            <span style="font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono';">${l.chaveLicenca || ''}</span>
          </td>
          <td style="padding: 10px 12px; font-weight: 700; color: #e2e8f0; font-size: 12.5px;">👤 ${l.operador || 'Operador'}</td>
          <td style="padding: 10px 12px;">${badge}</td>
          <td style="padding: 10px 12px; color: #e2e8f0; line-height: 1.4; font-size: 12px; max-width: 320px;">
            ${conteudoDescricao}
          </td>
          <td style="padding: 10px 8px; text-align: center; width: 40px;">
            <button type="button" onclick="MasterApp.excluirLogIndividual('${l.id}')" title="Excluir este registro" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: #f87171; border-radius: 6px; width: 30px; height: 30px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.3)'; this.style.borderColor='#f87171';" onmouseout="this.style.background='rgba(239,68,68,0.1)'; this.style.borderColor='rgba(239,68,68,0.25)';">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ---------------------------------------------------------------
  // RESOLVER HOSTNAME DO COMPUTADOR
  // ---------------------------------------------------------------
  resolverHostnameLog(log) {
    if (!log) return 'Computador';
    if (log.hostname && log.hostname !== 'Computador' && !log.hostname.startsWith('TERM-')) {
      return log.hostname;
    }
    // Tenta encontrar o hostname a partir dos terminais cadastrados na licença
    if (log.chaveLicenca && Array.isArray(this.clientes)) {
      const cli = this.clientes.find(c => c && (
        (c.chaveLicenca && c.chaveLicenca.toUpperCase() === log.chaveLicenca.toUpperCase()) ||
        (c.documento && c.documento.replace(/\D/g, '') === (log.chaveLicenca || '').replace(/\D/g, ''))
      ));
      if (cli && Array.isArray(cli.terminaisAtivos)) {
        const t = cli.terminaisAtivos.find(term => {
          const id = typeof term === 'string' ? term : (term.id || term.deviceId);
          return id === log.terminalId;
        });
        if (t && typeof t === 'object' && t.hostname) {
          return t.hostname;
        }
      }
    }
    return log.hostname || log.terminalId || 'Computador';
  },

  // ---------------------------------------------------------------
  // MODAL DE DETALHES DO LOG DE AUDITORIA
  // ---------------------------------------------------------------
  abrirModalDetalheLog(idx) {
    const filtroLoja = document.getElementById('filtro-auditoria-loja')?.value || 'todas';
    const filtroTipo = document.getElementById('filtro-auditoria-tipo')?.value || 'todos';

    let lista = Array.isArray(this.logsAuditoria) ? [...this.logsAuditoria] : [];
    if (filtroLoja !== 'todas') {
      lista = lista.filter(l => (l.chaveLicenca || '').toUpperCase() === filtroLoja.toUpperCase());
    }
    if (filtroTipo !== 'todos') {
      lista = lista.filter(l => l.tipo === filtroTipo);
    }

    const log = lista[idx];
    if (!log) return;

    const modal = document.getElementById('modal-detalhe-log');
    if (!modal) return;

    const dataHora = log.dataHoraFormatada || (log.criadoEm ? new Date(log.criadoEm).toLocaleString('pt-BR') : 'Data N/D');
    const badge = this.getBadgeTipoAuditoria(log.tipo);
    const hostnameResolvido = this.resolverHostnameLog(log);

    // Formatar detalhes extras (itens de cortesia, etc.)
    let detalhesExtra = '';
    if (log.detalhes && typeof log.detalhes === 'object') {
      const det = log.detalhes;

      // Motivo da cortesia
      const motivoTexto = det.motivo || '';
      if (motivoTexto) {
        detalhesExtra += `
          <div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 10px 12px;">
            <strong style="color: #fbbf24; font-size: 11px;">📝 Motivo da Cortesia:</strong>
            <span style="color: #e2e8f0; font-size: 13px; margin-left: 6px; font-weight: 600;">${motivoTexto}</span>
          </div>`;
      }

      // Se tiver lista de itens (cortesia)
      if (Array.isArray(det.itens) && det.itens.length > 0) {
        detalhesExtra += `
          <div style="background: rgba(168, 85, 247, 0.06); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 10px; padding: 12px;">
            <strong style="color: #c084fc; font-size: 12px; display: block; margin-bottom: 8px;">🛒 Itens da Cortesia (${det.itens.length}):</strong>
            <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <th style="text-align: left; padding: 4px 8px; color: #94a3b8; font-weight: 600;">Produto</th>
                  <th style="text-align: center; padding: 4px 8px; color: #94a3b8; font-weight: 600;">Qtd</th>
                  <th style="text-align: right; padding: 4px 8px; color: #94a3b8; font-weight: 600;">Preço Un.</th>
                </tr>
              </thead>
              <tbody>
                ${det.itens.map(item => {
                  const preco = parseFloat(item.precoVenda || item.preco || item.valor || item.precoUnitario || 0);
                  return `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 5px 8px; color: #e2e8f0; font-weight: 600;">${item.nome || 'Produto'}</td>
                    <td style="padding: 5px 8px; text-align: center; color: #94a3b8; font-family: 'JetBrains Mono';">${item.quantidade || 1}x</td>
                    <td style="padding: 5px 8px; text-align: right; color: #34d399; font-family: 'JetBrains Mono'; font-weight: 700;">R$ ${preco.toFixed(2).replace('.', ',')}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`;
      }

      // Valor total original
      if (det.valorOriginal !== undefined) {
        detalhesExtra += `
          <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; padding: 6px 12px; background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 8px;">
            <span style="font-size: 12px; color: #94a3b8;">💰 Total da cortesia:</span>
            <strong style="font-family: 'JetBrains Mono'; color: #f87171; font-size: 15px;">R$ ${parseFloat(det.valorOriginal).toFixed(2).replace('.', ',')}</strong>
          </div>`;
      }
    }

    // Para logs que NÃO são cortesia, mostrar a descrição normal
    const isCortesia = log.tipo === 'cortesia' && log.detalhes && (log.detalhes.motivo || (Array.isArray(log.detalhes.itens) && log.detalhes.itens.length > 0));
    const descricaoBloco = isCortesia ? '' : `
        <div style="background: rgba(14, 165, 233, 0.04); border: 1px solid rgba(14, 165, 233, 0.15); border-radius: 10px; padding: 12px 14px;">
          <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 6px;">📋 Descrição</span>
          <p style="color: #e2e8f0; font-size: 13px; line-height: 1.6; margin: 0; word-break: break-word;">${log.descricao || 'Sem detalhes'}</p>
        </div>`;

    document.getElementById('detalhe-log-conteudo').innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <!-- Header com badge e data -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          ${badge}
          <span style="font-family: 'JetBrains Mono'; font-size: 12px; color: #94a3b8;">🕐 ${dataHora}</span>
        </div>

        <!-- Informações principais -->
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid #334155; border-radius: 8px; padding: 10px 12px;">
            <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 3px;">Estabelecimento</span>
            <strong style="color: #fff; font-size: 13px;">${log.razaoSocial || 'Loja'}</strong>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid #334155; border-radius: 8px; padding: 10px 12px;">
            <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 3px;">Operador</span>
            <strong style="color: #e2e8f0; font-size: 13px;">👤 ${log.operador || 'Operador'}</strong>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid #334155; border-radius: 8px; padding: 10px 12px;">
            <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 3px;">Licença</span>
            <code style="color: #818cf8; font-size: 12px; font-family: 'JetBrains Mono'; font-weight: 700;">${log.chaveLicenca || 'N/D'}</code>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid #334155; border-radius: 8px; padding: 10px 12px;">
            <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 3px;">Computador</span>
            <code style="color: #38bdf8; font-size: 12px; font-family: 'JetBrains Mono'; font-weight: 700;">${hostnameResolvido}</code>
          </div>
        </div>

        ${descricaoBloco}
        ${detalhesExtra}
      </div>
    `;

    modal.classList.add('active');
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = 0;
  },

  fecharModalDetalheLog() {
    const modal = document.getElementById('modal-detalhe-log');
    if (modal) {
      modal.classList.remove('active');
      const modalBody = modal.querySelector('.modal-body');
      if (modalBody) modalBody.scrollTop = 0;
    }
  },

  // ---------------------------------------------------------------
  // EXCLUIR LOG INDIVIDUAL
  // ---------------------------------------------------------------
  async excluirLogIndividual(logId) {
    if (!logId) return;
    if (!confirm('Deseja excluir este registro de auditoria?')) return;

    try {
      if (!window.FirebaseDB || !window.FirebaseDB.db) {
        throw new Error('Firebase não disponível.');
      }
      const { db, deleteDoc, doc } = window.FirebaseDB;
      await deleteDoc(doc(db, "auditoria_lojas", logId));

      // Remover da lista local
      if (Array.isArray(this.logsAuditoria)) {
        this.logsAuditoria = this.logsAuditoria.filter(l => l.id !== logId);
      }

      this.filtrarLogsAuditoria();
      this.showToast('🗑️ Registro excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir log:', err);
      this.showToast('Erro ao excluir: ' + err.message, 'error');
    }
  },

  async limparLogsAntigos() {
    if (!confirm('Deseja excluir do Firebase todos os logs de auditoria com mais de 30 dias?\n\nIsso libera espaço no banco e mantém apenas o histórico do último mês.')) {
      return;
    }

    try {
      if (!window.FirebaseDB || !window.FirebaseDB.db) {
        throw new Error('Banco de dados Firebase não disponível.');
      }
      const { db, collection, getDocs, deleteDoc, doc } = window.FirebaseDB;
      const limiteData = new Date();
      limiteData.setDate(limiteData.getDate() - 30);
      const limiteIso = limiteData.toISOString();

      const colRef = collection(db, "auditoria_lojas");
      const snap = await getDocs(colRef);

      let apagados = 0;
      const promessas = [];

      snap.forEach(d => {
        const data = d.data();
        if (data && data.criadoEm && data.criadoEm < limiteIso) {
          promessas.push(deleteDoc(doc(db, "auditoria_lojas", d.id)));
          apagados++;
        }
      });

      if (promessas.length > 0) {
        await Promise.all(promessas);
        this.showToast(`🧹 ${apagados} logs com mais de 30 dias foram excluídos!`, 'success');
      } else {
        this.showToast('ℹ️ Nenhum log antigo (>30 dias) encontrado para exclusão.', 'info');
      }

      this.carregarLogsAuditoria();
    } catch (err) {
      console.error('Erro ao limpar logs antigos:', err);
      this.showToast('Erro ao limpar logs: ' + err.message, 'error');
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.MasterApp) window.MasterApp.init();
  });
} else {
  if (window.MasterApp) window.MasterApp.init();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    // 1. Se o modal de detalhes estiver aberto, fecha APENAS ele
    const modalDetalhe = document.getElementById('modal-detalhe-log');
    if (modalDetalhe && modalDetalhe.classList.contains('active')) {
      if (window.MasterApp && typeof window.MasterApp.fecharModalDetalheLog === 'function') {
        window.MasterApp.fecharModalDetalheLog();
      }
      return;
    }

    // 2. Se o modal de auditoria estiver aberto, fecha ele
    const modalAuditoria = document.getElementById('modal-auditoria');
    if (modalAuditoria && modalAuditoria.classList.contains('active')) {
      if (window.MasterApp && typeof window.MasterApp.fecharModalAuditoria === 'function') {
        window.MasterApp.fecharModalAuditoria();
      }
      return;
    }

    // 3. Demais modais
    const modalCliente = document.getElementById('modal-cliente');
    if (modalCliente && modalCliente.classList.contains('active')) {
      if (window.MasterApp && typeof window.MasterApp.fecharModalCliente === 'function') {
        window.MasterApp.fecharModalCliente();
      }
      return;
    }

    const modalPlanos = document.getElementById('modal-planos');
    if (modalPlanos && modalPlanos.classList.contains('active')) {
      if (window.MasterApp && typeof window.MasterApp.fecharModalPlanos === 'function') {
        window.MasterApp.fecharModalPlanos();
      }
      return;
    }
  }
});
