import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import React, {useCallback, useMemo, useState} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import {FadeInUp} from '../../../components/FadeInView';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';

import {ToastMessage} from '../../../utils/ToastMessage';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const AddUser = ({navigation}) => {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonors = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const snapshot = await firestore().collection('donors').get();
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDonors(list);
    } catch (error) {
      ToastMessage(error?.message || 'Failed to load donors', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDonors();
    }, [fetchDonors]),
  );

  const filteredDonors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return donors;
    return donors.filter(item => {
      const name = String(item.name || '').toLowerCase();
      const phone = String(item.phone || '').toLowerCase();
      const group = String(item.blood_group || '').toLowerCase();
      const email = String(item.email || '').toLowerCase();
      return (
        name.includes(q) ||
        phone.includes(q) ||
        group.includes(q) ||
        email.includes(q)
      );
    });
  }, [donors, search]);

  const onDelete = item => {
    Alert.alert(
      'Delete Donor',
      `Remove ${item.name || 'this donor'}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('donors').doc(item.id).delete();
              setDonors(prev => prev.filter(d => d.id !== item.id));
              ToastMessage('Donor deleted', 'success');
            } catch (error) {
              ToastMessage(error?.message || 'Delete failed', 'error');
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item, index}) => (
    <FadeInUp delay={Math.min(index, 7) * 60} from={14}>
      <View style={styles.card}>
        <View style={styles.bloodBadge}>
          <CustomText
            label={item.blood_group || '--'}
            fontFamily={fonts.bold}
            fontSize={14}
            color={COLORS.white}
          />
        </View>
        <View style={styles.cardInfo}>
          <CustomText
            label={item.name || 'Unknown donor'}
            fontFamily={fonts.semiBold}
            fontSize={15}
            color={COLORS.primaryBlue}
          />
          <CustomText
            label={item.phone || item.email || 'No contact'}
            fontSize={12}
            color={COLORS.gray1}
            marginTop={2}
          />
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('DonorForm', {item})}
          activeOpacity={0.8}
        >
          <Icons family="Feather" name="edit-2" size={16} color={COLORS.skyBlue} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, styles.deleteBtn]}
          onPress={() => onDelete(item)}
          activeOpacity={0.8}
        >
          <Icons family="Feather" name="trash-2" size={16} color="#E53935" />
        </TouchableOpacity>
      </View>
    </FadeInUp>
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
          ]}
        >
          <FadeInUp delay={40} from={10}>
            <View>
              <CustomText
                label="Manage Donor Records"
                fontSize={20}
                color="rgba(255,255,255,0.85)"
                marginTop={2}
              />
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.syncBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('ContactPicker')}
                >
                  <Icons
                    family="Feather"
                    name="users"
                    size={16}
                    color={COLORS.white}
                  />
                  <CustomText
                    label="Sync Contacts"
                    fontFamily={fonts.semiBold}
                    fontSize={13}
                    color={COLORS.white}
                    marginLeft={6}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('DonorForm')}
                >
                  <Icons family="Feather" name="plus" size={18} color={COLORS.primaryBlue} />
                  <CustomText
                    label="Add"
                    fontFamily={fonts.semiBold}
                    fontSize={13}
                    color={COLORS.primaryBlue}
                    marginLeft={4}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </FadeInUp>
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
              placeholder="Search by name, phone or blood group"
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
                  name="user-plus"
                  size={36}
                  color={COLORS.skyBlue}
                />
                <CustomText
                  label={search ? 'No matching donors' : 'No donors yet'}
                  fontFamily={fonts.medium}
                  color={COLORS.gray1}
                  fontSize={14}
                  marginTop={10}
                />
                {!search ? (
                  <CustomText
                    label="Tap Add to create a new donor"
                    fontSize={12}
                    color={COLORS.gray1}
                    marginTop={4}
                  />
                ) : null}
              </View>
            }
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

export default AddUser;

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  syncBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
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
  bloodBadge: {
    width: 48,
    height: 48,
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
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  deleteBtn: {
    backgroundColor: '#FDECEC',
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
