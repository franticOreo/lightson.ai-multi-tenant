"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bundler_webpack_1 = require("@payloadcms/bundler-webpack");
var db_mongodb_1 = require("@payloadcms/db-mongodb");
var richtext_slate_1 = require("@payloadcms/richtext-slate");
var dotenv_1 = __importDefault(require("dotenv"));
var path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../.env'),
});
var config_1 = require("payload/config");
var Pages_1 = require("./collections/Pages");
var Tenants_1 = require("./collections/Tenants");
var Users_1 = require("./collections/Users");
var Media_1 = require("./collections/Media");
exports.default = (0, config_1.buildConfig)({
    collections: [Users_1.Users, Tenants_1.Tenants, Pages_1.Pages, Media_1.Media],
    admin: {
        bundler: (0, bundler_webpack_1.webpackBundler)(),
        webpack: function (config) { return (__assign(__assign({}, config), { resolve: __assign(__assign({}, config.resolve), { alias: __assign(__assign({}, config.resolve.alias), { dotenv: path_1.default.resolve(__dirname, './dotenv.js') }) }) })); },
    },
    editor: (0, richtext_slate_1.slateEditor)({}),
    db: (0, db_mongodb_1.mongooseAdapter)({
        url: process.env.DATABASE_URI,
    }),
    typescript: {
        outputFile: path_1.default.resolve(__dirname, 'payload-types.ts'),
    },
});
//# sourceMappingURL=payload.config.js.map