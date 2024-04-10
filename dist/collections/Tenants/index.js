"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenants = void 0;
var superAdmins_1 = require("../../access/superAdmins");
var tenantAdmins_1 = require("./access/tenantAdmins");
exports.Tenants = {
    slug: 'tenants',
    access: {
        create: superAdmins_1.superAdmins,
        read: tenantAdmins_1.tenantAdmins,
        update: tenantAdmins_1.tenantAdmins,
        delete: superAdmins_1.superAdmins,
    },
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'domains',
            type: 'array',
            index: true,
            fields: [
                {
                    name: 'domain',
                    type: 'text',
                    required: true,
                },
            ],
        },
    ],
};
//# sourceMappingURL=index.js.map