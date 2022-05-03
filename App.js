import React from 'react';
import Navigation from './app/navigation/Navigation';
import { LogBox } from "react-native";

//ignorando el mensaje al cargar avatar
LogBox.ignoreLogs(["Setting a timer"]);

//ignoramos todos los warning, para que no me jodan
LogBox.ignoreAllLogs();

export default function App() {
/*  para probar usamos el useEffect
  useEffect( () => {
    firebase.auth().onAuthStateChanged(user => {
      console.log(user)
      //si todo esta bien, la funcion no tira error
      //osea.. si no estamos logueados nos tira null, sino nos tira el usuario.
    })
  }, [])
*/

  return (
    <Navigation />
  );
}


