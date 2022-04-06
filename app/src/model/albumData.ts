import { SelectItem } from "@mantine/core";
import { TrackItem } from "./trackItem";

export interface AlbumData {
  type?: string;
  copyrights?: string;
  artist?: string;
  colors?: string[];
  cover?: string;
  name?: string;
  release?: string;
  tracks?: TrackItem[];
  duration?: number;
  templates?: SelectItem[];
  template?: string;
  model?: string;
}
