import moment from 'moment';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Keyboard,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';

import CustomText from '../../../components/CustomText';
import Header from '../../../components/Header';
import ScreenWrapper from '../../../components/ScreenWrapper';

import Footer from './molecules/Footer';

import {get} from '../../../services/ApiRequest';
import {COLORS} from '../../../utils/COLORS';
import {ToastMessage} from '../../../utils/ToastMessage';

const InboxScreen = ({route}) => {
  const flatListRef = useRef(null);
  const data = route.params?.data;
  const {userData} = useSelector(state => state.users);
  const userId = userData?._id;
  const [scrolled, setScrolled] = useState(false);
  const [bottomLoader, setBottomLoader] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(new Animated.Value(0));
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', event => {
      setIsKeyboardVisible(true);
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: event.endCoordinates.height,
        useNativeDriver: false,
      }).start();
    });
    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', event => {
      setIsKeyboardVisible(false);
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: 0,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleScroll = () => {
    setScrolled(true);
  };

  const fetchMessages = async () => {
    try {
      const response = await get('msg/messages/' + data?._id);
      if (response.data) {
        setMessages(response.data?.messages);
      }
    } catch (error) {
      console.log('errrrrrr', error);
    }
  };

  const getMoreMessages = async () => {
    try {
      if (messages?.length > 0 && !bottomLoader) {
        setBottomLoader(true);
        const lastId = messages[messages?.length - 1]?._id;
        const url = 'msg/messages/' + data?.id + '/' + 'User' + '/' + lastId;
        const response = await get(url);
        if (response.data?.success) {
          setMessages([...messages, ...response.data?.messages]);
        }
        setTimeout(() => {
          setBottomLoader(false);
          setScrolled(false);
        }, 1000);
      }
    } catch (error) {
      console.log(error, 'in getting more msgs');
      setTimeout(() => {
        setBottomLoader(false);
        setScrolled(false);
      }, 1000);
    }
  };

  const sendMsg = () => {
    if (!inputText?.trim()) return;
    ToastMessage('Chat is currently unavailable');
  };

  useLayoutEffect(() => {
    if (data?._id) {
      fetchMessages();
    }
  }, [data?._id]);

  useEffect(() => {
    getMoreMessages();
  }, [scrolled]);

  const onPhonePress = () => {
    if (data?.phone) {
      Linking.openURL(`tel:${data?.phone}`);
    } else {
      ToastMessage('Invalid phone number');
    }
  };

  const renderMessage = ({item}) => (
    <>
      <CustomText
        label={moment(item.createdAt).format('h:mm A')}
        color="#818898"
        fontSize={12}
        marginTop={5}
        alignSelf={item.sender == userId ? 'flex-end' : 'flex-start'}
      />
      <View
        style={[
          styles.messageContainer,
          item.sender == userId ? styles.userMessage : styles.otherMessage,
        ]}>
        <CustomText
          label={item?.message}
          color={item.sender == userId ? COLORS.white : COLORS.black}
          lineHeight={25}
        />
      </View>
    </>
  );

  return (
    <ScreenWrapper
      paddingHorizontal={10}
      backgroundColor={COLORS.mainBg}
      footerUnScrollable={() => (
        <Animated.View style={{marginBottom: keyboardHeight}}>
          <Footer
            inputText={inputText}
            setInputText={setInputText}
            sendMessage={sendMsg}
            pad={isKeyboardVisible}
          />
        </Animated.View>
      )}
      headerUnScrollable={() => (
        <Header title={data?.name || 'Test'} onPhonePress={onPhonePress} />
      )}>
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        showsVerticalScrollIndicator={false}
        renderItem={renderMessage}
        keyExtractor={(_, i) => i.toString()}
        style={styles.messageList}
        onScrollEndDrag={handleScroll}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: COLORS.mainBg,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    maxWidth: '70%',
    padding: 14,
    borderRadius: 15,
    marginTop: 15,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primaryColor,
    borderTopRightRadius: 0,
    elevation: 1,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF5FF',
    borderTopLeftRadius: 0,
    elevation: 1,
  },
});

export default InboxScreen;
