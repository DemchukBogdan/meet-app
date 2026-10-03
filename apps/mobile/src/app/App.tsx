import { createMeetStore } from '@meet/api';
import { createI18n } from '@meet/i18n';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';

import { MeetingsRoot } from '@/features/meetings/screens/MeetingsRoot';

createI18n();

const store = createMeetStore();

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="dark" />
      <MeetingsRoot />
    </Provider>
  );
}
