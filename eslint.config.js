import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import tailwind from "eslint-plugin-tailwindcss";

export default [
    // 忽略产物与三方
    { ignores: ["dist/**", "build/**", "node_modules/**"] },

    // JS & TS 推荐
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // 你的前端源码规则
    {
        files: ["src/**/*.{ts,tsx,js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node, // webpack 配置、脚本里会用到 Node 全局
            },
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            import: importPlugin,
            tailwindcss: tailwind,
        },
        settings: {
            react: { version: "detect" }, // 自动探测 React 版本
            // tailwindcss 插件会自动寻找 tailwind.config.js；如需指定可加：
            // "tailwindcss": { config: "tailwind.config.js" }
        },
        rules: {
            /** React */
            "react/react-in-jsx-scope": "off", // 新版 React 无需显式 import React
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
            "tailwindcss/classnames-order": "warn",
            "tailwindcss/no-custom-classname": "off", // 允许你自定义 class
        },
    },

    // 对 webpack.config.* 等 Node 脚本单独放开（可选）
    {
        files: ["webpack.config.*", "scripts/**/*.{js,ts}"],
        languageOptions: {
            globals: globals.node,
            sourceType: "module",
        },
    },
];
