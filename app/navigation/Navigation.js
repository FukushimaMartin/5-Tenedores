import React from "react";
// Componente Container
import { NavigationContainer } from "@react-navigation/native"
// funcion bottom tab
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
// iconos de react native elements
import { Icon } from "react-native-elements"


import RestaurantsStacks from "./RestaurantsStack";
import FavoritesStack from "./FavoritesStack";
import TopRestaurantsStack from "./TopRestaurantsStack"
import SearchStack from "./SearchStack"
import AccountStack from "./AccountStack"


const Tab = createBottomTabNavigator();

export default function Navigation() {
    return(
        <NavigationContainer>
            {/* en tab-navigator agregamos el native elements para los icon */}
            <Tab.Navigator
                initialRouteName="restaurants"  //en que pestaña inicia la app
                tabBarOptions= {{ //opciones del tab bar
                    inactiveTintColor: "#646464", //color de pestaña inactiva
                    activeTintColor: "#00a680"  //color de pestaña activa
                    /* en la version 6 de react navigation, estas dos lineas van dentro del
                     screenOptions */
                }}
                screenOptions={ ({route}) => ({ //lambda -> al tab bar le metemos un icon
                    tabBarIcon: ({ color }) => screenOptions(route, color) //icon de x ruta y con x color (screenOption es una funcion definida mas abajo)
                }) }// route es un Tab.screen que le paso por param
            >
                {/* al crear el stack, esta linea la reemplazamos por la screen del Stack (idem con los demas)
                    <Tab.Screen 
                    name="restaurants" 
                    component={Restaurants} 
                    options= { {title: "Restaurantes"} } /> 
                */}
                <Tab.Screen 
                    name="restaurants" 
                    component={RestaurantsStacks} 
                    options= { {title: "Restaurantes"} } />
                    {/* En version 6 de react navigation debo agregar esta option luego del title
                        headerShown: false
                    de lo contrario, aparecerá 2 veces el title (porque en el stack también lo tiene)
                    */}
                    
                <Tab.Screen 
                    name="favorites" 
                    component={FavoritesStack}
                    options= { {title: "Favoritos"} } />
                <Tab.Screen
                    name="top-restaurants"
                    component={TopRestaurantsStack}
                    options= { {title: "Top 5"} } />
                <Tab.Screen
                    name="search"
                    component={SearchStack}
                    options= { {title: "Buscar"} } />
                <Tab.Screen
                    name="account"
                    component={AccountStack}
                    options= { {title: "Cuenta"} } />
            </Tab.Navigator>
        </NavigationContainer>
    )
}

function screenOptions(route,color) {
    let iconName;

    switch (route.name) {
        case "restaurants":
            iconName = "compass-outline";
            break;
        case "favorites":
            iconName = "heart-outline";
            break;
        case "top-restaurants":
            iconName = "star-outline";
            break;
        case "search":
            iconName = "magnify";
            break;
        case "account":
            iconName = "home-outline";
            break;
        default:
            break;
    }
    return(
        <Icon type="material-community" name={iconName} size={22} color={color} />
    )
}