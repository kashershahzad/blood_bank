import {appleAuth} from '@invertase/react-native-apple-authentication';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch} from 'react-redux';
import jwt_decode from 'jwt-decode';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import DualText from '../../../components/DualText';

import SocialIcon from '../Login/molecules/SocialIcon';

import {setLocation, setUserData} from '../../../store/reducer/usersSlice';
import {passwordRegex, regEmail} from '../../../utils/constants';
import {setToken} from '../../../store/reducer/AuthConfig';
import {ToastMessage} from '../../../utils/ToastMessage';
import GetLocation from '../../../utils/GetLocation';
import {post} from '../../../services/ApiRequest';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
const Signup = ({navigation}) => {
  const dispatch = useDispatch();
  const locationData = GetLocation();

  const init = {
    email: '',
    password: '',
  };
  const inits = {
    emailError: '',
    passwordError: '',
  };

  const [state, setState] = useState(init);
  const [errors, setErrors] = useState(inits);

  const [loading, setLoading] = useState(false);
  const [checkEmailError, setCheckEmailError] = useState('');
  const [GoogleLoading, setGoogleLoading] = useState(false);
  const [AppleLoading, setAppleLoading] = useState(false);

  const checkEmail = async text => {
    setState({...state, email: text});
    setCheckEmailError('');
    if (regEmail.test(text)) {
      try {
        const body = {
          type: 'customer',
          email: text,
        };
        const response = await post('users/check-email', body);
        if (!response.data?.success) {
          setCheckEmailError('Email Already Exists');
          ToastMessage('Email Already Exists');
        } else {
          setCheckEmailError('');
        }
      } catch (error) {
        setCheckEmailError(error?.response?.data?.message);
        ToastMessage(error?.response?.data?.message);
      }
    }
  };

  const onGoogleButtonPress = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      const FCMTOKEN = await AsyncStorage.getItem('fcmToken');
      const body = {
        fname: `${user?.data?.user?.givenName} ${user?.data?.user?.familyName}`,
        email: user?.data?.user?.email,
        profilePicture: user?.data?.user?.photo,
        fcmtoken: FCMTOKEN || '',
      };
      const response = await post('users/google/auth', body);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data?.token);
        dispatch(setToken(response.data?.token));
        dispatch(setUserData(response.data?.user));
      }
    } catch (error) {
      ToastMessage(error.response.data.message);
      setGoogleLoading(false);
    }
  };
  const errorCheck = useMemo(() => {
    return () => {
      let newErrors = {};
      if (!state.email) newErrors.emailError = 'Please enter Email address';
      else if (!regEmail.test(state.email))
        newErrors.emailError = 'Please enter valid email';
      else if (!state.password)
        newErrors.passwordError = 'Please enter password';
      else if (!passwordRegex.test(state.password))
        newErrors.passwordError =
          'Password must contain 1 number, 1 special character, Uppercase and 8 digits';

      setErrors(newErrors);
    };
  }, [state]);

  useEffect(() => {
    errorCheck();
  }, [errorCheck]);

  const array = [
    {
      id: 1,
      placeholder: 'Email',
      value: state.email,
      onChange: text => checkEmail(text),
      error: errors?.emailError || checkEmailError,
      autoCapitalize: 'none',
      keyboardType: 'email-address',
    },
    {
      id: 2,
      placeholder: 'Password',
      value: state.password,
      onChange: text => setState({...state, password: text}),
      error: errors?.passwordError,
    },
  ];

  const onAppleButtonPress = async () => {
    setAppleLoading(true);
    const FCMTOKEN = await AsyncStorage.getItem('fcmToken');
    const appleData = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    if (appleData.identityToken) {
      let res;
      if (appleData.email == null || appleData.email == undefined) {
        res = jwt_decode(appleData.identityToken);
      } else {
        res = appleData;
      }
      try {
        const payload = {
          email: res?.email,
          fcmtoken: FCMTOKEN ? FCMTOKEN : '',
          name: res?.fullName?.familyName + res?.fullName?.givenName,
          type: 'customer',
        };
        const response = await post('auth/social-login', payload);
        if (response.data.token) {
          await AsyncStorage.setItem('token', response.data?.token);
          dispatch(setToken(response.data?.token));
          dispatch(setUserData(response.data?.user));
          setGoogleLoading(false);
        }
      } catch (error) {
        ToastMessage(error.response.data.message);
        setAppleLoading(false);
      }
    } else {
      ToastMessage('An error has occurred. Please try again later.');
      setAppleLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setLocation(locationData));
  }, [locationData]);

  return (
    <ScreenWrapper
      backgroundColor={COLORS.white}
      statusBarColor={COLORS.white}
      scrollEnabled
      footerUnScrollable={() => (
        <DualText
          title="Already have an account?"
          secondTitle=" Sign in"
          marginTop={16}
          marginBottom={20}
          onPress={() => navigation.navigate('Login')}
        />
      )}>
      <CustomText
        label="Create your Account"
        fontFamily={fonts.bold}
        fontSize={38}
        marginTop={40}
        marginBottom={30}
        lineHeight={60}
      />

      {array?.map(item => (
        <CustomInput
          key={item?.id}
          placeholder={item.placeholder}
          value={item.value}
          onChangeText={item.onChange}
          autoCapitalize={item.autoCapitalize}
          error={item.error}
          withLabel={item.withLabel}
          secureTextEntry={item.id === 2}
          mailIcon={item.id == 1}
          lockIcon={item.id == 2}
          keyboardType={item.keyboardType}
        />
      ))}

      <CustomButton
        title="Continue"
        onPress={() => navigation.navigate('SignUpDetails', {state})}
        loading={loading}
        disabled={
          !Object.values(errors).every(error => error === '') ||
          !!checkEmailError
        }
        marginBottom={40}
      />
      <View style={styles.row}>
        <View style={styles.line} />
        <CustomText
          label="or continue with"
          alignSelf="center"
          fontFamily={fonts.semiBold}
          fontSize={16}
        />
        <View style={styles.line} />
      </View>
      <SocialIcon
        googlePress={() => onGoogleButtonPress()}
        applePress={() => onAppleButtonPress()}
        loading={GoogleLoading}
        appleLoading={AppleLoading}
        indicatorColor
        apple={Platform.OS == 'ios'}
      />
    </ScreenWrapper>
  );
};

export default Signup;
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  line: {
    width: '28%',
    height: 1,
    backgroundColor: COLORS.border,
  },
});
