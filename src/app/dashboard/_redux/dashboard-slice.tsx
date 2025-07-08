import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialDashboardState, DashboardState, Whiteboard } from './dashboard-state';

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: initialDashboardState,
  reducers: {
    setWhiteboards: (state, action: PayloadAction<Whiteboard[]>) => {
      state.whiteboards = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addWhiteboard: (state, action: PayloadAction<Whiteboard>) => {
      state.whiteboards.push(action.payload);
    },
    updateWhiteboard: (state, action: PayloadAction<{ id: string; updates: Partial<Whiteboard> }>) => {
      const index = state.whiteboards.findIndex(wb => wb.id === action.payload.id);
      if (index !== -1) {
        state.whiteboards[index] = { ...state.whiteboards[index], ...action.payload.updates };
      }
    },
    deleteWhiteboard: (state, action: PayloadAction<string>) => {
      state.whiteboards = state.whiteboards.filter(wb => wb.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setFilter: (state, action: PayloadAction<DashboardState['filter']>) => {
      state.filter = action.payload;
    },
    setSortBy: (state, action: PayloadAction<DashboardState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setWhiteboards,
  addWhiteboard,
  updateWhiteboard,
  deleteWhiteboard,
  setLoading,
  setError,
  setFilter,
  setSortBy,
  setSearchQuery,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;