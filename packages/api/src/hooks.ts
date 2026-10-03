import { useDispatch, useSelector } from 'react-redux';

import type { MeetDispatch, MeetRootState } from './store';

export function useMeetDispatch() {
  return useDispatch<MeetDispatch>();
}

export function useMeetSelector<Selected>(
  selector: (state: MeetRootState) => Selected,
): Selected {
  return useSelector(selector);
}
