import { StyleSheet, TouchableOpacity, TextInput, View } from "react-native";
import React from "react";

import Icons from "../../../../components/Icons";

import { COLORS } from "../../../../utils/COLORS";
import fonts from "../../../../assets/fonts";

const Footer = ({ inputText, setInputText, sendMessage, pad }) => {
  return (
    <View
      style={[
        styles.mainContainer,
        pad
          ? { padding: 20, paddingBottom: 0 }
          : { padding: 20, paddingBottom: 30 },
      ]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="gray"
          value={inputText}
          multiline
          textAlignVertical="top"
          onChangeText={(text) => setInputText(text)}
        />
      </View>
      <TouchableOpacity
        onPress={sendMessage}
        style={{
          height: 40,
          width: 40,
          marginLeft: 6,
          backgroundColor: !inputText ? COLORS.gray2 : COLORS.primaryColor,
          borderRadius: 99,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icons
          family="Ionicons"
          name="send"
          size={20}
          disabled={!inputText}
          color={!inputText ? COLORS.white : COLORS.white}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    width: "90%",
    backgroundColor: "#EAF5FF",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.primaryColor,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    padding: 0,
    margin: 0,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: COLORS.black,
    maxHeight: 100,
  },
});
