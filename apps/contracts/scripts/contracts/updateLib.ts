import fs from "fs/promises";
import path from "path";
import prettier from "prettier";
// @ts-ignore
import EntryPoint from "../../artifacts/contracts/entrypoint/EntryPoint.sol/EntryPoint.json";
// @ts-ignore
import Wallet from "../../artifacts/contracts/wallet/Wallet.sol/Wallet.json";
// @ts-ignore
import WalletProxy from "../../artifacts/contracts/wallet/WalletProxy.sol/WalletProxy.json";

async function main() {
  return Promise.all([
    fs.writeFile(
      path.resolve(
        __dirname,
        "../../../../packages/walletjs/lib/contracts/source/EntryPoint.json"
      ),
      prettier.format(JSON.stringify(EntryPoint), { parser: "json" })
    ),
    fs.writeFile(
      path.resolve(
        __dirname,
        "../../../../packages/walletjs/lib/contracts/source/WalletProxy.json"
      ),
      prettier.format(JSON.stringify(WalletProxy), { parser: "json" })
    ),
    fs.writeFile(
      path.resolve(
        __dirname,
        "../../../../packages/walletjs/lib/contracts/source/Wallet.json"
      ),
      prettier.format(JSON.stringify(Wallet), { parser: "json" })
    ),
  ]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
