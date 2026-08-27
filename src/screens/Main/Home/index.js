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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import {FadeInUp, ScaleIn} from '../../../components/FadeInView';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';
import DonorCard from './molecules/DonorCard';

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {setLocation, setUserData} from '../../../store/reducer/usersSlice';
import {logout} from '../../../store/reducer/AuthConfig';
import {ToastMessage} from '../../../utils/ToastMessage';
import GetLocation from '../../../utils/GetLocation';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const Home = ({navigation}) => {
  const dispatch = useDispatch();
  const locationData = GetLocation();

  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');
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
      console.log('===== FETCH DONORS =====');
      console.log('auth uid:', currentUser?.uid || 'NOT LOGGED IN');

      if (!currentUser) {
        console.log('Skipping Firestore read: user not authenticated');
        setDonors([]);
        return;
      }

      const snapshot = await firestore().collection('donors').get();
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('donors count:', list.length);
      setDonors(list);
    } catch (error) {
      console.log('===== FIRESTORE ERROR =====');
      console.log('code:', error?.code);
      console.log('message:', error?.message);
      console.log('stack:', error?.stack);
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
      console.log('onAuthStateChanged uid:', user?.uid || 'null');
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

  const filteredDonors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return donors;
    return donors.filter(item => {
      const name = String(item.name || '').toLowerCase();
      const group = String(item.blood_group || '').toLowerCase();
      return name.includes(q) || group.includes(q);
    });
  }, [donors, search]);

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
          ]}
        >
          <View style={styles.headerTop}>
            <FadeInUp delay={60} from={12}>
              <View>
                <CustomText
                  label="Blood Bank"
                  fontFamily={fonts.bold}
                  fontSize={22}
                  color={COLORS.white}
                />
                <CustomText
                  label="Available donors near you"
                  fontSize={13}
                  color="rgba(255,255,255,0.85)"
                  marginTop={2}
                />
              </View>
            </FadeInUp>
            <FadeInUp delay={120} from={8}>
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
                <CustomText
                  label="Logout"
                  fontFamily={fonts.semiBold}
                  fontSize={12}
                  color={COLORS.primaryBlue}
                  marginLeft={6}
                />
              </TouchableOpacity>
            </FadeInUp>
          </View>

          <ScaleIn delay={180}>
            <View style={styles.statsCard}>
            <View style={styles.statsIcon}>
              <Icons
                family="Ionicons"
                name="water"
                size={22}
                color={COLORS.white}
              />
            </View>
            <View style={{flex: 1, marginLeft: 12}}>
              <CustomText
                label="Total Donors"
                fontSize={12}
                color={COLORS.gray1}
              />
              <CustomText
                label={`${donors.length}`}
                fontFamily={fonts.bold}
                fontSize={24}
                color={COLORS.primaryBlue}
              />
            </View>
          </View>
          </ScaleIn>
        </View>
      )}>
      {loading ? (
        <View style={[styles.loader, styles.body]}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        </View>
      ) : (
        <View style={styles.body}>
          <FadeInUp delay={80} from={12}>
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
              placeholder="Search by name or blood group"
              placeholderTextColor={COLORS.gray1}
              style={styles.searchInput}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Icons
                  family="Feather"
                  name="x"
                  size={16}
                  color={COLORS.gray1}
                />
              </TouchableOpacity>
            ) : null}
          </View>
          </FadeInUp>

          <FlatList
            data={filteredDonors}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => (
              <DonorCard
                item={item}
                index={index}
                onPress={() => navigation.navigate('DonorDetail', {item})}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchDonors('refresh')}
                tintColor={COLORS.primaryBlue}
                colors={[COLORS.primaryBlue]}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <CustomText
                  label={search ? 'No matching donors' : 'No donors found'}
                  fontFamily={fonts.medium}
                  color={COLORS.gray1}
                  fontSize={14}
                />
              </View>
            }
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statsCard: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.skyBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
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
  body: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
});
