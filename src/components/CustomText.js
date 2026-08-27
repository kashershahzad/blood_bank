import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import React from "react";

import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const CustomText = ({
  textStyle,
  fontSize,
  marginTop,
  marginBottom,
  marginRight,
  marginLeft,
  alignSelf,
  fontFamily,
  fontStyle,
  textTransform,
  textAlign,
  label,
  color,
  fontWeight,
  bottom,
  width,
  borderColor,
  borderBottomWidth,
  onPress,
  marginVertical,
  paddingBottom,
  activeOpacity,
  textDecorationLine,
  lineHeight,
  containerStyle,
  right,
  left,
  numberOfLines,
  children,
  removeTranslation,
  disabled,
  letterSpacing,
}) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[containerStyle, { alignSelf }]}
      onPress={onPress}
      disabled={!onPress || disabled}
      activeOpacity={activeOpacity || 0.6}
    >
      <Text
        numberOfLines={numberOfLines}
        style={[
          {
            fontSize: fontSize || 14,
            color: color || COLORS.black,
            marginTop: marginTop || 0,
            marginBottom: marginBottom || 0,
            marginLeft: marginLeft || 0,
            marginRight: marginRight || 0,
            fontFamily: fontFamily || fonts.regular,
            fontStyle: fontStyle,
            lineHeight: lineHeight,
            textAlign: textAlign,
            textTransform: textTransform,
            fontWeight: fontWeight,
            bottom: bottom,
            borderBottomWidth: borderBottomWidth,
            borderColor: borderColor,
            width: width,
            marginVertical: marginVertical,
            paddingBottom: paddingBottom,
            right: right,
            left: left,
            letterSpacing,
            textDecorationLine: textDecorationLine || "none",
          },
          textStyle,
        ]}
      >
        {removeTranslation ? label : t(label)}
        {children}
      </Text>
    </TouchableOpacity>
  );
};
export default CustomText;
