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
    // Save only the properties we're going to modify
    const originalColors = items.map(item => {
        const originalState = { 
            item, 
            [colorProp]: item[colorProp] !== undefined ? item[colorProp] : null
        };
        if (applyToHeader) {
            originalState.headerColor = item.color !== undefined ? item.color : null;
        }
        return originalState;
    });
    
    // Use existing color from node's colorProp, otherwise use initialColor
    const startColor = items[0][colorProp] ?? initialColor;
    
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
            // Restore only the properties we modified
            originalColors.forEach((originalState) => {
                const { item } = originalState;
                const savedColor = originalState[colorProp];
                
                if (savedColor !== null) item[colorProp] = savedColor;
                else delete item[colorProp];
                
                if (applyToHeader) {
                    if (originalState.headerColor !== null) item.color = originalState.headerColor;
                    else delete item.color;
                }
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
        // Prevent multiple registrations
        if (LGraphCanvas.prototype._customNodeColorPatched) {
            return;
        }
        
        // Node color menu
        const origNodeOptions = LGraphCanvas.prototype.getNodeMenuOptions;
        LGraphCanvas.prototype.getNodeMenuOptions = function(node) {
            const opts = origNodeOptions?.apply(this, arguments) || [];
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
        
        // Mark as patched at the very end
        LGraphCanvas.prototype._customNodeColorPatched = true;
    }
});