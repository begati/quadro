import { TrackItem } from "./trackItem";

export interface Data {
  copyrights?: string;
  artist?: string;
  colors?: string[];
  cover?: string;
  name?: string;
  release?: string;
  tracks?: TrackItem[];
  duration?: number;
}
