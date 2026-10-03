import { registerRootComponent } from 'expo';
import { installMeetingsFetchMock } from '@meet/mocks';

import App from './src/app/App';

installMeetingsFetchMock();

registerRootComponent(App);
