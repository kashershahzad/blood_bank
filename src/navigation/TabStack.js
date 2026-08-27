import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';

import AddUser from '../screens/Main/AddUser';
import FindDonor from '../screens/Main/FindDonor';
import Icons from '../components/Icons';
import Home from '../screens/Main/Home';

import {COLORS} from '../utils/COLORS';

const Tab = createBottomTabNavigator();

const TabStack = () => {
  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.primaryBlue,
        tabBarInactiveTintColor: COLORS.gray1,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightBorder,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <Icons family="Feather" name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FindDonor"
        component={FindDonor}
        options={{
          tabBarLabel: 'Find a Donor',
          tabBarIcon: ({color, size}) => (
            <Icons family="Feather" name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddUser"
        component={AddUser}
        options={{
          tabBarLabel: 'Add Donor',
          tabBarIcon: ({color, size}) => (
            <Icons
              family="Feather"
              name="user-plus"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabStack;
