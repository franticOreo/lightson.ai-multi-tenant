"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperOrTenantAdmin = void 0;
var isSuperAdmin_1 = require("../../../utilities/isSuperAdmin");
var logs = false;
var isSuperOrTenantAdmin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var req, _a, user, payload, msg, foundTenants, msg, msg, tenantWithUser, msg, msg;
    var _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                req = args.req, _a = args.req, user = _a.user, payload = _a.payload;
                // always allow super admins through
                if ((0, isSuperAdmin_1.isSuperAdmin)(user)) {
                    return [2 /*return*/, true];
                }
                if (logs) {
                    msg = "Finding tenant with host: '".concat(req.headers.host, "'");
                    payload.logger.info({ msg: msg });
                }
                return [4 /*yield*/, payload.find({
                        collection: 'tenants',
                        where: {
                            'domains.domain': {
                                in: [req.headers.host],
                            },
                        },
                        depth: 0,
                        limit: 1,
                        req: req,
                    })
                    // if this tenant does not exist, deny access
                ];
            case 1:
                foundTenants = _f.sent();
                // if this tenant does not exist, deny access
                if (foundTenants.totalDocs === 0) {
                    if (logs) {
                        msg = "No tenant found for ".concat(req.headers.host);
                        payload.logger.info({ msg: msg });
                    }
                    return [2 /*return*/, false];
                }
                if (logs) {
                    msg = "Found tenant: '".concat((_c = (_b = foundTenants.docs) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.name, "', checking if user is an tenant admin");
                    payload.logger.info({ msg: msg });
                }
                tenantWithUser = (_d = user === null || user === void 0 ? void 0 : user.tenants) === null || _d === void 0 ? void 0 : _d.find(function (_a) {
                    var userTenant = _a.tenant;
                    return (userTenant === null || userTenant === void 0 ? void 0 : userTenant.id) === foundTenants.docs[0].id;
                });
                if ((_e = tenantWithUser === null || tenantWithUser === void 0 ? void 0 : tenantWithUser.roles) === null || _e === void 0 ? void 0 : _e.some(function (role) { return role === 'admin'; })) {
                    if (logs) {
                        msg = "User is an admin of ".concat(foundTenants.docs[0].name, ", allowing access");
                        payload.logger.info({ msg: msg });
                    }
                    return [2 /*return*/, true];
                }
                if (logs) {
                    msg = "User is not an admin of ".concat(foundTenants.docs[0].name, ", denying access");
                    payload.logger.info({ msg: msg });
                }
                return [2 /*return*/, false];
        }
    });
}); };
exports.isSuperOrTenantAdmin = isSuperOrTenantAdmin;
//# sourceMappingURL=isSuperOrTenantAdmin.js.map