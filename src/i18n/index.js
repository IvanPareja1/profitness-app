"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var i18next_1 = require("i18next");
var react_i18next_1 = require("react-i18next");
var i18next_browser_languagedetector_1 = require("i18next-browser-languagedetector");
var index_1 = require("./local/index");
i18next_1.default
    .use(i18next_browser_languagedetector_1.default)
    .use(react_i18next_1.initReactI18next)
    .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    resources: index_1.default,
    interpolation: {
        escapeValue: false,
    },
});
exports.default = i18next_1.default;
