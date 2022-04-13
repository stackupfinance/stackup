import Tracker from '@openreplay/tracker/cjs';
import { App } from '../config';

export const openReplayTracker = new Tracker({
  projectKey: App.openReplay.projectKey,
  __DISABLE_SECURE_MODE: process.env.NODE_ENV !== 'production',
  defaultInputMode: 1, // 0 = Plain, 1 = Obscured, 2 = Ignored
  onStart: ({ sessionID }) => console.log('OpenReplay tracker started with session: ', sessionID),
});
