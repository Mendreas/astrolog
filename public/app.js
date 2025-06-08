// ======================================================
// AstroLog - app.js (2025, versão limpa, comentada e sem duplicações)
// ======================================================

/*
 * ========== VARIÁVEIS GLOBAIS ==========
 */
let observacoes = [];
let currentLang = 'pt';
let currentFilter = 'todos';
let searchQuery = '';
let calendarioMes = new Date().getMonth();
let calendarioAno = new Date().getFullYear();
let inicioData = new Date();
let inicioCoords = null;
let localState = { coords: null, city: null, country: null };

/*
 * ========== TRADUÇÕES ==========
 */
const i18n = {
  pt: {
    faseLua: "Fase da Lua",
    mapaCeu: "Mapa do céu",
    inicio: "Início",
    home: "Início",
    hoje: "Hoje",
    data: "Data",
    localizacao: "Localização",
    editarData: "Editar Data",
    editarLocal: "Alterar localização",
    usarGeo: "Obter localização atual",
    alterarLocal: "Alterar",
    pesquisarLocal: "Pesquisar localidade...",
    previsao: "Previsão do tempo",
    eventos: "Eventos astronómicos",
    objetos: "Objetos visíveis",
    nuvens: "Nuvens",
    bortle: "Índice Bortle",
    latitude: "Latitude",
    longitude: "Longitude",
    buscarTempo: "A obter previsão...",
    semEventos: "Nenhum evento encontrado.",
    semObjetos: "Nenhum objeto visível encontrado.",
    erroGeo: "Não foi possível obter a localização.",
    selecionar: "Selecionar",
    searchPlaceholder: "Pesquisar observações...",
    all: "Todos",
    recent: "Recentes",
    favorites: "Favoritos",
    filterType: "Filtrar por tipo",
    cancel: "Cancelar",
    save: "Guardar",
    redFilter: "Filtro Vermelho",
    intensity: "Intensidade do Filtro",
    edit: "Editar",
    delete: "Eliminar",
    close: "Fechar",
    objectos: "Objectos",
    adicionar: "Adicionar",
    calendario: "Calendário",
    calendarTitle: "Calendário de Observações",
    recursos: "Recursos",
    configuracoes: "Configurações",
    links: "Links Úteis",
    ver: "Ver",
    addObsTitle: "Adicionar Observação",
    nomeObj: "Nome do objeto",
    tipo: "Tipo",
    dataObs: "Data da observação",
    localizacao: "Localização",
    ra: "RA",
    dec: "DEC",
    magnitude: "Magnitude",
    distancia: "Distância",
    unidadeDist: "Unidade",
    descricao: "Descrição",
    favorito: "Favorito",
    imagem: "Imagem",
    saveSuccess: "✔️ Observação adicionada com sucesso",
    monthNames: [
      "Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ],
    tipos: {
      "Estrela": "Estrela",
      "Galáxia": "Galáxia",
      "Aglomerado": "Aglomerado",
      "Nebulosa": "Nebulosa",
      "Sistema Solar": "Sistema Solar",
      "Outro": "Outro"
    }
  },
  en: {
    faseLua: "Moon Phase",
    mapaCeu: "Sky Map",
    inicio: "Home",
    home: "Home",
    hoje: "Today",
    data: "Date",
    localizacao: "Location",
    editarData: "Edit Date",
    editarLocal: "Change location",
    usarGeo: "Use current location",
    alterarLocal: "Change",
    pesquisarLocal: "Search location...",
    previsao: "Weather forecast",
    eventos: "Astronomical events",
    objetos: "Visible objects",
    nuvens: "Clouds",
    bortle: "Bortle Index",
    latitude: "Latitude",
    longitude: "Longitude",
    buscarTempo: "Getting forecast...",
    semEventos: "No events found.",
    semObjetos: "No visible objects found.",
    erroGeo: "Could not get location.",
    selecionar: "Select",
    searchPlaceholder: "Search observations...",
    all: "All",
    recent: "Recent",
    favorites: "Favorites",
    filterType: "Filter by type",
    cancel: "Cancel",
    save: "Save",
    redFilter: "Red Filter",
    intensity: "Filter Intensity",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    objectos: "Objects",
    adicionar: "Add",
    calendario: "Calendar",
    calendarTitle: "Observation Calendar",
    recursos: "Resources",
    configuracoes: "Settings",
    links: "Useful Links",
    ver: "View",
    addObsTitle: "Add Observation",
    nomeObj: "Object Name",
    tipo: "Type",
    dataObs: "Observation Date",
    localizacao: "Location",
    ra: "RA",
    dec: "DEC",
    magnitude: "Magnitude",
    distancia: "Distance",
    unidadeDist: "Unit",
    descricao: "Description",
    favorito: "Favorite",
    imagem: "Image",
    saveSuccess: "✔️ Observation successfully added",
    monthNames: [
      "January","February","March","April","May","June","July","August","September","October","November","December"
    ],
    tipos: {
      "Estrela": "Star",
      "Galáxia": "Galaxy",
      "Aglomerado": "Cluster",
      "Nebulosa": "Nebula",
      "Sistema Solar": "Solar System",
      "Outro": "Other"
    }
  }
};

/*
 * ========== FUNÇÕES DE INDEXEDDB ==========
 */
const DB_NAME = 'AstroLogDB';
const DB_VERSION = 1;
const STORE_NAME = 'observacoes';

// Abre (ou cria) a base de dados IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// Lê todas as observações guardadas
async function getAllObservacoes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Guarda (adiciona/edita) uma observação na BD
async function saveObservacao(obs) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(obs);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Apaga uma observação da BD (por id)
async function deleteObservacaoFromDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/*
 * ========== UTILITÁRIOS ==========
 */
// Normaliza uma data para formato YYYY-MM-DD (ISO)
function normalizarDataLocal(data) {
  return new Date(data).toLocaleDateString('sv-SE');
}
// Capitaliza primeira letra
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/*
 * ========== FUNÇÃO PARA ICONES DE TIPO ==========
 */
function getIcon(tipo) {
  const icons = {
    'Estrela': '⭐',
    'Galáxia': '🌌',
    'Aglomerado': '✨',
    'Nebulosa': '☁️',
    'Sistema Solar': '🪐',
    'Outro': '🔭'
  };
  return icons[tipo] || '❔';
}

/*
 * ========== INICIALIZAÇÃO DE INTERFACE E TABS ==========
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Carrega observações da base de dados ao arrancar
  observacoes = await getAllObservacoes();
  renderObservacoes();
  translateUI();
  updateRedFilterClass();

  // Marca tab “Início” como ativa à partida
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-tab") === "inicio") btn.classList.add("active");
  });
  document.querySelectorAll(".tab-content").forEach(sec => sec.classList.remove("active"));
  document.getElementById("tab-inicio-content").classList.add("active");

  // Pede localização ao carregar para a tab Início
  pedirGeolocalizacao(coords => {
    if (coords) {
      inicioCoords = coords;
      localState.coords = coords;
    }
    atualizarTabInicio();
  });

  // Navegação entre tabs (botões)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Ativa/desativa botões
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Ativa/desativa conteúdos
      const tabName = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
      const section = document.getElementById(`tab-${tabName}-content`);
      if (section) section.classList.add('active');

      // Funções extra por tab
      if (tabName === 'inicio') atualizarTabInicio();
      if (tabName === 'calendario') renderCalendario();
    });
  });

  // Listeners para filtros rápidos ("todos", "recentes", "favoritos")
  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderObservacoes();
    });
  });
});


  // Pesquisa textual
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.toLowerCase();
      renderObservacoes();
    });
  }

  // Filtro por tipo (dropdown)
  const filterBtn = document.getElementById('filterByType');
  if (filterBtn) {
    filterBtn.addEventListener('click', async () => {
      if (!observacoes || observacoes.length === 0) observacoes = await getAllObservacoes();
      if (!observacoes.length) {
        alert(i18n[currentLang].semObjetos);
        return;
      }
      document.querySelectorAll('.dropdown-menu').forEach(m => m.remove());
      const tipos = [...new Set(observacoes.map(o => o.tipo).filter(Boolean))];
      const menu = document.createElement('div');
      menu.className = 'dropdown-menu';
      tipos.forEach(tipo => {
        const item = document.createElement('div');
        item.textContent = i18n[currentLang].tipos[tipo] || tipo;
        item.addEventListener('click', () => {
          currentFilter = 'tipo';
          searchQuery = tipo.toLowerCase();
          renderObservacoes();
          menu.remove();
        });
        menu.appendChild(item);
      });
      // "Todos"
      const allItem = document.createElement('div');
      allItem.textContent = i18n[currentLang].all;
      allItem.addEventListener('click', () => {
        currentFilter = 'todos';
        searchQuery = '';
        renderObservacoes();
        menu.remove();
      });
      menu.appendChild(allItem);
      // Posição
      const rect = filterBtn.getBoundingClientRect();
      menu.style.position = 'absolute';
      menu.style.top = `${rect.bottom + window.scrollY}px`;
      menu.style.left = `${rect.left + window.scrollX}px`;
      menu.style.zIndex = 1000;
      document.body.appendChild(menu);
    });
  }

  // Troca idioma (PT/EN)
  const langBtn = document.getElementById('toggleLanguage');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'pt' ? 'en' : 'pt';
      langBtn.textContent = currentLang === 'pt' ? 'EN' : 'PT';
      translateUI();
      renderObservacoes();
    });
  }

  // Botão "+" para adicionar observação (abre modal)
  const addBtn = document.getElementById('addObservationBtn');
  const modal = document.getElementById('addObservationModal');
  const closeModalBtn = document.getElementById('closeAddModal');
  const cancelBtn = document.getElementById('cancelAdd');
  const form = document.getElementById('addObservationForm');
  const successMsg = document.getElementById('addSuccessMsg');
  if (addBtn) addBtn.addEventListener('click', () => { if (modal) modal.style.display = 'flex'; });
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddForm);
  if (cancelBtn) cancelBtn.addEventListener('click', closeAddForm);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeAddForm(); });

  // Submissão do formulário para adicionar observação
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const obs = {
        id: Date.now(),
        nome: formData.get('nome'),
        tipo: formData.get('tipo'),
        data: formData.get('data'),
        local: formData.get('local'),
        ra: formData.get('ra'),
        dec: formData.get('dec'),
        magnitude: formData.get('magnitude'),
        distancia: formData.get('distancia'),
        unidadeDistancia: formData.get('unidadeDistancia'),
        descricao: formData.get('descricao'),
        favorito: !!formData.get('favorito')
      };
      const file = formData.get('imagem');
      const saveObs = async () => {
        await saveObservacao(obs);
        observacoes = await getAllObservacoes();
        renderObservacoes();
        atualizarBackupJSON();
        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.textContent = i18n[currentLang].saveSuccess;
        }
        closeAddForm();
      };
      if (file && file.size > 0) {
        const reader = new FileReader();
        reader.onload = async () => { obs.imagem = reader.result; await saveObs(); };
        reader.onerror = async () => { alert("Erro ao carregar imagem."); await saveObs(); };
        reader.readAsDataURL(file);
      } else {
        await saveObs();
      }
    });
  }

  // Exportar observações (JSON)
  const exportBtn = document.getElementById('exportJson');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const data = await getAllObservacoes();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'astro-observacoes.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Importar observações (JSON)
  const importInput = document.getElementById('importJson');
  if (importInput) {
    importInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const data = JSON.parse(reader.result);
          if (!Array.isArray(data)) throw new Error("Formato inválido");
          const db = await openDB();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          for (const obs of data) {
            if (obs.id && obs.nome) store.put(obs);
          }
          tx.oncomplete = async () => {
            alert("Importação concluída!");
            observacoes = await getAllObservacoes();
            renderObservacoes();
            event.target.value = '';
          };
        } catch (err) {
          alert("Erro ao importar: " + err.message);
        }
      };
      reader.readAsText(file);
    });
  }
});

/*
 * ========== FILTRO VERMELHO ==========
 */
const redToggle = document.getElementById('redFilterToggle');
const redSlider = document.getElementById('redFilterIntensity');
const redButton = document.getElementById('toggleRedFilter');

// Aplica/remover filtro vermelho visual
function applyRedFilter(active) {
  if (active) {
    document.body.classList.add('red-filter');
    const intensity = parseInt(redSlider.value);
    document.body.style.backgroundColor = `rgba(255, 0, 0, ${intensity / 100})`;
  } else {
    document.body.classList.remove('red-filter');
    document.body.style.backgroundColor = '';
  }
}

// Listeners do filtro vermelho
redButton?.addEventListener('click', () => {
  if (!redToggle) return;
  redToggle.checked = !redToggle.checked;
  applyRedFilter(redToggle.checked);
});
redToggle?.addEventListener('change', () => {
  applyRedFilter(redToggle.checked);
});
redSlider?.addEventListener('input', () => {
  if (redToggle.checked) applyRedFilter(true);
});

// Atualiza classes CSS conforme intensidade (caso uses classes extra)
function updateRedFilterClass() {
  document.body.classList.remove('intensity-20', 'intensity-40', 'intensity-60', 'intensity-80', 'intensity-100');
  if (redToggle?.checked) {
    document.body.classList.add('red-filter');
    const val = parseInt(redSlider.value);
    if (val > 80)       document.body.classList.add('intensity-100');
    else if (val > 60)  document.body.classList.add('intensity-80');
    else if (val > 40)  document.body.classList.add('intensity-60');
    else if (val > 20)  document.body.classList.add('intensity-40');
    else                document.body.classList.add('intensity-20');
  } else {
    document.body.classList.remove('red-filter');
  }
}
redToggle?.addEventListener('change', updateRedFilterClass);
redSlider?.addEventListener('input', updateRedFilterClass);

/*
 * ========== BACKUP PARA localStorage ==========
 */
function atualizarBackupJSON() {
  const json = JSON.stringify(observacoes, null, 2);
  try {
    localStorage.setItem('backupAstroLog', json);
  } catch (err) {
    console.warn("Não foi possível gravar o backup em localStorage (quota exceeded).");
  }
}

// Fecha modal adicionar e limpa formulário
function closeAddForm() {
  const form = document.getElementById('addObservationForm');
  const modal = document.getElementById('addObservationModal');
  const successMsg = document.getElementById('addSuccessMsg');
  if (form) form.reset();
  if (modal) modal.style.display = 'none';
  if (successMsg) successMsg.style.display = 'none';
}

/*
 * ========== RENDERIZAR OBSERVAÇÕES ==========
 * Renderiza cartões para cada observação conforme filtros e pesquisa.
 */
function renderObservacoes() {
  if (!obsList) return;
  obsList.innerHTML = '';
  let list = [...observacoes];

  // Filtro de favoritos ou recentes
  if (currentFilter === 'favoritos') {
    list = list.filter(o => o.favorito);
  } else if (currentFilter === 'recentes') {
    list = list.sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  // Pesquisa textual
  if (searchQuery) {
    list = list.filter(o =>
      o.nome.toLowerCase().includes(searchQuery) ||
      o.tipo.toLowerCase().includes(searchQuery) ||
      (o.local || '').toLowerCase().includes(searchQuery)
    );
  }

  // Renderiza cada cartão de observação
  list.forEach(obs => {
    const card = document.createElement('div');
    card.className = 'observation-card';

    // Título: ícone + nome + estrela se favorito
    const titleDiv = document.createElement('div');
    titleDiv.className = 'title';
    titleDiv.textContent = `${getIcon(obs.tipo)} ${obs.nome} ${obs.favorito ? '⭐' : ''}`;
    card.appendChild(titleDiv);

    // Tipo traduzido
    const tipoSmall = document.createElement('div');
    const tipoTraduzido = i18n[currentLang].tipos[obs.tipo] || obs.tipo;
    tipoSmall.innerHTML = `<small>${tipoTraduzido}</small>`;
    card.appendChild(tipoSmall);

    // Data + local
    const dateLocal = document.createElement('div');
    const dataFormatada = new Date(obs.data).toLocaleDateString();
    dateLocal.innerHTML = `<small>${dataFormatada} – ${obs.local || ''}</small>`;
    card.appendChild(dateLocal);

    // Miniatura de imagem
    if (obs.imagem) {
      const img = document.createElement('img');
      img.src = obs.imagem;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100px';
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        window.open(obs.imagem, '_blank');
      });
      card.appendChild(img);
    }

    // Botões: Ver, Editar, Eliminar
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.marginTop = '0.5rem';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'view-btn';
    viewBtn.textContent = `🔍 ${i18n[currentLang].ver}`;
    viewBtn.addEventListener('click', () => { viewObservation(obs.id); });
    buttonsDiv.appendChild(viewBtn);

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = `✏️ ${i18n[currentLang].edit}`;
    editBtn.addEventListener('click', () => { editObservation(obs.id); });
    buttonsDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = `🗑️ ${i18n[currentLang].delete}`;
    deleteBtn.addEventListener('click', () => { deleteObservacaoHandler(obs.id); });
    buttonsDiv.appendChild(deleteBtn);

    card.appendChild(buttonsDiv);
    obsList.appendChild(card);
  });
}

