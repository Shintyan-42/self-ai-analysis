import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // any型の使用を許可（開発効率重視）
      "@typescript-eslint/no-explicit-any": "off",
      // 未使用変数の警告を無効化
      "@typescript-eslint/no-unused-vars": "off",
      // React Hookの依存関係チェックを緩和
      "react-hooks/exhaustive-deps": "warn",
      // console.logの使用を許可
      "no-console": "off",
      // 未定義変数の使用を許可（開発時）
      "no-undef": "off",
    },
  },
];

export default eslintConfig;
