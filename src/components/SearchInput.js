import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';

import CustomText from './CustomText';
import Icons from './Icons';

import {COLORS} from '../utils/COLORS';
import i18n from '../language/i18n';
import fonts from '../assets/fonts';

const SearchInput = ({
  placeholder,
  value,
  onChangeText,
  maxLength,
  marginBottom,
  isFocus,
  isBlur,
  autoFocus,
  ref,
  marginTop,
  isBack,
  onPress,
  editable,
  isDropdown,
  select,
  setSelect,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const navigation = useNavigation();
  const handleFocus = () => {
    setIsFocused(true);
    isFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    isBlur?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={[
        styles.mainContainer,
        {
          marginBottom,
          marginTop,
          borderColor: isFocused ? COLORS.primaryColor : '#F2F2F2',
        },
      ]}>
      {isBack ? (
        <Icons
          family="Ionicons"
          name="arrow-back-outline"
          color="#0F1621"
          size={25}
          style={{marginRight: 10}}
          onPress={() => navigation.goBack()}
        />
      ) : null}
      <TouchableOpacity
        style={styles.searchIcon}
        activeOpacity={0.6}
        onPress={onPress}>
        <Icons family="Feather" name="search" color={COLORS.white} size={18} />
      </TouchableOpacity>
      {editable ? (
        <TextInput
          ref={ref}
          placeholder={i18n.t(placeholder)}
          style={styles.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          placeholderTextColor="#9B9E9F"
          autoFocus={autoFocus}
          editable={editable}
        />
      ) : (
        <View style={{flex: 1}}>
          <CustomText
            label={placeholder}
            color="#9B9E9F"
            fontSize={13}
            fontFamily={fonts.medium}
          />
        </View>
      )}

      {isDropdown ? (
        <>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.6}
            onPress={() => setOpen(!isOpen)}>
            <CustomText
              label={select}
              fontSize={10}
              fontFamily={fonts.bold}
              textTransform="uppercase"
              marginRight={2}
            />
            <Icons
              family="Entypo"
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={12}
              color={COLORS.black}
            />
          </TouchableOpacity>
          {isOpen ? (
            <TouchableOpacity activeOpacity={1} style={styles.list}>
              {['schedule', 'now'].map((item, i) => (
                <CustomText
                  key={item}
                  label={item}
                  fontSize={12}
                  fontFamily={fonts.semiBold}
                  textTransform="uppercase"
                  marginBottom={i == 0 ? 7 : 0}
                  onPress={() => {
                    setSelect(item);
                    setOpen(false);
                  }}
                />
              ))}
            </TouchableOpacity>
          ) : null}
        </>
      ) : null}
    </TouchableOpacity>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#FBFBFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderWidth: 1,
    height: 50,
    width: '100%',
    borderRadius: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    margin: 0,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: COLORS.black,
  },
  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    backgroundColor: COLORS.white,
    elevation: 2,
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    right: 10,
    bottom: -20,
  },
});