/*
 * ========== VISUALIZAR, EDITAR E APAGAR OBSERVAÇÃO ==========
 * Usa modais dinâmicos.
 */
// Visualizar
window.viewObservation = function(id) {
  closeModal();
  const obs = observacoes.find(o => o.id === id);
  if (!obs) return;

  const modal = document.createElement('div');
  modal.className = 'modal open';
  modal.id = 'view-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${obs.nome}</h3>
      <p><strong>${i18n[currentLang].tipo}:</strong> ${i18n[currentLang].tipos[obs.tipo] || obs.tipo}</p>
      <p><strong>${i18n[currentLang].dataObs}:</strong> ${new Date(obs.data).toLocaleString()}</p>
      <p><strong>${i18n[currentLang].localizacao}:</strong> ${obs.local || ''}</p>
      <p><strong>RA:</strong> ${obs.ra || ''}</p>
      <p><strong>DEC:</strong> ${obs.dec || ''}</p>
      <p><strong>${i18n[currentLang].distancia}:</strong> ${obs.distancia || ''} ${obs.unidadeDistancia || ''}</p>
      <p><strong>${i18n[currentLang].magnitude}:</strong> ${obs.magnitude || ''}</p>
      <p><strong>${i18n[currentLang].descricao}:</strong> ${obs.descricao || ''}</p>
      ${obs.imagem ? `
        <img src="${obs.imagem}" 
             style="max-width:100%; max-height:200px; margin-top:1rem; cursor:pointer" 
             onclick="window.open('${obs.imagem}', '_blank')" />
      ` : ''}
      <button onclick="closeModalById('view-modal')">${i18n[currentLang].close}</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModalById('view-modal');
  });
};

