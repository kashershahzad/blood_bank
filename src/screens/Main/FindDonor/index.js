import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import {FadeInUp} from '../../../components/FadeInView';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';

import {ToastMessage} from '../../../utils/ToastMessage';
import {isAvailableForDonation} from '../../../utils/donation';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const FindDonor = ({navigation, route}) => {
  const [donors, setDonors] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(
    route?.params?.group || 'All',
  );
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonors = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      if (!auth().currentUser) {
        setDonors([]);
        return;
      }

      const snapshot = await firestore().collection('donors').get();
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDonors(list);
    } catch (error) {
      ToastMessage(
        error?.code === 'firestore/permission-denied'
          ? 'Permission denied. Allow read on donors in Firestore Rules.'
          : error?.message || 'Failed to load donors',
        'error',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const group = route?.params?.group;
      if (group) setSelectedGroup(group);
      fetchDonors();
    }, [fetchDonors, route?.params?.group]),
  );

  const filteredDonors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return donors.filter(item => {
      const matchesGroup =
        selectedGroup === 'All' ||
        String(item.blood_group || '').toUpperCase() === selectedGroup;
      if (!matchesGroup) return false;
      if (!q) return true;
      const name = String(item.name || '').toLowerCase();
      const phone = String(item.phone || '').toLowerCase();
      const group = String(item.blood_group || '').toLowerCase();
      const location = String(item.location || '').toLowerCase();
      return (
        name.includes(q) ||
        phone.includes(q) ||
        group.includes(q) ||
        location.includes(q)
      );
    });
  }, [donors, selectedGroup, search]);

  const renderItem = ({item, index}) => {
    const available = isAvailableForDonation(item.last_donation);
    return (
      <FadeInUp delay={Math.min(index, 7) * 60} from={14}>
        <TouchableOpacity
          style={[styles.card, !available && styles.cardUnavailable]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('DonorDetail', {item})}>
          <View style={[styles.bloodBadge, !available && styles.badgeUnavailable]}>
            <CustomText
              label={item.blood_group || '--'}
              fontFamily={fonts.bold}
              fontSize={15}
              color={COLORS.white}
              removeTranslation
            />
          </View>
          <View style={styles.cardInfo}>
            <CustomText
              label={item.name || 'Unknown donor'}
              fontFamily={fonts.semiBold}
              fontSize={15}
              color={available ? COLORS.primaryBlue : COLORS.gray2}
              removeTranslation
            />
            <CustomText
              label={
                available
                  ? item.phone || item.location || 'Tap to view details'
                  : 'Not Available'
              }
              fontSize={12}
              color={available ? COLORS.gray1 : COLORS.primaryBlue}
              fontFamily={available ? fonts.regular : fonts.semiBold}
              marginTop={2}
              removeTranslation
            />
          </View>
          <Icons
            family="Feather"
            name="chevron-right"
            size={18}
            color={available ? COLORS.skyBlue : COLORS.gray1}
          />
        </TouchableOpacity>
      </FadeInUp>
    );
  };

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
          <FadeInUp delay={40} from={10}>
            <CustomText
              label="Find a Donor"
              fontFamily={fonts.bold}
              fontSize={22}
              color={COLORS.white}
            />
            <CustomText
              label="Search donors by blood group"
              fontSize={13}
              color="rgba(255,255,255,0.85)"
              marginTop={4}
            />
          </FadeInUp>

          <View style={styles.chipWrap}>
            {BLOOD_GROUPS.map(group => {
              const active = selectedGroup === group;
              return (
                <TouchableOpacity
                  key={group}
                  onPress={() => setSelectedGroup(group)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.85}>
                  <CustomText
                    label={group}
                    fontFamily={fonts.semiBold}
                    fontSize={12}
                    color={active ? COLORS.primaryColor : COLORS.white}
                    removeTranslation
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.searchWrap}>
            <Icons
              family="Feather"
              name="search"
              size={18}
              color={COLORS.skyBlue}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, phone or location"
              placeholderTextColor={COLORS.gray1}
              style={styles.searchInput}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Icons family="Feather" name="x" size={16} color={COLORS.gray1} />
              </TouchableOpacity>
            ) : null}
          </View>
          <FlatList
            data={filteredDonors}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchDonors(true)}
                tintColor={COLORS.primaryBlue}
                colors={[COLORS.primaryBlue]}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Icons
                  family="Feather"
                  name="search"
                  size={36}
                  color={COLORS.skyBlue}
                />
                <CustomText
                  label={
                    search || selectedGroup !== 'All'
                      ? 'No matching donors'
                      : 'No donors found'
                  }
                  fontFamily={fonts.medium}
                  color={COLORS.gray1}
                  fontSize={14}
                  marginTop={10}
                />
              </View>
            }
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

export default FindDonor;

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginHorizontal: -4,
  },
  chip: {
    width: '18%',
    margin: '1%',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
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
    paddingTop: 16,
    paddingBottom: 90,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  cardUnavailable: {
    backgroundColor: '#F4E8EA',
    borderColor: '#E8C9CF',
  },
  bloodBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeUnavailable: {
    backgroundColor: COLORS.gray1,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  loader: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
});
