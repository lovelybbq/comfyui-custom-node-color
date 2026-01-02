// js/custom_background_color.js
import { app } from "../../scripts/app.js";
import { LovelyColorPicker } from "./lovely_color_picker.js";

// ============================================================================
// CONSTANTS
// ============================================================================
const DEFAULT_NODE_COLOR = "#000000";
const DEFAULT_GROUP_COLOR = "#a4a4a4";
const HEADER_DARKEN_AMOUNT = 0.25; // 25% darker

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex, amount) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - amount)));
    const g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - amount)));
    const b = Math.max(0, Math.floor((num & 255) * (1 - amount)));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Check if header is darker than bgcolor (to detect darker header mode)
 */
function isDarkerHeader(item) {
    if (!item.color || !item.bgcolor) return false;
    const headerHex = item.color.replace('#', '');
    const bgHex = item.bgcolor.replace('#', '');
    if (headerHex.length < 6 || bgHex.length < 6) return false;
    const headerNum = parseInt(headerHex, 16);
    const bgNum = parseInt(bgHex, 16);
    const headerBrightness = ((headerNum >> 16) & 255) + ((headerNum >> 8) & 255) + (headerNum & 255);
    const bgBrightness = ((bgNum >> 16) & 255) + ((bgNum >> 8) & 255) + (bgNum & 255);
    return headerBrightness < bgBrightness - 30; // threshold to detect darker header
}

/**
 * Opens color picker for nodes or groups
 */
function openColorPicker(items, colorProp, initialColor, title, hideReset, onUpdate, applyToHeader = false, enableShape = false) {
    // Track darker header state
    let darkerHeaderEnabled = enableShape && items.length > 0 && isDarkerHeader(items[0]);
    
    // Save only the properties we're going to modify
    const originalColors = items.map(item => {
        const originalState = { 
            item, 
            [colorProp]: item[colorProp] !== undefined ? item[colorProp] : null
        };
        if (applyToHeader) {
            originalState.headerColor = item.color !== undefined ? item.color : null;
        }
        if (enableShape) {
            originalState.shape = item.shape !== undefined ? item.shape : null;
        }
        return originalState;
    });
    
    // Use existing color from node's colorProp, otherwise use initialColor
    const startColor = items[0][colorProp] ?? initialColor;
    
    // Shape config (only for nodes)
    const shapeConfig = enableShape ? {
        initialShapes: items.map(item => item.shape ?? null),
        initialDarkerHeader: darkerHeaderEnabled,
        onShapeChange: (shapeValue) => {
            items.forEach(item => {
                item.shape = shapeValue;
            });
            onUpdate();
        },
        onHeaderStyleChange: (isDarker, currentHex) => {
            darkerHeaderEnabled = isDarker;
            items.forEach(item => {
                if (isDarker) {
                    item.color = darkenColor(currentHex, HEADER_DARKEN_AMOUNT);
                } else {
                    item.color = currentHex;
                }
            });
            onUpdate();
        }
    } : null;
    
    new LovelyColorPicker(
        startColor,
        (newHex) => {
            items.forEach(item => {
                item[colorProp] = newHex;
                if (applyToHeader) {
                    if (darkerHeaderEnabled) {
                        item.color = darkenColor(newHex, HEADER_DARKEN_AMOUNT);
                    } else {
                        item.color = newHex;
                    }
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
                
                if (enableShape) {
                    if (originalState.shape !== null) item.shape = originalState.shape;
                    else delete item.shape;
                }
            });
            onUpdate();
        },
        shapeConfig
    );
}

// ============================================================================
// EXTENSION REGISTRATION
// ============================================================================

app.registerExtension({
    name: "Comfy.LovelyBBQ.ContextMenu",
    
    async setup() {
        // Group color menu - still uses old approach (no new API for groups yet)
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
    },
    
    // Use getNodeMenuItems hook for node context menu
    getNodeMenuItems(node) {
        const canvas = app.canvas;
        const nodes = (canvas.selected_nodes?.[node.id]) 
            ? Object.values(canvas.selected_nodes) 
            : [node];

        return [
            null, // separator
            {
                content: nodes.length > 1 ? `Custom Node Color (${nodes.length})` : "Custom Node Color",
                callback: () => openColorPicker(
                    nodes,
                    "bgcolor",
                    DEFAULT_NODE_COLOR,
                    nodes.length > 1 ? `Custom Color (${nodes.length})` : "Custom Node Color",
                    nodes.length > 1,
                    () => canvas.setDirty(true, true),
                    true,  // Apply to header as well
                    true   // Enable shape selector
                )
            }
        ];
    },

    // Commands for keyboard shortcuts
    commands: [
        {
            id: "customColor",
            label: "Custom Color",
            function: () => {
                const canvas = app.canvas;
                const graph = app.graph;
                
                // Check for selected nodes first (priority over groups)
                const selectedNodes = canvas.selected_nodes ? Object.values(canvas.selected_nodes) : [];
                if (selectedNodes.length > 0) {
                    openColorPicker(
                        selectedNodes,
                        "bgcolor",
                        DEFAULT_NODE_COLOR,
                        selectedNodes.length > 1 ? `Custom Color (${selectedNodes.length})` : "Custom Node Color",
                        selectedNodes.length > 1,
                        () => canvas.setDirty(true, true),
                        true,  // Apply to header as well
                        true   // Enable shape selector
                    );
                    return;
                }
                
                // If no nodes selected, check for selected group
                let selectedGroup = null;
                if (graph._groups && graph._groups.length > 0) {
                    selectedGroup = graph._groups.find(g => g._selected || g.selected);
                }
                
                if (selectedGroup) {
                    openColorPicker(
                        [selectedGroup],
                        "color",
                        DEFAULT_GROUP_COLOR,
                        "Custom Group Color",
                        false,
                        () => {
                            canvas?.setDirty(true, true);
                            graph.setDirtyCanvas(true, true);
                        }
                    );
                }
            }
        }
    ],

    // Keybindings
    keybindings: [
        {
            combo: { key: "c" },
            commandId: "customColor"
        }
    ]
});