// Editar
window.editObservation = function(id) {
  closeModal();
  const obs = observacoes.find(o => o.id === id);
  if (!obs) return;

  const modal = document.createElement('div');
  modal.className = 'modal open';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${i18n[currentLang].edit} ${i18n[currentLang].addObsTitle}</h3>
      <form id="modalForm">
        <label>${i18n[currentLang].nomeObj}:
          <input name="nome" value="${obs.nome}" required />
        </label>
        <label>${i18n[currentLang].tipo}:
          <select name="tipo" required>
            ${Object.keys(i18n.pt.tipos).map(tipo =>
              `<option ${obs.tipo === tipo ? 'selected' : ''}>${tipo}</option>`
            ).join('')}
          </select>
        </label>
        <label>${i18n[currentLang].dataObs}:
          <input name="data" type="date" value="${obs.data.slice(0, 10)}" required />
        </label>
        <label>${i18n[currentLang].localizacao}:
          <input name="local" value="${obs.local || ''}" required />
        </label>
        <label>RA:
          <input name="ra" value="${obs.ra || ''}" />
        </label>
        <label>DEC:
          <input name="dec" value="${obs.dec || ''}" />
        </label>
        <label>${i18n[currentLang].distancia}:
          <input name="distancia" value="${obs.distancia || ''}" />
          <select name="unidadeDistancia">
            <option ${obs.unidadeDistancia === 'ly' ? 'selected' : ''}>ly</option>
            <option ${obs.unidadeDistancia === 'AU' ? 'selected' : ''}>AU</option>
          </select>
        </label>
        <label>${i18n[currentLang].magnitude}:
          <input name="magnitude" type="number" value="${obs.magnitude || ''}" />
        </label>
        <label>${i18n[currentLang].descricao}:
          <textarea name="descricao">${obs.descricao || ''}</textarea>
        </label>
        <label><input type="checkbox" name="favorito" ${obs.favorito ? 'checked' : ''}/> ${i18n[currentLang].favorito}</label>
        <label>${i18n[currentLang].imagem}:
          <input type="file" name="imagem" accept="image/*" />
        </label>
        <div style="margin-top:1rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="submit">${i18n[currentLang].save}</button>
          <button type="button" onclick="closeModal()">${i18n[currentLang].cancel}</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  const modalForm = modal.querySelector('#modalForm');
  modalForm.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(modalForm);
    const updatedObs = Object.fromEntries(data.entries());
    updatedObs.id = id;
    const file = data.get('imagem');
    const saveEdit = async () => {
      const original = observacoes.find(o => o.id === id);
      if (original?.imagem && !updatedObs.imagem) updatedObs.imagem = original.imagem;
      await saveObservacao(updatedObs);
      observacoes = await getAllObservacoes();
      renderObservacoes();
      closeModal();
    };
    if (file && file.size > 0) {
      const reader = new FileReader();
      reader.onload = async () => { updatedObs.imagem = reader.result; await saveEdit(); };
      reader.onerror = async () => { alert("Erro ao carregar imagem."); await saveEdit(); };
      reader.readAsDataURL(file);
    } else {
      await saveEdit();
    }
  });
};

