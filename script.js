// js/script.js
import { 
    escucharAulas, 
    crearAulaFirestore, 
    editarAulaFirestore, 
    eliminarAulaFirestore, 
    actualizarEstudiantesFirestore 
} from "./firebase.js";

// ==========================================================================
// 1. ESTADO DE LA APLICACIÓN (STATE MANAGEMENT)
// ==========================================================================
const appState = {
    aulas: [],
    aulaActiva: null // Almacenará el objeto completo del aula seleccionada
};

// ==========================================================================
// 2. REFERENCIAS DEL DOM
// ==========================================================================
const DOM = {
    // Secciones Principales
    loginSection: document.getElementById("login-section"),
    dashboardSection: document.getElementById("dashboard-section"),
    
    // Sub-secciones del Dashboard
    subInicio: document.getElementById("sub-inicio"),
    subAulas: document.getElementById("sub-aulas"),
    subPaseLista: document.getElementById("sub-pase-lista"),
    subReportes: document.getElementById("sub-reportes"),
    
    // Componentes de Navegación
    menuItems: document.querySelectorAll(".menu-item"),
    btnLogout: document.getElementById("btn-logout"),
    
    // Formularios e Inputs
    formLogin: document.getElementById("form-login"),
    formAula: document.getElementById("form-aula"),
    formEstudiante: document.getElementById("form-estudiante"),
    aulaIdHidden: document.getElementById("aula-id-hidden"),
    aulaNombre: document.getElementById("aula-nombre"),
    aulaMateria: document.getElementById("aula-materia"),
    estudianteNombre: document.getElementById("estudiante-nombre"),
    
    // Contenedores Dinámicos
    gridAulas: document.getElementById("grid-layout") || document.getElementById("grid-aulas"),
    listaEstudiantesAsistencia: document.getElementById("lista-estudiantes-asistencia"),
    statsContainer: document.getElementById("stats-container"),
    
    // Textos Dinámicos en Pase de Lista
    txtAsistenciaAula: document.getElementById("txt-asistencia-aula"),
    txtAsistenciaMateria: document.getElementById("txt-asistencia-materia"),
    
    // Botones de Control Acciones Directas
    btnAbrirModalAula: document.getElementById("btn-abrir-modal-aula"),
    btnVolverAulas: document.getElementById("btn-volver-aulas"),
    btnGuardarAsistencia: document.getElementById("btn-guardar-asistencia"),

    btnGenerarPdf:document.getElementById("btn-generar-pdf"),
    printClassName:document.getElementById("print-class-name"),
    printSubjectName:document.getElementById("print-subject-name"),
    printDate:document.getElementById("print-date"),
    
    // Modales
    modalAula: document.getElementById("modal-aula"),
    modalEstudiante: document.getElementById("modal-estudiante"),
    modalAulaTitulo: document.getElementById("modal-aula-titulo")
};

// Map para facilitar el ruteo interno entre subsecciones
const subSecciones = {
    inicio: DOM.subInicio,
    aulas: DOM.subAulas,
    paseLista: DOM.subPaseLista,
    reportes: DOM.subReportes
};

// ==========================================================================
// 3. CONTROLADOR DE VISTAS Y ROUTING
// ==========================================================================
function cambiarSubSeccion(targetKey) {
    Object.keys(subSecciones).forEach(key => {
        if (subSecciones[key]) {
            if (key === targetKey) {
                subSecciones[key].classList.remove("hidden");
            } else {
                subSecciones[key].classList.add("hidden");
            }
        }
    });

    // Actualizar clase activa estética en el menú lateral
    DOM.menuItems.forEach(item => {
        if (item.getAttribute("data-section") === targetKey) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

// Escuchador de navegación del menú lateral
DOM.menuItems.forEach(item => {
    item.addEventListener("click", (e) => {
        const targetSection = e.currentTarget.getAttribute("data-section");
        if (targetSection) cambiarSubSeccion(targetSection);
    });
});

// Botón Volver a Aulas desde Pase de Lista
if (DOM.btnVolverAulas) {
    DOM.btnVolverAulas.addEventListener("click", () => {
        appState.aulaActiva = null;
        cambiarSubSeccion("aulas");
    });
}

// ==========================================================================
// 4. SISTEMA DE LOGIN (VISUAL / FLUJO COZY)
// ==========================================================================
if (DOM.formLogin) {
    DOM.formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        // Simulación de login profesional, limpia formulario y transiciona pantallas
        DOM.loginSection.classList.add("hidden");
        DOM.dashboardSection.classList.remove("hidden");
        cambiarSubSeccion("inicio");
        DOM.formLogin.reset();
    });
}

if (DOM.btnLogout) {
    DOM.btnLogout.addEventListener("click", () => {
        DOM.dashboardSection.classList.add("hidden");
        DOM.loginSection.classList.remove("hidden");
        appState.aulaActiva = null;
    });
}

// ==========================================================================
// 5. CONTROLADOR GENERAL DE MODALES
// ==========================================================================
function abrirModal(modalElement) {
    if (modalElement) modalElement.classList.remove("hidden");
}

function cerrarModal(modalElement) {
    if (modalElement) modalElement.classList.add("hidden");
}

// Escuchador dinámico para cualquier botón de cierre de modal
document.querySelectorAll(".btn-close-modal").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const targetModalId = e.currentTarget.getAttribute("data-modal");
        cerrarModal(document.getElementById(targetModalId));
    });
});

