import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default [
    // 忽略产物与三方
    { ignores: ["dist/**", "build/**", "node_modules/**"] },

    // JS & TS 推荐
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // 你的前端源码（浏览器环境）
    {
        files: ["src/**/*.{ts,tsx,js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: tseslint.parser,
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: {
                ...globals.browser, // window/document/console 等
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            import: importPlugin,
        },

        settings: {
            react: { version: "detect" },
            "import/resolver": {
                typescript: {
                    project: ["./tsconfig.json"],
                },
                node: {
                    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
                },
            },
        },
        rules: {
            /** React */
            "react/react-in-jsx-scope": "off",
            "react/jsx-uses-react": "off",
            "react/jsx-uses-vars": "warn",

            /** React Hooks */
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            /** import 整理（可按需精简） */
            "import/order": ["warn", { "newlines-between": "always" }],
            "import/no-unresolved": "error",

            /** 通用 */
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "no-console": "off",

            /** Tailwind（按需开启/关闭） */
            // "tailwindcss/classnames-order": "warn",
            // "tailwindcss/no-custom-classname": "off",
        },
    },

    // Node 脚本（ESM/Module）：webpack、scripts、*.config.*（非 .cjs）
    {
        files: [
            "webpack.config.*",
            "*.config.{js,mjs,ts}",
            "scripts/**/*.{js,mjs,ts}",
            // 你的 AI review 脚本如果在根目录，请加上：
            "scripts/**/*",
        ],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: tseslint.parser,
            globals: {
                ...globals.node, // process、__dirname、console …
            },
        },
        rules: {
            // 在 Node 环境里无需限制 require/import 的混用（按需保留/移除）
            "@typescript-eslint/no-require-imports": "off",
        },
    },

    // 仅 .cjs 的 CommonJS 分组（因为上面是 module）
    {
        files: ["*.config.cjs", "scripts/**/*.cjs"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
];
