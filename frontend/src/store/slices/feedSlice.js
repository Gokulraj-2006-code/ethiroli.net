import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    fetchFeedStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFeedSuccess: (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter(item => !item.is_read).length;
      state.loading = false;
    },
    fetchFeedFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addFeedItem: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    removeFeedItem: (state, action) => {
      const { id, entity_id: entityId } = action.payload || {};
      const before = state.items.length;
      state.items = state.items.filter((item) => {
        if (id && item.id === id) return false;
        if (entityId && item.entity_id === entityId) return false;
        return true;
      });
      state.unreadCount = state.items.filter((item) => !item.is_read).length;
    },
    markFeedItemRead: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1 && !state.items[index].is_read) {
        state.items[index].is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    }
  }
});

export const {
  fetchFeedStart,
  fetchFeedSuccess,
  fetchFeedFailure,
  addFeedItem,
  removeFeedItem,
  markFeedItemRead
} = feedSlice.actions;

export default feedSlice.reducer;
