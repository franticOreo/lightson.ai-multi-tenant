"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastLoggedInTenant = void 0;
var lastLoggedInTenant = function (_a) {
    var _b;
    var user = _a.req.user, data = _a.data;
    return ((_b = user === null || user === void 0 ? void 0 : user.lastLoggedInTenant) === null || _b === void 0 ? void 0 : _b.id) === (data === null || data === void 0 ? void 0 : data.id);
};
exports.lastLoggedInTenant = lastLoggedInTenant;
//# sourceMappingURL=lastLoggedInTenant.js.map