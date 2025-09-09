"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NotFound_1 = require("../pages/NotFound");
var page_1 = require("../pages/dashboard/page");
var page_2 = require("../pages/nutrition/page");
var page_3 = require("../pages/exercise/page");
var page_4 = require("../pages/progress/page");
var page_5 = require("../pages/profile/page");
var page_6 = require("../pages/goals/page");
var routes = [
    {
        path: "/",
        element: <page_1.default />,
    },
    {
        path: "/nutrition",
        element: <page_2.default />,
    },
    {
        path: "/exercise",
        element: <page_3.default />,
    },
    {
        path: "/progress",
        element: <page_4.default />
    },
    {
        path: "/profile",
        element: <page_5.default />,
    },
    {
        path: "/goals",
        element: <page_6.default />,
    },
    {
        path: "*",
        element: <NotFound_1.default />,
    },
];
exports.default = routes;
