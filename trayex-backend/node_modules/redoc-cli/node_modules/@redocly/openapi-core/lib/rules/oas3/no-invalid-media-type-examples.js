"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidContentExamples = void 0;
const ref_utils_1 = require("../../ref-utils");
const utils_1 = require("../utils");
const ValidContentExamples = (opts) => {
    var _a;
    const disallowAdditionalProperties = (_a = opts.disallowAdditionalProperties) !== null && _a !== void 0 ? _a : true;
    return {
        MediaType: {
            leave(mediaType, ctx) {
                const { location, resolve } = ctx;
                if (!mediaType.schema)
                    return;
                if (mediaType.example) {
                    resolveAndValidateExample(mediaType.example, location.child('example'));
                }
                else if (mediaType.examples) {
                    for (const exampleName of Object.keys(mediaType.examples)) {
                        resolveAndValidateExample(mediaType.examples[exampleName], location.child(['examples', exampleName, 'value']), true);
                    }
                }
                function resolveAndValidateExample(example, location, isMultiple) {
                    if (ref_utils_1.isRef(example)) {
                        const resolved = resolve(example);
                        if (!resolved.location)
                            return;
                        location = isMultiple ? resolved.location.child('value') : resolved.location;
                        example = resolved.node;
                    }
                    utils_1.validateExample(isMultiple ? example.value : example, mediaType.schema, location, ctx, disallowAdditionalProperties);
                }
            },
        },
    };
};
exports.ValidContentExamples = ValidContentExamples;
