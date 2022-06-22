export const truncate = (address: string) => {
  const match = address.match(
    /^(0x[a-zA-Z0-9]{5})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/,
  );
  if (!match) {
    return address;
  }

  return `${match[1]}...${match[2]}`;
};

export const isValid = (address: string) => {
  return address.match(/^0x[a-fA-F0-9]{40}$/);
};
