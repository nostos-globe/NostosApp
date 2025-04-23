import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Trip, TripMedia } from '../services/mediaService';

interface MediaIconBarProps {
  tripMedia: TripMedia[];
  currentIndex: number;
  favoritedMedia: Record<string, boolean>;
  mediaVisibility: Record<string, string>;
  onVisibilityChange?: () => void;
  onFavoriteToggle?: () => void;
  onInfoPress?: () => void;
  onDeletePress?: () => void;
  screenType:  'explore' | 'profile';
}

const MediaIconBar = ({
  tripMedia,
  currentIndex,
  favoritedMedia,
  mediaVisibility,
  onVisibilityChange,
  onFavoriteToggle,
  onInfoPress,
  onDeletePress,
  screenType
}: MediaIconBarProps) => {
  
  const getVisibilityIcon = (mediaId: string): string => {
    const visibility = mediaVisibility[mediaId];
    if (visibility === 'PRIVATE') return '🔒';
    if (visibility === 'FRIENDS') return '👥';
    if (visibility === 'PUBLIC') return '🌐';
    return '🔒';
  };

  const renderIcons = () => {
    switch (screenType) {
      case 'explore':
        return (
          <>
            <TouchableOpacity onPress={onFavoriteToggle}>
              <Image 
                source={
                  tripMedia && 
                  tripMedia.length > 0 && 
                  currentIndex < tripMedia.length &&
                  favoritedMedia[tripMedia[currentIndex].mediaId.toString()]
                    ? require('../assets/filledFav_icon.png')
                    : require('../assets/fav_icon.png')
                }
                style={styles.iconItem}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onInfoPress}>
              <Image 
                source={require('../assets/info_icon.png')}
                style={styles.iconItem}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image 
                source={require('../assets/globe_icon.png')}
                style={styles.iconItem}
              />
            </TouchableOpacity>
          </>
        );
      case 'profile':
        return (
          <>
            <TouchableOpacity onPress={onVisibilityChange}>
              <Text style={styles.iconText}>
                {tripMedia && tripMedia.length > 0 && currentIndex < tripMedia.length
                  ? getVisibilityIcon(tripMedia[currentIndex].mediaId.toString())
                  : '🔒'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onFavoriteToggle}>
              <Image 
                source={
                  tripMedia && 
                  tripMedia.length > 0 && 
                  currentIndex < tripMedia.length &&
                  favoritedMedia[tripMedia[currentIndex].mediaId.toString()]
                    ? require('../assets/filledFav_icon.png')
                    : require('../assets/fav_icon.png')
                }
                style={styles.iconItem}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onInfoPress}>
              <Image 
                source={require('../assets/info_icon.png')}
                style={styles.iconItem}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDeletePress}>
              <Image 
                source={require('../assets/delete_icon.png')}
                style={styles.iconItem}
              />
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <View style={styles.iconBar}>
      {renderIcons()}
    </View>
  );
};

const styles = StyleSheet.create({
    iconBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 5,
        paddingVertical: 12,
        position: 'absolute',
        top: 90,
        left: 0,
        right: 0,
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderTopWidth: 0.5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
      iconText: {
        color: '#000',
        fontSize: 20,
      },
      iconItem: {
        width: 20,
        height: 20,
      },
});

export default MediaIconBar;