"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminFieldAccess = exports.superAdmins = void 0;
var checkUserRoles_1 = require("../utilities/checkUserRoles");
var superAdmins = function (_a) {
    var user = _a.req.user;
    return (0, checkUserRoles_1.checkUserRoles)(['super-admin'], user);
};
exports.superAdmins = superAdmins;
var superAdminFieldAccess = function (_a) {
    var user = _a.req.user;
    return (0, checkUserRoles_1.checkUserRoles)(['super-admin'], user);
};
exports.superAdminFieldAccess = superAdminFieldAccess;
//# sourceMappingURL=superAdmins.js.map