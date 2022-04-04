import { configureStore } from '@reduxjs/toolkit';
import globalReducer from './ducks/global.duck';

const store = configureStore({
  reducer: {
    global: globalReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
