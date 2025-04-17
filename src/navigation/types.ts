import { Globe } from '../services/globesService';
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
  Globe3DView: { globe: Globe };
  OtherProfile: {
    userId: number; 
  }
  Home: undefined;
  Login: undefined;
  Explore: undefined;
  Profile: undefined;
  GlobesList: undefined;
  AddContent: undefined;
  CreateMedia: undefined;
  CreateTrip: undefined;
  CreateGlobe: undefined;
  AddTrip: {
    globeId: number | string;
  };
};