import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import InboxScreen from '../screens/Main/Chat/InboxScreen';
import Notifications from '../screens/Main/Notifications';
import DonorDetail from '../screens/Main/Home/DonorDetail';
import ContactPicker from '../screens/Main/AddUser/ContactPicker';
import DonorForm from '../screens/Main/AddUser/DonorForm';
import TabStack from './TabStack';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="TabStack"
        component={TabStack}
        options={{contentStyle: {flex: 1}}}
      />
      <Stack.Screen name="DonorDetail" component={DonorDetail} />
      <Stack.Screen name="DonorForm" component={DonorForm} />
      <Stack.Screen name="ContactPicker" component={ContactPicker} />
      <Stack.Screen name="InboxScreen" component={InboxScreen} />
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  );
};

export default MainStack;
