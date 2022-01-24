import React, {useState, useEffect, useRef, useCallback} from 'react'
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native'
import { map } from "lodash";
import { ListItem, Icon, Rating } from "react-native-elements";
import Toast from "react-native-easy-toast";
import { useFocusEffect } from '@react-navigation/native';

import {firebaseApp} from "../../utils/firebase"
import firebase from "firebase/app"
import "firebase/firestore"

import Loading from '../../components/Loading';
import Map from '../../components/Map';
import Carousel from '../../components/CarouselImages';
import ListReviews from '../../components/Restaurants/ListReviews';


const db = firebase.firestore(firebaseApp)
const screenWidth = Dimensions.get('window').width

export default function Restaurant(props) {
  const { navigation, route } = props
  const {id, name} = route.params
  const [restaurant, setRestaurant] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [userLogged, setUserLogged] = useState(false)
  const [rating, setRating] = useState(0)
  const toastRef = useRef()

  navigation.setOptions({ title: name })

  firebase.auth().onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false)
  })

  //para que un efecto se vuelva a ejecutar cuando regresamos a la screen (con navigation.goback)
  useFocusEffect(
    useCallback(() => { //trae el restaurant de nuestra db
      db.collection("restaurants")
        .doc(id)
        .get().then( (response) => {
          const data = response.data()
          data.id = response.id

          setRestaurant(data)
          setRating(data.rating)
        })
    }, [])
  )
  

  useEffect(() => {
    if(userLogged && restaurant){
      db.collection("favorites")
        .where("idRestaurant", "==", restaurant.id)
        .where("idUser", "==", firebase.auth().currentUser.uid)
        .get()
        .then((response) => {
          if(response.docs.length === 1){
            setIsFavorite(true)
          }
        })
    }
  }, [userLogged, restaurant])

  const addFavorite = () => {
    if(!userLogged){
      toastRef.current.show("Debe loguearse antes de agregar un restaurant a favoritos")
    } else {
      //relaciona usuario con el restaurant
      const payload = {
        idUser: firebase.auth().currentUser.uid,
        idRestaurant: restaurant.id
      }
      db.collection("favorites")
        .add(payload)
        .then(() => {
          setIsFavorite(true)
          toastRef.current.show("Restaurante añadido a favoritos")
        })
        .catch(() => {
          toastRef.current.show("Error al añadir el restaurante a favoritos")
        })
    }
  }

  const removeFavorite = () => {
    db.collection("favorites")
      .where("idRestaurant", "==", restaurant.id)
      .where("idUser", "==", firebase.auth().currentUser.uid)
      .get()
      .then((response) => {
        response.forEach((doc) => {
          const idFavorite = doc.id

          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsFavorite(false)
              toastRef.current.show("Se ha eliminado el restaurante de la lista de favoritos")
            })
            .catch(() => {
              toastRef.current.show("Error al eliminar el restaurante de la lista de favoritos")
            })
        })
      })
  }
    
  if(!restaurant) return <Loading isVisible={true} text="Cargando..." />

  return (
    <ScrollView vertical style={styles.viewBody}>
      <View style={styles.viewFavorite}>
        <Icon
          type="material-community"
          name= {isFavorite ? "heart" : "heart-outline"}
          onPress={isFavorite ? removeFavorite : addFavorite}
          color= {isFavorite ? "#f00" : "#000"}
          size={30}
          underlayColor="transparent"
        />
      </View>
      <Carousel
        arrayImages={restaurant.images}
        height={250}
        width={screenWidth}
      />
      <TitleRestaurant
        name={restaurant.name}
        description={restaurant.description}
        rating={rating}
      />
      <RestaurantInfo
          location={restaurant.location}
          name={restaurant.name}
          address={restaurant.address}
      />
      <ListReviews
        navigation={navigation}
        idRestaurant={restaurant.id}
      />
      <Toast
        ref={toastRef} position="center" opacity={0.9}
      />
    </ScrollView>
  )
}

function TitleRestaurant(props) {
  const {name, description, rating} = props

  return(
    <View style={styles.viewRestaurantTitle}>
      <View style={{flexDirection: "row"}}>
        <Text style={styles.nameRestaurant}> {name} </Text>
        <Rating
          style={styles.rating}
          imageSize={20}
          readonly
          startingValue={parseFloat(rating)}
        />
      </View>
      <Text style={styles.descriptionRestaurant}> {description} </Text>
    </View>
  )
}

function RestaurantInfo(props){
  const { location, name, address } = props
  const listInfo = [
    {
      text: address,
      iconName: "map-marker",
      iconType: "material-community",
      action: null,
    },
  ]

  return (
    <View style={styles.viewRestaurantInfo}>
      <Text style={styles.restaurantInfoTitle}>
        Información sobre el restaurante
      </Text>

      <Map location={location} name={name} height={100} />

      {map(listInfo, (item, index) => (
        <ListItem
          key={index}
          title={item.text}
          leftIcon={{
            name: item.iconName,
            type: item.iconType,
            color: "#00a680"
          }}
          containerStyle={styles.containerListItem}
        />
      ))} 
    </View>
  )
}

const styles = StyleSheet.create({
  viewBody:{
    flex: 1,
    backgroundColor: "#fff"
  },
  viewRestaurantTitle: {
    padding: 15,
  },
  nameRestaurant: {
    fontSize: 20,
    fontWeight: "bold"
  },
  descriptionRestaurant: {
    marginTop: 5,
    color: "grey"
  },
  rating: {
    position: "absolute",
    right: 0
  },
  viewRestaurantInfo: {
    margin: 15,
    marginTop: 5
  },
  restaurantInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  containerListItem: {
    borderBottomColor: "#d8d8d8",
    borderBottomWidth: 1,
  },
  viewFavorite: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    padding: 5,
  },
})
