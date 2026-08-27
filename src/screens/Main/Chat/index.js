import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import ScreenWrapper from '../../../components/ScreenWrapper';
import SearchInput from '../../../components/SearchInput';
import NoDataFound from '../../../components/NoDataFound';
import Header from '../../../components/Header';

import Item from './molecules/Item';

import {get} from '../../../services/ApiRequest';
import {COLORS} from '../../../utils/COLORS';

const Chat = ({navigation}) => {
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigation = async item => {
    const dataToSend = {
      _id: item?.otherUser?._id,
      name: item?.otherUser?.name,
      phone: item?.otherUser?.phone || 0,
    };
    navigation.navigate('InboxScreen', {data: dataToSend});
  };
  const [messagesArray, setMessagesArray] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getConversationList = async () => {
    setRefreshing(true);
    try {
      const response = await get('msg/conversations');
      console.log(response?.data?.conversations[1]);

      setMessagesArray(response.data?.conversations);
    } catch (error) {
      console.log('hhhhhhhh==========', error);
      setRefreshing(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getConversationList();
  }, [isFocus]);

  const filteredMessages = messagesArray?.filter(item => {
    const fullName =
      `${item?.otherUser?.fname} ${item?.otherUser?.lname}`?.toLowerCase();
    return fullName?.includes(searchQuery.toLowerCase());
  });

  // const seenMsg = (id, otherId) => {
  //   if (socket) {
  //     socket.emit("seen-msg", {
  //       conversationId: id,
  //       otherId: otherId,
  //     });
  //   } else {
  //     console.log("Socket is null or not properly initialized");
  //   }
  // };

  return (
    <ScreenWrapper
      backgroundColor={COLORS.mainBg}
      paddingHorizontal={16}
      headerUnScrollable={() => (
        <>
          <Header title="Chats" />
          <View style={{paddingHorizontal: 16}}>
            <SearchInput
              placeholder="Search By Name"
              marginBottom={20}
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
            />
          </View>
        </>
      )}>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={getConversationList}
          />
        }
        data={filteredMessages}
        ListEmptyComponent={() => (
          <NoDataFound
            title="You have not received any messages"
            desc="All messages will appear here"
          />
        )}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({item}) => (
          <Item
            unseen={item?.unseen || 0}
            source={item?.otherUser?.image}
            onPress={() => {
              handleNavigation(item);
            }}
            lastMsg={item?.lastMsg?.message}
            name={`${item?.otherUser?.name || ''}`}
          />
        )}
      />
    </ScreenWrapper>
  );
};

export default Chat;

const styles = StyleSheet.create({
  heading: {
    padding: 15,
  },
});
