import {createSlice} from '@reduxjs/toolkit';
import {processArray} from '../../utils/constants';

const initialState = {
  messagesData: [],
};
export const chatSlice = createSlice({
  name: 'chat',
  initialState: initialState,
  reducers: {
    setMessagesData(state, action) {
      const data = action.payload;
      const arr = [...data];
      const mapArray = processArray(arr);
      state.messagesData = mapArray;
      return state;
    },
    paginatedData(state, action) {
      const data = action.payload;
      const arr = [...state.messagesData, ...data];
      const mapArray = processArray(arr);
      state.messagesData = mapArray;
      return state;
    },
    receivedMessage(state, action) {
      const {message} = action.payload;
      if (!state.messagesData[message._id]) {
        const newMessage = {...message};
        if (
          state?.messagesData.length > 0 &&
          state?.messagesData[0]?.day === 'Today'
        ) {
          newMessage.day = 'Today';
          newMessage.show = false;
        } else {
          newMessage.day = 'Today';
          newMessage.show = true;
        }
        const arr = [newMessage, ...state.messagesData];
        state.messagesData = arr;
      }
      return state;
    },
  },
});

export const {setMessagesData, paginatedData, receivedMessage} =
  chatSlice.actions;
