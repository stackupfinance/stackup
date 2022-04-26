declare module globalThis {
  function scrypt(passwd, salt, N, r, p, size): Promise<Uint8Array>;
}
