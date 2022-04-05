import { createSlice, SliceCaseReducers } from '@reduxjs/toolkit';
import { AlbumData } from '../../model/albumData';
import { TrackData } from '../../model/trackData';

export interface GlobalState {
  data: AlbumData | TrackData | null;
}

export const globalSlice = createSlice<GlobalState, SliceCaseReducers<GlobalState>>({
  name: 'global',
  initialState: {
    data: null,
  },
  reducers: {
    setData: (state, action) => {
      localStorage.setItem("project", JSON.stringify(action.payload));
      state.data = action.payload;
    }
  }
});

export const { setData } = globalSlice.actions;
export default globalSlice.reducer;
