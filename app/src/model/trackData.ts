import { SelectItem } from "@mantine/core";

export interface TrackData {
  type?: string;
  album_index?: number;
  artist?: string;
  album?: string;
  release?: string;
  duration?: number;
  current_time?: number;
  name?: string;
  templates?: SelectItem[];
  colors?: string[];
  cover?: string;
  template?: string;
  model?: string;
}
