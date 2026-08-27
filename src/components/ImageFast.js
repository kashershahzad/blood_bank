import React, { useEffect, useRef, useState } from "react";
import FastImage from "react-native-fast-image";
import {
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  View,
} from "react-native";

import CustomModal from "./CustomModal";
import Icons from "./Icons";

import { COLORS } from "../utils/COLORS";

const { width, height } = Dimensions.get("window");

const ImageFast = ({
  source,
  style,
  resizeMode,
  isView,
  loading,
  children,
  onPress,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);

  const SkeletonLoader = () => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [animatedValue]);

    const interpolatedBackground = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["#e0e0e0", "#c0c0e0"],
    });

    return (
      <View style={styles.skeletonContainer}>
        <Animated.View
          style={[styles.skeleton, { backgroundColor: interpolatedBackground }]}
        />
        <Animated.View
          style={[
            styles.skeleton,
            styles.skeletonShort,
            { backgroundColor: interpolatedBackground },
          ]}
        />
        <Animated.View
          style={[styles.skeleton, { backgroundColor: interpolatedBackground }]}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={isView ? () => setIsViewModal(true) : onPress}
      activeOpacity={0.6}
      disabled={!isView && !onPress}
      style={[
        style,
        { overflow: "hidden" },
        (loading || isImageLoading) && styles.centered,
      ]}
    >
      {isViewModal && (
        <CustomModal
          isVisible={isViewModal}
          onDisable={() => setIsViewModal(false)}
        >
          <Icons
            family="Entypo"
            name="circle-with-cross"
            color={COLORS.white}
            size={30}
            onPress={() => setIsViewModal(false)}
            style={styles.icon}
          />
          <FastImage
            onLoadStart={() => setIsImageLoading(true)}
            onLoadEnd={() => setIsImageLoading(false)}
            source={source}
            resizeMode="contain"
            style={{ width: width, height: height - 70 }}
          />
        </CustomModal>
      )}
      <FastImage
        onLoadStart={() => setIsImageLoading(true)}
        onLoadEnd={() => setIsImageLoading(false)}
        source={source}
        resizeMode={resizeMode}
        style={{ width: "100%", height: "100%" }}
      >
        <View style={styles.absoluteFill}>{children}</View>
      </FastImage>
      {loading || isImageLoading ? (
        <View style={styles.absoluteFill}>
          <SkeletonLoader />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  absoluteFill: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  icon: {
    alignSelf: "flex-end",
    marginBottom: -50,
    marginRight: 10,
    top: Platform.OS === "ios" ? 50 : 0,
    zIndex: 999,
  },
  skeletonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  skeleton: {
    width: "100%",
    height: "100%",
  },
  skeletonShort: {
    width: "100%",
    height: "100%",
  },
});

export default ImageFast;
