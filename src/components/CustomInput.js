import {Image, StyleSheet, TextInput, View} from 'react-native';
import React, {useState} from 'react';

import CustomText from './CustomText';
import Icons from './Icons';

import {COLORS} from '../utils/COLORS';
import i18n from '../language/i18n';
import fonts from '../assets/fonts';
import {Images} from '../assets/images';

const CustomInput = ({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType,
  multiline,
  maxLength,
  placeholderTextColor,
  editable,
  textAlignVertical,
  marginBottom,
  height = 58,
  autoCapitalize,
  error,
  isFocus,
  isBlur,
  width,
  onEndEditing,
  autoFocus,
  ref,
  borderRadius,
  marginTop,
  withLabel,
  isError,
  labelColor,
  borderColor,
  mailIcon,
  lockIcon,
  focusBorderColor,
  iconColor,
  inputRef,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePass, setHidePass] = useState(true);

  const handleFocus = () => {
    setIsFocused(true);
    isFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    isBlur?.();
  };

  return (
    <View style={{width: width || '100%'}}>
      {withLabel && (
        <CustomText
          label={withLabel}
          marginBottom={8}
          color={labelColor || COLORS.black}
        />
      )}
      <View
        style={[
          styles.mainContainer,
          {
            marginBottom: error ? 5 : marginBottom || 20,
            marginTop,
            borderColor:
              error || isError
                ? COLORS.red
                : isFocused
                ? focusBorderColor || COLORS.primaryColor
                : borderColor,
            borderWidth: isFocused || error || isError || borderColor ? 1 : 0,
            height: height ? height : multiline ? 180 : 56,
            width: '100%',
            borderRadius: borderRadius || 12,
            paddingLeft: mailIcon || lockIcon ? 14 : 20,
            backgroundColor: isFocused
              ? focusBorderColor
                ? 'rgba(193, 53, 74, 0.08)'
                : '#FFF4F6'
              : '#FAFAFA',
          },
        ]}>
        {(mailIcon || lockIcon) && (
          <Icons
            name={mailIcon ? 'mail' : 'lock'}
            family="Feather"
            size={18}
            color={
              isFocused
                ? focusBorderColor || COLORS.primaryColor
                : iconColor || COLORS.gray1
            }
          />
        )}
        <TextInput
          ref={inputRef}
          placeholder={placeholder ? i18n.t(placeholder) : ''}
          style={[
            styles.input,
            {
              width: secureTextEntry
                ? mailIcon || lockIcon
                  ? '82%'
                  : '92%'
                : mailIcon || lockIcon
                ? '88%'
                : '99%',
              paddingVertical: multiline ? 18 : 0,
              marginLeft: mailIcon || lockIcon ? 10 : 0,
            },
          ]}
          secureTextEntry={secureTextEntry ? (hidePass ? true : false) : false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          onEndEditing={onEndEditing}
          maxLength={maxLength}
          placeholderTextColor={placeholderTextColor || COLORS.inputLabel}
          editable={editable}
          textAlignVertical={multiline ? 'top' : textAlignVertical}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
        />

        {secureTextEntry && (
          <Icons
            name={!hidePass ? 'eye' : 'eye-off'}
            color={COLORS.gray}
            size={20}
            family="Feather"
            onPress={() => setHidePass(!hidePass)}
          />
        )}
      </View>
      {error && (
        <CustomText
          label={error}
          color={COLORS.red}
          fontFamily={fonts.semiBold}
          fontSize={10}
          marginBottom={15}
        />
      )}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  input: {
    height: '100%',
    padding: 0,
    margin: 0,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: COLORS.black,
  },
  leftIcon: {
    width: 20,
    height: 20,
    position: 'absolute',
    left: 15,
    resizeMode: 'contain',
  },
});
