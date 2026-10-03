import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { MeetingStatus } from '@meet/schemas';

export type MeetingsFiltersState = {
  status?: MeetingStatus;
  page: number;
};

const initialState: MeetingsFiltersState = {
  page: 1,
};

const meetingsFiltersSlice = createSlice({
  name: 'meetingsFilters',
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<MeetingStatus | undefined>) {
      state.status = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
});

export const { setPage, setStatus } = meetingsFiltersSlice.actions;
export const meetingsFiltersReducer = meetingsFiltersSlice.reducer;
