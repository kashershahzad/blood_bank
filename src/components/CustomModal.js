import { StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import React from "react";

const CustomModal = ({
  isVisible,
  transparent = true,
  onDisable,
  backdropOpacity,
  mainMargin,
  marginTop,
  marginBottom,
  marginVertical,
  marginHorizontal,
  borderRadius,
  overflow,
  children,
  isChange,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      transparent={transparent}
      onBackdropPress={onDisable}
      onBackButtonPress={onDisable}
      onDismiss={onDisable}
      backdropOpacity={backdropOpacity || 0.6}
      style={[
        {
          margin: mainMargin,
          marginTop,
          marginBottom,
          marginVertical,
          marginHorizontal,
          borderRadius,
          overflow,
        },
      ]}
    >
      <TouchableOpacity
        style={isChange ? styles.mainContainer1 : styles.mainContainer}
        activeOpacity={1}
        onPress={onDisable}
      >
        <TouchableOpacity style={styles.container} activeOpacity={1}>
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContainer1: {
    width: "100%",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  container: {
    width: "100%",
  },
});