// Abrir modal de crear aula (Limpia campos y resetea estado de edición)
if (DOM.btnAbrirModalAula) {
    DOM.btnAbrirModalAula.addEventListener("click", () => {
        if (DOM.formAula) DOM.formAula.reset();
        if (DOM.aulaIdHidden) DOM.aulaIdHidden.value = "";
        if (DOM.modalAulaTitulo) DOM.modalAulaTitulo.textContent = "Nueva Aula";
        abrirModal(DOM.modalAula);
    });
}

// ==========================================================================
// 6. GESTIÓN DE AULAS (CRUD DIRECTO CON FIRESTORE)
// ==========================================================================

// Submit del Formulario de Aula (Soporta Crear y Editar)
if (DOM.formAula) {
    DOM.formAula.addEventListener("submit", async (e) => {
        e.preventDefault();
        const idAula = DOM.aulaIdHidden.value;
        const nombre = DOM.aulaNombre.value.trim();
        const materia = DOM.aulaMateria.value.trim();

        try {
            if (idAula) {
                // Modo Edición
                await editarAulaFirestore(idAula, nombre, materia);
            } else {
                // Modo Creación
                await crearAulaFirestore(nombre, materia);
            }
            cerrarModal(DOM.modalAula);
            DOM.formAula.reset();
        } catch (error) {
            alert("Error al procesar la operación en el aula.");
        }
    });
}

// DELEGACIÓN DE EVENTOS: Clicks en Tarjetas de Aula (Abrir, Editar, Eliminar)
if (DOM.gridAulas) {
    DOM.gridAulas.addEventListener("click", async (e) => {
        const btnAbrir = e.target.closest(".btn-abrir-aula");
        const btnEditar = e.target.closest(".btn-editar-aula");
        const btnEliminar = e.target.closest(".btn-eliminar-aula");

        if (btnAbrir) {
            const id = btnAbrir.getAttribute("data-id");
            const aula = appState.aulas.find(a => a.id === id);
            if (aula) iniciarPaseLista(aula);
        }

        if (btnEditar) {
            const id = btnEditar.getAttribute("data-id");
            const aula = appState.aulas.find(a => a.id === id);
            if (aula) {
                if (DOM.aulaIdHidden) DOM.aulaIdHidden.value = aula.id;
                if (DOM.aulaNombre) DOM.aulaNombre.value = aula.nombre;
                if (DOM.aulaMateria) DOM.aulaMateria.value = aula.materia;
                if (DOM.modalAulaTitulo) DOM.modalAulaTitulo.textContent = "Editar Aula";
                abrirModal(DOM.modalAula);
            }
        }

        if (btnEliminar) {
            const id = btnEliminar.getAttribute("data-id");
            if (confirm("¿Estás seguro de eliminar esta aula permanentemente?")) {
                try {
                    await eliminarAulaFirestore(id);
                } catch (error) {
                    alert("No se pudo eliminar el aula.");
                }
            }
        }
    });
}

