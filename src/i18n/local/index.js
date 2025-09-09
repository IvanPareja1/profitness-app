"use strict";
// 添加 Vite 类型声明
/// <reference types="vite/client" />
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var modules = import.meta.glob('./*/*.ts', { eager: true });
var messages = {};
Object.keys(modules).forEach(function (path) {
    var match = path.match(/\.\/([^/]+)\/([^/]+)\.ts$/);
    if (match) {
        var lang = match[1];
        var module_1 = modules[path];
        if (!messages[lang]) {
            messages[lang] = { translation: {} };
        }
        // 合并翻译内容
        if (module_1.default) {
            messages[lang].translation = __assign(__assign({}, messages[lang].translation), module_1.default);
        }
    }
});
exports.default = messages;
