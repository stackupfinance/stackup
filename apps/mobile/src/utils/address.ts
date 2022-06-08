export const truncate = (address: string) => {
  const match = address.match(
    /^(0x[a-zA-Z0-9]{6})[a-zA-Z0-9]+([a-zA-Z0-9]{8})$/,
  );
  if (!match) {
    return address;
  }

  return `${match[1]}....${match[2]}`;
};
