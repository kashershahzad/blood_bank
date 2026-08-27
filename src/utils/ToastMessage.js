import Snackbar from 'react-native-snackbar';

export const ToastMessage = (message, type = 'text') => {
  if (typeof message === 'string') {
    let backgroundColor;
    switch (type) {
      case 'error':
        backgroundColor = '#FF0000'; // Red for error
        break;
      case 'success':
        backgroundColor = '#4bb543'; // Green for success
        break;
      default:
        backgroundColor = '#323232'; // Default background color
    }

    Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_SHORT, // You can use LENGTH_LONG or LENGTH_INDEFINITE as needed
      backgroundColor, // Dynamic background color
    });
  } else {
    return;
  }
};
