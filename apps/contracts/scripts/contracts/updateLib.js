const fs = require("fs").promises;
const path = require("path");
const prettier = require("prettier");
const EntryPoint = require("../../artifacts/contracts/ERC4337/EntryPoint.sol/EntryPoint.json");
const WalletProxy = require("../../artifacts/contracts/ERC4337/WalletProxy.sol/WalletProxy.json");
const Wallet = require("../../artifacts/contracts/ERC4337/Wallet.sol/Wallet.json");

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
