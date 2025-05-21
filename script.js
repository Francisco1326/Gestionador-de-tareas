let contenidoinicial = document.body.innerHTML;

function cambiarContenido() {
    history.pushState({ page: "organizador" }, "Organizador de Tareas", "#organizador");
    mostrarOrganizador();
}

function mostrarOrganizador() {
    document.body.innerHTML = `
        <h1 class="titulo">Organizador de Tareas</h1>
        <p>Agrega las tareas que desees organizar.</p>
        <p Class= "aviso"><strong> Aviso Importante: </strong> Para eliminar una tarea, simplemente da clic sobre ella y presiona eliminar.</p>
        <div class="contenedor-principal">
            <div class="contenedor-tablas">
                <div class="tabla" id="pendiente" ondragover="permitirSoltar(event)" ondrop="soltar(event)">
                    <h2>Pendiente</h2>
                </div>
                <div class="tabla" id="proceso" ondragover="permitirSoltar(event)" ondrop="soltar(event)">
                    <h2>En Proceso</h2>
                </div>
                <div class="tabla" id="completado" ondragover="permitirSoltar(event)" ondrop="soltar(event)">
                    <h2>Completado</h2>
                </div>
            </div>

            <div class="panel-actividades" id="panelActividades">
                <h3>📝 Actividades Recientes</h3>
                <ul id="listaActividades"></ul>
            </div>
        </div>

        <div class="botones">
            <button class="boton-comenzar" onclick="agregarTarea('pendiente')"><strong>Agregar tarea +</strong></button>
            <button class="boton-comenzar" onclick="agregarSubtarea()"><strong>Agregar sub tarea +</strong></button>
            <button class="boton-comenzar" onclick="verTodasLasTareas()"><strong>Historial de tareas.</strong></button> 
        </div>
    `;

    cargarTareas();
    hacerTareasArrastrables();
}

function agregarTarea(seccion) {
    let tareaTexto = prompt("Escribe la nueva tarea");
    if (tareaTexto) {
        let nuevaTarea = document.createElement("div");
        let tareaId = "tarea-" + new Date().getTime();
        nuevaTarea.id = tareaId;
        nuevaTarea.classList.add("tarea");
        nuevaTarea.setAttribute("draggable", "true");
        nuevaTarea.setAttribute("ondragstart", "arrastrar(event)");
        nuevaTarea.innerHTML = `
            <div class="tarea-contenido">${tareaTexto}</div>
            <div class="subtasks"></div>
        `;
    // Agregar un evento de clic a la tarea para que al hacer clic se elimine
    nuevaTarea.addEventListener("click", function() {
        if (confirm(`¿Seguro que quieres eliminar la tarea "${tareaTexto}"?`)) {
            nuevaTarea.remove();
            registrarActividad(`Se eliminó la tarea "${tareaTexto}"`);
            eliminarTareaLocalStorage(tareaId); // Eliminar también del localStorage
            guardarTareas();  // Guardar los cambios
        }
    });
        document.getElementById(seccion).appendChild(nuevaTarea);
        registrarActividad(`Se agregó la tarea "${tareaTexto}" a ${seccion}`);
        guardarTareas();
    }
}

function eliminarTareaLocalStorage(tareaId) {
    // Obtener las tareas guardadas en localStorage
    let datos = JSON.parse(localStorage.getItem("tareas"));
    if (datos) {
        // Eliminar la tarea del objeto de tareas en el localStorage
        ['pendiente', 'proceso', 'completado'].forEach(seccion => {
            datos[seccion] = datos[seccion].replace(new RegExp(`<div id="${tareaId}".*?</div>`, 'g'), '');
        });
        // Guardar de nuevo el objeto actualizado en localStorage
        localStorage.setItem("tareas", JSON.stringify(datos));
    }
}


