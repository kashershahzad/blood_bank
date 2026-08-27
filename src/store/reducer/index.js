import {combineReducers} from 'redux';

import {authConfigsSlice} from './AuthConfig';
import {usersSlice} from './usersSlice';
import {chatSlice} from './ChatSlice';

export const rootReducer = combineReducers({
  users: usersSlice.reducer,
  authConfig: authConfigsSlice.reducer,
  chat: chatSlice.reducer,
});
