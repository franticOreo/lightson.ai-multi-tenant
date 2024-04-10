"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTenantRoles = void 0;
var checkTenantRoles = function (allRoles, user, tenant) {
    if (allRoles === void 0) { allRoles = []; }
    if (user === void 0) { user = undefined; }
    if (tenant === void 0) { tenant = undefined; }
    if (tenant) {
        var id_1 = typeof tenant === 'string' ? tenant : tenant === null || tenant === void 0 ? void 0 : tenant.id;
        if (allRoles.some(function (role) {
            var _a;
            return (_a = user === null || user === void 0 ? void 0 : user.tenants) === null || _a === void 0 ? void 0 : _a.some(function (_a) {
                var userTenant = _a.tenant, roles = _a.roles;
                var tenantID = typeof userTenant === 'string' ? userTenant : userTenant === null || userTenant === void 0 ? void 0 : userTenant.id;
                return tenantID === id_1 && (roles === null || roles === void 0 ? void 0 : roles.includes(role));
            });
        }))
            return true;
    }
    return false;
};
exports.checkTenantRoles = checkTenantRoles;
//# sourceMappingURL=checkTenantRoles.js.map