import {StyleSheet, View} from 'react-native';
import React from 'react';

import CustomButton from './CustomButton';
import CustomModal from './CustomModal';
import CustomText from './CustomText';
import ImageFast from './ImageFast';

import {Images} from '../assets/images';
import {COLORS} from '../utils/COLORS';
import fonts from '../assets/fonts';

const SuccessModal = ({
  isVisible,
  onDisable,
  onPress,
  title,
  desc,
  buttonTitle,
}) => {
  return (
    <CustomModal isVisible={isVisible} onDisable={onDisable}>
      <View style={styles.mainContainer}>
        <ImageFast
          source={Images.greenCheck}
          style={styles.img}
          resizeMode="contain"
        />
        <CustomText
          label={title}
          fontFamily={fonts.bold}
          fontSize={24}
          marginBottom={5}
          textAlign="center"
        />
        <CustomText
          label={desc}
          color={COLORS.gray2}
          textAlign="center"
          marginBottom={20}
          lineHeight={22}
        />
        <CustomButton title={buttonTitle} onPress={onPress} />
      </View>
    </CustomModal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '85%',
    alignSelf: 'center',
  },
  img: {
    width: 105,
    height: 105,
    marginBottom: 30,
  },
});
