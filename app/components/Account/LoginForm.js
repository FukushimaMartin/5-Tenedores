import React, {useState} from "react";
import { StyleSheet, View } from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import { isEmpty } from "lodash";
import * as firebase from "firebase";
import { useNavigation } from "@react-navigation/core";

import { validateEmail } from "../../utils/validations";
import Loading from "../Loading";


export default function LoginForm(props){
  const {toastRef} = props;
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState( defaultFormValue() )
  const [loading, setloading] = useState(false);

  firebase.auth().onAuthStateChanged((user) => {
    user && navigation.navigate("account")
  })

  const onChange = (event, type) => {
    setFormData({ ...formData, [type]: event.nativeEvent.text })
  }

  const onSubmit = () => {
    if(
      isEmpty(formData.email) || 
      isEmpty(formData.password)
    ) {
      toastRef.current.show("Todos los campos son obligatorios")
    } else if ( !validateEmail(formData.email) ) {
      toastRef.current.show("El email no es correcto")
    } else {
      setloading(true)
      firebase
        .auth()
        .signInWithEmailAndPassword( formData.email, formData.password )
        .then( () => {
          setloading(false)
          navigation.goBack()
        })
        .catch( () => {
          setloading(false)
          toastRef.current.show("Email y/o contraseña incorrecta")
        })
    }
  }

  return(
    <View style={styles.formContainer}>
      <Input
        placeholder="Correo Electrónico"
        containerStyle={styles.inputForm}
        onChange={ (event) => {onChange(event,"email")} }
        rightIcon={
          <Icon
            type="material-community"
            name="at"
            iconStyle={styles.iconRight}
          />
        }
      />
      <Input
        placeholder="Contraseña"
        containerStyle={styles.inputForm}
        password={true}
        secureTextEntry={showPassword ? false : true}
        onChange={ (event) => {onChange(event,"password")} }
        rightIcon={
          <Icon
            type="material-community"
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            iconStyle={styles.iconRight}
            onPress={ () => {setShowPassword(!showPassword)} }
          />
        }
      />
      <Button
        title="Iniciar Sesión"
        //estilos al contenedor
        containerStyle={styles.btnContainerLogin}
        //estilos al boton
        buttonStyle={styles.btnLogin}
        onPress={onSubmit}
      />
      <Loading isVisible={loading} text="Iniciando Sesión" />
    </View>
  )
}

function defaultFormValue() {
  return {
    email: "",
    password: ""
  }
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  inputForm: {
    width: "100%",
    marginTop: 20,
  },
  btnContainerLogin: {
    marginTop: 20,
    width: "95%",
  },
  btnLogin: {
    backgroundColor: "#00a680",
  },
  iconRight: {
    color: "#c1c1c1",
  }
})