// Apagar
window.deleteObservacaoHandler = async function(id) {
  if (confirm(i18n[currentLang].delete + "?")) {
    await deleteObservacaoFromDB(id);
    observacoes = await getAllObservacoes();
    renderObservacoes();
  }
};

/*
 * ========== CALENDÁRIO ==========
 */
function renderCalendario() {
  const title = document.getElementById('calendarMonthYear');
  const displaySpan = document.getElementById('calendarMonthYearDisplay');
  const container = document.getElementById('calendarContainer');
  const results = document.getElementById('calendarResults');
  if (!title || !container || !results) return;

  container.innerHTML = '';
  results.innerHTML = '';

  // Dias do mês
  const firstDay = new Date(calendarioAno, calendarioMes, 1).getDay();
  const daysInMonth = new Date(calendarioAno, calendarioMes + 1, 0).getDate();
  const nomeMes = i18n[currentLang].monthNames[calendarioMes];
  const textoMesAno = `${capitalize(nomeMes)} ${calendarioAno}`;
  title.textContent = textoMesAno;
  if (displaySpan) displaySpan.textContent = textoMesAno;

  // Conjunto de datas com observações
  const diasComObservacoes = new Set(
    observacoes.map(o => normalizarDataLocal(o.data))
  );

  // Espaços vazios antes do 1º dia
  for (let i = 0; i < firstDay; i++) {
    const vazio = document.createElement('div');
    vazio.className = 'calendar-day';
    vazio.textContent = '';
    container.appendChild(vazio);
  }

  // Dias do mês
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calendarioAno, calendarioMes, d);
    const dateStr = normalizarDataLocal(date);
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = d;
    if (diasComObservacoes.has(dateStr)) {
      dayDiv.classList.add('highlight');
      dayDiv.addEventListener('click', () => mostrarObservacoesDoDia(dateStr));
    }
    container.appendChild(dayDiv);
  }
}

