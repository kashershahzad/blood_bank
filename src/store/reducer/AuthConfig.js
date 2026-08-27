import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  token: '',
  isOnBoarding: false,
};
export const authConfigsSlice = createSlice({
  name: 'authConfigs',
  initialState: initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
    setOnBoarding(state, action) {
      state.isOnBoarding = action.payload;
    },
    logout(state, action) {
      state.token = '';
    },
  },
});

export const {setToken, setOnBoarding, logout} = authConfigsSlice.actions;
