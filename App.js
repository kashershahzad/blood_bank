import { NavigationContainer } from '@react-navigation/native';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import RNBootSplash from 'react-native-bootsplash';
import { I18nextProvider } from 'react-i18next';
import notifee from '@notifee/react-native';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import 'intl-pluralrules';

import BrainBox from './src/components/BrainBox';

import { persistor, store } from './src/store';
import { COLORS } from './src/utils/COLORS';
import Navigation from './src/navigation';
import i18n from './src/language/i18n';

const App = () => {
  useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []);
  const onMessageHandler = async () => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
    await notifee.displayNotification({
      title: 'Notification Title',
      body: 'Main notification message',
      android: {
        channelId,
        smallIcon: 'ic_launcher',
      },
    });
  };

  notifee.onBackgroundEvent(async ({ type, detail }) => {});

  notifee.onForegroundEvent(({ type, detail }) => {});

  useEffect(() => {
    const unSubMessaging = messaging().onMessage(onMessageHandler);
    return () => {
      unSubMessaging();
    };
  }, []);
  return (
    <I18nextProvider i18n={i18n}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.primaryColor}
      />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <NavigationContainer>
              <BrainBox>
                <Navigation />
              </BrainBox>
            </NavigationContainer>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </I18nextProvider>
  );
};

export default App;
