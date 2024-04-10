"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = void 0;
var checkUserRoles_1 = require("./checkUserRoles");
var isSuperAdmin = function (user) { return (0, checkUserRoles_1.checkUserRoles)(['super-admin'], user); };
exports.isSuperAdmin = isSuperAdmin;
//# sourceMappingURL=isSuperAdmin.js.map