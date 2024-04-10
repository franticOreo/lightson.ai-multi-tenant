"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggedIn = void 0;
var loggedIn = function (_a) {
    var user = _a.req.user;
    return Boolean(user);
};
exports.loggedIn = loggedIn;
//# sourceMappingURL=loggedIn.js.map