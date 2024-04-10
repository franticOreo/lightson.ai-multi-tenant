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
exports.seed = void 0;
var seed = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, abc, bbc, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return __generator(this, function (_l) {
        switch (_l.label) {
            case 0: 
            // create super admin
            return [4 /*yield*/, payload.create({
                    collection: 'users',
                    data: {
                        email: 'demo@payloadcms.com',
                        password: 'demo',
                        roles: ['super-admin'],
                    },
                })
                // create tenants, use `*.localhost.com` so that accidentally forgotten changes the hosts file are acceptable
            ];
            case 1:
                // create super admin
                _l.sent();
                _c = (_b = Promise).all;
                return [4 /*yield*/, payload.create({
                        collection: 'tenants',
                        data: {
                            name: 'ABC',
                            domains: [{ domain: 'abc.localhost.com:3000' }],
                        },
                    })];
            case 2:
                _d = [
                    _l.sent()
                ];
                return [4 /*yield*/, payload.create({
                        collection: 'tenants',
                        data: {
                            name: 'BBC',
                            domains: [{ domain: 'bbc.localhost.com:3000' }],
                        },
                    })];
            case 3: return [4 /*yield*/, _c.apply(_b, [_d.concat([
                        _l.sent()
                    ])])
                // create tenant-scoped admins and users
            ];
            case 4:
                _a = _l.sent(), abc = _a[0], bbc = _a[1];
                _f = (_e = Promise).all;
                return [4 /*yield*/, payload.create({
                        collection: 'users',
                        data: {
                            email: 'admin@abc.com',
                            password: 'test',
                            roles: ['user'],
                            tenants: [
                                {
                                    tenant: abc.id,
                                    roles: ['admin'],
                                },
                            ],
                        },
                    })];
            case 5:
                _g = [
                    _l.sent()
                ];
                return [4 /*yield*/, payload.create({
                        collection: 'users',
                        data: {
                            email: 'user@abc.com',
                            password: 'test',
                            roles: ['user'],
                            tenants: [
                                {
                                    tenant: abc.id,
                                    roles: ['user'],
                                },
                            ],
                        },
                    })];
            case 6:
                _g = _g.concat([
                    _l.sent()
                ]);
                return [4 /*yield*/, payload.create({
                        collection: 'users',
                        data: {
                            email: 'admin@bbc.com',
                            password: 'test',
                            roles: ['user'],
                            tenants: [
                                {
                                    tenant: bbc.id,
                                    roles: ['admin'],
                                },
                            ],
                        },
                    })];
            case 7:
                _g = _g.concat([
                    _l.sent()
                ]);
                return [4 /*yield*/, payload.create({
                        collection: 'users',
                        data: {
                            email: 'user@bbc.com',
                            password: 'test',
                            roles: ['user'],
                            tenants: [
                                {
                                    tenant: bbc.id,
                                    roles: ['user'],
                                },
                            ],
                        },
                    })];
            case 8: 
            // create tenant-scoped admins and users
            return [4 /*yield*/, _f.apply(_e, [_g.concat([
                        _l.sent()
                    ])])
                // create tenant-scoped pages
            ];
            case 9:
                // create tenant-scoped admins and users
                _l.sent();
                _j = (_h = Promise).all;
                return [4 /*yield*/, payload.create({
                        collection: 'pages',
                        data: {
                            tenant: abc.id,
                            title: 'ABC Home',
                            richText: [
                                {
                                    text: 'Hello, ABC!',
                                },
                            ],
                        },
                    })];
            case 10:
                _k = [
                    _l.sent()
                ];
                return [4 /*yield*/, payload.create({
                        collection: 'pages',
                        data: {
                            title: 'BBC Home',
                            tenant: bbc.id,
                            richText: [
                                {
                                    text: 'Hello, BBC!',
                                },
                            ],
                        },
                    })];
            case 11: 
            // create tenant-scoped pages
            return [4 /*yield*/, _j.apply(_h, [_k.concat([
                        _l.sent()
                    ])])];
            case 12:
                // create tenant-scoped pages
                _l.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.seed = seed;
//# sourceMappingURL=index.js.map