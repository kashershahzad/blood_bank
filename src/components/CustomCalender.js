import { View, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";

import CustomText from "./CustomText";
import Icons from "./Icons";

import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const CustomCalendar = ({
  disabled,
  disabledDates = [],
  error,
  selectedDates = [],
  setSelectedDates,
  multipleSelection = true, // Default is multiple selection
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (year, month) => {
    const days = [];
    let date = new Date(Date.UTC(year, month, 1));
    while (date.getUTCMonth() === month) {
      days.push(new Date(date)); // Push a UTC-based date
      date.setUTCDate(date.getUTCDate() + 1);
    }
    return days;
  };

  const getMonthName = (date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[date.getMonth()];
  };

  const handleDatePress = (day) => {
    const selectedDay = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
    );

    if (
      selectedDates.length > 0 &&
      selectedDates[0].toUTCString() === selectedDay.toUTCString()
    ) {
      setSelectedDates([]);
    } else {
      setSelectedDates([selectedDay]);
    }
    // }
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const daysInMonth = getDaysInMonth(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  const monthName = getMonthName(currentMonth);
  const today = new Date();

  const isSelectedDate = (day) => {
    return selectedDates.some(
      (selectedDate) =>
        new Date(selectedDate).toUTCString() === day.toUTCString()
    );
  };

  const isToday = (day) => {
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );
    return todayUTC.toUTCString() === day.toUTCString();
  };

  const isDisabledDate = (day) => {
    return disabledDates.some((disabledDate) => {
      const formattedDisabledDate = new Date(disabledDate);
      return (
        Date.UTC(
          formattedDisabledDate.getFullYear(),
          formattedDisabledDate.getMonth(),
          formattedDisabledDate.getDate()
        ) ===
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
      );
    });
  };

  const isCurrentDate = (day) => {
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );
    return todayUTC.toUTCString() === day.toUTCString();
  };

  return (
    <View>
      <View
        style={[
          styles.container,
          {
            backgroundColor: COLORS.white,
            borderColor: error ? COLORS.red : COLORS.lightGray,
            marginBottom: error ? 5 : 20,
          },
        ]}
      >
        <View style={styles.header}>
          <Icons
            family="Entypo"
            name="chevron-left"
            size={22}
            color={COLORS.black}
            onPress={prevMonth}
          />
          <CustomText
            fontFamily={fonts.bold}
            fontSize={16}
            label={`${monthName} ${currentMonth.getFullYear()}`}
          />
          <Icons
            family="Entypo"
            name="chevron-right"
            size={22}
            onPress={nextMonth}
            color={COLORS.black}
          />
        </View>
        <View style={styles.daysHeader}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <View style={{ width: "14.25%", alignItems: "center" }} key={day}>
              <CustomText key={day} label={day} fontFamily={fonts.semiBold} />
            </View>
          ))}
        </View>
        <View style={styles.daysContainer}>
          {daysInMonth.map((day, index) => {
            const isBeforeToday = day < today && !isToday(day);
            const isSelected = isSelectedDate(day);
            const isDisabled = isDisabledDate(day);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.day,
                  isSelected ? styles.selectedDay : {},
                  isDisabled ? styles.disabledDay : {},
                ]}
                onPress={() =>
                  !isBeforeToday && !isDisabled && handleDatePress(day)
                }
                disabled={disabled || isBeforeToday || isDisabled}
              >
                <View
                  style={[
                    styles.dayInner,
                    isSelected ? styles.selectedDayInner : {},
                    isCurrentDate(day) ? styles.currentDateBorder : {}, // Border for current date
                  ]}
                >
                  <CustomText
                    label={day.getDate()}
                    fontFamily={fonts.bold}
                    color={
                      isBeforeToday || isDisabled
                        ? COLORS.gray
                        : isSelected
                        ? COLORS.white
                        : COLORS.black
                    }
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {error && (
        <CustomText
          label={error}
          color={COLORS.red}
          fontFamily={fonts.semiBold}
          fontSize={10}
          marginBottom={20}
          alignSelf="flex-start"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    borderWidth: 1,
    paddingBottom: 10,
    borderRadius: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  daysHeader: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  day: {
    width: "14.1%",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  dayInner: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  selectedDay: {
    borderRadius: 10,
  },
  selectedDayInner: {
    backgroundColor: COLORS.black,
    borderRadius: 100,
    width: 30,
    height: 30,
  },
  disabledDay: {
    backgroundColor: "transparent",
  },
  currentDateBorder: {
    borderWidth: 1.5,
    borderColor: COLORS.primaryColor, // Customize this color
    borderRadius: 100,
    width: 30,
    height: 30,
  },
});

export default CustomCalendar;
