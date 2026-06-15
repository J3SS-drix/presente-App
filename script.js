import { db } from "./firebase.js";

console.log("Firebase conectado");
console.log(db);

function entrar() {

    document.getElementById("login").style.display = "none";

    document.getElementById("dashboard").style.display = "flex";

}

    window.entrar = entrar;

/* BOTONES DE ASISTENCIA */

window.onload = function () {

    const students = document.querySelectorAll(".student");

    students.forEach(student => {

        const buttons = student.querySelectorAll("button");

        buttons.forEach(button => {

            button.addEventListener("click", () => {

                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active-present",
                        "active-absent",
                        "active-late"
                    );

                });

                if(button.classList.contains("present")){
                    button.classList.add("active-present");
                }

                if(button.classList.contains("absent")){
                    button.classList.add("active-absent");
                }

                if(button.classList.contains("late")){
                    button.classList.add("active-late");
                }

            });

        });

    });

};

function mostrarSeccion(seccionId){

    /* SECCIONES */

    const sections = document.querySelectorAll("main section");

    sections.forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(seccionId)
        .classList.remove("hidden");



    if(seccionId === "asistencia" && aulaActual){

        document.getElementById("attendanceClass")
        .textContent =
        "📚 Aula: " + aulaActual.nombre;



        document.getElementById("attendanceSubject")
        .textContent =
        "📖 Materia: " + aulaActual.materia;



        renderAsistencia();

    }



    /* SIDEBAR ACTIVE */

    const menuItems = document.querySelectorAll(".sidebar li");

    menuItems.forEach(item => {
        item.classList.remove("active");
    });

    event.target.classList.add("active");

}

const classContainer =
document.getElementById("classContainer");



let aulas = [];

let aulaActual = null;



/* CARGAR */

window.addEventListener("load", () => {

    const guardadas =
    localStorage.getItem("aulas");



    if(guardadas){

        aulas = JSON.parse(guardadas);

        aulas.forEach(aula => {
            renderAula(aula);
        });

    }

    actualizarDashboard();
});



/* CREAR */

function crearAula(){

    const input =
    document.getElementById("className");

    const nombre = input.value.trim();



    if(nombre === ""){
        return;
    }

   const materia =
        prompt("Ingrese la materia:");



    if(!materia){
        return;
    }

    const nuevaAula = {

    nombre:nombre,

    materia:materia,

    estudiantes:[]
    };



    aulas.push(nuevaAula);



    localStorage.setItem(
        "aulas",
        JSON.stringify(aulas)
    );



    renderAula(nuevaAula);



    input.value = "";

    actualizarDashboard();

    actualizarReportes();
}



/* RENDER */

function renderAula(aula){

    const card =
    document.createElement("div");

    card.classList.add("class-card");



    card.innerHTML = `

    <div class="class-top">

        <div>

            <h3>${aula.nombre}</h3>

            <p>
                📖 ${aula.materia}
            </p>

        </div>



        <div class="class-actions">

            <button
            class="edit-btn">

                <i class="fa-solid fa-pen"></i>

            </button>



            <button
            class="delete-btn">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

    </div>

`;

const editBtn =
card.querySelector(".edit-btn");

const deleteBtn =
card.querySelector(".delete-btn");

editBtn.addEventListener("click", (event) => {

    event.stopPropagation();



    const nuevoNombre =
    prompt(
        "Editar nombre del aula:",
        aula.nombre
    );



    if(!nuevoNombre){
        return;
    }



    aula.nombre = nuevoNombre;



    localStorage.setItem(
        "aulas",
        JSON.stringify(aulas)
    );



    card.querySelector("h3")
    .textContent = nuevoNombre;

});

deleteBtn.addEventListener("click", (event) => {

    event.stopPropagation();



    const confirmar =
    confirm(
        "¿Eliminar esta aula?"
    );



    if(!confirmar){
        return;
    }



    aulas =
    aulas.filter(a => a !== aula);



    localStorage.setItem(
        "aulas",
        JSON.stringify(aulas)
    );



    card.remove();

});
    
card.addEventListener("click", () => {

    abrirAula(aula);

});



    classContainer.appendChild(card);

}

function abrirAula(aula){

    aulaActual = aula;



    mostrarSeccion("classView");



    document.getElementById("classTitle")
    .textContent = aula.nombre;



    document.getElementById("attendanceClass")
    .textContent =
    "📚 Aula: " + aula.nombre;



    document.getElementById("attendanceSubject")
    .textContent =
    "📖 Materia: " + aula.materia;

    renderEstudiantes();

    renderAsistencia();
}

function agregarEstudiante(){

    const nombre =
    prompt("Nombre del estudiante:");



    if(!nombre){
        return;
    }



    aulaActual.estudiantes.push({

        nombre:nombre,

        estado:null

    });



    localStorage.setItem(
        "aulas",
        JSON.stringify(aulas)
    );



    renderEstudiantes();

    actualizarDashboard();

    actualizarReportes();
}



