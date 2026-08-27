import React from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  View,
} from "react-native";

import CustomText from "../../../../components/CustomText";

import { Images } from "../../../../assets/images";
import { COLORS } from "../../../../utils/COLORS";
import fonts from "../../../../assets/fonts";

const SocialIcon = ({
  googlePress,
  applePress,
  indicatorColor,
  googleLoading,
  appleLoading,
}) => {
  const array = [
    ...(Platform.OS == "ios"
      ? [
          {
            id: 1,
            img: Images.apple,
            title: "Login with Apple",
            onPress: applePress,
            loading: appleLoading,
          },
        ]
      : []),
    {
      id: 2,
      img: Images.google,
      title: "Continue with Google",
      onPress: googlePress,
      loading: googleLoading,
    },
  ];

  return (
    <View>
      {array?.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.item,
            {
              backgroundColor: item.id == 1 ? "#000000" : COLORS.white,
              borderColor:
                item.id == 2 ? "rgba(25, 103, 169, 0.22)" : "transparent",
            },
          ]}
          onPress={item.onPress}
        >
          {item?.loading ? (
            <ActivityIndicator
              size={25}
              color={indicatorColor ? COLORS.primaryColor : COLORS.white}
            />
          ) : (
            <>
              <Image
                source={item.img}
                style={[
                  styles.icon,
                  { tintColor: item.id == 1 && COLORS.white },
                ]}
              />
              <CustomText
                label={item.title}
                fontSize={14}
                marginLeft={10}
                fontFamily={fonts.semiBold}
                color={item.id == 1 ? COLORS.white : COLORS.black}
              />
            </>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SocialIcon;

const styles = StyleSheet.create({
  item: {
    width: "100%",
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
});
