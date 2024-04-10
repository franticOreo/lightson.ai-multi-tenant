"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantAdmins = void 0;
var isSuperAdmin_1 = require("../../../utilities/isSuperAdmin");
// the user must be an admin of the tenant being accessed
var tenantAdmins = function (_a) {
    var _b;
    var user = _a.req.user;
    if ((0, isSuperAdmin_1.isSuperAdmin)(user)) {
        return true;
    }
    return {
        id: {
            in: ((_b = user === null || user === void 0 ? void 0 : user.tenants) === null || _b === void 0 ? void 0 : _b.map(function (_a) {
                var tenant = _a.tenant, roles = _a.roles;
                return roles.includes('admin') ? (typeof tenant === 'string' ? tenant : tenant.id) : null;
            }).filter(Boolean)) || [],
        },
    };
};
exports.tenantAdmins = tenantAdmins;
//# sourceMappingURL=tenantAdmins.js.map