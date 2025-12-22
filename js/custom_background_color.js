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
function openColorPicker(items, colorProp, initialColor, title, hideReset, onUpdate, applyToHeader = false) {
    const originalColors = items.map(item => ({ 
        item, 
        bgcolor: item.bgcolor || null,
        color: item.color || null
    }));
    
    // Use existing header color if available, otherwise use initialColor
    const startColor = applyToHeader ? (items[0].color || items[0].bgcolor || initialColor) : (items[0][colorProp] || initialColor);
    
    new LovelyColorPicker(
        startColor,
        (newHex) => {
            items.forEach(item => {
                item[colorProp] = newHex;
                if (applyToHeader) {
                    item.color = newHex;
                }
            });
            onUpdate();
        },
        title,
        hideReset,
        () => {
            originalColors.forEach(({ item, bgcolor, color }) => {
                if (bgcolor !== null) item.bgcolor = bgcolor;
                else delete item.bgcolor;
                
                if (color !== null) item.color = color;
                else delete item.color;
            });
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
                    () => canvas.setDirty(true, true),
                    true  // Apply to header as well
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