// Mostra observações de um dia no calendário
function mostrarObservacoesDoDia(dataISO) {
  const lista = observacoes.filter(o => o.data.startsWith(dataISO));
  const container = document.getElementById('calendarResults');
  if (!container) return;
  if (!lista.length) {
    container.innerHTML = `<p>${i18n[currentLang].semEventos} ${dataISO}</p>`;
    return;
  }
  container.innerHTML = `
    <h3>${i18n[currentLang].addObsTitle} (${dataISO}):</h3>
    <ul>
      ${lista.map(o => `<li>${getIcon(o.tipo)} ${o.nome}</li>`).join('')}
    </ul>`;
}

// Ícone do tipo de objeto
function getIcon(tipo) {
  const icons = {
    'Estrela': '⭐', 'Galáxia': '🌌', 'Aglomerado': '✨', 'Nebulosa': '☁️',
    'Sistema Solar': '🪐', 'Outro': '🔭'
  };
  return icons[tipo] || '❔';
}

/*
 * ========== UTILITÁRIOS E TRADUÇÃO ==========
 */
// Formato YYYY-MM-DD local
function normalizarDataLocal(data) {
  return new Date(data).toLocaleDateString('sv-SE');
}

// Primeira letra maiúscula
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/*
 * ========== TRADUÇÃO DA UI ==========
 */
