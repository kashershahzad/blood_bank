import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import {FadeInUp} from '../../../components/FadeInView';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';

import {ToastMessage} from '../../../utils/ToastMessage';
import {
  formatDonationDate,
  getDonationElapsedLabel,
  sortDonationsNewest,
} from '../../../utils/donation';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const AllDonations = ({navigation}) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const snapshot = await firestore().collection('donations').get();
      const list = sortDonationsNewest(
        snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})),
      );
      setDonations(list);
    } catch (error) {
      ToastMessage(error?.message || 'Failed to load donations', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDonations();
    }, [fetchDonations]),
  );

  const openDonation = item => {
    if (!item.donor_id) return;
    navigation.navigate('DonorDetail', {
      item: {
        id: item.donor_id,
        name: item.name,
        blood_group: item.blood_group,
        phone: item.phone,
      },
    });
  };

  const renderItem = ({item, index}) => (
    <FadeInUp delay={Math.min(index, 8) * 50} from={12}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.row}
        onPress={() => openDonation(item)}
      >
        <View style={styles.badge}>
          <CustomText
            label={item.blood_group || '--'}
            fontFamily={fonts.bold}
            fontSize={13}
            color={COLORS.white}
            removeTranslation
          />
        </View>
        <View style={styles.info}>
          <CustomText
            label={item.name || 'Unknown donor'}
            fontFamily={fonts.semiBold}
            fontSize={14}
            color={COLORS.primaryColor}
            removeTranslation
          />
          <CustomText
            label={
              item.hospital
                ? item.hospital
                : getDonationElapsedLabel(item.donation_date) ||
                  'Donation recorded'
            }
            fontSize={11}
            color={COLORS.gray1}
            marginTop={2}
            removeTranslation
          />
        </View>
        <View style={styles.dateWrap}>
          <CustomText
            label={formatDonationDate(item.donation_date)}
            fontSize={11}
            fontFamily={fonts.semiBold}
            color={COLORS.primaryBlue}
            removeTranslation
          />
          <Icons
            family="Feather"
            name="chevron-right"
            size={16}
            color={COLORS.skyBlue}
          />
        </View>
      </TouchableOpacity>
    </FadeInUp>
  );

  return (
    <ScreenWrapper
      backgroundColor={COLORS.primaryColor}
      statusBarColor={COLORS.primaryColor}
      barStyle="light-content"
      paddingHorizontal={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop:
              (Platform.OS === 'android' ? StatusBar.currentHeight || 16 : 8) +
              8,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <Icons
              family="Ionicons"
              name="chevron-back"
              size={22}
              color={COLORS.primaryBlue}
            />
          </TouchableOpacity>
          <CustomText
            label="All Donations"
            fontFamily={fonts.semiBold}
            fontSize={16}
            color={COLORS.white}
          />
          <View style={{width: 40}} />
        </View>
        <CustomText
          label={`${donations.length} total donations`}
          fontSize={13}
          color="rgba(255,255,255,0.85)"
          marginTop={14}
          removeTranslation
        />
      </View>

      <View style={styles.sheet}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          </View>
        ) : (
          <FlatList
            data={donations}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchDonations(true)}
                tintColor={COLORS.primaryBlue}
                colors={[COLORS.primaryBlue]}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Icons
                  family="Feather"
                  name="droplet"
                  size={28}
                  color={COLORS.skyBlue}
                />
                <CustomText
                  label="No donations recorded yet"
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

export default AllDonations;

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: 20,
    paddingBottom: 22,
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
  sheet: {
    flex: 1,
    backgroundColor: COLORS.mainBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -4,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  dateWrap: {
    alignItems: 'flex-end',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
});
