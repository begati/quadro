import { FormList } from "@mantine/form/lib/form-list/form-list";
import { TrackItem } from "./trackItem";

export interface Tracks {
  count?: number;
  duration?: number;
  items?: TrackItem[];
}
