"use strict";

const fs = require("fs");
const path = require("path");

const bundlePath = path.resolve(__dirname, "..", "l10n", "bundle.l10n.json");
let l10nKeys = new Set();

try {
    const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
    l10nKeys = new Set(Object.keys(bundle));
} catch {
    // Bundle not yet generated; rule becomes a no-op until `npm run l10n:export` runs.
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description: "Disallow equality comparisons against known translatable string literals",
        },
        messages: {
            noLiteralComparison:
                "Comparing against translatable string '{{value}}' by its English value. " +
                "Use object reference comparison or call l10n.t() consistently.",
        },
    },
    create(context) {
        if (l10nKeys.size === 0) {
            return {};
        }

        return {
            BinaryExpression(node) {
                if (node.operator !== "===" && node.operator !== "!==") {
                    return;
                }

                for (const operand of [node.left, node.right]) {
                    if (
                        operand.type === "Literal" &&
                        typeof operand.value === "string" &&
                        l10nKeys.has(operand.value)
                    ) {
                        context.report({
                            node: operand,
                            messageId: "noLiteralComparison",
                            data: { value: operand.value },
                        });
                    }
                }
            },
        };
    },
};
