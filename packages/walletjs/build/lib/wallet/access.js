"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuardians = void 0;
const getGuardians = async (wallet) => {
    const guardianCount = await wallet.getGuardianCount();
    return Promise.all(new Array(guardianCount.toNumber())
        .fill("")
        .map((_, i) => wallet.getGuardian(i)));
};
exports.getGuardians = getGuardians;
