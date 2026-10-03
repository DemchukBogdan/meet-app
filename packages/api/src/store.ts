import { configureStore } from '@reduxjs/toolkit';

import { meetingsApi } from './meetings.api';
import { meetingsFiltersReducer } from './meetings-filters';

export function createMeetStore() {
  return configureStore({
    reducer: {
      [meetingsApi.reducerPath]: meetingsApi.reducer,
      meetingsFilters: meetingsFiltersReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(meetingsApi.middleware),
  });
}

export type MeetStore = ReturnType<typeof createMeetStore>;
export type MeetRootState = ReturnType<MeetStore['getState']>;
export type MeetDispatch = MeetStore['dispatch'];
