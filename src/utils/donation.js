import moment from 'moment';

const DATE_FORMATS = [
  'DD/MM/YYYY',
  'D/M/YYYY',
  'YYYY-MM-DD',
  'DD-MM-YYYY',
  'DD MMM YYYY',
  'D MMM YYYY',
];

export const extractDonationDate = value => {
  if (!value) return '';
  if (typeof value === 'object') {
    const parsed = parseDonationDate(value);
    return parsed ? parsed.format('DD/MM/YYYY') : '';
  }
  return String(value).split('•')[0].trim();
};

export const extractHospitalFromDonation = value => {
  if (!value) return '';
  const parts = String(value).split('•');
  if (parts.length < 2) return '';
  return parts.slice(1).join('•').trim();
};

export const parseDonationDate = value => {
  if (!value) return null;

  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      const date = moment(value.toDate());
      return date.isValid() ? date.startOf('day') : null;
    }
    if (typeof value.seconds === 'number') {
      const date = moment.unix(value.seconds);
      return date.isValid() ? date.startOf('day') : null;
    }
    if (value instanceof Date) {
      const date = moment(value);
      return date.isValid() ? date.startOf('day') : null;
    }
  }

  const text = String(value).split('•')[0].trim();
  if (!text) return null;

  const parsed = moment(text, DATE_FORMATS, true);
  if (parsed.isValid()) return parsed.startOf('day');

  const loose = moment(text);
  return loose.isValid() ? loose.startOf('day') : null;
};

export const formatDonationDate = value => {
  const date = parseDonationDate(value);
  return date ? date.format('DD/MM/YYYY') : extractDonationDate(value);
};

export const getDonationElapsedLabel = value => {
  const date = parseDonationDate(value);
  if (!date) return '';

  const today = moment().startOf('day');
  if (today.isBefore(date)) return 'Future date';

  const months = today.diff(date, 'months');
  const days = today.diff(date.clone().add(months, 'months'), 'days');

  if (months <= 0 && days <= 0) return 'Today';

  const parts = [];
  if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`);
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);
  return `${parts.join(' ')} ago`;
};

export const getEligibilityDate = value => {
  const date = parseDonationDate(value);
  if (!date) return null;
  return date.clone().add(6, 'months').startOf('day');
};

export const isAvailableForDonation = value => {
  const date = parseDonationDate(value);
  if (!date) return !extractDonationDate(value);
  return !moment().startOf('day').isBefore(getEligibilityDate(value));
};

export const getLastHospital = donor =>
  donor?.last_hospital || extractHospitalFromDonation(donor?.last_donation);
