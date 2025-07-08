export interface Whiteboard {
  id: string;
  title: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  shared: boolean;
}

export interface DashboardState {
  whiteboards: Whiteboard[];
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'recent' | 'shared';
  sortBy: 'date' | 'name';
  searchQuery: string;
}

export const initialDashboardState: DashboardState = {
  whiteboards: [],
  isLoading: false,
  error: null,
  filter: 'all',
  sortBy: 'date',
  searchQuery: '',
};