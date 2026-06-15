// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



// Configuración de tu proyecto

const firebaseConfig = {
  apiKey: "AIzaSyBb6Y4aeYXLTu2wq2KtVS-JcBfulKqYnRc",
  authDomain: "presente-ef9af.firebaseapp.com",
  projectId: "presente-ef9af",
  storageBucket: "presente-ef9af.firebasestorage.app",
  messagingSenderId: "794715558769",
  appId: "1:794715558769:web:e7341dc92f4a03795f1cd0",
  measurementId: "G-PX0Q4RY8B8"
};



// Inicializar Firebase

const app = initializeApp(firebaseConfig);



// Base de datos

const db = getFirestore(app);



// Exportar

export { db };