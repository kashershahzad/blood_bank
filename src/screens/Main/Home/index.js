import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import {FadeInUp, ScaleIn} from '../../../components/FadeInView';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {setLocation, setUserData} from '../../../store/reducer/usersSlice';
import {logout} from '../../../store/reducer/AuthConfig';
import {ToastMessage} from '../../../utils/ToastMessage';
import {
  formatDonationDate,
  getDonationElapsedLabel,
  isAvailableForDonation,
  sortDonationsNewest,
} from '../../../utils/donation';
import GetLocation from '../../../utils/GetLocation';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Home = ({navigation}) => {
  const dispatch = useDispatch();
  const locationData = GetLocation();
  const userData = useSelector(state => state.users.userData);

  const [donors, setDonors] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(setLocation(locationData));
  }, [locationData]);

  const fetchDonors = useCallback(async (mode = 'full') => {
    try {
      if (mode === 'refresh') setRefreshing(true);
      else if (mode === 'full') setLoading(true);

      const currentUser = auth().currentUser;
      if (!currentUser) {
        setDonors([]);
        setDonations([]);
        return;
      }

      const [donorsSnap, donationsSnap] = await Promise.all([
        firestore().collection('donors').get(),
        firestore().collection('donations').get(),
      ]);
      setDonors(
        donorsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
      setDonations(
        sortDonationsNewest(
          donationsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })),
        ),
      );
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

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        fetchDonors();
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [fetchDonors]);

  useFocusEffect(
    useCallback(() => {
      if (auth().currentUser) {
        fetchDonors('silent');
      }
    }, [fetchDonors]),
  );

  const stats = useMemo(() => {
    const total = donors.length;
    const available = donors.filter(item =>
      isAvailableForDonation(item.last_donation),
    ).length;
    const groups = BLOOD_GROUPS.map(group => {
      const items = donors.filter(
        item => String(item.blood_group || '').toUpperCase() === group,
      );
      return {
        group,
        available: items.filter(item =>
          isAvailableForDonation(item.last_donation),
        ).length,
      };
    });
    const maxAvailable = Math.max(1, ...groups.map(item => item.available));
    const recentList = donations.slice(0, 4);

    return {
      total,
      available,
      totalDonations: donations.length,
      recentList,
      groups,
      maxAvailable,
    };
  }, [donors, donations]);

  const greetingName =
    userData?.name || userData?.email?.split('@')[0] || 'there';

  const handleLogout = async () => {
    try {
      if (auth().currentUser) {
        await auth().signOut();
      }
    } catch (error) {
      console.log('Firebase signOut error:', error);
    }

    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.log('Google signOut error:', error);
    }

    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.log('Token remove error:', error);
    }

    dispatch(setUserData({}));
    dispatch(logout());
  };

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
        <View style={styles.blobOne} />
        <View style={styles.blobTwo} />

        <FadeInUp delay={40} from={10}>
          <View style={styles.headerTop}>
            <View style={{flex: 1, marginRight: 12}}>
              <CustomText
                label={`Hello, ${greetingName}`}
                fontSize={13}
                color="rgba(255,255,255,0.78)"
                removeTranslation
              />
              <CustomText
                label="Blood Bank"
                fontFamily={fonts.bold}
                fontSize={26}
                color={COLORS.white}
                marginTop={2}
              />
              <CustomText
                label="Live donation overview"
                fontSize={13}
                color="rgba(255,255,255,0.8)"
                marginTop={2}
              />
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.8}
              style={styles.logoutBtn}
            >
              <Icons
                family="Feather"
                name="log-out"
                size={16}
                color={COLORS.primaryBlue}
              />
            </TouchableOpacity>
          </View>
        </FadeInUp>
      </View>

      <View style={styles.sheet}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchDonors('refresh')}
                tintColor={COLORS.primaryBlue}
                colors={[COLORS.primaryBlue]}
              />
            }
          >
            <FadeInUp delay={80} from={16}>
              <View style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <Icons
                    family="Ionicons"
                    name="water"
                    size={26}
                    color={COLORS.white}
                  />
                </View>
                <View style={styles.heroText}>
                  <CustomText
                    label="Total Donors"
                    fontSize={13}
                    color={COLORS.gray1}
                    fontFamily={fonts.medium}
                  />
                  <CustomText
                    label={`${stats.total}`}
                    fontFamily={fonts.bold}
                    fontSize={36}
                    color={COLORS.primaryColor}
                    marginTop={2}
                    removeTranslation
                  />
                </View>
                <View style={styles.heroBadge}>
                  <CustomText
                    label="All groups"
                    fontSize={11}
                    fontFamily={fonts.semiBold}
                    color={COLORS.primaryBlue}
                  />
                </View>
              </View>
            </FadeInUp>

            <View style={styles.statRow}>
              <ScaleIn delay={140} style={styles.statFlex}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[styles.miniCard, styles.availableCard]}
                  onPress={() => navigation.navigate('FindDonor')}
                >
                  <View style={[styles.miniIcon, styles.availableIcon]}>
                    <Icons
                      family="Feather"
                      name="check-circle"
                      size={16}
                      color={COLORS.white}
                    />
                  </View>
                  <CustomText
                    label="Available Donors"
                    fontSize={11}
                    color={COLORS.gray2}
                    marginTop={12}
                    fontFamily={fonts.medium}
                  />
                  <CustomText
                    label={`${stats.available}`}
                    fontFamily={fonts.bold}
                    fontSize={28}
                    color="#1F7A4D"
                    marginTop={2}
                    removeTranslation
                  />
                  <CustomText
                    label="Ready to donate"
                    fontSize={11}
                    color="#3D9B6A"
                    marginTop={2}
                  />
                </TouchableOpacity>
              </ScaleIn>

              <ScaleIn delay={200} style={styles.statFlex}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[styles.miniCard, styles.recentCard]}
                  onPress={() => navigation.navigate('AllDonations')}
                >
                  <View style={[styles.miniIcon, styles.recentIcon]}>
                    <Icons
                      family="Feather"
                      name="droplet"
                      size={16}
                      color={COLORS.white}
                    />
                  </View>
                  <CustomText
                    label="Total Donations"
                    fontSize={11}
                    color={COLORS.gray2}
                    marginTop={12}
                    fontFamily={fonts.medium}
                  />
                  <CustomText
                    label={`${stats.totalDonations}`}
                    fontFamily={fonts.bold}
                    fontSize={28}
                    color={COLORS.primaryBlue}
                    marginTop={2}
                    removeTranslation
                  />
                  <CustomText
                    label="All recorded"
                    fontSize={11}
                    color={COLORS.skyBlue}
                    marginTop={2}
                  />
                </TouchableOpacity>
              </ScaleIn>
            </View>

            <FadeInUp delay={220} from={12}>
              <View style={styles.sectionHead}>
                <CustomText
                  label="Each Blood Group"
                  fontFamily={fonts.semiBold}
                  fontSize={16}
                  color={COLORS.primaryColor}
                />
                <CustomText
                  label="Tap to find"
                  fontSize={12}
                  color={COLORS.gray1}
                />
              </View>
              <View style={styles.groupGrid}>
                {stats.groups.map(item => {
                  const fill = (item.available / stats.maxAvailable) * 100;
                  return (
                    <TouchableOpacity
                      key={item.group}
                      activeOpacity={0.88}
                      style={styles.groupCard}
                      onPress={() =>
                        navigation.navigate('FindDonor', {group: item.group})
                      }
                    >
                      <View style={styles.groupTop}>
                        <View style={styles.groupBadge}>
                          <CustomText
                            label={item.group}
                            fontFamily={fonts.bold}
                            fontSize={13}
                            color={COLORS.white}
                            removeTranslation
                          />
                        </View>
                        <CustomText
                          label={`${item.available}`}
                          fontFamily={fonts.bold}
                          fontSize={20}
                          color={
                            item.available ? '#1F7A4D' : COLORS.primaryColor
                          }
                          removeTranslation
                        />
                      </View>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${Math.max(
                                item.available ? 12 : 0,
                                fill,
                              )}%`,
                            },
                          ]}
                        />
                      </View>
                      {/* <CustomText
                        label="available"
                        fontSize={10}
                        color={item.available ? '#1F7A4D' : COLORS.gray1}
                        marginTop={8}
                        fontFamily={fonts.medium}
                      /> */}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FadeInUp>

            <FadeInUp delay={280} from={12}>
              <View style={styles.sectionHead}>
                <CustomText
                  label="Recent Donations"
                  fontFamily={fonts.semiBold}
                  fontSize={16}
                  color={COLORS.primaryColor}
                />
                {donations.length ? (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('AllDonations')}
                    activeOpacity={0.8}
                  >
                    <CustomText
                      label="View All"
                      fontSize={12}
                      fontFamily={fonts.semiBold}
                      color={COLORS.primaryBlue}
                    />
                  </TouchableOpacity>
                ) : (
                  <CustomText
                    label="Latest records"
                    fontSize={12}
                    color={COLORS.gray1}
                  />
                )}
              </View>

              {stats.recentList.length ? (
                stats.recentList.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    style={styles.recentRow}
                    onPress={() =>
                      item.donor_id
                        ? navigation.navigate('DonorDetail', {
                            item: {
                              id: item.donor_id,
                              name: item.name,
                              blood_group: item.blood_group,
                              phone: item.phone,
                            },
                          })
                        : null
                    }
                  >
                    <View style={styles.recentBadge}>
                      <CustomText
                        label={item.blood_group || '--'}
                        fontFamily={fonts.bold}
                        fontSize={13}
                        color={COLORS.white}
                        removeTranslation
                      />
                    </View>
                    <View style={styles.recentInfo}>
                      <CustomText
                        label={item.name || 'Unknown donor'}
                        fontFamily={fonts.semiBold}
                        fontSize={14}
                        color={COLORS.primaryColor}
                        removeTranslation
                      />
                      <CustomText
                        label={
                          item.hospital ||
                          getDonationElapsedLabel(item.donation_date) ||
                          'Donation recorded'
                        }
                        fontSize={11}
                        color={COLORS.gray1}
                        marginTop={2}
                        removeTranslation
                      />
                    </View>
                    <View style={styles.recentDateWrap}>
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
                ))
              ) : (
                <View style={styles.emptyRecent}>
                  <Icons
                    family="Feather"
                    name="droplet"
                    size={22}
                    color={COLORS.skyBlue}
                  />
                  <CustomText
                    label="No donations recorded yet"
                    fontFamily={fonts.medium}
                    color={COLORS.gray1}
                    fontSize={13}
                    marginTop={8}
                  />
                </View>
              )}
            </FadeInUp>
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: 20,
    paddingBottom: 36,
    overflow: 'hidden',
  },
  blobOne: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -40,
    top: -30,
  },
  blobTwo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(232,107,122,0.35)',
    left: -24,
    bottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.mainBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -18,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 110,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    shadowColor: COLORS.primaryColor,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    marginLeft: 14,
  },
  heroBadge: {
    backgroundColor: COLORS.lightFill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  statFlex: {
    flex: 1,
  },
  miniCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    minHeight: 148,
  },
  availableCard: {
    backgroundColor: '#F3FBF6',
    borderColor: '#D7F0E2',
  },
  recentCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.lightBorder,
  },
  miniIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableIcon: {
    backgroundColor: '#2E9A63',
  },
  recentIcon: {
    backgroundColor: COLORS.skyBlue,
  },
  sectionHead: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  groupCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  groupTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupBadge: {
    minWidth: 42,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTrack: {
    height: 6,
    borderRadius: 6,
    backgroundColor: COLORS.lightFill,
    marginTop: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 6,
    backgroundColor: COLORS.skyBlue,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  recentBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  recentDateWrap: {
    alignItems: 'flex-end',
  },
  emptyRecent: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
});
