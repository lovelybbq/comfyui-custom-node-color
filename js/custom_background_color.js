// js/custom_background_color.js
import { app } from "../../scripts/app.js";
import { LovelyColorPicker } from "./lovely_color_picker.js";

app.registerExtension({
    name: "Comfy.LovelyBBQ.NodeContextMenu",
    async setup() {
        // ============================================================
        // NODE COLOR MENU
        // ============================================================
        const origNodeOptions = LGraphCanvas.prototype.getNodeMenuOptions;
        LGraphCanvas.prototype.getNodeMenuOptions = function(node) {
            const opts = origNodeOptions.apply(this, arguments);
            const canvas = this;
            const nodes = (canvas.selected_nodes && canvas.selected_nodes[node.id]) 
                ? Object.values(canvas.selected_nodes) : [node];

            opts.push(null);
            opts.push({
                content: "Custom Node Color",
                callback: () => {
                    // Save original colors before opening picker
                    const originalColors = nodes.map(n => ({ node: n, color: n.bgcolor || "#000000" }));
                    
                    // Initial color from the primary node
                    const initialColor = node.bgcolor || "#000000";
                    
                    new LovelyColorPicker(
                        initialColor, 
                        (newHex) => {
                            // LOGIC: Apply color to all selected nodes
                            nodes.forEach(n => n.bgcolor = newHex);
                            canvas.setDirty(true, true);
                        },
                        nodes.length > 1 ? `Custom Color (${nodes.length})` : "Custom Node Color",
                        nodes.length > 1,  // Hide reset button if multiple nodes selected
                        () => {
                            // Cancel callback: restore original colors
                            originalColors.forEach(({ node: n, color }) => {
                                n.bgcolor = color;
                            });
                            canvas.setDirty(true, true);
                        }
                    );
                }
            });
            return opts;
        }

        // ============================================================
        // GROUP COLOR MENU - Hook into LGraphGroup.prototype.getMenuOptions
        // ============================================================
        const origGroupGetMenuOptions = LGraphGroup.prototype.getMenuOptions;
        LGraphGroup.prototype.getMenuOptions = function(graphCanvas) {
            const opts = origGroupGetMenuOptions ? origGroupGetMenuOptions.apply(this, arguments) : [];
            const group = this;
            const canvas = graphCanvas || app.canvas;
            
            // Add our custom option at the end
            opts.push(null); // separator
            opts.push({
                content: "Custom Group Color",
                callback: function() {
                    const originalColor = group.color || "#a4a4a4";
                    
                    new LovelyColorPicker(
                        originalColor, 
                        function(newHex) {
                            group.color = newHex;
                            if (canvas) canvas.setDirty(true, true);
                            app.graph.setDirtyCanvas(true, true);
                        },
                        "Custom Group Color",
                        false,
                        function() {
                            group.color = originalColor;
                            if (canvas) canvas.setDirty(true, true);
                            app.graph.setDirtyCanvas(true, true);
                        }
                    );
                }
            });
            
            return opts;
        }
    }
});