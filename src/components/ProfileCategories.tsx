import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

interface ProfileCategoriesProps {
  onCategoryPress?: (category: string) => void;
  selectedCategory?: string;
}

const ProfileCategories: React.FC<ProfileCategoriesProps> = ({ onCategoryPress, selectedCategory }) => {
  return (
    <View style={styles.tripCategories}>
      <TouchableOpacity 
        style={[
          styles.categoryButton,
          selectedCategory === 'trips' && styles.selectedCategory
        ]}
        onPress={() => onCategoryPress?.('trips')}
      >
          <Image 
            source={require('../assets/trip_icon.png')}
            style={styles.tripCategoriesItem}
          />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.categoryButton,
          selectedCategory === 'globes' && styles.selectedCategory
        ]}
        onPress={() => onCategoryPress?.('globes')}
      >
          <Image 
            source={require('../assets/globe_icon.png')}
            style={styles.tripCategoriesItem}
          />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.categoryButton,
          selectedCategory === 'favorites' && styles.selectedCategory
        ]}
        onPress={() => onCategoryPress?.('favorites')}
      >
        <Image 
            source={require('../assets/likeProfile_icon.png')}
            style={styles.tripCategoriesItem}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tripCategories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tripCategoriesItem: {
    width: 25,
    height: 25,
  },
  categoryButton: {
    padding: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedCategory: {
    borderBottomColor: '#000',
  },
});

export default ProfileCategories;