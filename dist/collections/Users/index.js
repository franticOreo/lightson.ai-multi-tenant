"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
var anyone_1 = require("../../access/anyone");
var superAdmins_1 = require("../../access/superAdmins");
var adminsAndSelf_1 = require("./access/adminsAndSelf");
var tenantAdmins_1 = require("./access/tenantAdmins");
var loginAfterCreate_1 = require("./hooks/loginAfterCreate");
var recordLastLoggedInTenant_1 = require("./hooks/recordLastLoggedInTenant");
var isSuperOrTenantAdmin_1 = require("./utilities/isSuperOrTenantAdmin");
exports.Users = {
    slug: 'users',
    auth: true,
    admin: {
        useAsTitle: 'email',
    },
    access: {
        read: adminsAndSelf_1.adminsAndSelf,
        create: anyone_1.anyone,
        update: adminsAndSelf_1.adminsAndSelf,
        delete: adminsAndSelf_1.adminsAndSelf,
        admin: isSuperOrTenantAdmin_1.isSuperOrTenantAdmin,
    },
    hooks: {
        afterChange: [loginAfterCreate_1.loginAfterCreate],
        afterLogin: [recordLastLoggedInTenant_1.recordLastLoggedInTenant],
    },
    fields: [
        {
            name: 'firstName',
            type: 'text',
        },
        {
            name: 'lastName',
            type: 'text',
        },
        {
            name: 'roles',
            type: 'select',
            hasMany: true,
            required: true,
            access: {
                create: superAdmins_1.superAdminFieldAccess,
                update: superAdmins_1.superAdminFieldAccess,
                read: superAdmins_1.superAdminFieldAccess,
            },
            options: [
                {
                    label: 'Super Admin',
                    value: 'super-admin',
                },
                {
                    label: 'User',
                    value: 'user',
                },
            ],
        },
        {
            name: 'tenants',
            type: 'array',
            label: 'Tenants',
            access: {
                create: tenantAdmins_1.tenantAdmins,
                update: tenantAdmins_1.tenantAdmins,
                read: tenantAdmins_1.tenantAdmins,
            },
            fields: [
                {
                    name: 'tenant',
                    type: 'relationship',
                    relationTo: 'tenants',
                    required: true,
                },
                {
                    name: 'roles',
                    type: 'select',
                    hasMany: true,
                    required: true,
                    options: [
                        {
                            label: 'Admin',
                            value: 'admin',
                        },
                        {
                            label: 'User',
                            value: 'user',
                        },
                    ],
                },
            ],
        },
        {
            name: 'lastLoggedInTenant',
            type: 'relationship',
            relationTo: 'tenants',
            index: true,
            access: {
                create: function () { return false; },
                read: tenantAdmins_1.tenantAdmins,
                update: superAdmins_1.superAdminFieldAccess,
            },
            admin: {
                position: 'sidebar',
            },
        },
    ],
};
//# sourceMappingURL=index.js.map