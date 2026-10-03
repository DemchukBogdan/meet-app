import { setupWorker } from 'msw/browser';

import { createMeetingHandlers } from './handlers';
import { MeetingsMockServer } from './meetings-mock-server';

const meetingsMockServer = new MeetingsMockServer();

export const worker = setupWorker(...createMeetingHandlers(meetingsMockServer));
