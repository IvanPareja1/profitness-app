"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigatePromise = void 0;
exports.AppRoutes = AppRoutes;
var react_router_dom_1 = require("react-router-dom");
var react_router_dom_2 = require("react-router-dom");
var react_1 = require("react");
var config_1 = require("./config");
var navigateResolver;
exports.navigatePromise = new Promise(function (resolve) {
    navigateResolver = resolve;
});
function AppRoutes() {
    var element = (0, react_router_dom_2.useRoutes)(config_1.default);
    if (!window.REACT_APP_NAVIGATE) {
        var navigate_1 = (0, react_router_dom_1.useNavigate)();
        (0, react_1.useEffect)(function () {
            window.REACT_APP_NAVIGATE = navigate_1;
            navigateResolver(window.REACT_APP_NAVIGATE);
        });
    }
    return element;
}
