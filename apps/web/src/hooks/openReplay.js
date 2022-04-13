import { useAccountStore, accountHomePageSelector } from '../state';
import { openReplayTracker } from '../utils/openReplay';

export const useOpenReplayTracker = () => {
  const { user } = useAccountStore(accountHomePageSelector);
  if (user.username) {
    openReplayTracker.setUserID(user.username);
  }
};
