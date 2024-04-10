"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantAdmins = void 0;
var checkUserRoles_1 = require("../../../utilities/checkUserRoles");
var checkTenantRoles_1 = require("../utilities/checkTenantRoles");
var tenantAdmins = function (args) {
    var _a;
    var user = args.req.user, doc = args.doc;
    return ((0, checkUserRoles_1.checkUserRoles)(['super-admin'], user) ||
        ((_a = doc === null || doc === void 0 ? void 0 : doc.tenants) === null || _a === void 0 ? void 0 : _a.some(function (_a) {
            var tenant = _a.tenant;
            var id = typeof tenant === 'string' ? tenant : tenant === null || tenant === void 0 ? void 0 : tenant.id;
            return (0, checkTenantRoles_1.checkTenantRoles)(['admin'], user, id);
        })));
};
exports.tenantAdmins = tenantAdmins;
//# sourceMappingURL=tenantAdmins.js.map