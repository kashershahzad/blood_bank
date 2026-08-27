import { TouchableOpacity, View, StyleSheet, Animated } from "react-native";
import React, { useState } from "react";

import { COLORS } from "../utils/COLORS";

const CustomToggle = ({ value = false, setValue }) => {
  const [isToggled, setIsToggled] = useState(value);
  const [animation] = useState(new Animated.Value(value ? 1 : 0));

  const handleToggle = () => {
    Animated.spring(animation, {
      toValue: isToggled ? 0 : 1,
      useNativeDriver: true,
    }).start();
    setIsToggled(!isToggled);
    if (setValue) {
      setValue(!isToggled);
    }
  };

  const toggleStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 16],
        }),
      },
    ],
  };

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
      <View
        style={[
          styles.toggleContainer,
          isToggled ? styles.onBackground : styles.offBackground,
        ]}
      >
        <Animated.View style={[styles.toggleCircle, toggleStyle]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    width: 36,
    height: 20,
    borderRadius: 100,
    justifyContent: "center",
    padding: 2,
  },
  toggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 100,
    backgroundColor: COLORS.white,
  },
  onBackground: {
    backgroundColor: COLORS.green,
  },
  offBackground: {
    backgroundColor: COLORS.lightGray,
  },
});

export default CustomToggle;
