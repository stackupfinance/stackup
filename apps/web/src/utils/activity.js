export const getToUserFromActivity = (activity, userId) =>
  activity.users.find((curr) => curr.id !== userId);
