import {useDispatch} from 'react-redux';
import React, {useEffect} from 'react';
import {View} from 'react-native';

import TermsAndConditionsText from '../../../components/TermsAndConditionsText';
import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomButton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';

import {setLocation} from '../../../store/reducer/usersSlice';
import {setOnBoarding} from '../../../store/reducer/AuthConfig';
import GetLocation from '../../../utils/GetLocation';
import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';

const GetStarted = ({navigation}) => {
  const dispatch = useDispatch();
  const locationData = GetLocation();

  useEffect(() => {
    dispatch(setLocation(locationData));
  }, [locationData]);

  return (
    <ScreenWrapper
      footerUnScrollable={() => (
        <>
          <View
            style={{
              paddingHorizontal: 20,
              marginBottom: 10,
            }}>
            <CustomButton
              title="Get Started"
              marginBottom={12}
              height={52}
              borderRadius={6}
              onPress={() => {
                navigation.navigate('Login');
                dispatch(setOnBoarding(true));
              }}
            />
            <TermsAndConditionsText
              onTermPress={() => navigation.navigate('TermsCondition')}
              onPolicyPress={() => navigation.navigate('PrivacyPolicy')}
            />
          </View>
        </>
      )}>
      <ImageFast
        resizeMode="contain"
        source={Images.logo}
        style={{height: 362, width: 373}}
      />

      <View
        style={{paddingHorizontal: 14, alignItems: 'center', marginTop: 20}}>
        <CustomText
          label="Welcome to Utecho Kit"
          fontSize={32}
          fontFamily={fonts.semiBold}
          marginBottom={10}
          marginTop={20}
          textAlign={'center'}
        />
        <CustomText
          label="Embrace eco-friendly travel join our ride-sharing community for a greener commute."
          fontSize={14}
          lineHeight={24}
          textAlign="center"
        />
      </View>
    </ScreenWrapper>
  );
};

export default GetStarted;
