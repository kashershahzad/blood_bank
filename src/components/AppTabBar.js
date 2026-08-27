import {Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React from 'react';

import CustomText from './CustomText';
import Icons from './Icons';

import {COLORS} from '../utils/COLORS';
import fonts from '../assets/fonts';

const TABS = [
  {name: 'Home', label: 'Home', icon: 'home'},
  {name: 'FindDonor', label: 'Find a Donor', icon: 'search'},
  {name: 'AddUser', label: 'Add Donor', icon: 'user-plus'},
];

const AppTabBar = ({state, navigation, active, onPress}) => {
  const insets = useSafeAreaInsets();
  const current = active || state?.routes?.[state.index]?.name;

  const handlePress = name => {
    if (onPress) {
      onPress(name);
      return;
    }

    if (!navigation || !state) {
      return;
    }

    const route = state.routes.find(item => item.name === name);
    if (!route) {
      return;
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(name);
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8)},
      ]}>
      {TABS.map(tab => {
        const isFocused = current === tab.name;
        const color = isFocused ? COLORS.white : COLORS.primaryBlue;

        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.item, isFocused && styles.itemActive]}
            activeOpacity={0.85}
            onPress={() => handlePress(tab.name)}>
            <Icons family="Feather" name={tab.icon} size={18} color={color} />
            <CustomText
              label={tab.label}
              fontSize={11}
              fontFamily={fonts.semiBold}
              color={color}
              marginLeft={6}
              removeTranslation
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default AppTabBar;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightBorder,
    paddingHorizontal: 12,
    paddingTop: 8,
    zIndex: 100,
    elevation: 24,
  },
  item: {
    flex: 1,
    marginHorizontal: 6,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    backgroundColor: COLORS.lightFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
});
