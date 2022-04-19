const dtsgen = require("dts-gen/bin/lib");
const fse = require("fs-extra");
const path = require("path");
const prettier = require("prettier");

const dir = path.join(process.cwd(), "/types/index.d.ts");

let dts = dtsgen.generateModuleDeclarationFile(
  "@stackupfinance/walletjs",
  require("./lib")
);

dts = prettier.format(dts, { parser: "typescript" });

fse.outputFile(dir, dts).catch(console.error);
