import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Foundation from 'react-native-vector-icons/Foundation';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Zocial from 'react-native-vector-icons/Zocial';
import Entypo from 'react-native-vector-icons/Entypo';
import React from 'react';

const Icons = ({family, name, color, size, ...props}) => {
  let Family;
  switch (family) {
    case 'AntDesign':
      Family = AntDesign;
      break;
    case 'Entypo':
      Family = Entypo;
      break;
    case 'EvilIcons':
      Family = EvilIcons;
      break;
    case 'Feather':
      Family = Feather;
      break;
    case 'FontAwesome':
      Family = FontAwesome;
      break;
    case 'FontAwesome5':
      Family = FontAwesome5;
      break;
    case 'FontAwesome6':
      Family = FontAwesome6;
      break;
    case 'Fontisto':
      Family = Fontisto;
      break;
    case 'Foundation':
      Family = Foundation;
      break;
    case 'Ionicons':
      Family = Ionicons;
      break;
    case 'MaterialCommunityIcons':
      Family = MaterialCommunityIcons;
      break;
    case 'MaterialIcons':
      Family = MaterialIcons;
      break;
    case 'Octicons':
      Family = Octicons;
      break;
    case 'SimpleLineIcons':
      Family = SimpleLineIcons;
      break;
    case 'Zocial':
      Family = Zocial;
      break;
    case 'FontAwesome5Pro':
      Family = FontAwesome5Pro;
      break;
    default:
      Family = Ionicons;
  }

  return (
    <Family
      name={name || 'help-outline'}
      color={color || '#000'}
      size={size || 14}
      {...props}
    />
  );
};
export default Icons;
