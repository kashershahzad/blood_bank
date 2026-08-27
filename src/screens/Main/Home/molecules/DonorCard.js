import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';

import CustomText from '../../../../components/CustomText';
import {FadeInUp} from '../../../../components/FadeInView';
import Icons from '../../../../components/Icons';

import {COLORS} from '../../../../utils/COLORS';
import fonts from '../../../../assets/fonts';

const DonorCard = ({item, onPress, index = 0}) => {
  return (
    <FadeInUp delay={Math.min(index, 8) * 70} from={16}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.card}
      >
        <View style={styles.bloodBadge}>
          <CustomText
            label={item.blood_group || '--'}
            fontFamily={fonts.bold}
            fontSize={15}
            color={COLORS.white}
          />
        </View>
        <View style={styles.nameWrap}>
          <CustomText
            label={item.name || 'Unknown donor'}
            fontFamily={fonts.semiBold}
            fontSize={16}
            color={COLORS.primaryBlue}
          />
          <CustomText
            label="Tap to view details"
            fontSize={11}
            color={COLORS.gray1}
            marginTop={2}
          />
        </View>
        <Icons
          family="Feather"
          name="chevron-right"
          size={20}
          color={COLORS.skyBlue}
        />
      </TouchableOpacity>
    </FadeInUp>
  );
};

export default DonorCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.primaryBlue,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bloodBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
});
