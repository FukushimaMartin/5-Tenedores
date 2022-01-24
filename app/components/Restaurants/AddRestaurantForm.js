import React, {useState, useEffect} from "react";
import { StyleSheet, View, ScrollView, Alert, Dimensions } from "react-native";
import { Icon, Avatar, Image, Input, Button } from "react-native-elements"
// import * as Permissions from "expo-permissions"
import * as ImagePicker from "expo-image-picker"
import { Camera } from 'expo-camera';
import { map, size, filter } from "lodash"
import * as Location from "expo-location"
import MapView from "react-native-maps";
import uuid from "random-uuid-v4"

import Modal from "../Modal"
import { firebaseApp } from "../../utils/firebase"
import firebase from "firebase/app";
import "firebase/storage"
import "firebase/firestore"

const db = firebase.firestore(firebaseApp)
const widthScreen = Dimensions.get("window").width;

export default function AddRestaurantForm(props){
  const {toastRef, setIsLoading, navigation} = props

  const [restaurantName, setRestaurantName] = useState("")
  const [restaurantAddress, setRestaurantAddress] = useState("")
  const [restaurantDescription, setRestaurantDescription] = useState("")
  const [imagesSelected, setImagesSelected] = useState([])
  const [isVisibleMap, setIsVisibleMap] = useState(false)
  const [locationRestaurant, setLocationRestaurant] = useState(null)

  const addRestaurant = () => {
    if(!restaurantName || !restaurantAddress || !restaurantDescription){
      toastRef.current.show("Todos los campos deben ser completados")
    } else if(size(imagesSelected) === 0) {
      toastRef.current.show("El restaurante debe tener al menos una foto")
    } else if(!locationRestaurant){
      toastRef.current.show("Tienes que localizar el restaurante en el mapa")
    } else {
      setIsLoading(true);
      uploadImageStorage().then( (response) => {
        db.collection("restaurants")
          .add({
            name: restaurantName,
            address: restaurantAddress,
            description: restaurantDescription,
            location: locationRestaurant,
            images: response,
            rating: 0,
            ratingTotal: 0,
            quantityVoting: 0,
            createAt: new Date(),
            createBy: firebase.auth().currentUser.uid,
          })
          .then(() => {
            setIsLoading(false)
            navigation.navigate("restaurants")
          })
          .catch(() => {
            setIsLoading(false)
            toastRef.current.show("Error al subir el restaurante, reinténtelo mas tarde")
          })
      })
    }
  }

  const uploadImageStorage = async () => {
    const imageBlob = []

//envolvemos en un promise para que termine de ejecutar el map para luego retornar el array
    await Promise.all( 
      map(imagesSelected, async (image) => {
        const response = await fetch(image)
        const blob = await response.blob()
        const ref = firebase.storage().ref("restaurants").child(uuid())
        
        await ref.put(blob).then( async result => {
          await firebase
              .storage()
              .ref(`restaurants/${result.metadata.name}`)
              .getDownloadURL()
              .then( (photoURL) => {
                imageBlob.push(photoURL)
              })
        })
      })
    )
    return imageBlob;
  }

  return(
    <ScrollView style={styles.scrollView}>
      <ImageRestaurant imagenRestaurant={imagesSelected[0]} />
      <FormAdd
        setRestaurantName={setRestaurantName}
        setRestaurantAddress={setRestaurantAddress}
        setRestaurantDescription={setRestaurantDescription}
        setIsVisibleMap={setIsVisibleMap}
        locationRestaurant={locationRestaurant}
      />

      <UploadImage
        toastRef={toastRef}
        imagesSelected={imagesSelected}
        setImagesSelected={setImagesSelected}
      />

      <Button
        title="Crear Restaurante"
        onPress={addRestaurant}
        buttonStyle={styles.btnAddRestaurant}
      />
      <Map
        toastRef={toastRef}
        isVisibleMap={isVisibleMap}
        setIsVisibleMap={setIsVisibleMap}
        setLocationRestaurant={setLocationRestaurant}
      />
    </ScrollView>
  )
}

function ImageRestaurant(props){
  const { imagenRestaurant } = props

  return (
    <View style={styles.viewPhoto}>
      <Image 
        source={ 
          imagenRestaurant
            ? {uri: imagenRestaurant}
            : require("../../../assets/img/no-image.png") }
        style={{ width: widthScreen, height: 200}}
      />
    </View>
  )
}

function FormAdd(props){
  const {
    setRestaurantName, 
    setRestaurantAddress, 
    setRestaurantDescription,
    setIsVisibleMap,
    locationRestaurant,
  } = props

  return (
    <View style={styles.viewForm}>
      <Input
        placeholder="Nombre del restaurant"
        containerStyle={styles.input}
        onChange={ event => setRestaurantName(event.nativeEvent.text)}
        // value={cityName}
      />
      <Input
        placeholder="Dirección"
        containerStyle={styles.input}
        onChange= {event => setRestaurantAddress(event.nativeEvent.text)}
        // value={cityAddress}
        rightIcon={{
            type: "material-community",
            name: "google-maps",
            color: locationRestaurant ? "#00a680" : "#c2c2c2",
            onPress: () => setIsVisibleMap(true)
        }}
      />
      <Input
        placeholder="Descripcion del restaurante"
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange= {event => setRestaurantDescription(event.nativeEvent.text)}
      />
    </View>
  )
}

