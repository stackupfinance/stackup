import Tracker from '@openreplay/tracker/cjs';
import { App } from '../config';

export const openReplayTracker = new Tracker({
  projectKey: App.openReplay.projectKey,
  __DISABLE_SECURE_MODE: process.env.NODE_ENV === 'production' ? false : true,
  onStart: ({ sessionID }) => console.log('OpenReplay tracker started with session: ', sessionID),
});
