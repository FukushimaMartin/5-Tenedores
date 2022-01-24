import React from "react";
import {createStackNavigator} from "@react-navigation/stack";

import Account from "../screens/account/Account";
import Login from "../screens/account/Login";
import Register from "../screens/account/Register";

const Stack = createStackNavigator();

export default function AccountStack() {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name="account"
                component={Account}
                options={ {title: "Mi Cuenta"} }
            />
            <Stack.Screen
                name= "login"
                component= {Login} 
                options={ {title: "Inicias sesión"} }
            />
            <Stack.Screen
                name= "register"
                component= {Register} 
                options={ {title: "Registro"} }
            />
        </Stack.Navigator>
    )
}