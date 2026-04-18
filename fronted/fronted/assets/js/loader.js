function loadPage(pageName) {
    const content = document.getElementById('main-content');
    const title = document.getElementById('page-title');
    const actions = document.getElementById('header-actions');

    const pageConfig = {
        'dashboard': {
            title: 'Resumen de Gestión',
            buttons: ''
        },
        'expedientes': {
            title: 'Archivo Digital',
            buttons: `
                <button onclick="loadPage('archivados')" class="bg-stone-100 text-stone-500 border border-stone-200 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-200 transition-all">
                    <i class="fas fa-archive mr-1"></i> Archivados
                </button>
                <button onclick="loadPage('nuevo-expediente')" class="bg-[#1A1917] text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#2e2d2a] transition-all">
                    + Nuevo Expediente
                </button>`
        },
        'vencimientos': {
            title: 'Estado de Vencimientos',
            buttons: ''
        },

        'archivados': {
            title: 'Expedientes Archivados',
            buttons: `
            <button onclick="loadPage('expedientes')" class="bg-white text-stone-900 border border-stone-200 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-all">
                ← Volver a Activos
            </button>`
        },

        'nuevo-expediente': {
            title: 'Crear Nuevo Expediente',
            buttons: `
        <button onclick="loadPage('expedientes')" class="bg-white text-stone-900 border border-stone-200 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-all">
            <i class="fas fa-arrow-left mr-2"></i> Volver
        </button>`
        },
    'visor': {
        title: 'Visor de Expediente',
        buttons: `
            <button onclick="loadPage('expedientes')" class="bg-white text-stone-900 border border-stone-200 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-all">
                <i class="fas fa-times mr-2 text-stone-400"></i> Cerrar Visor
            </button>`
    }
    };

    const config = pageConfig[pageName] || { title: 'LeIA LegalTech', buttons: '' };
    title.innerText = config.title;
    actions.innerHTML = config.buttons;

    // Ajuste de ruta: Asegúrate de que la carpeta 'pages' esté al mismo nivel que index.html
    fetch(`pages/${pageName}.html`)
        .then(res => {
            if (!res.ok) throw new Error(`No se encontró el archivo: pages/${pageName}.html`);
            return res.text();
        })
        .then(html => {
            content.innerHTML = html;

            if (pageName === 'expedientes') {
                renderCards();
            } else if (pageName === 'archivados') {
                renderArchivedCards(); // Nueva función
            }
        })
        .catch(err => {
            console.error("Error crítico:", err);
            content.innerHTML = `
                <div class="p-12 border-2 border-dashed border-stone-200 rounded-[2rem] text-center text-stone-400">
                    <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
                    <p class="text-sm font-bold uppercase tracking-widest">Error de carga</p>
                    <p class="text-xs mt-2 text-stone-400">Asegúrate de estar usando un servidor local (Live Server) y que la carpeta 'pages' contenga '${pageName}.html'.</p>
                </div>`;
        });
}

window.onload = () => loadPage('dashboard');

/* ════════════════════════════════════════════════════════════
   LÓGICA DE EXPEDIENTES (Se ejecuta globalmente cuando es necesario)
   ════════════════════════════════════════════════════════════ */

const today = new Date();

function addDays(n) {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
}

