import { StyleSheet } from "react-native";
import React from "react";

import CustomText from "./CustomText";

import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const DualText = ({
  title,
  secondTitle,
  marginBottom,
  marginTop,
  onPress,
  secondColor,
}) => {
  return (
    <CustomText
      alignSelf="center"
      color="#9E9E9E"
      marginTop={marginTop}
      marginBottom={marginBottom}
      label={title}
    >
      <CustomText
        label={secondTitle}
        onPress={onPress}
        fontFamily={fonts.bold}
        color={secondColor || COLORS.primaryColor}
        marginBottom={-4}
      />
    </CustomText>
  );
};

export default DualText;

const styles = StyleSheet.create({});
