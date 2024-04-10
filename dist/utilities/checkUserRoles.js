"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserRoles = void 0;
var checkUserRoles = function (allRoles, user) {
    if (allRoles === void 0) { allRoles = []; }
    if (user === void 0) { user = undefined; }
    if (user) {
        if (allRoles.some(function (role) {
            var _a;
            return (_a = user === null || user === void 0 ? void 0 : user.roles) === null || _a === void 0 ? void 0 : _a.some(function (individualRole) {
                return individualRole === role;
            });
        }))
            return true;
    }
    return false;
};
exports.checkUserRoles = checkUserRoles;
//# sourceMappingURL=checkUserRoles.js.map