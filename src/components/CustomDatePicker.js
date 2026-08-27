import { Image, StyleSheet, TouchableOpacity } from "react-native";
import DatePicker from "react-native-date-picker";
import React, { useState } from "react";
import moment from "moment";

import CustomText from "./CustomText";

import { Images } from "../assets/images";
import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const CustomDatePicker = ({
  value,
  setValue,
  error,
  withLabel,
  labelColor,
  placeholder = "Date",
  type = "date",
}) => {
  const [isModal, setModal] = useState(false);
  return (
    <>
      {withLabel && (
        <CustomText
          label={withLabel}
          marginBottom={8}
          color={labelColor || COLORS.black}
        />
      )}
      <TouchableOpacity
        onPress={() => setModal(true)}
        style={[
          styles.mainContainer,
          {
            marginBottom: error ? 5 : 20,
            borderColor: error ? COLORS.red : "transparent",
          },
        ]}
      >
        <CustomText
          label={
            value
              ? moment(value).format(type == "date" ? "DD/MM/YYYY" : "h:mm A")
              : placeholder
          }
          color={value ? COLORS.black : COLORS.inputLabel}
        />
        <Image
          source={type == "date" ? Images.calendar : Images.clock}
          style={[
            styles.rightIcon,
            { tintColor: value?.length ? COLORS.primaryColor : "#9E9E9E" },
          ]}
        />
      </TouchableOpacity>
      {error && (
        <CustomText
          label={error}
          color={COLORS.red}
          fontFamily={fonts.semiBold}
          fontSize={10}
          marginBottom={15}
        />
      )}
      {isModal && (
        <DatePicker
          modal
          open={isModal}
          date={value || new Date()}
          onConfirm={(date) => {
            setValue(date);
            setModal(false);
          }}
          onCancel={() => {
            setModal(false);
          }}
          mode={type}
        />
      )}
    </>
  );
};

export default CustomDatePicker;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
  },

  rightIcon: {
    width: 20,
    height: 20,
    position: "absolute",
    right: 15,
    resizeMode: "contain",
  },
});
