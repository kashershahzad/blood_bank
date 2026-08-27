import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  Platform,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import jwt_decode from 'jwt-decode';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import DualText from '../../../components/DualText';
import { FadeInUp, ScaleIn } from '../../../components/FadeInView';
import Icons from '../../../components/Icons';

import { setLocation, setUserData } from '../../../store/reducer/usersSlice';
import { setToken } from '../../../store/reducer/AuthConfig';
import { ToastMessage } from '../../../utils/ToastMessage';
import GetLocation from '../../../utils/GetLocation';
import { regEmail } from '../../../utils/constants';
import { post } from '../../../services/ApiRequest';
import { COLORS } from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import auth from '@react-native-firebase/auth';

const getFirebaseAuthMessage = error => {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection';
    default:
      return error?.message || 'Sign in failed';
  }
};

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const locationData = GetLocation();
  const { height } = useWindowDimensions();
  const isSmall = height < 720;
  const blobOneY = useRef(new Animated.Value(0)).current;
  const blobTwoY = useRef(new Animated.Value(0)).current;
  const blobThreeY = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '735961848532-eibai22aakbj22nutl177d7au091vv1o.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  useEffect(() => {
    const float = (value, to, duration) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: to,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );

    const one = float(blobOneY, 18, 2800);
    const two = float(blobTwoY, -16, 3400);
    const three = float(blobThreeY, 12, 2600);
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    one.start();
    two.start();
    three.start();
    pulse.start();

    return () => {
      one.stop();
      two.stop();
      three.stop();
      pulse.stop();
    };
  }, [blobOneY, blobThreeY, blobTwoY, logoScale]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const init = {
    email: '',
    password: '',
  };
  const inits = {
    emailError: '',
    passwordError: '',
  };

  const [GoogleLoading, setGoogleLoading] = useState(false);
  const [AppleLoading, setAppleLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(inits);
  const [state, setState] = useState(init);

  const array = [
    {
      id: 1,
      placeholder: 'Enter your email',
      withLabel: 'Email',
      value: state.email,
      onChange: text => {
        setState({ ...state, email: text });
        if (errors.emailError) setErrors({ ...errors, emailError: '' });
      },
      error: errors?.emailError,
      autoCapitalize: 'none',
      keyboardType: 'email-address',
      inputRef: emailRef,
      returnKeyType: 'next',
      blurOnSubmit: false,
      onSubmitEditing: () => passwordRef.current?.focus(),
    },
    {
      id: 2,
      placeholder: 'Enter your password',
      withLabel: 'Password',
      value: state.password,
      onChange: text => {
        setState({ ...state, password: text });
        if (errors.passwordError) setErrors({ ...errors, passwordError: '' });
      },
      error: errors?.passwordError,
      inputRef: passwordRef,
      returnKeyType: 'done',
    },
  ];

  const onGoogleButtonPress = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      const FCMTOKEN = await AsyncStorage.getItem('fcmToken');
      const body = {
        name: user?.user?.givenName + ' ' + user?.user?.familyName,
        email: user?.user?.email,
        fcmtoken: FCMTOKEN || '',
      };
      const response = await post('auth/social-login', body)
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data?.token);
        dispatch(setToken(response.data?.token));
        dispatch(setUserData(response.data?.user));
      }
    } catch (error) {
      console.log('===========error', error);
      ToastMessage(error?.response?.data?.message || 'Sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    const newErrors = {};
    if (!state.email) newErrors.emailError = 'Please enter Email address';
    else if (!regEmail.test(state.email))
      newErrors.emailError = 'Please enter valid email';
    if (!state.password) newErrors.passwordError = 'Please enter Password';
    else if (state.password.length < 8)
      newErrors.passwordError = 'Password must be 8 digits';

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      setLoading(true);
      const { user } = await auth().signInWithEmailAndPassword(
        state.email.trim(),
        state.password,
      );
      const token = await user.getIdToken();
      await AsyncStorage.setItem('token', token);
      dispatch(setToken(token));
      dispatch(
        setUserData({
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
        }),
      );
    } catch (error) {
      ToastMessage(getFirebaseAuthMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

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
      backgroundColor={COLORS.primaryColor}
      statusBarColor={COLORS.primaryColor}
      barStyle="light-content"
      paddingHorizontal={0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardHeight + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces
        nestedScrollEnabled
      >
        <View style={styles.header}>
          <Animated.View
            style={[styles.blobOne, { transform: [{ translateY: blobOneY }] }]}
          />
          <Animated.View
            style={[styles.blobTwo, { transform: [{ translateY: blobTwoY }] }]}
          />
          <Animated.View
            style={[
              styles.blobThree,
              { transform: [{ translateY: blobThreeY }] },
            ]}
          />
          <View style={styles.ring} />

          <View
            style={[
              styles.headerContent,
              {
                paddingTop:
                  (Platform.OS === 'android'
                    ? StatusBar.currentHeight || 16
                    : 8) + 12,
                paddingBottom: 14,
              },
            ]}
          >
            <FadeInUp delay={80}>
              <View style={styles.brandRow}>
                <Animated.View
                  style={[
                    styles.logoOuter,
                    { transform: [{ scale: logoScale }] },
                  ]}
                >
                  <View style={styles.logoMid}>
                    <View style={styles.logoInner}>
                      <Icons
                        family="Ionicons"
                        name="water"
                        size={isSmall ? 20 : 22}
                        color={COLORS.white}
                      />
                    </View>
                  </View>
                </Animated.View>
                <View>
                  <CustomText
                    label="BLOOD BANK"
                    fontFamily={fonts.semiBold}
                    fontSize={11}
                    color={COLORS.white}
                    letterSpacing={2.4}
                  />
                  <CustomText
                    label="Give blood. Save lives."
                    fontFamily={fonts.regular}
                    fontSize={11}
                    color="rgba(255,255,255,0.75)"
                    marginTop={1}
                  />
                </View>
              </View>
            </FadeInUp>

            <FadeInUp delay={180} from={18}>
              <View style={styles.welcomeBlock}>
                <CustomText
                  label="Welcome Back"
                  fontFamily={fonts.bold}
                  fontSize={isSmall ? 26 : 30}
                  color={COLORS.white}
                  lineHeight={isSmall ? 32 : 38}
                />
                <View style={styles.welcomeLine} />
                <CustomText
                  label="Sign in to continue helping people in need"
                  fontFamily={fonts.regular}
                  fontSize={13}
                  color="rgba(255,255,255,0.86)"
                  marginTop={6}
                  lineHeight={18}
                />
              </View>
            </FadeInUp>
          </View>

          <View style={styles.featureRow}>
            {[
              { icon: 'heart', family: 'Feather', title: 'Donate' },
              { icon: 'users', family: 'Feather', title: 'Find Donors' },
              { icon: 'zap', family: 'Feather', title: 'Fast Help' },
            ].map((item, index) => (
              <FadeInUp
                key={item.title}
                delay={280 + index * 90}
                from={16}
                style={styles.featureCardWrap}
              >
                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Icons
                      family={item.family}
                      name={item.icon}
                      size={14}
                      color={COLORS.primaryColor}
                    />
                  </View>
                  <CustomText
                    label={item.title}
                    fontFamily={fonts.medium}
                    fontSize={11}
                    color={COLORS.white}
                    marginTop={4}
                  />
                </View>
              </FadeInUp>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.sheet,
            { paddingBottom: Platform.OS === 'ios' ? 24 : 18 },
          ]}
        >
            {array?.map((item, index) => (
              <FadeInUp key={item?.id} delay={420 + index * 80} from={14}>
                <CustomInput
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
                  borderRadius={16}
                  height={56}
                  borderColor={COLORS.lightBorder}
                  focusBorderColor={COLORS.skyBlue}
                  iconColor={COLORS.skyBlue}
                  labelColor={COLORS.primaryBlue}
                  inputRef={item.inputRef}
                  returnKeyType={item.returnKeyType}
                  blurOnSubmit={item.blurOnSubmit}
                  onSubmitEditing={
                    item.id === 2 ? handleLogin : item.onSubmitEditing
                  }
                />
              </FadeInUp>
            ))}

            <ScaleIn delay={620}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={loading}
                style={styles.signInBtn}
              >
            {loading ? (
              <ActivityIndicator size={22} color={COLORS.white} />
            ) : (
              <>
                <CustomText
                  label="Sign in"
                  color={COLORS.white}
                  fontFamily={fonts.semiBold}
                  fontSize={16}
                />
                <View style={styles.signInArrow}>
                  <Icons
                    family="Feather"
                    name="arrow-right"
                    size={16}
                    color={COLORS.primaryBlue}
                  />
                </View>
              </>
            )}
          </TouchableOpacity>
            </ScaleIn>

          {/* <DualText
            title="Don’t have an account?"
            secondTitle=" Sign up"
            marginTop={0}
            marginBottom={0}
            secondColor={COLORS.primaryBlue}
            onPress={() => navigation.navigate('Signup')}
          /> */}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.primaryColor,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  blobOne: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.skyBlue,
    top: -80,
    right: -60,
    opacity: 0.28,
  },
  blobTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.white,
    top: 30,
    left: -80,
    opacity: 0.08,
  },
  blobThree: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.white,
    bottom: 70,
    right: 24,
    opacity: 0.08,
  },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 18,
    borderColor: 'rgba(255,255,255,0.08)',
    top: 18,
    right: 10,
  },
  headerContent: {
    paddingHorizontal: 22,
    zIndex: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: "3%",
  },
  logoOuter: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoMid: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(232,107,122,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeBlock: {
    marginTop: "15%",
  },
  welcomeLine: {
    width: 42,
    height: 3,
    borderRadius: 3,
    backgroundColor: COLORS.skyBlue,
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 20,
    marginTop: 12,
  },
  featureCardWrap: {
    width: '31.5%',
  },
  featureCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  featureIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 38,
  },
  signInBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signInBtnDisabled: {
    backgroundColor: COLORS.skyBlue,
    opacity: 0.55,
    elevation: 0,
    shadowOpacity: 0,
  },
  signInArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
