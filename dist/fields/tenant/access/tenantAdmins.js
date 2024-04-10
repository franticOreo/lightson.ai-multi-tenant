"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantAdminFieldAccess = void 0;
var checkUserRoles_1 = require("../../../utilities/checkUserRoles");
var tenantAdminFieldAccess = function (_a) {
    var _b;
    var user = _a.req.user, doc = _a.doc;
    return ((0, checkUserRoles_1.checkUserRoles)(['super-admin'], user) ||
        !(doc === null || doc === void 0 ? void 0 : doc.tenant) ||
        ((doc === null || doc === void 0 ? void 0 : doc.tenant) &&
            ((_b = user === null || user === void 0 ? void 0 : user.tenants) === null || _b === void 0 ? void 0 : _b.some(function (_a) {
                var userTenant = _a.tenant, roles = _a.roles;
                return (typeof (doc === null || doc === void 0 ? void 0 : doc.tenant) === 'string' ? doc === null || doc === void 0 ? void 0 : doc.tenant : doc === null || doc === void 0 ? void 0 : doc.tenant.id) === (userTenant === null || userTenant === void 0 ? void 0 : userTenant.id) &&
                    (roles === null || roles === void 0 ? void 0 : roles.includes('admin'));
            }))));
};
exports.tenantAdminFieldAccess = tenantAdminFieldAccess;
//# sourceMappingURL=tenantAdmins.js.map