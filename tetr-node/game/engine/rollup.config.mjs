import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
const name = "tortoise";
const plugins = [nodeResolve({ extensions: [".ts"] }), typescript()];

export default [
  {
    input: "index.ts",
    output: [
      {
        format: "esm",
        name: name,
        file: "build/" + name + ".module.js",
        indent: "\t",
      },
    ],
    plugins: [...plugins],
  },

  {
    input: "index.ts",
    output: [
      {
        format: "umd",
        name: name,
        file: "build/" + name + ".js",
        indent: "\t",
      },
      {
        format: "cjs",
        name: name,
        file: "build/" + name + ".cjs",
        indent: "\t",
      },
    ],
    plugins: [...plugins],
  },

  {
    input: "build/full/index.d.ts",
    output: [{ file: "build/" + name + ".d.ts", format: "es" }],
    plugins: [dts()],
  },
];
