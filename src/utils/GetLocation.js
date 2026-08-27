import {Alert, Linking, Platform, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {useEffect, useState} from 'react';

const GetLocation = () => {
  const [locationData, setLocationData] = useState({});

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocationData({
          latitude,
          longitude,
        });
      },
      error => {
        console.error('Geolocation Error:', error.message);
        Alert.alert('Error', 'Unable to get your location. Please try again.');
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const requestAndroidPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getLocation();
      } else {
        showPermissionAlert();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const requestIosPermission = () => {
    Geolocation.requestAuthorization(
      () => {
        getLocation();
      },
      error => {
        console.error('iOS permission error:', error);
        showPermissionAlert();
      },
    );
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      await requestAndroidPermission();
    } else {
      requestIosPermission();
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      'Permission Required',
      'Please allow location permission in Settings.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: () => Linking.openSettings()},
      ],
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return locationData;
};

export default GetLocation;
