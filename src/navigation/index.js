import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import React, {useEffect} from 'react';

//screens
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import i18n from '../language/i18n';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const isToken = useSelector(state => state.authConfig.token);

  const {language} = useSelector(state => state.users);

  useEffect(() => {
    if (language == 'en') {
      i18n.changeLanguage('en');
    } else {
      i18n.changeLanguage('dr');
    }
  }, []);
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {isToken ? (
        <Stack.Screen name="MainStack" component={MainStack} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigation;
