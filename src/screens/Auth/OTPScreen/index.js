import AsyncStorage from '@react-native-async-storage/async-storage';
import {Animated, Keyboard, StyleSheet, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import ScreenWrapper from '../../../components/ScreenWrapper';
import SuccessModal from '../../../components/SuccessModal';
import CustomButton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import OTPComponent from '../../../components/OTP';

import {setUserData} from '../../../store/reducer/usersSlice';
import {setToken} from '../../../store/reducer/AuthConfig';
import {ToastMessage} from '../../../utils/ToastMessage';
import {post} from '../../../services/ApiRequest';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const OTPScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const isAccountCreated = route.params?.isAccountCreated;
  const keyboardHeight = new Animated.Value(0);
  const signupData = route.params?.signupData;
  const timerRef = useRef(null);
  const token = route.params?.token;

  const [isResetModal, setResetModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', event => {
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: event.endCoordinates.height,
        useNativeDriver: false,
      }).start();
    });
    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', event => {
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: 0,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    startTimer();

    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    setTimer(5);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    const body = {
      email: signupData?.email,
      code: otp,
    };
    const bodyReset = {
      token: token,
      code: otp,
    };

    const url = isAccountCreated
      ? 'users/verify-otp/forget-password'
      : 'users/verify-otp/registration';

    try {
      const response = await post(url, isAccountCreated ? bodyReset : body);
      ToastMessage(response.data.message);
      if (isAccountCreated) {
        if (response.data?.success) {
          navigation.navigate('ResetPass', {token: token, code: otp});
        }
      } else {
        if (response.data?.success) {
          handleRegisterUser();
        } else {
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      ToastMessage(error.response.data.message);
    }
  };

  const handleRegisterUser = async () => {
    setLoading(true);
    const fcmToken = await AsyncStorage.getItem('fcmToken');
    try {
      const body = {
        name: signupData?.fullName,
        password: signupData?.password,
        email: signupData?.email,
        dob: signupData?.dateOfBirth,
        phone: signupData?.phone,
        gender: signupData?.gender,
        image: signupData?.profile,
        code: otp,
        address: signupData?.address,
        fcmtoken: fcmToken || '',
      };

      const response = await post('users/signup/customer', body);

      if (response.data.success) {
        await AsyncStorage.setItem('token', response.data?.token);
        dispatch(setToken(response.data?.token));
        dispatch(setUserData(response.data?.user));
        ToastMessage(response.data?.message);
      } else {
        ToastMessage(response.data?.message);
      }
    } catch (error) {
      ToastMessage(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const body = {
        email: signupData?.email,
        type: 'customer',
      };
      const url = isAccountCreated
        ? 'users/forget-password'
        : 'users/send-code';
      const response = await post(url, body);
      ToastMessage(response.data?.message);
      setLoading(false);
    } catch (error) {
      ToastMessage(error.response?.data?.message);
      setLoading(false);
    }
    startTimer();
  };

  return (
    <ScreenWrapper
      scrollEnabled
      footerUnScrollable={() => (
        <Animated.View
          style={{marginBottom: keyboardHeight, paddingHorizontal: 20}}>
          <CustomButton
            title="Verify"
            marginTop={40}
            marginBottom={20}
            loading={loading}
            disabled={!otp}
            onPress={handleVerifyOtp}
          />
        </Animated.View>
      )}>
      <CustomText
        label="Verify Account"
        fontFamily={fonts.semiBold}
        fontSize={24}
        color={COLORS.black}
        marginTop={10}
      />
      <CustomText
        label="Enter the verification code we just sent on your email address."
        color={COLORS.black}
        fontFamily={fonts.medium}
        marginBottom={50}
      />
      <OTPComponent value={otp} setValue={setOtp} />
      <View style={[styles.row, {marginBottom: 18}]}>
        <CustomText
          label="Re-send code in"
          fontSize={16}
          onPress={handleResendOtp}
          fontFamily={fonts.medium}
          color={COLORS.gray1}
          disabled={timer !== 0}
        />
        <CustomText
          label={` 00 : ${String(timer).padStart(2, '0')}`}
          color={COLORS.primaryColor}
          marginBottom={-3}
          fontSize={16}
          marginLeft={4}
        />
      </View>

      <SuccessModal
        isVisible={isResetModal}
        title="Changed Successfully"
        desc="Your password has been changed successfully."
        buttonTitle="Sign In"
        onDisable={() => setResetModal(false)}
        onPress={() => {
          setResetModal(false);
          setTimeout(() => {
            navigation.navigate('Login');
          }, 100);
        }}
      />
    </ScreenWrapper>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
  },
  backIcon: {
    width: 35,
    height: 35,
    backgroundColor: COLORS.back,
    elevation: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 25,
    marginTop: 25,
  },
});
