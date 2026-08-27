import {createSlice} from '@reduxjs/toolkit';

export const usersSlice = createSlice({
  name: 'users',
  initialState: {
    userData: {},
    location: {},
  },
  reducers: {
    setUserData(state, action) {
      state.userData = action.payload;
    },
    setLocation(state, action) {
      state.location = action.payload;
    },
  },
});

export const {setUserData, setLocation} = usersSlice.actions;

export default usersSlice.reducer;
