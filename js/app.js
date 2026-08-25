/**
 * FlowPDV Master SaaS - Gerenciador Central de Licenças & Sincronização Cloud Firestore
 */

window.MasterApp = {
  clientes: [],
  filtroAtual: 'todos',

  presetsCategorias: {
    adega: {
      icone: '🍷',
      lista: ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos', 'Combos']
    },
    mercado: {
      icone: '🛒',
      lista: ['Alimentos', 'Carnes & Açougue', 'Bebidas', 'Laticínios & Frios', 'Hortifrúti', 'Padaria', 'Higiene & Limpeza', 'Matinais']
    },
    conveniencia: {
      icone: '🏪',
      lista: ['Bebidas Geladas', 'Salgados & Lanches', 'Snacks', 'Tabacaria', 'Doces & Chocolates', 'Energéticos', 'Gelo & Carvão']
    },
    tabacaria: {
      icone: '🚬',
      lista: ['Essências', 'Carvão & Alumínio', 'Sedas & Filtros', 'Isqueiros & Maçaricos', 'Narguiles & Peças', 'Vapes & Pods', 'Bebidas']
    },
    padaria: {
      icone: '🥖',
      lista: ['Pães', 'Bolos & Doces', 'Salgados', 'Frios & Laticínios', 'Café & Bebidas', 'Mercearia']
    },
    geral: {
      icone: '⚡',
      lista: ['Bebidas', 'Alimentos', 'Carnes', 'Limpeza', 'Higiene', 'Tabacaria', 'Acessórios']
    }
  },

  usuarioLogado: null,

  async init() {
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

  aplicarPresetCategorias(tipo) {
    const preset = this.presetsCategorias[tipo];
    if (!preset) return;

    const iconeEl = document.getElementById('cli-icone');
    const catEl = document.getElementById('cli-categorias');

    if (iconeEl) iconeEl.value = preset.icone;
    if (catEl) catEl.value = preset.lista.join(', ');
  },

  async salvarDados() {
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
          icone: licAtiva.icone || '🍷',
          logoUrl: licAtiva.logoUrl || '',
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
          const docId = c.id || c.chaveLicenca;
          const payload = {
            id: c.id,
            nome: c.nome,
            razaoSocial: c.nome,
            documento: c.documento,
            cnpj: c.documento,
            responsavel: c.responsavel,
            whatsapp: c.whatsapp,
            icone: c.icone || '🍷',
            logoUrl: c.logoUrl || '',
            categorias: (c.categorias && c.categorias.length > 0) ? c.categorias : ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos'],
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
    await this.sincronizarComNuvemFirestore();
    this.iniciarOuvinteNuvemRealtime();
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
                icone: data.icone || '🍷',
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
            for (const c of cloudClientes) {
              const docClean = (c.documento || '').replace(/\D/g, '');
              const key = docClean || c.chaveLicenca || c.id;
              const existing = dedupMap.get(key);
              if (!existing) {
                dedupMap.set(key, {
                  ...c,
                  terminaisAtivos: Array.isArray(c.terminaisAtivos) ? [...c.terminaisAtivos] : []
                });
              } else {
                const combinedTerms = new Set([
                  ...(Array.isArray(existing.terminaisAtivos) ? existing.terminaisAtivos : []),
                  ...(Array.isArray(c.terminaisAtivos) ? c.terminaisAtivos : [])
                ]);
                existing.terminaisAtivos = Array.from(combinedTerms);
                if (c.limiteTerminais) existing.limiteTerminais = c.limiteTerminais;
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
              icone: data.icone || '🍷',
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

            const itemFormatado = {
              ...cCloud,
              logoUrl: logoUrlFinal,
              categorias: catsFinal
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
        const numCats = (c.categorias && Array.isArray(c.categorias)) ? c.categorias.length : 0;

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

    if (idInput) idInput.value = '';
    if (btnExcluir) btnExcluir.style.display = 'none';
    if (chaveInput) chaveInput.value = 'LIC-FLOW-' + Math.floor(100000 + Math.random() * 900000);
    if (pinInput) pinInput.value = '1234';
    if (limiteInput) limiteInput.value = '1';
    if (termInfoBox) termInfoBox.style.display = 'none';
    if (logoInput) logoInput.value = '';
    if (catInput) catInput.value = this.presetsCategorias.adega.lista.join(', ');
    
    const d = new Date();
    d.setDate(d.getDate() + 30);
    if (vencInput) vencInput.value = d.toISOString().split('T')[0];

    this.previewLogo();
    if (modal) {
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
    const iconeInput = document.getElementById('cli-icone');
    const logoInput = document.getElementById('cli-logo-url');
    const catInput = document.getElementById('cli-categorias');
    const planoInput = document.getElementById('cli-plano');
    const valorInput = document.getElementById('cli-valor');
    const vencInput = document.getElementById('cli-vencimento');
    const chaveInput = document.getElementById('cli-chave');
    const pinInput = document.getElementById('cli-pin-gerente');
    const limiteInput = document.getElementById('cli-limite-terminais');
    const contagemTerm = document.getElementById('cli-terminais-contagem');
    const termInfoBox = document.getElementById('cli-terminais-info-box');
    const statusInput = document.getElementById('cli-status');
    const btnExcluir = document.getElementById('btn-excluir-cliente');

    if (idInput) idInput.value = c.id;
    if (nomeInput) nomeInput.value = c.nome || '';
    if (docInput) docInput.value = c.documento || '';
    if (respInput) respInput.value = c.responsavel || '';
    if (zapInput) zapInput.value = c.whatsapp || '';
    if (iconeInput) iconeInput.value = c.icone || '🍷';
    if (logoInput) logoInput.value = c.logoUrl || '';
    if (catInput) catInput.value = (c.categorias && Array.isArray(c.categorias)) ? c.categorias.join(', ') : this.presetsCategorias.adega.lista.join(', ');
    if (planoInput) planoInput.value = c.plano || 'Mensal Pro';
    if (valorInput) valorInput.value = c.valorMensal || 89.90;
    if (vencInput) vencInput.value = c.vencimento ? (c.vencimento.includes('T') ? c.vencimento.split('T')[0] : c.vencimento) : '';
    if (chaveInput) chaveInput.value = c.chaveLicenca || c.id;
    if (pinInput) pinInput.value = c.pinGerente || '1234';
    if (limiteInput) limiteInput.value = c.limiteTerminais || 1;
    
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
    const icone = document.getElementById('cli-icone')?.value || '🍷';
    const logoUrl = document.getElementById('cli-logo-url')?.value.trim() || '';
    const categoriasRaw = document.getElementById('cli-categorias')?.value.trim() || '';
    const categorias = categoriasRaw ? categoriasRaw.split(',').map(s => s.trim()).filter(Boolean) : ['Cervejas', 'Destilados', 'Vinhos', 'Não Alcoólicos', 'Gelo & Carvão', 'Tabacaria', 'Petiscos'];
    const plano = document.getElementById('cli-plano')?.value || 'Mensal Pro';
    const valorMensal = parseFloat(document.getElementById('cli-valor')?.value) || 89.90;
    const vencimento = document.getElementById('cli-vencimento')?.value || '2026-12-31';
    const status = document.getElementById('cli-status')?.value || 'ativa';
    const pinGerente = document.getElementById('cli-pin-gerente')?.value.trim() || '1234';
    const limiteTerminais = Math.max(1, parseInt(document.getElementById('cli-limite-terminais')?.value) || 1);

    const cExistente = this.clientes.find(item => item && (item.id === idFinal || item.chaveLicenca === chaveLicenca));

    const novoCliente = {
      id: idFinal,
      nome,
      razaoSocial: nome,
      documento,
      cnpj: documento,
      responsavel,
      whatsapp,
      icone,
      logoUrl,
      categorias,
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

    this.fecharModalCliente();
    this.renderMetrics();
    this.renderTabela();

    await this.salvarDados();
    this.renderMetrics();
    this.renderTabela();

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

  atualizarValorPlano() {
    const plano = document.getElementById('cli-plano').value;
    const inputValor = document.getElementById('cli-valor');
    if (plano.includes('89,90') || plano === 'Mensal Pro') inputValor.value = '89.90';
    else if (plano.includes('69,90') || plano === 'Mensal Básico') inputValor.value = '69.90';
    else if (plano.includes('239,70') || plano === 'Trimestral') inputValor.value = '239.70';
    else if (plano.includes('899,00') || plano === 'Anual VIP') inputValor.value = '899.00';
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
    if (window.MasterApp && typeof window.MasterApp.fecharModalCliente === 'function') {
      window.MasterApp.fecharModalCliente();
    }
  }
});