// Pintado Reactivo de Tarjetas de Aula en el DOM
function renderizarTarjetasAulas(listaAulas) {
    if (!DOM.gridAulas) return;
    DOM.gridAulas.innerHTML = "";

    if (listaAulas.length === 0) {
        DOM.gridAulas.innerHTML = `
            <div class="no-data-cozy">
                <i class="fas fa-folder-open"></i>
                <p>No hay aulas registradas aún. ¡Comienza creando una!</p>
            </div>`;
        return;
    }

    listaAulas.forEach(aula => {
        const totalEstudiantes = aula.estudiantes ? aula.estudiantes.length : 0;
        const tarjeta = document.createElement("div");
        tarjeta.className = "card-aula"; // Mantiene tus estilos CSS de forma idéntica
        tarjeta.innerHTML = `
            <div class="card-body">
                <h3>${aula.nombre}</h3>
                <p class="materia-text">${aula.materia}</p>
                <span class="badge-students"><i class="fas fa-users"></i> ${totalEstudiantes} estudiantes</span>
            </div>
            <div class="card-actions">
                <button class="btn-action btn-abrir-aula" data-id="${aula.id}" title="Pasar Asistencia">
                    <i class="fas fa-clipboard-list"></i> Abrir
                </button>
                <button class="btn-action btn-editar-aula" data-id="${aula.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-eliminar-aula" data-id="${aula.id}" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        DOM.gridAulas.appendChild(tarjeta);
    });
}

// ==========================================================================
// 7. SUBSISTEMA DE ASISTENCIA Y PASAR LISTA (ESTUDIANTES)
// ==========================================================================
function iniciarPaseLista(aula) {
    appState.aulaActiva = aula;
    if (DOM.txtAsistenciaAula) DOM.txtAsistenciaAula.textContent = aula.nombre;
    if (DOM.txtAsistenciaMateria) DOM.txtAsistenciaMateria.textContent = aula.materia;
    
    if(DOM.printClassName){DOM.printClassName.textContent =aula.nombre;}
    if(DOM.printSubjectName){DOM.printSubjectName.textContent =aula.materia;}
    if(DOM.printDate){DOM.printDate.textContent =new Date().toLocaleDateString("es-NI");}

    renderizarEstudiantesAsistencia();
    cambiarSubSeccion("paseLista");
}

function renderizarEstudiantesAsistencia() {
    if (!DOM.listaEstudiantesAsistencia) return;
    DOM.listaEstudiantesAsistencia.innerHTML = "";

    const estudiantes = appState.aulaActiva.estudiantes || [];

    if (estudiantes.length === 0) {
        DOM.listaEstudiantesAsistencia.innerHTML = `
            <tr>
                <td colspan="3" class="text-center-cozy">
                    No hay estudiantes registrados en esta aula. ¡Agrega uno arriba!
                </td>
            </tr>`;
        return;
    }

    estudiantes.forEach((estudiante, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>
                <div class="student-info">
                    <i class="fas fa-user-circle student-avatar"></i>
                    <strong>${estudiante.nombre}</strong>
                </div>
            </td>
            <td>
                <select
                    class="select-cozy-status status-${estudiante.estado}"
                    data-index="${index}">
                    <option value="presente" ${estudiante.estado === 'presente' ? 'selected' : ''}>Presente</option>
                    <option value="ausente" ${estudiante.estado === 'ausente' ? 'selected' : ''}>Ausente</option>
                    <option value="tarde" ${estudiante.estado === 'tarde' ? 'selected' : ''}>Tarde</option>
                </select>
            </td>
            <td>
                <button class="btn-delete-student" data-index="${index}">
                    <i class="fas fa-user-minus"></i> Eliminar
                </button>
            </td>
        `;
        DOM.listaEstudiantesAsistencia.appendChild(fila);
    });
}

// Abrir modal agregar estudiante
if (document.getElementById("btn-abrir-modal-estudiante")) {
    document.getElementById("btn-abrir-modal-estudiante").addEventListener("click", () => {
        if (DOM.formEstudiante) DOM.formEstudiante.reset();
        abrirModal(DOM.modalEstudiante);
    });
}

// Submit Agregar Estudiante
if (DOM.formEstudiante) {
    DOM.formEstudiante.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!appState.aulaActiva) return;

        const nombre = DOM.estudianteNombre.value.trim();
        const listaActualizada = [...(appState.aulaActiva.estudiantes || [])];
        
        // Agregar estructura requerida
        listaActualizada.push({
            nombre: nombre,
            estado: "presente" // Por defecto entra como presente
        });

        try {
            await actualizarEstudiantesFirestore(appState.aulaActiva.id, listaActualizada);
            appState.aulaActiva.estudiantes = listaActualizada; // Actualización optimista local
            renderizarEstudiantesAsistencia();
            cerrarModal(DOM.modalEstudiante);
            DOM.formEstudiante.reset();
        } catch (error) {
            alert("Error al registrar el estudiante.");
        }
    });
}

