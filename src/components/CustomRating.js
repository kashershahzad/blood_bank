import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";

import { Images } from "../assets/images";
import { COLORS } from "../utils/COLORS";

const CustomRating = ({
  totalStars = 5,
  value = 0,
  onRatingCompleted,
  disabled,
  size = 30,
  marginLeft,
}) => {
  const [selectedStars, setSelectedStars] = useState(value);
  useEffect(() => {
    setSelectedStars(value);
  }, [value]);
  const handleStarPress = (star) => {
    if (!disabled) {
      setSelectedStars(star);
      if (onRatingCompleted) {
        onRatingCompleted(star);
      }
    }
  };
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= totalStars; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Image
            source={Images.star}
            style={[
              styles.image,
              {
                tintColor: i <= selectedStars ? COLORS.secondary : COLORS.gray,
                width: size,
                height: size,
                marginLeft: marginLeft,
              },
            ]}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };
  return <View style={{ flexDirection: "row" }}>{renderStars()}</View>;
};
export default CustomRating;
const styles = StyleSheet.create({
  image: {
    resizeMode: "contain",
    marginRight: 5,
  },
});
