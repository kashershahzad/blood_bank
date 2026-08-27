import {
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import React, {useMemo, useState} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import {FadeInUp, ScaleIn} from '../../../components/FadeInView';
import DonationDateField from '../../../components/DonationDateField';
import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';

import {ToastMessage} from '../../../utils/ToastMessage';
import {formatDonationDate, parseDonationDate} from '../../../utils/donation';
import {regEmail} from '../../../utils/constants';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DIGITS_ONLY = /[^0-9]/g;

const DonorForm = ({navigation, route}) => {
  const item = route?.params?.item;
  const isEdit = !!item?.id;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({
    name: item?.name || '',
    email: item?.email || '',
    phone: String(item?.phone || '').replace(/[^0-9]/g, ''),
    age: item?.age ? String(item.age).replace(/[^0-9]/g, '') : '',
    blood_group: item?.blood_group || '',
    cnic: String(item?.cnic || '').replace(/[^0-9]/g, ''),
    location: item?.location || '',
    last_donation: formatDonationDate(item?.last_donation),
    last_hospital:
      item?.last_hospital ||
      (String(item?.last_donation || '').includes('•')
        ? String(item.last_donation).split('•').slice(1).join('•').trim()
        : ''),
  });

  const setField = (key, value) => {
    let nextValue = value;
    if (['phone', 'age', 'cnic'].includes(key)) {
      nextValue = String(value).replace(DIGITS_ONLY, '');
    }
    setState(prev => ({...prev, [key]: nextValue}));
    if (errors[key]) setErrors(prev => ({...prev, [key]: ''}));
  };

  const fields = useMemo(
    () => [
      {
        key: 'name',
        label: 'Full Name',
        keyboardType: 'default',
        returnKeyType: 'next',
      },
      {
        key: 'email',
        label: 'Email',
        keyboardType: 'email-address',
        autoCapitalize: 'none',
        returnKeyType: 'next',
      },
      {
        key: 'phone',
        label: 'Phone',
        keyboardType: 'number-pad',
        returnKeyType: 'next',
        maxLength: 15,
      },
      {
        key: 'age',
        label: 'Age',
        keyboardType: 'number-pad',
        returnKeyType: 'next',
        maxLength: 3,
      },
      {
        key: 'cnic',
        label: 'CNIC',
        keyboardType: 'number-pad',
        returnKeyType: 'next',
        maxLength: 13,
      },
      {
        key: 'location',
        label: 'Location',
        keyboardType: 'default',
        returnKeyType: 'next',
      },
      {
        key: 'last_hospital',
        label: 'Last Hospital',
        keyboardType: 'default',
        returnKeyType: 'done',
      },
    ],
    [],
  );

  const validate = () => {
    const next = {};
    const phone = state.phone.trim();
    const age = state.age.trim();
    const cnic = state.cnic.trim();

    if (!state.blood_group) next.blood_group = 'Please select blood group';
    if (!state.name.trim()) next.name = 'Please enter name';

    if (!phone) {
      next.phone = 'Please enter phone number';
    } else if (!/^\d+$/.test(phone) || phone.length < 10 || phone.length > 15) {
      next.phone = 'Enter a valid phone number';
    }

    if (age && (Number(age) < 1 || Number(age) > 120)) {
      next.age = 'Enter a valid age';
    }

    if (cnic && cnic.length !== 13) {
      next.cnic = 'CNIC must be 13 digits';
    }

    if (state.email && !regEmail.test(state.email.trim())) {
      next.email = 'Please enter a valid email';
    }

    if (state.last_donation.trim()) {
      const date = parseDonationDate(state.last_donation.trim());
      if (!date) {
        next.last_donation = 'Please select a valid date';
      }
    }

    setErrors(next);
    if (Object.keys(next).length) {
      ToastMessage(Object.values(next)[0], 'error');
      return false;
    }
    return true;
  };

  const onSave = async () => {
    if (!validate()) return;
    const currentUser = auth().currentUser;
    if (!currentUser) {
      ToastMessage('Please login again', 'error');
      return;
    }

    const payload = {
      name: state.name.trim(),
      email: state.email.trim(),
      phone: state.phone.trim(),
      age: state.age.trim(),
      blood_group: state.blood_group,
      cnic: state.cnic.trim(),
      location: state.location.trim(),
      last_donation:
        formatDonationDate(state.last_donation.trim()) ||
        state.last_donation.trim(),
      last_hospital: state.last_hospital.trim(),
    };

    try {
      setLoading(true);
      if (isEdit) {
        await firestore().collection('donors').doc(item.id).update(payload);
        ToastMessage('Donor updated', 'success');
      } else {
        await firestore()
          .collection('donors')
          .add({
            ...payload,
            created_by: currentUser.uid,
          });
        ToastMessage('Donor added', 'success');
      }
      navigation.goBack();
    } catch (error) {
      ToastMessage(error?.message || 'Save failed', 'error');
    } finally {
      setLoading(false);
    }
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
              label={isEdit ? 'Edit Donor' : 'Add Donor'}
              fontFamily={fonts.semiBold}
              fontSize={16}
              color={COLORS.white}
            />
            <View style={{width: 40}} />
          </View>
        </FadeInUp>
        <FadeInUp delay={120} from={12}>
          <CustomText
            label={
              isEdit
                ? 'Update donor information'
                : 'Fill in the details to add a new donor'
            }
            fontSize={13}
            color="rgba(255,255,255,0.85)"
            marginTop={14}
          />
        </FadeInUp>
      </View>

      <View style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.form}
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <FadeInUp delay={180} from={10}>
            <CustomText
              label="Blood Group"
              marginBottom={10}
              color={COLORS.primaryBlue}
            />
            <View style={styles.chipRow}>
              {BLOOD_GROUPS.map(group => {
                const active = state.blood_group === group;
                return (
                  <TouchableOpacity
                    key={group}
                    onPress={() => setField('blood_group', group)}
                    style={[styles.chip, active && styles.chipActive]}
                    activeOpacity={0.85}
                  >
                    <CustomText
                      label={group}
                      fontFamily={fonts.semiBold}
                      fontSize={13}
                      color={active ? COLORS.white : COLORS.primaryBlue}
                      removeTranslation
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.blood_group ? (
              <CustomText
                label={errors.blood_group}
                color={COLORS.red}
                fontFamily={fonts.semiBold}
                fontSize={10}
                marginBottom={10}
              />
            ) : null}
          </FadeInUp>

          {fields.map((field, index) => (
            <FadeInUp key={field.key} delay={220 + index * 50} from={12}>
              {field.key === 'last_hospital' ? (
                <>
                  <DonationDateField
                    withLabel="Last Donation Date"
                    value={state.last_donation}
                    onChange={date => setField('last_donation', date)}
                    error={errors.last_donation}
                    labelColor={COLORS.primaryBlue}
                  />
                  <CustomInput
                    withLabel={field.label}
                    placeholder=""
                    value={state[field.key]}
                    onChangeText={text => setField(field.key, text)}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize}
                    returnKeyType={field.returnKeyType}
                    maxLength={field.maxLength}
                    error={errors[field.key]}
                    borderRadius={16}
                    height={56}
                    borderColor={COLORS.lightBorder}
                    focusBorderColor={COLORS.skyBlue}
                    labelColor={COLORS.primaryBlue}
                  />
                </>
              ) : (
                <CustomInput
                  withLabel={field.label}
                  placeholder=""
                  value={state[field.key]}
                  onChangeText={text => setField(field.key, text)}
                  keyboardType={field.keyboardType}
                  autoCapitalize={field.autoCapitalize}
                  returnKeyType={field.returnKeyType}
                  maxLength={field.maxLength}
                  error={errors[field.key]}
                  borderRadius={16}
                  height={56}
                  borderColor={COLORS.lightBorder}
                  focusBorderColor={COLORS.skyBlue}
                  labelColor={COLORS.primaryBlue}
                />
              )}
            </FadeInUp>
          ))}

          <ScaleIn delay={560}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={onSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size={22} color={COLORS.white} />
              ) : (
                <>
                  <Icons
                    family="Feather"
                    name={isEdit ? 'check' : 'plus'}
                    size={18}
                    color={COLORS.white}
                  />
                  <CustomText
                    label={isEdit ? 'Update Donor' : 'Save Donor'}
                    color={COLORS.white}
                    fontFamily={fonts.semiBold}
                    fontSize={16}
                    marginLeft={8}
                  />
                </>
              )}
            </TouchableOpacity>
          </ScaleIn>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default DonorForm;

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
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  form: {
    paddingBottom: 36,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    backgroundColor: COLORS.lightFill,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  saveBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
});