function fmtDate(d) {
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDays(exp) {
    return Math.round((exp.vence - today) / (1000 * 60 * 60 * 24));
}

let sortMode = 'plazo';

let expedientes = [
    { id: 'EXP-2025-041', name: 'García Hernández vs. Grupo Inmobiliario Arco', materia: 'Civil', materiaFull: 'Civil — Arrendamiento', partes: 'Roberto García H. (actor) · Grupo Inmobiliario Arco S.A. (demandado)', resumen: 'Demanda por rescisión de contrato y devolución de depósito por incumplimiento de condiciones pactadas.', vence: addDays(3), estado: 'Activo' },
    { id: 'EXP-2025-038', name: 'Martínez Olvera — Pensión alimenticia', materia: 'Familiar', materiaFull: 'Familiar — Alimentos', partes: 'Laura Martínez O. (actora) · Sergio Olvera R. (demandado)', resumen: 'Solicitud de aumento de pensión alimenticia para menor de edad tras cambio en situación económica del demandado.', vence: addDays(18), estado: 'Activo' },
    { id: 'EXP-2025-029', name: 'Constructora Peña — Disputa laboral', materia: 'Laboral', materiaFull: 'Laboral — Despido injustificado', partes: 'Trabajadores Sindicalizados (actores) · Constructora Peña e Hijos S.C. (demandado)', resumen: 'Demanda colectiva por despido masivo sin liquidación conforme a la LFT tras cierre de planta.', vence: addDays(45), estado: 'En pausa' }
];

function similarity(a, b) {
    a = a.toLowerCase(); b = b.toLowerCase();
    if (a.includes(b) || b.includes(a)) return 1;
    let matches = 0;
    const wa = a.split(/\s+/), wb = b.split(/\s+/);
    wb.forEach(w => { if (wa.some(x => x.startsWith(w) || w.startsWith(x))) matches++; });
    return matches / Math.max(wb.length, 1);
}

window.toggleSort = function () {
    sortMode = sortMode === 'plazo' ? 'alfa' : 'plazo';
    document.getElementById('sort-btn').textContent = sortMode === 'plazo' ? 'Ordenar: Plazo ↑' : 'Ordenar: A → Z';
    renderCards();
}

window.toggleEstado = function (id) {
    const exp = expedientes.find(e => e.id === id);
    if (!exp) return;
    exp.estado = exp.estado === 'Activo' ? 'En pausa' : 'Activo';
    renderCards();
}

window.editName = function (id) {
    const el = document.getElementById('name-' + id);
    if (!el) return;
    const cur = el.textContent;
    const inp = document.createElement('input');
    inp.value = cur;
    inp.style.cssText = 'font-size:15px;font-weight:600;border:none;border-bottom:1.5px solid #1A1917;background:transparent;color:#1A1917;outline:none;width:280px;font-family:"DM Sans",sans-serif;';
    el.replaceWith(inp);
    inp.focus(); inp.select();
    function save() {
        const exp = expedientes.find(e => e.id === id);
        if (exp) exp.name = inp.value || cur;
        renderCards();
    }
    inp.addEventListener('blur', save);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); });
}

