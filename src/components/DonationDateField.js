import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import moment from 'moment';

import CustomModal from './CustomModal';
import CustomText from './CustomText';
import Icons from './Icons';

import {
  formatDonationDate,
  getDonationElapsedLabel,
  parseDonationDate,
} from '../utils/donation';
import {COLORS} from '../utils/COLORS';
import fonts from '../assets/fonts';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const DonationDateField = ({
  value,
  onChange,
  error,
  withLabel = 'Last Donation Date',
  labelColor,
  showElapsed = true,
  inline = false,
}) => {
  const selected = parseDonationDate(value);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(selected ? selected.clone() : moment());
  const today = moment().startOf('day');
  const elapsed = showElapsed ? getDonationElapsedLabel(value) : '';

  const days = useMemo(() => {
    const start = cursor.clone().startOf('month');
    const end = cursor.clone().endOf('month');
    const items = [];
    for (let i = 0; i < start.day(); i += 1) items.push(null);
    for (let d = 1; d <= end.date(); d += 1) {
      items.push(cursor.clone().date(d).startOf('day'));
    }
    return items;
  }, [cursor]);

  const openPicker = () => {
    setCursor(selected ? selected.clone() : moment());
    setOpen(prev => (inline ? !prev : true));
  };

  const pickDay = day => {
    if (!day || day.isAfter(today)) return;
    onChange(day.format('DD/MM/YYYY'));
    setOpen(false);
  };

  const calendarBody = (
    <View style={inline ? styles.inlineCard : styles.modalCard}>
      <View style={styles.modalHeader}>
        <TouchableOpacity
          onPress={() => setCursor(prev => prev.clone().subtract(1, 'month'))}
          style={styles.navBtn}
          activeOpacity={0.8}
        >
          <Icons
            family="Feather"
            name="chevron-left"
            size={20}
            color={COLORS.primaryBlue}
          />
        </TouchableOpacity>
        <CustomText
          label={cursor.format('MMMM YYYY')}
          fontFamily={fonts.semiBold}
          fontSize={16}
          color={COLORS.primaryColor}
        />
        <TouchableOpacity
          onPress={() => setCursor(prev => prev.clone().add(1, 'month'))}
          style={styles.navBtn}
          activeOpacity={0.8}
        >
          <Icons
            family="Feather"
            name="chevron-right"
            size={20}
            color={COLORS.primaryBlue}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={`${day}-${index}`} style={styles.dayCell}>
            <CustomText
              label={day}
              fontSize={12}
              fontFamily={fonts.semiBold}
              color={COLORS.gray1}
            />
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }
          const isFuture = day.isAfter(today);
          const isSelected = selected && day.isSame(selected, 'day');
          const isToday = day.isSame(today, 'day');
          return (
            <TouchableOpacity
              key={day.format('YYYY-MM-DD')}
              style={styles.dayCell}
              disabled={isFuture}
              onPress={() => pickDay(day)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.dayInner,
                  isSelected && styles.daySelected,
                  isToday && !isSelected && styles.dayToday,
                ]}
              >
                <CustomText
                  label={String(day.date())}
                  fontSize={13}
                  fontFamily={fonts.semiBold}
                  color={
                    isFuture
                      ? COLORS.gray1
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

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => {
            onChange('');
            setOpen(false);
          }}
          style={styles.clearBtn}
          activeOpacity={0.8}
        >
          <CustomText
            label="Clear"
            color={COLORS.primaryBlue}
            fontFamily={fonts.semiBold}
            fontSize={14}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOpen(false)}
          style={styles.doneBtn}
          activeOpacity={0.85}
        >
          <CustomText
            label="Done"
            color={COLORS.white}
            fontFamily={fonts.semiBold}
            fontSize={14}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const calendar = inline ? (
    open ? (
      calendarBody
    ) : null
  ) : (
    <CustomModal isVisible={open} onDisable={() => setOpen(false)}>
      {calendarBody}
    </CustomModal>
  );

  return (
    <View style={styles.wrap}>
      {withLabel ? (
        <CustomText
          label={withLabel}
          marginBottom={8}
          color={labelColor || COLORS.black}
        />
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openPicker}
        style={[
          styles.field,
          {
            borderColor: error ? COLORS.red : COLORS.lightBorder,
            marginBottom: error || elapsed ? 6 : 20,
          },
        ]}
      >
        <CustomText
          label={selected ? formatDonationDate(value) : 'Select date'}
          fontSize={14}
          color={selected ? COLORS.black : COLORS.inputLabel}
        />
        <Icons
          family="Feather"
          name="calendar"
          size={18}
          color={selected ? COLORS.primaryBlue : COLORS.gray1}
        />
      </TouchableOpacity>

      {error ? (
        <CustomText
          label={error}
          color={COLORS.red}
          fontFamily={fonts.semiBold}
          fontSize={10}
          marginBottom={elapsed ? 4 : 15}
        />
      ) : null}

      {elapsed ? (
        <CustomText
          label={elapsed}
          color={COLORS.primaryBlue}
          fontFamily={fonts.medium}
          fontSize={12}
          marginBottom={16}
        />
      ) : null}

      {calendar}
    </View>
  );
};

export default DonationDateField;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  field: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 8,
  },
  inlineCard: {
    backgroundColor: COLORS.lightFill,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: COLORS.primaryBlue,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: COLORS.skyBlue,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  clearBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
