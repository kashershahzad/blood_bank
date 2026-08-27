import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {getDeviceContacts} from 'app-contacts';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';

import {ToastMessage} from '../../../utils/ToastMessage';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const requestPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    {
      title: 'Contacts Permission',
      message:
        'Blood Bank needs access to your contacts so you can add donors faster.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    Alert.alert(
      'Permission required',
      'Enable contacts permission from Settings to sync contacts.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: () => Linking.openSettings()},
      ],
    );
  }

  return false;
};

const ContactPicker = ({navigation}) => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const allowed = await requestPermission();
      if (!allowed) {
        setContacts([]);
        return;
      }

      const list = await getDeviceContacts();
      setContacts(Array.isArray(list) ? list : []);
    } catch (error) {
      setContacts([]);
      ToastMessage(error?.message || 'Failed to load contacts', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(item => {
      const name = String(item.name || '').toLowerCase();
      const phone = String(item.phone || '');
      return name.includes(q) || phone.includes(q);
    });
  }, [contacts, search]);

  const onSelect = item => {
    navigation.replace('DonorForm', {
      item: {
        name: item.name || '',
        phone: String(item.phone || '').replace(/[^0-9]/g, ''),
      },
    });
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onSelect(item)}>
      <View style={styles.avatar}>
        <CustomText
          label={(item.name || 'U').charAt(0).toUpperCase()}
          fontFamily={fonts.bold}
          fontSize={16}
          color={COLORS.white}
          removeTranslation
        />
      </View>
      <View style={styles.cardInfo}>
        <CustomText
          label={item.name || 'Unknown'}
          fontFamily={fonts.semiBold}
          fontSize={15}
          color={COLORS.primaryBlue}
          removeTranslation
        />
        <CustomText
          label={item.phone || ''}
          fontSize={12}
          color={COLORS.gray1}
          marginTop={2}
          removeTranslation
        />
      </View>
      <Icons family="Feather" name="chevron-right" size={18} color={COLORS.gray1} />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper
      backgroundColor={COLORS.primaryColor}
      statusBarColor={COLORS.primaryColor}
      barStyle="light-content"
      paddingHorizontal={0}
      headerUnScrollable={() => (
        <View
          style={[
            styles.header,
            {
              paddingTop:
                (Platform.OS === 'android'
                  ? StatusBar.currentHeight || 16
                  : 8) + 10,
            },
          ]}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.8}>
              <Icons
                family="Ionicons"
                name="chevron-back"
                size={22}
                color={COLORS.primaryBlue}
              />
            </TouchableOpacity>
            <CustomText
              label="Sync Contacts"
              fontFamily={fonts.semiBold}
              fontSize={16}
              color={COLORS.white}
            />
            <View style={{width: 40}} />
          </View>
        </View>
      )}>
      <View style={styles.body}>
        <View style={styles.searchWrap}>
          <Icons family="Feather" name="search" size={18} color={COLORS.skyBlue} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search name or number"
            placeholderTextColor={COLORS.gray1}
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icons family="Feather" name="x" size={16} color={COLORS.gray1} />
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item, index) =>
              `${item.phone || 'p'}-${item.name || 'n'}-${index}`
            }
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.empty}>
                <Icons
                  family="Feather"
                  name="users"
                  size={36}
                  color={COLORS.skyBlue}
                />
                <CustomText
                  label={search ? 'No matching contacts' : 'No contacts found'}
                  fontFamily={fonts.medium}
                  color={COLORS.gray1}
                  fontSize={14}
                  marginTop={10}
                />
              </View>
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default ContactPicker;

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    backgroundColor: COLORS.lightFill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: COLORS.black,
    padding: 0,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 36,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
});
