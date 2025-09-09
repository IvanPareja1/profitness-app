"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthGuard;
var useAuth_1 = require("../../hooks/useAuth");
var LoginScreen_1 = require("./LoginScreen");
var LoadingScreen_1 = require("./LoadingScreen");
function AuthGuard(_a) {
    var children = _a.children;
    var _b = (0, useAuth_1.useAuth)(), user = _b.user, loading = _b.loading;
    if (loading) {
        return <LoadingScreen_1.default />;
    }
    if (!user) {
        return <LoginScreen_1.default />;
    }
    return <>{children}</>;
}
