import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";

import CustomText from "../../../../components/CustomText";
import ImageFast from "../../../../components/ImageFast";

import { COLORS } from "../../../../utils/COLORS";
import fonts from "../../../../assets/fonts";

const Item = ({ title, time, desc, img, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.mainContainer}
    >
      <ImageFast source={img} style={styles.img} />
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={{ width: "70%" }}>
            <CustomText
              label={title}
              fontFamily={fonts.semiBold}
              fontSize={16}
            />
          </View>
          <CustomText
            label={time}
            fontFamily={fonts.medium}
            fontSize={12}
            color={COLORS.inputLabel}
          />
        </View>
        <CustomText
          label={desc}
          fontSize={14}
          numberOfLines={3}
          color={COLORS.inputLabel}
          marginBottom={15}
          marginTop={10}
        />
      </View>
    </TouchableOpacity>
  );
};

export default Item;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  img: {
    width: 48,
    height: 48,
    borderRadius: 100,
  },
  container: {
    width: "82%",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
