// js/custom_background_color.js
import { app } from "../../scripts/app.js";
import { LovelyColorPicker } from "./lovely_color_picker.js";

app.registerExtension({
    name: "Comfy.LovelyBBQ.NodeContextMenu",
    async setup() {
        const origOptions = LGraphCanvas.prototype.getNodeMenuOptions;
        LGraphCanvas.prototype.getNodeMenuOptions = function(node) {
            const opts = origOptions.apply(this, arguments);
            const canvas = this;
            const nodes = (canvas.selected_nodes && canvas.selected_nodes[node.id]) 
                ? Object.values(canvas.selected_nodes) : [node];

            opts.push(null);
            opts.push({
                content: "Custom Node Color",
                callback: () => {
                    // Close any existing picker logic if needed, though class handles it
                    
                    // Initial color from the primary node
                    const initialColor = node.bgcolor || "#000000";
                    
                    new LovelyColorPicker(
                        initialColor, 
                        (newHex) => {
                            // LOGIC: Apply color to all selected nodes
                            nodes.forEach(n => n.bgcolor = newHex);
                            canvas.setDirty(true, true);
                        },
                        nodes.length > 1 ? `Custom Color (${nodes.length})` : "Custom Node Color"
                    );
                }
            });
            return opts;
        }
    }
});