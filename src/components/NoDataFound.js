import { Dimensions, Image, StyleSheet, View } from "react-native";
import React from "react";

import CustomText from "./CustomText";

import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";
import { Images } from "../assets/images";

const NoDataFound = ({ title, marginTop, source, desc }) => {
  return (
    <View style={styles.mainContainer}>
      <Image
        style={[styles.image, { marginTop: marginTop || 80 }]}
        source={source || Images.noShow}
      />
      <CustomText
        label={title || "noDataFound"}
        textTransform={"capitalize"}
        fontFamily={fonts.bold}
        fontSize={18}
        textAlign="center"
        marginTop={15}
      />
      <CustomText
        label={desc}
        fontFamily={fonts.medium}
        fontSize={16}
        textAlign="center"
        marginTop={10}
        color={COLORS.authText}
        lineHeight={25}
      />
    </View>
  );
};

export default NoDataFound;

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    height: 450,
    width: Dimensions.get("window").width - 40,
    paddingHorizontal: 35,
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
});
