import {browser} from "@zerebos/eslint-config";
import ts from "@zerebos/eslint-config-typescript";


/** @type {import("@zerebos/eslint-config-typescript").ConfigArray} */
export default [
    ...browser,
    ...ts.configs.recommended
];