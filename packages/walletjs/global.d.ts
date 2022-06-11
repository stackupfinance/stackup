declare module "scrypt-js/thirdparty/buffer" {
  export class SlowBuffer extends Uint8Array {
    constructor(value: string);
  }
}
