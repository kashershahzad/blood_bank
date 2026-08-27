import { StyleSheet, View, TouchableOpacity } from "react-native";
import React from "react";

import CustomText from "../../../../components/CustomText";
import ImageFast from "../../../../components/ImageFast";

import { Images } from "../../../../assets/images";
import { COLORS } from "../../../../utils/COLORS";
import fonts from "../../../../assets/fonts";

const Item = ({ source, onPress, name, unseen, lastMsg, time }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={styles.mainContainer}
    >
      <ImageFast
        source={source ? { uri: source } : Images.placeholderUser}
        style={styles.image}
        resizeMode="cover"
        isView
      />

      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <CustomText label={name} fontFamily={fonts.semiBold} fontSize={16} />
          <CustomText
            label={time}
            fontFamily={fonts.medium}
            fontSize={12}
            color="#818898"
          />
        </View>
        <View style={styles.row}>
          <CustomText
            label={lastMsg}
            numberOfLines={1}
            fontSize={12}
            color="#818898"
            width={240}
          />
          {unseen ? (
            <View style={styles.unseenContainer}>
              <CustomText
                label={unseen}
                fontSize={12}
                color={COLORS.white}
                fontFamily={fonts.bold}
                marginTop={-2}
              />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Item;

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 100,
  },
  rightContainer: {
    width: "80%",
    borderBottomWidth: 1,
    borderBlockColor: COLORS.borderColor,
    paddingBottom: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  unseenContainer: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: COLORS.primaryColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 2,
  },
});
