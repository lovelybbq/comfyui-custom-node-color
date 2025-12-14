// js/custom_background_color.js
import { app } from "../../scripts/app.js";
import { LovelyColorPicker } from "./lovely_color_picker.js";

// ============================================================================
// CONSTANTS
// ============================================================================
const DEFAULT_NODE_COLOR = "#000000";
const DEFAULT_GROUP_COLOR = "#a4a4a4";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Opens color picker for nodes or groups
 */
function openColorPicker(items, colorProp, initialColor, title, hideReset, onUpdate) {
    const originalColors = items.map(item => ({ item, color: item[colorProp] || initialColor }));
    
    new LovelyColorPicker(
        items[0][colorProp] || initialColor,
        (newHex) => {
            items.forEach(item => item[colorProp] = newHex);
            onUpdate();
        },
        title,
        hideReset,
        () => {
            originalColors.forEach(({ item, color }) => item[colorProp] = color);
            onUpdate();
        }
    );
}

// ============================================================================
// EXTENSION REGISTRATION
// ============================================================================

app.registerExtension({
    name: "Comfy.LovelyBBQ.ContextMenu",
    async setup() {
        // Node color menu
        const origNodeOptions = LGraphCanvas.prototype.getNodeMenuOptions;
        LGraphCanvas.prototype.getNodeMenuOptions = function(node) {
            const opts = origNodeOptions.apply(this, arguments);
            const canvas = this;
            const nodes = (canvas.selected_nodes?.[node.id]) 
                ? Object.values(canvas.selected_nodes) 
                : [node];

            opts.push(null);
            opts.push({
                content: nodes.length > 1 ? `Custom Node Color (${nodes.length})` : "Custom Node Color",
                callback: () => openColorPicker(
                    nodes,
                    "bgcolor",
                    DEFAULT_NODE_COLOR,
                    nodes.length > 1 ? `Custom Color (${nodes.length})` : "Custom Node Color",
                    nodes.length > 1,
                    () => canvas.setDirty(true, true)
                )
            });
            return opts;
        };

        // Group color menu
        const origGroupOptions = LGraphGroup.prototype.getMenuOptions;
        LGraphGroup.prototype.getMenuOptions = function(graphCanvas) {
            const opts = origGroupOptions?.apply(this, arguments) || [];
            const group = this;
            const canvas = graphCanvas || app.canvas;

            opts.push(null);
            opts.push({
                content: "Custom Group Color",
                callback: () => openColorPicker(
                    [group],
                    "color",
                    DEFAULT_GROUP_COLOR,
                    "Custom Group Color",
                    false,
                    () => {
                        canvas?.setDirty(true, true);
                        app.graph.setDirtyCanvas(true, true);
                    }
                )
            });
            return opts;
        };
    }
});