function agregarSubtarea() {
    let tareas = Array.from(document.querySelectorAll('.tarea'));
    if (tareas.length === 0) {
        alert('Primero crea una tarea.');
        return;
    }

    let listaTareas = tareas.map((tarea, index) => {
        let contenido = tarea.querySelector('.tarea-contenido');
        let texto = contenido ? contenido.textContent.replace(/ ✔- completado$/, '') : '';
        return `${index + 1}: ${texto}`;
    });

    let seleccion = prompt(`Selecciona la tarea padre:\n${listaTareas.join('\n')}`);
    let indice = parseInt(seleccion) - 1;

    if (isNaN(indice) || indice < 0 || indice >= tareas.length) {
        alert('Selección inválida.');
        return;
    }

    let tareaPadre = tareas[indice];
    let subtareaTexto = prompt('Escribe la sub tarea:');
    if (!subtareaTexto) return;

    let subtarea = document.createElement('div');
    subtarea.className = 'subtarea';
    subtarea.innerHTML = `
        <span>${subtareaTexto}</span>
        <button class="completar-subtarea" onclick="marcarSubtareaCompletada(this)">✓</button>
    `;
    
    tareaPadre.querySelector('.subtasks').appendChild(subtarea);
    guardarTareas();
}

function marcarSubtareaCompletada(boton) {
    let subtarea = boton.parentElement;
    subtarea.classList.toggle('completada');
    boton.style.backgroundColor = subtarea.classList.contains('completada') ? 'green' : '';
    guardarTareas();
}

function cargarTareas() {
    let datos = JSON.parse(localStorage.getItem("tareas"));
    if (datos) {
        ['pendiente', 'proceso', 'completado'].forEach(seccion => {
            let tempDiv = document.createElement('div');
            tempDiv.innerHTML = datos[seccion];
            tempDiv.querySelectorAll('.tarea').forEach(tarea => {
                if (!tarea.querySelector('.tarea-contenido')) {
                    tarea.innerHTML = `
                        <div class="tarea-contenido">${tarea.innerHTML}</div>
                        <div class="subtasks"></div>
                    `;
                    tarea.setAttribute("draggable", "true");
                    tarea.setAttribute("ondragstart", "arrastrar(event)");
                }
            });
            document.getElementById(seccion).innerHTML = tempDiv.innerHTML;
        });
        hacerTareasArrastrables();
    }
}

// Mantenemos las funciones originales sin cambios desde aquí...
function guardarTareas() {
    let datos = {
        pendiente: document.getElementById("pendiente").innerHTML,
        proceso: document.getElementById("proceso").innerHTML,
        completado: document.getElementById("completado").innerHTML
    };
    localStorage.setItem("tareas", JSON.stringify(datos));
}

function registrarActividad(texto) {
    const lista = document.getElementById("listaActividades");
    if (lista) {
        const item = document.createElement("li");
        item.textContent = texto;
        lista.prepend(item); 
    }
}

function hacerTareasArrastrables() {
    document.querySelectorAll(".tarea").forEach(tarea => {
        tarea.setAttribute("draggable", "true");
        tarea.setAttribute("ondragstart", "arrastrar(event)");
    });
}

function arrastrar(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    setTimeout(() => event.target.style.display = "none", 0);
}

function permitirSoltar(event) {
    event.preventDefault();
}

function soltar(event) {
    event.preventDefault();
    let tareaId = event.dataTransfer.getData("text/plain");
    let tarea = document.getElementById(tareaId);
    if (tarea) {
        tarea.style.display = "block";
        let destino = event.target.closest(".tabla");

        if (destino && destino.classList.contains("tabla")) {
            destino.appendChild(tarea);
            registrarActividad(`La tarea "${tarea.textContent.replace('✔- completado', '').trim()}" se movió a ${destino.id}`);

            if (destino.id === "completado") {
                if(!tarea.querySelector(".palomita")) {
                    let palomita = document.createElement("span");
                    palomita.textContent = " ✔- completado";
                    palomita.style.color = "green";
                    palomita.style.fontSize = "20px";
                    palomita.classList.add("palomita");
                    tarea.querySelector('.tarea-contenido').appendChild(palomita);
                    alert("¡Tarea completada exitosamente!");
                }
                registrarActividad(`✔ La tarea "${tarea.textContent.replace('✔- completado', '').trim()}" fue completada`);
            } else {
                let palomita = tarea.querySelector(".palomita");
                if (palomita) {
                    palomita.remove();
                }
            }
            guardarTareas();
        }
    }
}

