import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Avatar } from "react-native-elements";
import * as firebase from  "firebase";
import * as ImagePicker from "expo-image-picker";
import { Camera } from 'expo-camera';


export default function InfoUser(props){
    const { userInfo: {uid, photoURL, displayName, email},
        toastRef,
        setLoading,
        setLoadingText //no me funciono colocar el loading(ej 76.)
    } = props;
//    const { photoUrl } = userInfo;   (esto lo hago resumido, colocandolo arriba) de props saco el userInfo, y de userInfo saco el photoUrl

    //console.log(props.userInfo)

    const changeAvatar = async () => {
        const resultPermissions = await Camera.requestCameraPermissionsAsync();
        // console.log(resultPermissions)
        const resultPermissionsCamera = resultPermissions.status;

        if(resultPermissionsCamera === "denied"){
            toastRef.current.show("Es necesario aceptar los permisos de la galeria")
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4,3]
            })

            if(result.cancelled) {
                toastRef.current.show("Has cancelado la selección de imagen")
            } else {
                uploadImage(result.uri)
                    .then( () => { updatePhotoUrl() } ) //imagen cargada
                    .catch( () => {
                        toastRef.current.show("Error al cargar la imagen")
                    })
            }
        }
    }

    const uploadImage = async (uri) => {
        setLoadingText("Actualizando avatar")
        setLoading(true)

        //console.log(uri)
        const response = await fetch(uri);
        const blob = await response.blob();
        //console.log(JSON.stringify(response))
        //console.log(JSON.stringify(blob))

        const ref = firebase.storage().ref().child(`avatar/${uid}`)

        return ref.put(blob)
    }

    const updatePhotoUrl = () => {
        firebase
            .storage()
            .ref(`avatar/${uid}`)
            .getDownloadURL()
            .then( async (response) => {
                //console.log(response) ya vemos la url de la foto
                const update = { photoURL: response }
                await firebase.auth().currentUser.updateProfile(update);
                // console.log("Imagen Actualizada")
                setLoading(false)
            })
            .catch( () => {
                toastRef.current.show("Error al cargar la imagen")
            })
    }


    return(
        <View style={styles.viewUserInfo}>
            <Avatar
                rounded
                size="large"
                showEditButton
                onEditPress={changeAvatar}
                containerStyle={styles.userInfoAvatar}
                source={photoURL ? {uri: photoURL} : require("../../../assets/img/avatar-default.jpg")}
            />
            <View>
                <Text style={styles.displayName}>
                    {displayName ? displayName : "Anónimo"}
                </Text>
                <Text>
                    {email ? email : "Social Login"}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    viewUserInfo: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        backgroundColor: "#f2f2f2",
        paddingTop: 30,
        paddingBottom: 30,
    },
    userInfoAvatar: {
        marginRight: 20
    },
    displayName: {
        fontWeight: "bold",
        paddingBottom: 5,
    }
})