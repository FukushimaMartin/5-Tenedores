import React, { useState, useEffect } from 'react'
import * as firebase from "firebase";
import UserGuest from "./UserGuest";
import UserLogged from './UserLogged';

import Loading from "../../components/Loading";

export default function Account() {
  const [login, setLogin] = useState(null);

  //useEffect se ejecuta con un lambda, y luego de las llaves colocamos un array
  //si los elementos del array fueron modificados, entonces vuelve a ejecutar useEffect
  useEffect( () => {
    firebase.auth().onAuthStateChanged( (user) => {
      !user ? setLogin(false) : setLogin(true);
      //verificamos si hay un usuario conectado y con el resultado seteamos nuestro estado login
    })
  }, [] );

  if (login === null) return <Loading isVisible={true} text="Cargando..."/>;

  return login ? <UserLogged /> : <UserGuest />;
}