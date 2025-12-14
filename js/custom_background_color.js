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
        // GROUP COLOR MENU - Hook into processContextMenu
        // ============================================================
        const origProcessContextMenu = LGraphCanvas.prototype.processContextMenu;
        LGraphCanvas.prototype.processContextMenu = function(node, event) {
            // Check if we clicked on a group
            const group = this.graph.getGroupOnPos(event.canvasX, event.canvasY);
            
            if (group && !node) {
                // We clicked on a group (not a node)
                const canvas = this;
                
                // Get original menu options using new API (LGraphGroup.getMenuOptions)
                let options = [];
                if (group.getMenuOptions) {
                    options = group.getMenuOptions(this) || [];
                } else if (LGraphCanvas.prototype.getGroupMenuOptions) {
                    // Fallback to deprecated method
                    options = LGraphCanvas.prototype.getGroupMenuOptions.call(this, group) || [];
                }
                
                // Add our custom option
                options.push(null); // separator
                options.push({
                    content: "Custom Group Color",
                    callback: () => {
                        const originalColor = group.color || "#a4a4a4";
                        
                        new LovelyColorPicker(
                            originalColor, 
                            (newHex) => {
                                group.color = newHex;
                                canvas.setDirty(true, true);
                            },
                            "Custom Group Color",
                            false,
                            () => {
                                group.color = originalColor;
                                canvas.setDirty(true, true);
                            }
                        );
                    }
                });
                
                new LiteGraph.ContextMenu(options, {
                    event: event,
                    callback: null,
                    extra: group
                }, this.getCanvasWindow());
                
                return;
            }
            
            // Call original for nodes and other elements
            if (origProcessContextMenu) {
                return origProcessContextMenu.apply(this, arguments);
            }
        }
    }
});