function Map(props){
  const { toastRef, isVisibleMap, setIsVisibleMap, setLocationRestaurant } = props
  const [location, setLocation] = useState(null)

  /* Esta funcion permite ver la geolocalizacion del usuario, el cual podrá moverse por el mapa
    y luego guardar la posicion final*/
  useEffect(() => {
    (async () => {
      const resultPermission = await Location.requestForegroundPermissionsAsync()
      const statusPermission = resultPermission.status;

      if(statusPermission !== "granted") {
        toastRef.current.show("Tienes que aceptar los permisos de localización.", 3000)
      } else {
        const loc = await Location.getCurrentPositionAsync({})

        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        })
      }
    })()
  }, [])

  const confirmLocation = async () => {
    /*Este metodo guarda los datos de localizacion y region, de acuerdo a la ubicación seleccionada
     en el mapa, en nuestras variables de estado.*/
    setLocationRestaurant(location)
    toastRef.current.show("Localización guardada con éxito")
    setIsVisibleMap(false)
  }

  return(
    <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
      <View>
        {location && (
          <MapView
            style={styles.mapStyle}
            provider={MapView.PROVIDER_GOOGLE}
            initialRegion={location}
            showsUserLocation={true}
            onRegionChange={ (region) => setLocation(region)}
          >
            <MapView.Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
                }}
              draggable
            />
          </MapView>
        )}
        <View style={styles.viewMapBtn}>
          <Button
            title="Guardar ubicación"
            containerStyle={styles.viewMapBtnContainerSave}
            buttonStyle={styles.viewMapBtnSave}
            onPress={confirmLocation}
          />
          <Button
            title="Cancelar ubicación" 
            containerStyle={styles.viewMapBtnContainerCancel}
            buttonStyle={styles.viewMapBtnCancel}
            onPress={() => setIsVisibleMap(false)}
          />
        </View>
      </View>
    </Modal>
  )
}

function UploadImage(props){
  const {toastRef, imagesSelected, setImagesSelected} = props

  const imageSelect = async () => {
    const resultPermissionsCamera = await Camera.requestCameraPermissionsAsync()
    // console.log(resultPermissions)

    if( resultPermissionsCamera === "denied" ){
      toastRef.current.show("Es necesario aceptar los permisos de la galeria", 2000)
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4,3]
      })
      if(result.cancelled) {
        toastRef.current.show("Has cancelado la selección de imagen", 2000)
      } else {
        // setImagesSelected(result.uri)
        setImagesSelected([...imagesSelected, result.uri]) 
      }
    }
  }

  const removeImage = (image) => {
    const arrayImages = imagesSelected

    Alert.alert(
      "Eliminar Imagen",
      "¿Estas seguro de que quieres eliminar la imagen?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: () => {+
            setImagesSelected(
              filter(arrayImages, (imageUrl) => imageUrl !== image)
            )
          }
        }
      ],
      { cancelable: false }
    )
  }

  return(
    <View style={styles.viewImages}>
      {size(imagesSelected) < 4 && (
        <Icon
          type="material-community"
          name="camera"
          color="#7a7a7a"
          containerStyle={styles.containerIcon}
          onPress={imageSelect}
        />
      )}
      {map(imagesSelected, (imageRestaurant, index) => (
        <Avatar
          key={index}
          style={styles.miniatureStyle}
          source={{ uri: imageRestaurant }}
          onPress={() => removeImage(imageRestaurant)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
    scrollView: {
        height: "100%"
    },
    viewForm: {
        marginLeft: 10,
        marginRight: 10
    },
    input: {
        marginBottom: 10
    },
    textArea: {
        height: 100,
        width: "100%",
        padding: 0,
        margin: 0
    },
    btnAddRestaurant: {
        backgroundColor: "#1190CB",
        margin: 20,
        // fontWeight: "bold",
    },
    viewImages: {
        flexDirection: "row",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 30,
    },
    containerIcon: {
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        height: 70,
        width: 70,
        backgroundColor: "#e3e3e3",
    },
    miniatureStyle: {
        width: 70,
        height: 70,
        marginRight: 7,
    },
    viewPhoto: {
      alignItems: "center",
      height: 200,
      marginBottom: 20,
    },
    mapStyle: {
        width: "100%",
        height: 550,
    },
    viewMapBtn: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    viewMapBtnContainerCancel: {
        paddingLeft: 5,
    },
    viewMapBtnCancel: {
        backgroundColor: "#a60d0d",
    },
    viewMapBtnContainerSave: {
        paddingRight: 5
    },
    viewMapBtnSave: {
        backgroundColor: "#00a680",
    },


    viewMap: {
        height: "100%"
    },
})