import { TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import React, { useState } from "react";

import CustomText from "./CustomText";

import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const CustomButton = ({
  onPress,
  title,
  disabled,
  loading,
  customStyle,
  customText,
  marginBottom,
  marginTop,
  backgroundColor,
  color,
  width = "100%",
  height = 54,
  borderRadius = 8,
  justifyContent = "center",
  alignItems = "center",
  flexDirection = "row",
  alignSelf = "center",
  fontSize,
  indicatorColor,
  marginRight,
  borderWidth,
  borderColor,
  fontFamily,
  loadingSize,
  mainStyle,
}) => {
  const [animation] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(animation, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animation, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        mainStyle,
        { transform: [{ scale: animation }], width, alignSelf },
      ]}
    >
      <TouchableOpacity
        disabled={loading || disabled}
        activeOpacity={0.6}
        style={[
          {
            backgroundColor: disabled
              ? COLORS.authText
              : backgroundColor
              ? backgroundColor
              : COLORS.primaryColor,
            marginTop,
            marginBottom,
            width: "100%",
            height,
            borderRadius,
            flexDirection,
            alignItems,
            justifyContent,
            marginRight,
            borderWidth,
            borderColor,
          },
          customStyle,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {loading && (
          <ActivityIndicator
            size={loadingSize || 25}
            color={indicatorColor ? COLORS.primaryColor : COLORS.white}
          />
        )}
        {!loading && (
          <CustomText
            textStyle={customText}
            label={title}
            color={color ? color : COLORS.white}
            fontFamily={fontFamily || fonts.semiBold}
            fontSize={fontSize || 15}
            lineHeight={22}
            marginTop={-2}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CustomButton;
