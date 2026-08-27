import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import React from 'react';

//screens

import getStarted from '../screens/Auth/GetStarted';
import OnBoarding from '../screens/Auth/OnBoarding';
import OTPScreen from '../screens/Auth/OTPScreen';
import Signup from '../screens/Auth/Signup';
import Login from '../screens/Auth/Login';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const isOnBoarding = useSelector(state => state.authConfig.isOnBoarding);
  console.log(isOnBoarding);
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      // initialRouteName="OnBoarding"
    >
      {/* {!isOnBoarding && (
        <>
          <Stack.Screen name="OnBoarding" component={OnBoarding} />
          <Stack.Screen name="getStarted" component={getStarted} />
        </>
      )} */}

      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