function eliminarSubtarea(boton) {
    const subtarea = boton.closest(".subtarea");
    const subtareaTexto = subtarea.querySelector("span")?.textContent || "subtarea";

    if (confirm(`¿Seguro que quieres eliminar la subtarea "${subtareaTexto}"?`)) {
        const tareaPadre = subtarea.closest(".tarea");
        const tareaId = tareaPadre.id;

        // Eliminar la subtarea de la vista
        subtarea.remove();

        // Eliminar la subtarea del localStorage
        eliminarSubtareaLocalStorage(tareaId, subtareaTexto);

        registrarActividad(`Se eliminó la subtarea "${subtareaTexto}" de la tarea "${tareaPadre.querySelector('.tarea-contenido').textContent}"`);
        guardarTareas();  // Guardar los cambios en el localStorage
    }
}

function eliminarSubtareaLocalStorage(tareaId, subtareaTexto) {
    // Obtener las tareas guardadas en localStorage
    let datos = JSON.parse(localStorage.getItem("tareas"));
    if (datos) {
        // Buscar la tarea que contiene la subtarea a eliminar
        ['pendiente', 'proceso', 'completado'].forEach(seccion => {
            // Buscar la tarea por su ID y eliminar la subtarea correspondiente
            datos[seccion] = datos[seccion].replace(new RegExp(`<div id="${tareaId}".*?<span>${subtareaTexto}</span>.*?</div>`, 'g'), '');
        });
        // Guardar de nuevo el objeto actualizado en localStorage
        localStorage.setItem("tareas", JSON.stringify(datos));
    }
}

function verTodasLasTareas() {
    let datos = JSON.parse(localStorage.getItem("tareas"));
    if (!datos) {
        alert("No hay tareas registradas.");
        return;
    }

    // Crear un array para almacenar todas las tareas con sus fechas
    let todasLasTareas = [];

    // Función para extraer tareas con sus timestamps
    function extraerTareasDesdeHTML(htmlSeccion, seccionNombre) {
        let contenedor = document.createElement("div");
        contenedor.innerHTML = htmlSeccion;

        contenedor.querySelectorAll(".tarea").forEach(tarea => {
            let id = tarea.id;
            let contenido = tarea.innerHTML;
            let timestamp = parseInt(id.replace("tarea-", ""));

            todasLasTareas.push({ id, contenido, timestamp, seccion: seccionNombre });
        });
    }

    extraerTareasDesdeHTML(datos.pendiente, "Pendiente");
    extraerTareasDesdeHTML(datos.proceso, "En Proceso");
    extraerTareasDesdeHTML(datos.completado, "Completado");

    // Ordenar las tareas por timestamp
    todasLasTareas.sort((a, b) => a.timestamp - b.timestamp);

    // Cambiar el contenido de la página para mostrar todas las tareas
    document.body.innerHTML = `
        <h1 class="titulo">Historial de tareas (en orden)</h1>
        <button class="boton-comenzar" onclick="mostrarOrganizador()">Volver al organizador</button>
        <button class="boton-comenzar" onclick="borrarHistorial()">Borrar historial</button>
        <div class="lista-tareas">
            ${todasLasTareas.map(tarea => `
                <div class="tarea">
                    <div>${tarea.contenido}</div>
                    <small><em>${tarea.seccion}</em></small>
                </div>
            `).join("")}
        </div>
    `;
}

function borrarHistorial() {
    if (confirm("¿Estás seguro de que deseas borrar el historial de tareas? Esta acción no se puede deshacer.")) {
        localStorage.removeItem("tareas");
        alert("Historial eliminado exitosamente.");
        mostrarOrganizador(); // Vuelve a la vista principal
    }
}

window.onpopstate = function (event) {
    if (!event.state) {
        document.body.innerHTML = contenidoinicial;
    }
};