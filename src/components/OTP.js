import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  useClearByFocusCell,
  useBlurOnFulfill,
  CodeField,
  Cursor,
} from "react-native-confirmation-code-field";

import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const CELL_COUNT = 4;

const OTPComponent = ({ value, setValue }) => {
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <View>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <View
            onLayout={getCellOnLayoutHandler(index)}
            key={index}
            style={[styles.cellRoot, isFocused && styles.focusCell]}
          >
            <Text style={styles.cellText}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default OTPComponent;

const styles = StyleSheet.create({
  codeFieldRoot: {
    width: "98%",
    justifyContent: "space-between",
    alignSelf: "center",
  },
  cellRoot: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    width: 70,
    backgroundColor: "#ECECEC",
  },
  cellText: {
    color: COLORS.primaryColor,
    fontSize: 30,
    textAlign: "center",
    fontFamily: fonts.regular,
  },
  focusCell: {
    borderColor: COLORS.primaryColor,
    borderWidth: 1,
    backgroundColor: "#e3ebef",
  },
});
