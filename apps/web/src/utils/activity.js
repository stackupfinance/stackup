export const getToUserFromSavedActivity = (savedActivity, userId) =>
  savedActivity.users.find((curr) => curr.id !== userId);
