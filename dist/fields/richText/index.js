"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var richtext_slate_1 = require("@payloadcms/richtext-slate");
var deepMerge_1 = __importDefault(require("../../utilities/deepMerge"));
var link_1 = __importDefault(require("../link"));
var elements_1 = __importDefault(require("./elements"));
var leaves_1 = __importDefault(require("./leaves"));
var richText = function (overrides, additions) {
    if (additions === void 0) { additions = {
        elements: [],
        leaves: [],
    }; }
    return (0, deepMerge_1.default)({
        name: 'richText',
        type: 'richText',
        required: true,
        editor: (0, richtext_slate_1.slateEditor)({
            admin: {
                upload: {
                    collections: {
                        media: {
                            fields: [
                                {
                                    type: 'richText',
                                    name: 'caption',
                                    label: 'Caption',
                                    editor: (0, richtext_slate_1.slateEditor)({
                                        admin: {
                                            elements: __spreadArray([], elements_1.default, true),
                                            leaves: __spreadArray([], leaves_1.default, true),
                                        },
                                    }),
                                },
                                {
                                    type: 'radio',
                                    name: 'alignment',
                                    label: 'Alignment',
                                    options: [
                                        {
                                            label: 'Left',
                                            value: 'left',
                                        },
                                        {
                                            label: 'Center',
                                            value: 'center',
                                        },
                                        {
                                            label: 'Right',
                                            value: 'right',
                                        },
                                    ],
                                },
                                {
                                    name: 'enableLink',
                                    type: 'checkbox',
                                    label: 'Enable Link',
                                },
                                (0, link_1.default)({
                                    appearances: false,
                                    disableLabel: true,
                                    overrides: {
                                        admin: {
                                            condition: function (_, data) { return Boolean(data === null || data === void 0 ? void 0 : data.enableLink); },
                                        },
                                    },
                                }),
                            ],
                        },
                    },
                },
                elements: __spreadArray(__spreadArray([], elements_1.default, true), (additions.elements || []), true),
                leaves: __spreadArray(__spreadArray([], leaves_1.default, true), (additions.leaves || []), true),
            },
        }),
    }, overrides);
};
exports.default = richText;
//# sourceMappingURL=index.js.map