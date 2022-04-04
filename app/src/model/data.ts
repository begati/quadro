import { FormList } from "@mantine/form/lib/form-list/form-list";
import { Color } from "./color";
import { Tracks } from "./tracks";

export interface Data {
  artist?: string;
  colors?: string[];
  cover?: string;
  name?: string;
  release?: string;
  tracks?: Tracks;
}
