import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type RouteParams = {
  type: 'followers' | 'following' | 'likes';
  userId: number;
  profiles: Array<{
    profileId: number;
    username: string;
    profilePicture?: string;
  }>;
};

const FollowListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { type, profiles } = route.params as RouteParams;

  const renderItem = ({ item }: { item: RouteParams['profiles'][0] }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => navigation.navigate('UserProfile', { userId: item.profileId })}
    >
      <Image
        source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {type === 'followers' 
            ? 'Followers' 
            : type === 'following' 
              ? 'Following' 
              : 'Likes'}
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <FlatList
        data={profiles}
        renderItem={renderItem}
        keyExtractor={(item) => (item?.profileId || '').toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    width: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 30,
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FollowListScreen;