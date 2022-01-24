import firebase from "firebase/app"

const firebaseConfig = {
    apiKey: "AIzaSyArhIn-NajUeB72PI2SX-AyCtkXP4cQNJA",
    authDomain: "tenedores-4f33c.firebaseapp.com",
    projectId: "tenedores-4f33c",
    storageBucket: "tenedores-4f33c.appspot.com",
    messagingSenderId: "362661691212",
    appId: "1:362661691212:web:fe4dd1a3c560db6eea99e9"
};

                        //tomo el paquete firebase y uso su funcion initializeApp
                        //otra manera es importando la funcion {initializeApp} y me ahorro el "firebase."
export const firebaseApp = firebase.initializeApp(firebaseConfig)