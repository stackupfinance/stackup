export const pick = (
  object: Record<string, any> | undefined,
  keys: Array<string>
): object => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      return { ...obj, [key]: object[key] };
    }
    return obj;
  }, {});
};
