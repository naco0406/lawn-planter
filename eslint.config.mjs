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
  // 개발중일 때만 eslint 무시
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // 사용하지 않는 변수 경고 끄기
      "react/no-unescaped-entities": "off", // 따옴표 관련 경고 끄기
      "@typescript-eslint/no-explicit-any": "off", // any 타입 관련 경고 끄기
      "@typescript-eslint/ban-ts-comment": "off", // ts-expect-error 관련 경고 끄기
      "prefer-const": "off", // let을 const로 바꾸라는 경고 끄기
      "@next/next/no-img-element": "off" // img 태그 대신 next/image를 사용하라는 경고 끄기
    }
  }
];

export default eslintConfig;
