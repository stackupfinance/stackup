import Tracker from '@openreplay/tracker/cjs';
import { App } from '../config';

export const openReplayTracker = new Tracker({
  projectKey: App.openReplay.projectKey,
  __DISABLE_SECURE_MODE: process.env.NODE_ENV !== 'production',
});
