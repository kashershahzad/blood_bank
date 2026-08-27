import React, {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';

export const FadeInUp = ({
  children,
  delay = 0,
  duration = 520,
  from = 22,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration, opacity, translateY]);

  return (
    <Animated.View style={[style, {opacity, transform: [{translateY}]}]}>
      {children}
    </Animated.View>
  );
};

export const ScaleIn = ({children, delay = 0, style}) => {
  const scale = useRef(new Animated.Value(0.72)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        delay,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, scale]);

  return (
    <Animated.View style={[style, {opacity, transform: [{scale}]}]}>
      {children}
    </Animated.View>
  );
};
