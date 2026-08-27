import MapView, {Marker} from 'react-native-maps';
import React from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';

const MapScreen = () => {
  return (
    <ScreenWrapper
      translucent
      statusBarColor="transparent"
      paddingHorizontal={0.1}>
      <MapView
        style={{flex: 1}}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
        <Marker
          coordinate={{latitude: 37.78825, longitude: -122.4324}}
          title="Marker"
          description="This is a marker"
        />
      </MapView>
    </ScreenWrapper>
  );
};

export default MapScreen;
