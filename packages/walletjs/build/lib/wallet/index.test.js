"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const _1 = require(".");
const contracts_1 = require("../contracts");
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
describe("Wallet", () => {
    describe("create random", () => {
        it("has all the correct fields", async () => {
            const wallet = await (0, _1.createRandom)("password", "salt", {
                guardians: [ethers_1.ethers.constants.AddressZero],
            });
            expect(wallet.walletAddress).toMatch(ADDRESS_REGEX);
            expect(wallet.initImplementation).toEqual(contracts_1.Wallet.address);
            expect(wallet.initOwner).toMatch(ADDRESS_REGEX);
            expect(wallet.initGuardians.length).toEqual(1);
            expect(wallet.initGuardians[0]).toEqual(ethers_1.ethers.constants.AddressZero);
            expect(wallet.salt).toEqual("salt");
            expect(wallet.encryptedSigner).toMatch(BASE64_REGEX);
        });
    });
    describe("decrypting signer", () => {
        it("returns the signer when password is correct", async () => {
            const wallet = await (0, _1.createRandom)("password", "salt");
            const signer = await (0, _1.decryptSigner)(wallet, "password", "salt");
            expect(signer).not.toBeUndefined();
            expect(wallet.initOwner).toEqual(signer?.address);
        });
        it("does not return the signer when password is incorrect", async () => {
            const wallet = await (0, _1.createRandom)("password", "salt");
            const signer = await (0, _1.decryptSigner)(wallet, "wrongPassword", "salt");
            expect(signer).toBeUndefined();
        });
        it("does not return the signer when salt is incorrect", async () => {
            const wallet = await (0, _1.createRandom)("password", "salt");
            const signer = await (0, _1.decryptSigner)(wallet, "password", "wrongSalt");
            expect(signer).toBeUndefined();
        });
        it("does not return the signer when password has different case", async () => {
            const wallet = await (0, _1.createRandom)("password", "salt");
            const signer = await (0, _1.decryptSigner)(wallet, "PASSWORD", "salt");
            expect(signer).toBeUndefined();
        });
        it("does not return the signer when salt has different case", async () => {
            const wallet = await (0, _1.createRandom)("password", "salt");
            const signer = await (0, _1.decryptSigner)(wallet, "password", "SALT");
            expect(signer).toBeUndefined();
        });
    });
    describe("Reencrypt signer", () => {
        it("returns a new encryptedSigner value", async () => {
            const w1 = await (0, _1.createRandom)("password", "salt");
            const w2 = {
                ...w1,
                encryptedSigner: (await (0, _1.reencryptSigner)(w1, "password", "newPassword", "salt")) ?? "",
            };
            const oldSigner = await (0, _1.decryptSigner)(w1, "password", "salt");
            const newSigner = await (0, _1.decryptSigner)(w2, "newPassword", "salt");
            expect(oldSigner).not.toBeUndefined();
            expect(newSigner).not.toBeUndefined();
            expect(oldSigner?.address).toEqual(newSigner?.address);
        });
        it("does not return an encryptedSigner value if password is wrong", async () => {
            const w = await (0, _1.createRandom)("password", "salt");
            const encryptedSigner = await (0, _1.reencryptSigner)(w, "wrongPassword", "newPassword", "salt");
            expect(encryptedSigner).toBeUndefined();
        });
    });
});
