"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var useAuth_1 = require("./hooks/useAuth");
var react_router_dom_1 = require("react-router-dom");
var router_1 = require("./router");
var AuthGuard_1 = require("./components/auth/AuthGuard");
var __BASE_PATH__ = import.meta.env.BASE_URL || '/';
function App() {
    return (<useAuth_1.AuthProvider>
      <react_router_dom_1.BrowserRouter basename={__BASE_PATH__}>
        <AuthGuard_1.default>
          <router_1.AppRoutes />
        </AuthGuard_1.default>
      </react_router_dom_1.BrowserRouter>
    </useAuth_1.AuthProvider>);
}
exports.default = App;