function translateUI() {
  const t = i18n[currentLang];
  // Cabeçalho + filtros rápidos
  document.getElementById('searchInput').placeholder = t.searchPlaceholder;
  document.querySelector('[data-filter="todos"]').textContent = t.all;
  document.querySelector('[data-filter="recentes"]').textContent = t.recent;
  document.querySelector('[data-filter="favoritos"]').textContent = t.favorites;
  document.getElementById('filterByType').textContent = t.filterType;
  document.getElementById('toggleLanguage').textContent = currentLang === 'pt' ? 'EN' : 'PT';

  // Modal Adicionar Observação
  document.getElementById('addObsTitle').textContent = t.addObsTitle;
  document.getElementById('labelNomeObj').textContent = t.nomeObj;
  document.getElementById('labelTipo').textContent = t.tipo;
  document.getElementById('labelData').textContent = t.dataObs;
  document.getElementById('labelLocalizacao').textContent = t.localizacao;
  document.getElementById('labelRA').textContent = t.ra;
  document.getElementById('labelDEC').textContent = t.dec;
  document.getElementById('labelMagnitude').textContent = t.magnitude;
  document.getElementById('labelDistancia').textContent = t.distancia;
  document.getElementById('labelDescricao').textContent = t.descricao;
  document.getElementById('labelFavorito').lastChild.textContent = " " + t.favorito;
  document.getElementById('labelImagem').textContent = t.imagem;
  document.getElementById('btnSave').textContent = t.save;
  document.getElementById('btnCancel').textContent = t.cancel;
  document.getElementById('addSuccessMsg').textContent = t.saveSuccess;

  // Select de tipos no formulário
  const tipoSelect = document.getElementById('inputTipo');
  if (tipoSelect) {
    Array.from(tipoSelect.options).forEach(opt => {
      const val = opt.value;
      opt.textContent = t.tipos[val] || val;
    });
  }
  // Unidade distância
  const unidade = document.getElementById('inputUnidadeDistancia');
  if (unidade) {
    unidade.options[0].text = "ly";
    unidade.options[1].text = "AU";
  }
  // Tabs
  document.querySelectorAll("nav button[data-tab]").forEach(btn => {
    const key = btn.getAttribute("data-tab");
    if (t[key]) btn.textContent = t[key];
  });
  // Configurações
  if (document.getElementById('tab-config-content')) {
    document.querySelector('#tab-configuracoes p').textContent =
      currentLang === 'pt'
        ? "Ajustes e configurações da aplicação."
        : "Application settings and adjustments.";
    document.getElementById('exportJson').textContent = "📤 " + (currentLang === 'pt' ? "Exportar Observações" : "Export Observations");
    const importLabel = document.querySelector('label.import-label');
    if (importLabel) importLabel.childNodes[1].textContent = currentLang === 'pt' ? " Importar Observações" : " Import Observations";
    document.getElementById('downloadBackup').textContent = currentLang === 'pt' ? "💾 Descarregar Backup" : "💾 Download Backup";
  }
  // Footer
  document.querySelector('footer label:first-child').textContent = t.redFilter;
  document.querySelector('footer label:last-of-type').textContent = t.intensity;
  // Botões das observações
  document.querySelectorAll(".observation-card button.view-btn").forEach(btn => btn.textContent = `🔍 ${t.ver}`);
  document.querySelectorAll(".observation-card button.edit-btn").forEach(btn => btn.textContent = `✏️ ${t.edit}`);
  document.querySelectorAll(".observation-card button.delete-btn").forEach(btn => btn.textContent = `🗑️ ${t.delete}`);
  // Calendário
  const title = document.getElementById('calendarMonthYear');
  const span = document.getElementById('calendarMonthYearDisplay');
  if (title && span) {
    const nomeMes = t.monthNames[calendarioMes];
    const textoMesAno = `${capitalize(nomeMes)} ${calendarioAno}`;
    title.textContent = textoMesAno;
    span.textContent = textoMesAno;
  }
  if (document.getElementById('tab-calendario-content')?.classList.contains('active')) {
    renderCalendario();
  }
  // Corrige tipos traduzidos do dropdown aberto
  document.querySelectorAll('.dropdown-menu > div').forEach((item, i) => {
    if (item.textContent.trim() === i18n.pt.all || item.textContent.trim() === i18n.en.all) {
      item.textContent = t.all;
    } else if (i < Object.keys(i18n.pt.tipos).length) {
      const tipoKey = item.textContent.trim();
      item.textContent = t.tipos[tipoKey] || tipoKey;
    }
  });
  atualizarTabInicio();
}

/*
 * ========== MODAIS GENÉRICOS ==========
 */
// Fecha modal por ID
window.closeModalById = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.remove();
};
// Fecha todos os modais
window.closeModal = function() {
  document.querySelectorAll('.modal').forEach(m => m.remove());
};

/*
 * ========== INTEGRAÇÃO DA TAB INÍCIO ==========
 * Atualiza as secções "Início" com previsão, eventos e objetos.
 */
async function atualizarTabInicio() {
  const t = i18n[currentLang];
  const dadosDiv = document.getElementById('astroapi-dados');
  const skyDiv = document.getElementById('astroapi-skymap');
  if (!localState.coords) {
    dadosDiv.innerHTML = `<span>${t.erroGeo}</span>`;
    skyDiv.innerHTML = '';
    return;
  }
  dadosDiv.innerHTML = t.buscarTempo;
  try {
    await mostrarPrevisaoTempo(localState.coords);
    mostrarEventosAstronomicos();
    mostrarObjetosVisiveis();
    skyDiv.innerHTML = "<em>(Mapa do céu/integração futura)</em>";
  } catch (e) {
    dadosDiv.innerHTML = `<span>${t.erroGeo}</span>`;
    skyDiv.innerHTML = '';
    console.error(e);
  }
}
