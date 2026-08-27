import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../utils/COLORS";

const TermsAndConditionsText = ({ onTermPress, onPolicyPress }) => {
  return (
    <Text style={[styles.text, { alignSelf: "center" }]}>
      By continuing, you agree that you have read and accept our{" "}
      <TouchableOpacity onPress={onTermPress}>
        <Text style={styles.link}>T&C</Text>
      </TouchableOpacity>{" "}
      and{" "}
      <TouchableOpacity onPress={onPolicyPress}>
        <Text style={styles.link}>Privacy Policy</Text>
      </TouchableOpacity>
      .
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: "gray",
    marginVertical: 10,
  },
  link: {
    marginBottom: -2,
    color: COLORS.black,
    textDecorationLine: "underline",
  },
});

export default TermsAndConditionsText;