function renderEstudiantes(){

    const lista =
    document.getElementById("studentList");



    lista.innerHTML = "";



    aulaActual.estudiantes.forEach(estudiante => {

        const div =
        document.createElement("div");



        div.classList.add("student");


    div.innerHTML = `

        <span>${estudiante.nombre}</span>



        <div class="actions">

            <button
                class="
                present
                ${estudiante.estado === 'presente'
                ? 'active-present'
                : ''}
                "
            onclick="
            cambiarEstado(
            '${estudiante.nombre}',
            'presente'
            )">

                <i class="fa-solid fa-check"></i>

            </button>



            <button
            class="
                absent
                ${estudiante.estado === 'ausente'
                ? 'active-absent'
                : ''}
                "

            onclick="
            cambiarEstado(
            '${estudiante.nombre}',
            'ausente'
            )">

                <i class="fa-solid fa-xmark"></i>

            </button>



            <button
            class="
                late
                ${estudiante.estado === 'tarde'
                ? 'active-late'
                : ''}
                "

            onclick="
            cambiarEstado(
            '${estudiante.nombre}',
            'tarde'
            )">

                <i class="fa-solid fa-clock"></i>

            </button>

        </div>

    `;



        lista.appendChild(div);

    });

}



function cambiarEstado(nombre, estado){

    const estudiante =
    aulaActual.estudiantes.find(
        e => e.nombre === nombre
    );



    estudiante.estado = estado;



    localStorage.setItem(
        "aulas",
        JSON.stringify(aulas)
    );



    renderEstudiantes();

    actualizarDashboard();
    
    actualizarReportes();

}

function actualizarDashboard(){

    let estudiantes = 0;

    let presentes = 0;

    let ausentes = 0;

    let tarde = 0;



    aulas.forEach(aula => {

        estudiantes += aula.estudiantes.length;



        aula.estudiantes.forEach(estudiante => {

            if(estudiante.estado === "presente"){

                presentes++;

            }

            else if(estudiante.estado === "ausente"){

                ausentes++;

            }

            else if(estudiante.estado === "tarde"){

                tarde++;

            }

        });

    });



    document.getElementById("totalStudents")
    .textContent = estudiantes;



    document.getElementById("totalPresent")
    .textContent = presentes;



    document.getElementById("totalAbsent")
    .textContent = ausentes;



    document.getElementById("totalLate")
    .textContent = tarde;


    actualizarReportes();
}

function actualizarReportes(){

    let aulasTotal =
    aulas.length;

    let estudiantes = 0;

    let presentes = 0;

    let ausentes = 0;

    let tarde = 0;



    aulas.forEach(aula => {

        estudiantes +=
        aula.estudiantes.length;



        aula.estudiantes.forEach(estudiante => {

            if(estudiante.estado === "presente"){

                presentes++;

            }

            else if(estudiante.estado === "ausente"){

                ausentes++;

            }

            else if(estudiante.estado === "tarde"){

                tarde++;

            }

        });

    });



    let porcentaje = 0;



    if(estudiantes > 0){

        porcentaje =
        (
            presentes /
            estudiantes
        ) * 100;
    }



    document.getElementById("reportAulas")
    .textContent = aulasTotal;



    document.getElementById("reportStudents")
    .textContent = estudiantes;



    document.getElementById("reportPresent")
    .textContent = presentes;



    document.getElementById("reportAbsent")
    .textContent = ausentes;



    document.getElementById("reportLate")
    .textContent = tarde;



    document.getElementById("attendancePercent")
    .textContent =
    porcentaje.toFixed(1) + "%";

}

function renderAsistencia(){

    const container =
    document.getElementById(
        "attendanceStudents"
    );



    container.innerHTML = "";



    if(!aulaActual){

        container.innerHTML =
        "<p>Seleccione un aula.</p>";

        return;

    }



    aulaActual.estudiantes.forEach(
        estudiante => {

        const div =
        document.createElement("div");



        div.classList.add(
            "student"
        );



        div.innerHTML = `

            <span>
                ${estudiante.nombre}
            </span>

            <div class="actions">

                <button
                class="present">

                    <i class="fa-solid fa-check"></i>

                </button>

                <button
                class="absent">

                    <i class="fa-solid fa-xmark"></i>

                </button>

                <button
                class="late">

                    <i class="fa-solid fa-clock"></i>

                </button>

            </div>

        `;



        const buttons =
        div.querySelectorAll("button");



        buttons[0].onclick = () => {

            estudiante.estado =
            "presente";



            guardarDatos();

            actualizarDashboard();

            actualizarReportes();

            renderAsistencia();

        };



        buttons[1].onclick = () => {

            estudiante.estado =
            "ausente";



            guardarDatos();

            actualizarDashboard();

            actualizarReportes();

            renderAsistencia();

        };



        buttons[2].onclick = () => {

            estudiante.estado =
            "tarde";



            guardarDatos();

            actualizarDashboard();

            actualizarReportes();

            renderAsistencia();

        };



        container.appendChild(div);

    });

}

function guardarDatos(){

    localStorage.setItem(
        "aulas",
        JSON.stringify(aulas)
    );

}