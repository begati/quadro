import { createSlice, SliceCaseReducers } from '@reduxjs/toolkit';
import { Data } from '../../model/data';

export interface GlobalState {
  data: Data | null;
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