// DELEGACIÓN DE EVENTOS EN TABLA: Cambios de Select y Eliminar Estudiante
if (DOM.listaEstudiantesAsistencia) {
    // Detectar cambios en los selectores de asistencia de forma reactiva en el cliente
    DOM.listaEstudiantesAsistencia.addEventListener("change", (e) => {
        if (e.target.classList.contains("select-cozy-status")) {
            const index = e.target.getAttribute("data-index");
            const nuevoEstado = e.target.value;

                e.target.classList.remove(
                    "status-presente",
                    "status-ausente",
                    "status-tarde"
                );

                e.target.classList.add(
                    `status-${nuevoEstado}`
                );

            if (appState.aulaActiva && appState.aulaActiva.estudiantes[index]) {
                appState.aulaActiva.estudiantes[index].estado = nuevoEstado;
            }
        }
    });

    // Detectar click en eliminar estudiante
    DOM.listaEstudiantesAsistencia.addEventListener("click", async (e) => {
        const btnEliminar = e.target.closest(".btn-delete-student");
        if (btnEliminar && appState.aulaActiva) {
            const index = parseInt(btnEliminar.getAttribute("data-index"), 10);
            if (confirm(`¿Remover a ${appState.aulaActiva.estudiantes[index].nombre} del aula?`)) {
                const listaActualizada = [...appState.aulaActiva.estudiantes];
                listaActualizada.splice(index, 1);

                try {
                    await actualizarEstudiantesFirestore(appState.aulaActiva.id, listaActualizada);
                    appState.aulaActiva.estudiantes = listaActualizada;
                    renderizarEstudiantesAsistencia();
                } catch (error) {
                    alert("No se pudo eliminar al estudiante.");
                }
            }
        }
    });
}

// Guardar Pase de Lista definitivo en Firestore
if (DOM.btnGuardarAsistencia) {
    DOM.btnGuardarAsistencia.addEventListener("click", async () => {
        if (!appState.aulaActiva) return;
        try {
            await actualizarEstudiantesFirestore(appState.aulaActiva.id, appState.aulaActiva.estudiantes);
            alert("¡Asistencia guardada con éxito en Firestore!");
        } catch (error) {
            alert("Error al salvar el pase de lista.");
        }
    });
}

// Boton de pdf
if(DOM.btnGenerarPdf){

    DOM.btnGenerarPdf.addEventListener(
        "click",
        () => {

            window.print();

        }
    );

}

// ==========================================================================
// 8. DASHBOARD DINÁMICO / REPORTES GENERALES (KPI DE INICIO)
// ==========================================================================
function calcularEstadisticasGenerales(listaAulas) {
    if (!DOM.statsContainer) return;

        let totalAulas = listaAulas.length;

        let totalEstudiantes = 0;

        let presentes = 0;

        let ausentes = 0;

        let tardes = 0;

        listaAulas.forEach(aula => {

            (aula.estudiantes || [])
            .forEach(estudiante => {

                totalEstudiantes++;

                if(estudiante.estado === "presente")
                    presentes++;

                else if(estudiante.estado === "ausente")
                    ausentes++;

                else if(estudiante.estado === "tarde")
                    tardes++;

            });

        });

        const totalEstados =
        presentes + ausentes + tardes;

        const porcentajeAsistencia =
        totalEstados > 0

        ? Math.round(
            (presentes / totalEstados)
            * 100
        )

        : 0;

    DOM.statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-chalkboard"></i></div>
            <div class="stat-info">
                <h3>${totalAulas}</h3>
                <p>Aulas Activas</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-graduation-cap"></i></div>
            <div class="stat-info">
                <h3>${totalEstudiantes}</h3>
                <p>Alumnos Totales</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
            <div class="stat-info">
                <h3>${porcentajeAsistencia}%</h3>
                <p>Asistencia General</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
            <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
            <h3>${tardes}</h3>
            <p>Tardanzas</p>
        </div>
</div>
    `;
}

// ==========================================================================
// 9. INICIALIZACIÓN SÍNCRONA EN TIEMPO REAL (EL CORE REACTIVO)
// ==========================================================================
// Escuchamos la base de datos. Si algo cambia en la nube, la UI reacciona sola.
escucharAulas((aulasActualizadas) => {
    appState.aulas = aulasActualizadas;
    
    // 1. Refrescar las tarjetas de aulas
    renderizarTarjetasAulas(aulasActualizadas);
    
    // 2. Refrescar los contadores e indicadores de la sección Inicio
    calcularEstadisticasGenerales(aulasActualizadas);
    
    // 3. Si el profesor tiene un aula abierta en este momento, actualiza su tabla en vivo
    if (appState.aulaActiva) {
        const aulaFresca = aulasActualizadas.find(a => a.id === appState.aulaActiva.id);
        if (aulaFresca) {
            appState.aulaActiva = aulaFresca;
            renderizarEstudiantesAsistencia();
        }
    }
});
