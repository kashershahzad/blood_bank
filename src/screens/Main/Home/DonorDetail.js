import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import {FadeInUp, ScaleIn} from '../../../components/FadeInView';
import DonationDateField from '../../../components/DonationDateField';
import CustomInput from '../../../components/CustomInput';
import CustomModal from '../../../components/CustomModal';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';

import {ToastMessage} from '../../../utils/ToastMessage';
import {
  buildDonationRecord,
  formatDonationDate,
  getDonationElapsedLabel,
  getLastHospital,
  isAvailableForDonation,
  parseDonationDate,
} from '../../../utils/donation';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const InfoRow = ({icon, title, value, delay = 0}) => {
  if (!value) return null;
  return (
    <FadeInUp delay={delay} from={14}>
      <View style={styles.infoRow}>
        <View style={styles.infoIcon}>
          <Icons family="Feather" name={icon} size={16} color={COLORS.white} />
        </View>
        <View style={styles.infoText}>
          <CustomText
            label={title}
            fontSize={11}
            color={COLORS.gray1}
            fontFamily={fonts.medium}
          />
          <CustomText
            label={String(value)}
            fontSize={14}
            color={COLORS.primaryBlue}
            fontFamily={fonts.semiBold}
            marginTop={2}
          />
        </View>
      </View>
    </FadeInUp>
  );
};

