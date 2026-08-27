import {NativeModules} from 'react-native';

const {AppContacts} = NativeModules;

export const getDeviceContacts = () => {
  if (!AppContacts?.getAll) {
    return Promise.reject(
      new Error('Contacts module is missing. Rebuild the app and try again.'),
    );
  }
  return AppContacts.getAll();
};