window.renderCards = function () {
    // Si los elementos no existen (ej. estamos en dashboard), no hacemos nada
    const container = document.getElementById('cards-container');
    if (!container) return;

    const q = document.getElementById('search-input').value.trim().toLowerCase();
    const materia = document.getElementById('filter-materia').value;
    const plazo = document.getElementById('filter-plazo').value;
    const estado = document.getElementById('filter-estado').value;

    let list = expedientes.filter(e => {
        if (materia && e.materia !== materia) return false;
        if (estado && e.estado !== estado) return false;
        const d = getDays(e);
        if (plazo === 'urgente' && d > 7) return false;
        if (plazo === 'proximo' && (d <= 7 || d > 30)) return false;
        if (plazo === 'holgado' && d <= 30) return false;
        if (q) {
            const hay = (e.name + ' ' + e.materiaFull + ' ' + e.partes + ' ' + e.resumen + ' ' + e.id).toLowerCase();
            if (similarity(hay, q) < 0.15 && !hay.includes(q)) return false;
        }
        return true;
    });

    if (sortMode === 'alfa') list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    else list.sort((a, b) => getDays(a) - getDays(b));

    const activos = expedientes.filter(e => e.estado === 'Activo').length;
    const badge = document.getElementById('count-badge');
    if (badge) badge.textContent = activos + ' activo' + (activos !== 1 ? 's' : '');

    if (!list.length) {
        container.innerHTML = `<div class="text-center p-12 text-slate-400 bg-white border border-slate-100 rounded-xl text-sm"><div class="text-3xl mb-2">🗂</div>Sin expedientes que coincidan con los filtros.</div>`;
        return;
    }

    container.innerHTML = list.map(e => {
        const d = getDays(e);
        const cls = d <= 7 ? 'vence-red' : d <= 30 ? 'vence-amber' : 'vence-green';
        const unit = Math.abs(d) === 1 ? 'día' : 'días';
        const pillCls = e.estado === 'Activo' ? 'pill-activo' : 'pill-pausa';

        return `
        <div class="exp-card">
            <div class="flex-1 min-w-0">
                <div class="flex items-start gap-2 mb-2.5 flex-wrap">
                    <span class="font-['DM_Mono'] text-xs text-slate-400 font-medium mt-0.5">${e.id}</span>
                    <span class="text-slate-400 mt-0.5 text-sm">—</span>
                    <span class="text-[15px] font-semibold text-[#1A1917] tracking-tight" id="name-${e.id}">${e.name}</span>
                    <button class="bg-transparent border-none px-1 cursor-pointer text-xs text-slate-400 mt-0.5 rounded transition hover:text-[#1A1917] hover:bg-slate-100" title="Editar nombre" onclick="editName('${e.id}')">✎</button>
                    <button class="status-pill ${pillCls}" onclick="toggleEstado('${e.id}')">${e.estado}</button>
                </div>
                <div class="grid gap-1.5">
                    <div class="flex gap-2 text-[13px]"><span class="text-slate-500 whitespace-nowrap min-w-[58px] font-medium">Materia:</span><span class="text-[#1A1917]">${e.materiaFull}</span></div>
                    <div class="flex gap-2 text-[13px]"><span class="text-slate-500 whitespace-nowrap min-w-[58px] font-medium">Partes:</span><span class="text-[#1A1917]">${e.partes}</span></div>
                    <div class="flex gap-2 text-[13px]"><span class="text-slate-500 whitespace-nowrap min-w-[58px] font-medium">Resumen:</span><span class="text-[#1A1917]">${e.resumen}</span></div>
                </div>
            </div>
            <div class="flex flex-col items-center justify-between gap-3 pl-4 border-l border-slate-100 min-w-[100px] exp-right">
                <div class="text-center">
                    <p class="text-[10px] font-semibold tracking-[0.6px] uppercase text-slate-400 mb-1">Vence en</p>
                    <p class="vence-num ${cls}">${d}</p>
                    <p class="text-xs text-slate-500 mt-0.5">${unit}</p>
                    <p class="text-[11px] text-slate-400 mt-1 font-['DM_Mono']">${fmtDate(e.vence)}</p>
                </div>
                <button onclick="loadPage('visor')" class="w-9 h-9 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer text-lg text-slate-500 transition-all hover:bg-[#1A1917] hover:text-white hover:border-transparent hover:scale-105 leading-none">
                     >
                </button>
            </div>
        </div>`;
    }).join('');
}

/* ════════════════════════════════════════════════════════════
   LÓGICA DE VENCIMIENTOS
   ════════════════════════════════════════════════════════════ */

window.filtrar = function (element, status) {
    // 1. Quitar activo de todos los chips y ponerlo al presionado
    const chips = document.querySelectorAll('.chip');
    if (chips.length > 0) {
        chips.forEach(c => c.classList.remove('active'));
        element.classList.add('active');
    }

    // 2. Ocultar / Mostrar filas según su data-status
    const rows = document.querySelectorAll('.t-row');
    rows.forEach(row => {
        if (status === 'todos' || row.getAttribute('data-status') === status) {
            row.style.display = 'grid'; // Usamos grid porque el CSS original usa grid
        } else {
            row.style.display = 'none';
        }
    });
};

window.buscar = function (query) {
    const rows = document.querySelectorAll('.t-row');
    const lowerQuery = query.toLowerCase();

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        if (text.includes(lowerQuery)) {
            row.style.display = 'grid';
        } else {
            row.style.display = 'none';
        }
    });
};


// Función para cargar modales dinámicamente
async function openModal(modalName) {
    // 1. Si ya hay un modal abierto, lo eliminamos para no duplicar
    const existingModal = document.getElementById('modal-overlay');
    if (existingModal) existingModal.remove();

    try {
        // 2. Traemos el archivo HTML del modal
        const response = await fetch(`pages/${modalName}.html`);
        if (!response.ok) throw new Error('No se encontró el modal');

        const modalHtml = await response.text();

        // 3. Lo inyectamos al final del body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    } catch (error) {
        console.error("Error al cargar el modal:", error);
    }
}

