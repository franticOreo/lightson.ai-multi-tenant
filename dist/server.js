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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
var next_1 = __importDefault(require("next"));
var build_1 = __importDefault(require("next/dist/build"));
var path_1 = __importDefault(require("path"));
var uploadPostsToPayload_1 = require("./utils/uploadPostsToPayload"); // Adjust the import path as necessary
var tenantUserManagement_1 = require("./utils/tenantUserManagement");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
console.log("Server is running");
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../.env'),
});
var express_1 = __importDefault(require("express"));
var payload_1 = __importDefault(require("payload"));
var seed_1 = require("./payload/seed");
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.post('/api/signup', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, client_password, client_name, client_business_name, client_phone_number, client_email, client_service_area, client_business_address, client_operating_hours, createdUser, userToken, state, instagramAuthUrl, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, client_password = _a.client_password, client_name = _a.client_name, client_business_name = _a.client_business_name, client_phone_number = _a.client_phone_number, client_email = _a.client_email, client_service_area = _a.client_service_area, client_business_address = _a.client_business_address, client_operating_hours = _a.client_operating_hours;
                console.log(req.body);
                return [4 /*yield*/, (0, tenantUserManagement_1.createUser)(client_email, client_password)];
            case 1:
                createdUser = _b.sent();
                userToken = jsonwebtoken_1.default.sign({
                    client_name: client_name,
                    client_user_id: createdUser.id,
                    client_business_name: client_business_name,
                    client_phone_number: client_phone_number,
                    client_email: client_email,
                    client_service_area: client_service_area,
                    client_business_address: client_business_address,
                    client_operating_hours: client_operating_hours,
                }, process.env.JWT_SECRET, { expiresIn: '1h' });
                state = encodeURIComponent(JSON.stringify({ userToken: userToken }));
                instagramAuthUrl = "https://api.instagram.com/oauth/authorize?client_id=".concat(process.env.INSTAGRAM_CLIENT_ID, "&redirect_uri=").concat(encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI), "&scope=user_profile,user_media&response_type=code&state=").concat(state);
                res.redirect(instagramAuthUrl);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('Signup error:', error_1);
                res.status(500).send({ error: 'Signup failed' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/instagram/callback', uploadPostsToPayload_1.handleInstagramCallback);
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var server_1, nextApp, nextHandler;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, payload_1.default.init({
                    secret: process.env.PAYLOAD_SECRET || '',
                    express: app,
                    onInit: function () {
                        payload_1.default.logger.info("Payload Admin URL: ".concat(payload_1.default.getAdminURL()));
                    },
                })];
            case 1:
                _a.sent();
                if (!(process.env.PAYLOAD_SEED === 'true')) return [3 /*break*/, 3];
                payload_1.default.logger.info('---- SEEDING DATABASE ----');
                return [4 /*yield*/, (0, seed_1.seed)(payload_1.default)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                app.use('/assets/', express_1.default.static(path_1.default.resolve(__dirname, './payload/assets')));
                if (process.env.NEXT_BUILD) {
                    console.log('NEXT_BUILD is', process.env.NEXT_BUILD);
                    server_1 = app.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    payload_1.default.logger.info("Next.js is now building...");
                                    // @ts-expect-error
                                    return [4 /*yield*/, (0, build_1.default)(path_1.default.join(__dirname, '../'))];
                                case 1:
                                    // @ts-expect-error
                                    _a.sent();
                                    process.exit();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Graceful shutdown
                    process.on('SIGINT', function () {
                        console.log('SIGINT signal received: closing HTTP server');
                        server_1.close(function () {
                            console.log('HTTP server closed');
                            process.exit(0);
                        });
                    });
                    process.on('SIGTERM', function () {
                        console.log('SIGTERM signal received: closing HTTP server');
                        server_1.close(function () {
                            console.log('HTTP server closed');
                            process.exit(0);
                        });
                    });
                    return [2 /*return*/];
                }
                app.use(function (req, res, next) {
                    console.log("Incoming request: ".concat(req.method, " ").concat(req.url));
                    next();
                });
                app.use(function (req, res, next) {
                    res.on('finish', function () {
                        console.log("Request to ".concat(req.method, " ").concat(req.url, " sent response ").concat(res.statusCode));
                    });
                    next();
                });
                nextApp = (0, next_1.default)({
                    dev: process.env.NODE_ENV !== 'production',
                });
                nextHandler = nextApp.getRequestHandler();
                app.use(function (req, res) { return nextHandler(req, res); });
                nextApp.prepare().then(function () {
                    payload_1.default.logger.info('Starting Next.js...');
                    app.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            payload_1.default.logger.info("Next.js App URL: ".concat(process.env.PAYLOAD_PUBLIC_SERVER_URL));
                            return [2 /*return*/];
                        });
                    }); });
                });
                return [2 /*return*/];
        }
    });
}); };
start();
