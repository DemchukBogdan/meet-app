import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { JoinServiceProvider } from '../join/join-service-context';
import { CreateMeetingPage } from '../pages/create-meeting-page';
import { MeetingDetailsPage } from '../pages/meeting-details-page';
import { MeetingsPage } from '../pages/meetings-page';
import { store } from './store';

export function App() {
  return (
    <Provider store={store}>
      <JoinServiceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MeetingsPage />} />
            <Route path="/meetings/new" element={<CreateMeetingPage />} />
            <Route
              path="/meetings/:meetingId"
              element={<MeetingDetailsPage />}
            />
          </Routes>
        </BrowserRouter>
      </JoinServiceProvider>
    </Provider>
  );
}
