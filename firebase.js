// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración de Firebase (Se mantiene tu configuración actual del repositorio)
const firebaseConfig = {
    apiKey: "AIzaSyAs...", // Reemplaza con tus credenciales completas si es necesario
    authDomain: "presente-app-df26b.firebaseapp.com",
    projectId: "presente-app-df26b",
    storageBucket: "presente-app-df26b.firebasestorage.app",
    messagingSenderId: "1090150943315",
    appId: "1:1090150943315:web:86f67160ba79ffbc0fa511"
};

// Inicializar Firebase y el servicio de Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ==========================================
// OPERACIONES EN TIEMPO REAL (REACTIVIDAD)
// ==========================================

/**
 * Sincroniza la colección de aulas en tiempo real con la aplicación.
 * @param {Function} callback - Función que se ejecuta automáticamente cada vez que cambian los datos en Firestore.
 */
export const escucharAulas = (callback) => {
    const aulasRef = collection(db, "aulas");
    return onSnapshot(aulasRef, (snapshot) => {
        const aulas = [];
        snapshot.forEach((doc) => {
            aulas.push({ id: doc.id, ...doc.data() });
        });
        callback(aulas); // Enviamos el arreglo actualizado al controlador (script.js)
    }, (error) => {
        console.error("Error en la sincronización en tiempo real:", error);
    });
};

// ==========================================
// CRUD: GESTIÓN DE AULAS
// ==========================================

/**
 * Crea una nueva aula con la estructura requerida.
 * @param {string} nombre - Nombre o código del aula (ej. 3T1-CO)
 * @param {string} materia - Nombre de la asignatura
 */
export const crearAulaFirestore = async (nombre, materia) => {
    try {
        const aulasRef = collection(db, "aulas");
        await addDoc(aulasRef, {
            nombre,
            materia,
            estudiantes: [] // Inicialmente el aula no tiene estudiantes
        });
    } catch (error) {
        console.error("Error al crear el aula en Firestore:", error);
        throw error;
    }
};

/**
 * Modifica los datos de identificación de un aula existente.
 * @param {string} idAula - ID del documento en Firestore
 * @param {string} nuevoNombre 
 * @param {string} nuevaMateria 
 */
export const editarAulaFirestore = async (idAula, nuevoNombre, nuevaMateria) => {
    try {
        const aulaDocRef = doc(db, "aulas", idAula);
        await updateDoc(aulaDocRef, {
            nombre: nuevoNombre,
            materia: nuevaMateria
        });
    } catch (error) {
        console.error("Error al editar el aula en Firestore:", error);
        throw error;
    }
};

/**
 * Elimina permanentemente un aula de la base de datos.
 * @param {string} idAula - ID del documento a eliminar
 */
export const eliminarAulaFirestore = async (idAula) => {
    try {
        const aulaDocRef = doc(db, "aulas", idAula);
        await deleteDoc(aulaDocRef);
    } catch (error) {
        console.error("Error al eliminar el aula en Firestore:", error);
        throw error;
    }
};

// ==========================================
// GESTIÓN DE ESTUDIANTES Y PASE DE LISTA
// ==========================================

/**
 * Actualiza la lista completa de estudiantes de un aula.
 * Esta función única resuelve tres requisitos: crear estudiante, eliminar estudiante y guardar asistencia.
 * @param {string} idAula - ID del aula afectada
 * @param {Array} listaEstudiantes - El arreglo completo de estudiantes actualizado [{nombre, estado}]
 */
export const actualizarEstudiantesFirestore = async (idAula, listaEstudiantes) => {
    try {
        const aulaDocRef = doc(db, "aulas", idAula);
        await updateDoc(aulaDocRef, {
            estudiantes: listaEstudiantes
        });
    } catch (error) {
        console.error("Error al actualizar la lista de estudiantes en Firestore:", error);
        throw error;
    }
};
