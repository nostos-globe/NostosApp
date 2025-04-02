import { TripMedia, Trip } from '../services/mediaService';

export type RootStackParamList = {
  PhotoView: {
    imageUrl: string;
    tripMedia: TripMedia[];
    initialIndex: number;
    trip?: Trip;
  };
  Home: undefined;
  Login: undefined;
  Explore: undefined;
  Profile: undefined;
};