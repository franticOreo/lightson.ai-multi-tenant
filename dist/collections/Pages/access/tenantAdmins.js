"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantAdmins = void 0;
var checkUserRoles_1 = require("../../../utilities/checkUserRoles");
// the user must be an admin of the document's tenant
var tenantAdmins = function (_a) {
    var _b;
    var user = _a.req.user;
    if ((0, checkUserRoles_1.checkUserRoles)(['super-admin'], user)) {
        return true;
    }
    return {
        tenant: {
            in: ((_b = user === null || user === void 0 ? void 0 : user.tenants) === null || _b === void 0 ? void 0 : _b.map(function (_a) {
                var tenant = _a.tenant, roles = _a.roles;
                return roles.includes('admin') ? (typeof tenant === 'string' ? tenant : tenant.id) : null;
            }).filter(Boolean)) || [],
        },
    };
};
exports.tenantAdmins = tenantAdmins;
//# sourceMappingURL=tenantAdmins.js.map