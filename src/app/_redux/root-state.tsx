export interface RootState {
  isLoading: boolean;
  welcomeMessage: string;
  featuredContent: {
    title: string;
    description: string;
    link: string;
  }[];
}

export const initialRootState: RootState = {
  isLoading: false,
  welcomeMessage: 'Welcome to Whiteboard App',
  featuredContent: []
};