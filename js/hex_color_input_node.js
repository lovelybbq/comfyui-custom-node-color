import { app } from "../../scripts/app.js";
import { LovelyColorPicker } from "./lovely_color_picker.js";

// ============================================================================
// DESIGN CONFIGURATION
// ============================================================================
const DESIGN_CONFIG = {
    ELEMENT_HEIGHT: 22,
    SPACING: 6,
    MARGIN_X: 10,
    RADIUS: 4,
};
DESIGN_CONFIG.TOTAL_HEIGHT = DESIGN_CONFIG.ELEMENT_HEIGHT + DESIGN_CONFIG.SPACING;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates and normalizes hex color input
 */
function validateHexColor(value) {
    let clean = (value || "").replace(/[^0-9a-fA-F]/g, "");
    if (clean.length === 0) clean = "000000";
    else if (clean.length > 6) clean = clean.substring(0, 6);
    return "#" + clean.toUpperCase();
}

/**
 * Draws standardized widget element with background, border, and optional text
 */
function drawWidget(ctx, y, widgetWidth, color, text, isInput) {
    const { ELEMENT_HEIGHT, SPACING, MARGIN_X, RADIUS } = DESIGN_CONFIG;
    const drawWidth = widgetWidth - (MARGIN_X * 2);
    const drawY = y + SPACING;

    // Background
    ctx.fillStyle = (color && typeof color === 'object') ? color : (color || "#222");
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(MARGIN_X, drawY, drawWidth, ELEMENT_HEIGHT, RADIUS);
    } else {
        ctx.rect(MARGIN_X, drawY, drawWidth, ELEMENT_HEIGHT);
    }
    ctx.fill();

    // Border
    ctx.strokeStyle = isInput ? "#555" : "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Text
    if (text != null) {
        ctx.fillStyle = "#fff";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, widgetWidth / 2, drawY + (ELEMENT_HEIGHT / 2));
    }
}

// ============================================================================
// EXTENSION REGISTRATION
// ============================================================================

app.registerExtension({
    name: "Comfy.LovelyBBQ.HexNode",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== "HexColorInput") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            // Ensure widgets array exists
            if (!this.widgets) this.widgets = [];

            const inputWidget = this.widgets.find((w) => w.name === "hex_color");
            if (!inputWidget) return result;

            const { TOTAL_HEIGHT } = DESIGN_CONFIG;
            const node = this;

            // ============================================================
            // INPUT WIDGET SETUP
            // ============================================================
            inputWidget.type = "label";

            const originalCallback = inputWidget.callback;
            inputWidget.callback = function (value) {
                this.value = validateHexColor(value);
                if (typeof originalCallback === 'function') {
                    originalCallback.call(this, this.value);
                }
                if (this.parent) this.parent.setDirtyCanvas(true);
            };

            inputWidget.mouse = function (event, pos) {
                if (event.type === 'pointerdown') {
                    const editWidget = Object.assign({}, inputWidget);
                    editWidget.type = "text";
                    if (app.canvas?.showEditWidget) {
                        app.canvas.showEditWidget(editWidget);
                    }
                }
                return true;
            };

            inputWidget.computeSize = function (width) {
                return [width, TOTAL_HEIGHT];
            };

            inputWidget.draw = function (ctx, node, widgetWidth, y) {
                const displayValue = (this.value || "#000000").toUpperCase();
                drawWidget(ctx, y, widgetWidth, "#222", displayValue, true);
            };

            // ============================================================
            // PREVIEW WIDGET
            // ============================================================
            const previewWidget = {
                name: "hex_preview",
                type: "HTML",
                get value() {
                    return inputWidget.value;
                },
                set value(v) { },
                computeSize: function (width) {
                    return [width, TOTAL_HEIGHT];
                },
                draw: function (ctx, node, widgetWidth, y) {
                    if (typeof y !== 'number') return;
                    const hex = inputWidget.value || "#000000";
                    drawWidget(ctx, y, widgetWidth, hex, null, false);
                }
            };

            if (!node.widgets.find(w => w.name === "hex_preview")) {
                node.widgets.push(previewWidget);
            }

            // ============================================================
            // COLOR PICKER BUTTON
            // ============================================================
            const buttonWidget = {
                name: "pick_color_custom",
                type: "HTML",
                label: "Pick Color",
                computeSize: function (width) {
                    return [width, TOTAL_HEIGHT];
                },
                draw: function (ctx, node, widgetWidth, y) {
                    if (typeof y !== 'number') return;

                    const { ELEMENT_HEIGHT, SPACING, MARGIN_X } = DESIGN_CONFIG;
                    const drawY = y + SPACING;
                    const grad = ctx.createLinearGradient(MARGIN_X, drawY, MARGIN_X, drawY + ELEMENT_HEIGHT);
                    grad.addColorStop(0, "#444");
                    grad.addColorStop(1, "#333");

                    drawWidget(ctx, y, widgetWidth, grad, "Pick Color", false);
                },
                mouse: function (event) {
                    if (event.type === "pointerdown") {
                        try {
                            const currentColor = inputWidget.value || "#000000";
                            new LovelyColorPicker(
                                currentColor,
                                (newHex) => {
                                    if (typeof inputWidget.callback === 'function') {
                                        inputWidget.callback(newHex);
                                    }
                                    node.setDirtyCanvas(true);
                                },
                                "Pick Hex Color"
                            );
                        } catch (e) {
                            console.error("Error opening Color Picker:", e);
                        }
                    }
                    return true;
                }
            };

            if (!node.widgets.find(w => w.name === "pick_color_custom")) {
                node.widgets.push(buttonWidget);
            }

            // ============================================================
            // RESIZE NODE
            // ============================================================
            if (node.size) {
                node.setSize([node.size[0], TOTAL_HEIGHT * 3 + 40]);
            }

            return result;
        };
    }
});