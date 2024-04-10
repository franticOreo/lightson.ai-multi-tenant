"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaBlock = void 0;
// import { invertBackground } from '../../fields/invertBackground'
exports.MediaBlock = {
    slug: 'mediaBlock',
    fields: [
        // invertBackground,
        {
            name: 'position',
            type: 'select',
            defaultValue: 'default',
            options: [
                {
                    label: 'Default',
                    value: 'default',
                },
                {
                    label: 'Fullscreen',
                    value: 'fullscreen',
                },
            ],
        },
        {
            name: 'media',
            type: 'upload',
            relationTo: 'media',
            required: true,
        },
    ],
};
//# sourceMappingURL=index.js.map