import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '../components/app-shell';
import { AuthSessionProvider } from '../features/auth/auth-session-context';
import { RequireAuth } from '../features/auth/require-auth';
import { JoinServiceProvider } from '../join/join-service-context';
import { CreateMeetingPage } from '../pages/create-meeting-page';
import { LoginPage } from '../pages/login-page';
import { MeetingDetailsPage } from '../pages/meeting-details-page';
import { MeetingsPage } from '../pages/meetings-page';
import { store } from './store';

export function App() {
  return (
    <Provider store={store}>
      <AuthSessionProvider>
        <JoinServiceProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<RequireAuth />}>
                  <Route path="/" element={<MeetingsPage />} />
                  <Route path="/meetings/new" element={<CreateMeetingPage />} />
                  <Route
                    path="/meetings/:meetingId"
                    element={<MeetingDetailsPage />}
                  />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </JoinServiceProvider>
      </AuthSessionProvider>
    </Provider>
  );
}
