import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export default function CustomTextRegular(props: TextProps) {
  return <Text {...props} style={[styles.text, props.style]} />;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'OutfitRegular',
    lineHeight: 22,
  },
});