// Datos de ejemplo para archivados
let archivados = [
    {
        id: 'EXP-2024-012',
        name: 'Sucesión Intestamentaria - Familia Rivas',
        materiaFull: 'Familiar',
        partes: 'Herederos Rivas vs. N/A',
        resumen: 'Sentencia ejecutoriada. Caso cerrado satisfactoriamente.',
        fechaCierre: '15/Dic/2025'
    }
];

window.renderArchivedCards = function () {
    const container = document.getElementById('cards-archivados-container');
    if (!container) return;

    if (!archivados.length) {
        container.innerHTML = `<div class="text-center p-12 text-slate-400">No hay expedientes archivados.</div>`;
        return;
    }

    container.innerHTML = archivados.map(e => `
        <div class="exp-card-archived">
            <div class="flex-1 min-w-0">
                <div class="flex items-start gap-2 mb-2.5 flex-wrap">
                    <span class="font-['DM_Mono'] text-xs text-slate-400 font-medium mt-0.5">${e.id}</span>
                    <span class="text-slate-400 mt-0.5 text-sm">—</span>
                    <span class="text-[15px] font-semibold text-slate-600 tracking-tight">${e.name}</span>
                    <span class="status-pill-archived text-[10px] uppercase">Archivado</span>
                </div>
                <div class="grid gap-1.5">
                    <div class="flex gap-2 text-[13px]"><span class="text-slate-500 font-medium min-w-[58px]">Materia:</span><span class="text-slate-600">${e.materiaFull}</span></div>
                    <div class="flex gap-2 text-[13px]"><span class="text-slate-500 font-medium min-w-[58px]">Partes:</span><span class="text-slate-600">${e.partes}</span></div>
                    <div class="flex gap-2 text-[13px]"><span class="text-slate-500 font-medium min-w-[58px]">Resumen:</span><span class="text-slate-400 italic">${e.resumen}</span></div>
                </div>
            </div>
            <div class="flex flex-col items-center justify-center pl-4 border-l border-slate-100 min-w-[120px]">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Cerrado el</p>
                <p class="concluido-date">${e.fechaCierre}</p>
            </div>
        </div>
    `).join('');
}

/* ════════════════════════════════════════════════════════════
   LÓGICA DE NUEVO EXPEDIENTE
   ════════════════════════════════════════════════════════════ */

window.handleFile = function(file) {
    if (!file) return;
    // Simulamos detección de PDF
    const banner = document.getElementById('ai-banner');
    if (banner) banner.classList.remove('hidden');
    console.log("Archivo cargado:", file.name);
};

window.runAI = function() {
    const btn = document.getElementById('ai-big-btn');
    const label = btn.querySelector('span');
    const spin = document.getElementById('ai-big-spin');

    label.innerText = "Procesando...";
    spin.classList.remove('hidden');

    // Simulación de extracción de datos por IA
    setTimeout(() => {
        document.getElementById('f-num').value = "EXP-2026-" + Math.floor(Math.random() * 900 + 100);
        document.getElementById('f-nombre').value = "Sucesión Inmobiliaria - Análisis IA";
        document.getElementById('f-resumen').value = "La IA ha determinado que este caso trata sobre una disputa de propiedad basada en el documento cargado...";
        
        label.innerText = "¡Completado!";
        spin.classList.add('hidden');
        btn.classList.replace('bg-indigo-600', 'bg-emerald-500');
    }, 1500);
};

window.saveNewExpediente = function() {
    const name = document.getElementById('f-nombre').value;
    const id = document.getElementById('f-num').value;

    if (!name || !id) {
        alert("Por favor completa los campos obligatorios");
        return;
    }

    // Añadir al array global de expedientes
    expedientes.unshift({
        id: id,
        name: name,
        materia: 'Civil',
        materiaFull: 'Civil — Analizado por IA',
        partes: 'Parte Actora vs Parte Demandada',
        resumen: document.getElementById('f-resumen').value,
        vence: addDays(15),
        estado: 'Activo'
    });

    alert("Expediente guardado con éxito");
    loadPage('expedientes');
};