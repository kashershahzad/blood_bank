import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';

import {getToken} from '../utils/constants';

const BrainBox = ({children}) => {
  const navigation = useNavigation();
  useEffect(() => {
    getToken();
  }, []);
  const handlePress = data => {
    const item = JSON.parse(data?.recipient);
    if (data?.messageType === 'message') {
      navigation.navigate('MainStack', {
        screen: 'InboxScreen',
        params: {data: item},
      });
    }
  };
  useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      handlePress(remoteMessage?.data);
    });
  }, []);

  return <View style={{flex: 1}}>{children}</View>;
};

export default BrainBox;