const DonorDetail = ({navigation, route}) => {
  const [donor, setDonor] = useState(route?.params?.item || {});
  const [showDonate, setShowDonate] = useState(false);
  const [donationDate, setDonationDate] = useState(
    moment().format('DD/MM/YYYY'),
  );
  const [hospital, setHospital] = useState('');
  const [saving, setSaving] = useState(false);
  const [todayKey, setTodayKey] = useState(() => moment().format('YYYY-MM-DD'));

  useFocusEffect(
    useCallback(() => {
      setTodayKey(moment().format('YYYY-MM-DD'));
      let cancelled = false;
      const loadDonor = async () => {
        if (!route?.params?.item?.id) return;
        try {
          const snap = await firestore()
            .collection('donors')
            .doc(route.params.item.id)
            .get();
          if (!cancelled && snap.exists) {
            setDonor({id: snap.id, ...snap.data()});
          }
        } catch (_) {}
      };
      loadDonor();
      return () => {
        cancelled = true;
      };
    }, [route?.params?.item?.id]),
  );

  useEffect(() => {
    const ms =
      moment().clone().add(1, 'day').startOf('day').diff(moment()) + 250;
    const timer = setTimeout(() => {
      setTodayKey(moment().format('YYYY-MM-DD'));
    }, ms);
    return () => clearTimeout(timer);
  }, [todayKey]);

  const canDonate = useMemo(
    () => isAvailableForDonation(donor.last_donation),
    [donor.last_donation, todayKey],
  );
  const monthsLabel = useMemo(
    () => getDonationElapsedLabel(donor.last_donation),
    [donor.last_donation, todayKey],
  );
  const lastHospital = getLastHospital(donor);

  const onCall = () => {
    if (!donor.phone) {
      ToastMessage('Phone number not available', 'error');
      return;
    }
    const number = String(donor.phone).replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${number}`).catch(() => {
      ToastMessage('Unable to open dialer', 'error');
    });
  };

  const openDonateModal = () => {
    setDonationDate(moment().format('DD/MM/YYYY'));
    setHospital('');
    setShowDonate(true);
  };

  const onConfirmDonation = async () => {
    if (!donor.id) {
      ToastMessage('Donor record not found', 'error');
      return;
    }
    const lastDonation = formatDonationDate(donationDate.trim());
    if (!lastDonation || !parseDonationDate(lastDonation)) {
      ToastMessage('Please select donation date', 'error');
      return;
    }

    try {
      setSaving(true);
      const donationPayload = buildDonationRecord({
        donorId: donor.id,
        name: donor.name,
        blood_group: donor.blood_group,
        phone: donor.phone,
        donation_date: lastDonation,
        hospital: hospital.trim(),
        created_by: auth().currentUser?.uid || '',
      });
      await firestore().collection('donors').doc(donor.id).update({
        last_donation: lastDonation,
        last_hospital: hospital.trim(),
      });
      await firestore()
        .collection('donations')
        .add({
          ...donationPayload,
          created_at: firestore.FieldValue.serverTimestamp(),
        });
      setDonor(prev => ({
        ...prev,
        last_donation: lastDonation,
        last_hospital: hospital.trim(),
      }));
      setShowDonate(false);
      ToastMessage('Donation confirmed', 'success');
    } catch (error) {
      ToastMessage(error?.message || 'Failed to update donation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(
    () => [
      {icon: 'heart', title: 'Blood Group', value: donor.blood_group},
      {icon: 'user', title: 'Age', value: donor.age ? `${donor.age} years` : ''},
      {icon: 'mail', title: 'Email', value: donor.email},
      {icon: 'phone', title: 'Phone', value: donor.phone},
      {icon: 'credit-card', title: 'CNIC', value: donor.cnic},
      {icon: 'map-pin', title: 'Location', value: donor.location},
      {
        icon: 'clock',
        title: 'Last Donation Date',
        value: formatDonationDate(donor.last_donation),
      },
      {
        icon: 'calendar',
        title: 'Time Since Last Donation',
        value: monthsLabel,
      },
      {icon: 'home', title: 'Last Hospital', value: lastHospital},
    ],
    [donor, monthsLabel, lastHospital],
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
        <FadeInUp delay={40} from={8}>
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
              label="Donor Details"
              fontFamily={fonts.semiBold}
              fontSize={16}
              color={COLORS.white}
            />
            <View style={{width: 40}} />
          </View>
        </FadeInUp>

        <View style={styles.profile}>
          <ScaleIn delay={120}>
            <View style={styles.bloodBadge}>
              <CustomText
                label={donor.blood_group || '--'}
                fontFamily={fonts.bold}
                fontSize={26}
                color={COLORS.white}
              />
            </View>
          </ScaleIn>
          <FadeInUp delay={220} from={12}>
            <CustomText
              label={donor.name || 'Unknown donor'}
              fontFamily={fonts.bold}
              fontSize={22}
              color={COLORS.white}
              marginTop={14}
            />
          </FadeInUp>
          <FadeInUp delay={280} from={8}>
            <CustomText
              label="Blood Donor"
              fontSize={13}
              color="rgba(255,255,255,0.8)"
              marginTop={4}
            />
          </FadeInUp>
        </View>
      </View>

      <FadeInUp delay={240} from={36} style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <CustomText
            label="Information"
            fontFamily={fonts.semiBold}
            fontSize={16}
            color={COLORS.primaryBlue}
            marginBottom={14}
          />

          {rows.map((row, index) => (
            <InfoRow
              key={row.title}
              icon={row.icon}
              title={row.title}
              value={row.value}
              delay={320 + index * 80}
            />
          ))}
        </ScrollView>

        {canDonate && donor.phone ? (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={onCall}
            activeOpacity={0.85}
          >
            <Icons family="Feather" name="phone" size={18} color={COLORS.white} />
            <CustomText
              label="Contact"
              color={COLORS.white}
              fontFamily={fonts.semiBold}
              fontSize={15}
              marginLeft={8}
            />
          </TouchableOpacity>
        ) : !canDonate ? (
          <View style={styles.unavailableBox}>
            <Icons
              family="Feather"
              name="alert-circle"
              size={16}
              color={COLORS.primaryBlue}
            />
            <CustomText
              label="Not Available for donation"
              color={COLORS.primaryBlue}
              fontFamily={fonts.semiBold}
              fontSize={14}
              marginLeft={8}
            />
          </View>
        ) : null}

        {canDonate ? (
          <TouchableOpacity
            style={styles.donateBtn}
            onPress={openDonateModal}
            activeOpacity={0.85}
          >
            <Icons
              family="Feather"
              name="check-circle"
              size={18}
              color={COLORS.white}
            />
            <CustomText
              label="Donated"
              color={COLORS.white}
              fontFamily={fonts.semiBold}
              fontSize={15}
              marginLeft={8}
            />
          </TouchableOpacity>
        ) : null}
      </FadeInUp>

      <CustomModal
        isVisible={showDonate}
        onDisable={() => !saving && setShowDonate(false)}
        isChange
        mainMargin={0}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <CustomText
              label="Please confirm the donation"
              fontFamily={fonts.bold}
              fontSize={18}
              color={COLORS.primaryColor}
              marginBottom={16}
            />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
            <DonationDateField
              withLabel="Donation Date"
              value={donationDate}
              onChange={setDonationDate}
              labelColor={COLORS.primaryBlue}
              showElapsed={false}
              inline
            />
            <CustomInput
              withLabel="Hospital (optional)"
              value={hospital}
              onChangeText={setHospital}
              borderRadius={14}
              height={52}
              borderColor={COLORS.lightBorder}
              focusBorderColor={COLORS.skyBlue}
              labelColor={COLORS.primaryBlue}
              marginBottom={8}
            />
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={onConfirmDonation}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size={20} color={COLORS.white} />
              ) : (
                <CustomText
                  label="Confirm"
                  color={COLORS.white}
                  fontFamily={fonts.semiBold}
                  fontSize={15}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowDonate(false)}
              disabled={saving}
              activeOpacity={0.8}
            >
              <CustomText
                label="Cancel"
                color={COLORS.primaryBlue}
                fontFamily={fonts.semiBold}
                fontSize={14}
              />
            </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </CustomModal>
    </ScreenWrapper>
  );
};

export default DonorDetail;

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: 20,
    paddingBottom: 28,
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
  profile: {
    alignItems: 'center',
    marginTop: 18,
  },
  bloodBadge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: COLORS.skyBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  sheetContent: {
    paddingBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightFill,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.skyBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  callBtn: {
    marginTop: 16,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableBox: {
    marginTop: 16,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.lightFill,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donateBtn: {
    marginTop: 10,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.lightBorder,
    marginBottom: 14,
  },
  confirmBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelBtn: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
});
