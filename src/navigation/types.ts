import { TripMedia, Trip } from '../services/mediaService';

export type RootStackParamList = {
  PhotoView: {
    imageUrl: string;
    tripMedia: TripMedia[];
    initialIndex: number;
    trip?: Trip;
  };
  ExplorePhotoView: {
    imageUrl: string;
    tripMedia: TripMedia[];
    initialIndex: number;
    trip?: Trip;
  };
  OtherProfile: {
    userId: number; 
  }
  Home: undefined;
  Login: undefined;
  Explore: undefined;
  Profile: undefined;
};