import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialRootState, RootState } from './root-state';

const rootSlice = createSlice({
  name: 'root',
  initialState: initialRootState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setWelcomeMessage: (state, action: PayloadAction<string>) => {
      state.welcomeMessage = action.payload;
    },
    setFeaturedContent: (state, action: PayloadAction<RootState['featuredContent']>) => {
      state.featuredContent = action.payload;
    },
    addFeaturedContent: (state, action: PayloadAction<RootState['featuredContent'][0]>) => {
      state.featuredContent.push(action.payload);
    },
    clearFeaturedContent: (state) => {
      state.featuredContent = [];
    }
  }
});

export const { 
  setLoading, 
  setWelcomeMessage, 
  setFeaturedContent, 
  addFeaturedContent, 
  clearFeaturedContent 
} = rootSlice.actions;

export default rootSlice.reducer;