import {Animated, Dimensions, StyleSheet, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomButton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';

import {setLocation} from '../../../store/reducer/usersSlice';
import GetLocation from '../../../utils/GetLocation';
import {Images} from '../../../assets/images';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const {width, height} = Dimensions.get('window');

const OnBoarding = () => {
  const dispatch = useDispatch();
  const flatListRef = useRef();
  const navigation = useNavigation();
  const locationData = GetLocation();

  const [currentIndex, setCurrentIndex] = useState(0);

  const array = [
    {
      id: 1,
      img: Images.onBoarding1,
    },
    {
      id: 2,
      img: Images.onBoarding2,
    },
    {
      id: 3,
      img: Images.onBoarding3,
    },
  ];
  useEffect(() => {
    flatListRef.current.scrollToIndex({animated: true, index: currentIndex});
  }, [currentIndex]);

  useEffect(() => {
    dispatch(setLocation(locationData));
  }, [locationData]);

  return (
    <ScreenWrapper paddingHorizontal={0.1}>
      <Animated.FlatList
        data={array}
        showsHorizontalScrollIndicator={false}
        horizontal
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={info => {
          console.error('Failed to scroll to index:', info.index);
        }}
        ref={flatListRef}
        onMomentumScrollEnd={e => {
          const x = e.nativeEvent.contentOffset.x;
          setCurrentIndex((x / width)?.toFixed(0));
        }}
        initialScrollIndex={currentIndex}
        pagingEnabled
        renderItem={({item}) => (
          <Animated.View style={styles.sliderItem}>
            <Animated.Image style={styles.img} source={item.img} />
          </Animated.View>
        )}
      />
      <View style={styles.container}>
        <CustomText
          label={
            currentIndex == 0
              ? 'onBoarding1'
              : currentIndex == 1
              ? 'onBoarding2'
              : 'onBoarding3'
          }
          fontSize={30}
          marginBottom={15}
          textAlign="center"
          fontFamily={fonts.bold}
          color={'#212121'}
        />

        <Animated.View style={styles.dotContainer}>
          {array?.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i == currentIndex ? COLORS.primaryColor : COLORS.dotColor,
                  width: i == currentIndex ? 26 : 8,
                },
              ]}
            />
          ))}
        </Animated.View>
        <View style={styles.row}>
          <CustomButton
            title={currentIndex == 2 ? 'Get Started' : 'Next'}
            onPress={
              currentIndex == 2
                ? () => navigation.replace('getStarted')
                : () => setCurrentIndex(pre => parseInt(pre) + 1)
            }
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};
export default OnBoarding;
const styles = StyleSheet.create({
  sliderItem: {
    width: width,
    height: height / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  img: {
    height: '80%',
    width: '80%',
    resizeMode: 'contain',
  },
  dot: {
    marginHorizontal: 3,
    borderRadius: 100,
    height: 8,
    width: 8,
    marginVertical: 36,
  },
  container: {
    width: width,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    padding: 30,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: COLORS.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
