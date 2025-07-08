import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from '@/store/slices/auth-slice'
import whiteboardReducer from '@/store/slices/whiteboard-slice'
import drawingReducer from '@/store/slices/drawing-slice'
import rootReducer from '@/app/_redux/root-slice'
import dashboardReducer from '@/store/slices/dashboard-slice'

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user'],
}

const drawingPersistConfig = {
  key: 'drawing',
  storage,
  whitelist: ['selectedTool', 'selectedColor', 'strokeWidth', 'fill'],
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)
const persistedDrawingReducer = persistReducer(drawingPersistConfig, drawingReducer)

export const store = configureStore({
  reducer: {
    root: rootReducer,
    auth: persistedAuthReducer,
    dashboard: dashboardReducer,
    whiteboard: whiteboardReducer,
    drawing: persistedDrawingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch