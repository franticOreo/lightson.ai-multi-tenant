"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenants = void 0;
var isSuperAdmin_1 = require("../../../utilities/isSuperAdmin");
var tenants = function (_a) {
    var _b, _c, _d, _e;
    var user = _a.req.user, data = _a.data;
    // individual documents
    return (((_b = data === null || data === void 0 ? void 0 : data.tenant) === null || _b === void 0 ? void 0 : _b.id) && ((_c = user === null || user === void 0 ? void 0 : user.lastLoggedInTenant) === null || _c === void 0 ? void 0 : _c.id) === data.tenant.id) ||
        (!((_d = user === null || user === void 0 ? void 0 : user.lastLoggedInTenant) === null || _d === void 0 ? void 0 : _d.id) && (0, isSuperAdmin_1.isSuperAdmin)(user)) || {
        // list of documents
        tenant: {
            equals: (_e = user === null || user === void 0 ? void 0 : user.lastLoggedInTenant) === null || _e === void 0 ? void 0 : _e.id,
        },
    };
};
exports.tenants = tenants;
//# sourceMappingURL=tenants.js.map