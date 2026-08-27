import {ActivityIndicator, RefreshControl, FlatList, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import moment from 'moment';

import ScreenWrapper from '../../../components/ScreenWrapper';
import NoDataFound from '../../../components/NoDataFound';
import Header from '../../../components/Header';

import Item from './molecules/Item';

import {get} from '../../../services/ApiRequest';
import {Images} from '../../../assets/images';
import {COLORS} from '../../../utils/COLORS';

const Notifications = () => {
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [lastId, setLastId] = useState('');
  const [loading, setLoading] = useState(true);
  const [bottomLoader, setBottomLoader] = useState(false);

  const handlePress = item => {
    if (item?.type === 'message') {
      navigation.navigate('InboxScreen', {data: item?.user});
    } else if (item?.type === 'offer') {
      navigation.navigate('TabStack', {
        screen: 'Requests',
        params: {data: item},
      });
    } else if (item?.type === 'order') {
      navigation.navigate('TabStack', {
        screen: 'MyRide',
        params: {data: item},
      });
    } else if (item?.type === 'schedule' || item?.type === 'proposal') {
      navigation.navigate('ScheduleDetail', {id: item?.schedule});
    } else if (item?.type === 'contract') {
      navigation.navigate('ViewContract', {
        id: item?.order?._id,
      });
    }
  };

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
        setLastId('');
      }
      const endpoint = lastId
        ? `notification/all/${lastId}`
        : `notification/all`;
      const res = await get(endpoint);

      if (res.data?.success) {
        const newNotifications = res.data?.notifications;

        if (newNotifications.length > 0) {
          setData(
            isRefresh ? newNotifications : [...data, ...newNotifications],
          );
          setLastId(newNotifications[newNotifications.length - 1]._id);
        }
      }
      setLoading(false);
      setBottomLoader(false);
    } catch (error) {
      setLoading(false);
      setBottomLoader(false);
      console.log('err in getting notifications===>', error.response.data);
    }
  };

  const fetchMoreData = async () => {
    if (data?.length !== 0 && !bottomLoader) {
      setBottomLoader(true);
      await fetchData(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);
  // useEffect(() => {
  //   if (socket) {
  //     socket.emit("seen-notification", {});
  //   }
  // }, [socket]);

  return (
    <ScreenWrapper headerUnScrollable={() => <Header title="Notifications" />}>
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {}}
            tintColor={COLORS.primaryColor}
          />
        }
        ListFooterComponent={
          bottomLoader ? (
            <View style={{marginBottom: 15}}>
              <ActivityIndicator size="large" color={COLORS.primaryColor} />
            </View>
          ) : null
        }
        onEndReached={fetchMoreData}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? null : <NoDataFound title="No Notification Found" />
        }
        renderItem={({item}) => (
          <Item
            key={item}
            title={item?.title}
            time={moment(item?.createdAt).fromNow()}
            desc={item?.description}
            img={Images?.placeholderUser}
            onPress={() => handlePress(item)}
          />
        )}
      />
    </ScreenWrapper>
  );
};

export default Notifications;
