// js/lovely_color_picker.js

// ============================================================================
// SHARED UTILS & STYLES
// ============================================================================

// Inject styles once
if (!document.getElementById('lovely-picker-styles')) {
    const cssStyle = document.createElement('style');
    cssStyle.id = 'lovely-picker-styles';
    cssStyle.innerHTML = `
        .cp-panel {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 280px; padding: 15px;
            background: rgba(12, 12, 12, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            font-family: sans-serif; color: white; user-select: none; z-index: 10000;
            display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;
        }
        .cp-header { font-size: 12px; font-weight: bold; opacity: 0.7; text-align: center; margin-bottom: 2px; }
        .cp-canvas-wrap { position: relative; width: 100%; border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
        .cp-cursor { position: absolute; border: 2px solid white; box-shadow: 0 0 2px black; pointer-events: none; transform: translate(-50%, -50%); }
        .cp-cursor.round { width: 12px; height: 12px; border-radius: 50%; }
        .cp-cursor.bar { width: 8px; height: 18px; border-radius: 4px; top: 50%; background: white; border: none; box-shadow: 0 0 4px rgba(0,0,0,0.5); }
        .cp-row { display: flex; gap: 8px; align-items: center; justify-content: space-between; }
        .cp-col { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .cp-label { font-size: 9px; opacity: 0.5; margin-bottom: 2px; letter-spacing: 1px; }
        .cp-input {
            width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15);
            color: white; border-radius: 6px; padding: 4px 0; text-align: center; font-size: 11px;
            outline: none; -moz-appearance: textfield;
        }
        .cp-input::-webkit-outer-spin-button, .cp-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .cp-input.hex { font-family: monospace; letter-spacing: 1px; height: 32px; padding: 0 8px; color: rgba(255,255,255,0.9); }
        .cp-btn {
            width: 100%; padding: 10px; border-radius: 6px; font-size: 13px; font-weight: bold; cursor: pointer; transition: 0.2s; border: 1px solid transparent;
        }
        .cp-btn.done { background: white; color: black; }
        .cp-btn.done:hover { opacity: 0.8; }
        .cp-btn.cancel { background: rgba(255, 50, 50, 0.15); color: #ffcccc; border-color: rgba(255, 50, 50, 0.25); }
        .cp-btn.cancel:hover { background: rgba(255, 50, 50, 0.25); }
        .cp-icon-btn {
            width: 32px; height: 32px; flex-shrink: 0;
            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            font-size: 16px; color: #ccc; transition: all 0.2s ease;
        }
        .cp-icon-btn:hover { background: rgba(255,255,255,0.2); color: white; }
        .cp-icon-btn.modified { background: rgba(255, 50, 50, 0.2) !important; border-color: rgba(255, 80, 80, 0.4) !important; color: #ffcccc !important; box-shadow: 0 0 8px rgba(255, 0, 0, 0.25); }
        .cp-fav-grid { 
            display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; min-height: 24px; padding: 10px;
            background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
        }
        .cp-fav-empty { grid-column: span 7; text-align: center; font-size: 10px; opacity: 0.4; padding: 4px 0; }
        .cp-swatch { 
            aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); box-sizing: border-box; cursor: pointer; transition: 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .cp-swatch:hover { transform: scale(1.15); border-color: rgba(255,255,255,0.8); z-index: 2; }
        .cp-swatch:active { transform: scale(0.9); }
        .cp-swatch.active { border: 2px solid white !important; box-shadow: 0 0 0 2px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.5); transform: scale(1.1); z-index: 5; }
        .cp-swatch.marking-delete { border-color: #ff4444 !important; opacity: 0.5; transform: scale(0.8); position: relative; }
        .cp-swatch.marking-delete::after { content: "×"; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ff4444; font-size: 20px; font-weight: bold; pointer-events: none; }
        .cp-shape-row { display: flex; gap: 8px; }
        .cp-shape-btn {
            flex: 1; padding: 8px 4px; border-radius: 6px; font-size: 11px;
            background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
            color: rgba(255,255,255,0.7); cursor: pointer; transition: all 0.2s;
        }
        .cp-shape-btn:hover { background: rgba(255,255,255,0.15); color: white; }
        .cp-shape-btn.active { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.5); color: white; box-shadow: 0 0 8px rgba(255,255,255,0.2); }
        .cp-icon-btn.active { 
            background: rgba(100, 150, 255, 0.3) !important; 
            border-color: rgba(100, 150, 255, 0.6) !important; 
            color: rgb(150, 200, 255) !important;
            box-shadow: 0 0 8px rgba(100, 150, 255, 0.4) !important;
        }
    `;
    document.head.appendChild(cssStyle);
}

const $el = (tag, props = {}, children = []) => {
    const el = document.createElement(tag);
    if (props.className) el.className = props.className;
    if (props.style) Object.assign(el.style, props.style);
    if (props.attrs) Object.entries(props.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (props.events) Object.entries(props.events).forEach(([k, v]) => el.addEventListener(k, v));
    if (props.html) el.innerHTML = props.html;
    if (props.text) el.textContent = props.text;
    if (props.parent) props.parent.appendChild(el);
    children.forEach(child => child && el.appendChild(child));
    return el;
};

const ColorUtils = {
    HEX_REGEX: /^#?([0-9A-F]{3}){1,2}$/i,
    isCompleteHex: (hex) => ColorUtils.HEX_REGEX.test(hex),
    hexToRgb: (hex) => {
        if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
        hex = hex.replace(/[^0-9A-F]/gi, '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const num = parseInt(hex, 16);
        return isNaN(num) ? { r: 0, g: 0, b: 0 } : { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    },
    rgbToHex: (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1),
    rgbToHsv: (r, g, b) => {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
        let h = 0, s = (max === 0 ? 0 : d / max), v = max;
        if (max !== min) {
            h = (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4) / 6;
        }
        return { h, s, v };
    },
    hsvToRgb: (h, s, v) => {
        const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
        const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6] || [0, 0, 0];
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }
};

const FavoritesManager = {
    KEY: "ComfyUI_CustomColorNode_Favorites",
    MAX: 14,
    load: () => { try { return JSON.parse(localStorage.getItem(FavoritesManager.KEY)) || []; } catch { return []; } },
    save: (c) => localStorage.setItem(FavoritesManager.KEY, JSON.stringify(c)),
    has: (h) => FavoritesManager.load().includes(h),
    isFull: () => FavoritesManager.load().length >= FavoritesManager.MAX,
    toggle: (hex) => {
        let favs = FavoritesManager.load();
        const idx = favs.indexOf(hex);
        if (idx > -1) favs.splice(idx, 1);
        else {
            favs.unshift(hex);
            if (favs.length > FavoritesManager.MAX) favs.pop();
        }
        FavoritesManager.save(favs);
    }
};

// ============================================================================
// MAIN CLASS EXPORT
// ============================================================================

export class LovelyColorPicker {
    static isOpen = false;

    constructor(initialColor, onColorChange, title = "Select Color", hideReset = false, onCancel = null, shapeConfig = null) {
        LovelyColorPicker.isOpen = true;
        
        this.onColorChange = onColorChange;
        this.onCancel = onCancel;
        this.initialColor = initialColor || "#000000";
        this.title = title;
        this.hideReset = hideReset;
        this.isPicking = false;
        
        // Shape config: { nodes: [...], onShapeChange: fn, initialShapes: [...] }
        this.shapeConfig = shapeConfig;
        this.currentShape = shapeConfig?.initialShapes?.[0] ?? null;
        
        // Darker header config
        this.darkerHeader = shapeConfig?.initialDarkerHeader ?? false;
        this.onHeaderStyleChange = shapeConfig?.onHeaderStyleChange ?? null;
        
        // Init State
        const startRgb = ColorUtils.hexToRgb(this.initialColor);
        this.state = ColorUtils.rgbToHsv(startRgb.r, startRgb.g, startRgb.b);

        this.render();
        this.updateUI();
        this.bindGlobalEvents();
    }

    render() {
        this.el = $el("div", { className: "cp-panel", events: { pointerdown: (e) => e.stopPropagation() }});

        // Header
        $el("div", { className: "cp-header", text: this.title, parent: this.el });

        // SV Canvas
        const svWrap = $el("div", { className: "cp-canvas-wrap", style: { height: "140px", cursor: "crosshair" }, parent: this.el });
        this.svCanvas = $el("canvas", { attrs: { width: 250, height: 140 }, style: { width: "100%", height: "100%", display: "block" }, parent: svWrap });
        this.svCursor = $el("div", { className: "cp-cursor round", parent: svWrap });
        this.bindDrag(svWrap, (x, y) => { this.state.s = x; this.state.v = 1 - y; this.updateUI(); });

        // Hue Canvas
        const hueWrap = $el("div", { className: "cp-canvas-wrap", style: { height: "14px", cursor: "ew-resize" }, parent: this.el });
        this.hueCanvas = $el("canvas", { attrs: { width: 250, height: 14 }, style: { width: "100%", height: "100%", display: "block" }, parent: hueWrap });
        this.hueCursor = $el("div", { className: "cp-cursor bar", parent: hueWrap });
        this.bindDrag(hueWrap, (x, y) => { this.state.h = x; this.updateUI(); });
        this.drawHueCanvas();

        // RGB Inputs
        const rgbRow = $el("div", { className: "cp-row", parent: this.el });
        this.rgbInputs = {};
        ['r', 'g', 'b'].forEach(key => {
            const col = $el("div", { className: "cp-col", parent: rgbRow });
            $el("span", { className: "cp-label", text: key.toUpperCase(), parent: col });
            this.rgbInputs[key] = $el("input", { 
                className: "cp-input", attrs: { type: "text", maxlength: 3 }, 
                events: { 
                    pointerdown: e => e.stopPropagation(),
                    input: (e) => {
                        // Allow only digits 0-9
                        let clean = e.target.value.replace(/\D/g, '');
                        let val = clean ? Math.min(255, parseInt(clean)) : 0;
                        e.target.value = clean ? String(val) : '0';
                        const cur = this.getCurrentRgb(); cur[key] = val;
                        this.state = ColorUtils.rgbToHsv(cur.r, cur.g, cur.b);
                        this.updateUI('rgb');
                    }
                },
                parent: col 
            });
        });

        // Controls
        const ctrlRow = $el("div", { className: "cp-row", parent: this.el });
        
        // Hex
        this.hexInput = $el("input", { 
            className: "cp-input hex", style: { flex: 1 }, 
            events: {
                pointerdown: e => e.stopPropagation(),
                input: (e) => {
                    let clean = e.target.value.replace(/[^0-9a-f]/gi, '').substring(0, 6);
                    e.target.value = "#" + clean;
                    if (ColorUtils.isCompleteHex(clean)) {
                        const rgb = ColorUtils.hexToRgb("#" + clean);
                        this.state = ColorUtils.rgbToHsv(rgb.r, rgb.g, rgb.b);
                        this.updateUI('hex');
                    }
                }
            },
            parent: ctrlRow
        });

        // Reset Btn
        if (!this.hideReset) {
            this.resetBtn = $el("div", { 
                className: "cp-icon-btn", text: "↺", attrs: { title: "Reset to original color" },
                events: { click: () => this.applyColor(this.initialColor, true) },
                parent: ctrlRow 
            });
        }

        // Eyedropper
        if (window.EyeDropper) {
            $el("div", {
                className: "cp-icon-btn",
                html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2.5l-5 5-11 11c-.8.8-1 2.3-.5 2.8.5.5 2 .3 2.8-.5l11-11 5-5c.5-.5.3-2.8-2.3-2.3z"/><path d="M15 9l4 4"/></svg>',
                attrs: { title: "Pick color from screen" },
                events: { click: () => this.activateEyedropper() },
                parent: ctrlRow
            });
        }

        // Darker header button (only for nodes)
        if (this.shapeConfig) {
            this.darkerHeaderBtn = $el("div", { 
                className: `cp-icon-btn ${this.darkerHeader ? "active" : ""}`,
                text: "◐",
                attrs: { title: "Toggle darker header" },
                events: { click: () => this.toggleDarkerHeader() },
                parent: ctrlRow
            });
        }

        // Favorites
        this.starBtn = $el("div", { 
            className: "cp-icon-btn", style: { fontSize: "18px" },
            attrs: { title: "Add to favorites" },
            events: {
                click: () => {
                    FavoritesManager.toggle(this.getCurrentHex());
                    this.updateUI();
                },
                mouseenter: () => {
                    if (!FavoritesManager.has(this.getCurrentHex()) && FavoritesManager.isFull()) {
                        this.favContainer.lastElementChild?.classList.add("marking-delete");
                    }
                },
                mouseleave: () => this.favContainer.querySelectorAll(".marking-delete").forEach(e => e.classList.remove("marking-delete"))
            },
            parent: ctrlRow
        });

        // Fav Container
        this.favContainer = $el("div", { className: "cp-fav-grid", parent: this.el });

        // Shape selector (only for nodes) - 4 buttons in a row
        if (this.shapeConfig) {
            const shapeRow = $el("div", { className: "cp-shape-row", parent: this.el });
            this.shapeButtons = {};
            const shapes = { null: "Default", 1: "Box", 2: "Round", 4: "Card" };
            Object.entries(shapes).forEach(([value, name]) => {
                const shapeVal = value === "null" ? null : parseInt(value);
                const btn = $el("button", {
                    className: `cp-shape-btn ${shapeVal === this.currentShape ? "active" : ""}`,
                    text: name,
                    attrs: { title: `Set shape to ${name}` },
                    events: {
                        click: () => this.setShape(shapeVal)
                    },
                    parent: shapeRow
                });
                this.shapeButtons[value] = btn;
            });
        }

        // Footer
        const footer = $el("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, parent: this.el });
        $el("button", { className: "cp-btn done", text: "Done", events: { click: () => this.close() }, parent: footer });
        $el("button", { className: "cp-btn cancel", text: "Cancel", events: { click: () => this.cancel() }, parent: footer });

        document.body.appendChild(this.el);
    }

    bindGlobalEvents() {
        this.clickOutsideHandler = (e) => {
            if (!this.el || this.isPicking) return;
            if (this.el.contains(e.target)) return;
            this.close();
        };
        setTimeout(() => document.addEventListener("pointerdown", this.clickOutsideHandler, { capture: true }), 100);
    }

    bindDrag(el, cb) {
        el.onpointerdown = (e) => {
            e.preventDefault(); e.stopPropagation();
            el.setPointerCapture(e.pointerId);
            const move = (ev) => {
                const r = el.getBoundingClientRect();
                cb(Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height)));
            };
            move(e);
            el.onpointermove = move;
            el.onpointerup = () => { el.releasePointerCapture(e.pointerId); el.onpointermove = null; el.onpointerup = null; };
        };
    }

    async activateEyedropper() {
        if (!window.EyeDropper) return;
        this.isPicking = true;
        try {
            const result = await new EyeDropper().open();
            this.applyColor(result.sRGBHex);
        } catch (e) {
            // Cancelled
        } finally {
            this.isPicking = false;
        }
    }

    applyColor(hex, resetShape = false) {
        const rgb = ColorUtils.hexToRgb(hex);
        this.state = ColorUtils.rgbToHsv(rgb.r, rgb.g, rgb.b);
        
        // Reset shape to initial value (only when explicitly requested, e.g., Reset button)
        if (resetShape && this.shapeConfig?.initialShapes?.[0] !== undefined) {
            const initialShape = this.shapeConfig.initialShapes[0];
            this.setShape(initialShape);
        }
        
        this.updateUI();
    }

    getCurrentRgb() { return ColorUtils.hsvToRgb(this.state.h, this.state.s, this.state.v); }
    getCurrentHex() { const c = this.getCurrentRgb(); return ColorUtils.rgbToHex(c.r, c.g, c.b); }

    drawHueCanvas() {
        const ctx = this.hueCanvas.getContext("2d");
        const g = ctx.createLinearGradient(0, 0, this.hueCanvas.width, 0);
        [0, 0.17, 0.33, 0.5, 0.67, 0.83, 1].forEach((s, i) => g.addColorStop(s, ["red", "yellow", "lime", "cyan", "blue", "magenta", "red"][i]));
        ctx.fillStyle = g; ctx.fillRect(0, 0, this.hueCanvas.width, this.hueCanvas.height);
    }

    updateUI(skipInputType = null) {
        const ctx = this.svCanvas.getContext("2d"), w = this.svCanvas.width, h = this.svCanvas.height;
        const rgb = ColorUtils.hsvToRgb(this.state.h, 1, 1);
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`; ctx.fillRect(0, 0, w, h);
        const gw = ctx.createLinearGradient(0, 0, w, 0); gw.addColorStop(0, "white"); gw.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = gw; ctx.fillRect(0, 0, w, h);
        const gb = ctx.createLinearGradient(0, 0, 0, h); gb.addColorStop(0, "rgba(0,0,0,0)"); gb.addColorStop(1, "black"); ctx.fillStyle = gb; ctx.fillRect(0, 0, w, h);

        this.svCursor.style.left = (this.state.s * 100) + "%"; this.svCursor.style.top = ((1 - this.state.v) * 100) + "%";
        this.svCursor.style.borderColor = this.state.v < 0.5 ? "white" : "black"; 
        this.hueCursor.style.left = (this.state.h * 100) + "%";

        const curRgb = this.getCurrentRgb();
        const hex = ColorUtils.rgbToHex(curRgb.r, curRgb.g, curRgb.b);

        if (skipInputType !== 'hex') this.hexInput.value = hex;
        if (skipInputType !== 'rgb') {
            this.rgbInputs.r.value = curRgb.r; this.rgbInputs.g.value = curRgb.g; this.rgbInputs.b.value = curRgb.b;
        }

        // CALLBACK: Pass the color back to whoever called us
        if (this.onColorChange) this.onColorChange(hex);

        // Favorites UI
        this.renderFavorites(hex);
        
        const isFav = FavoritesManager.has(hex);
        this.starBtn.textContent = isFav ? "★" : "☆";
        this.starBtn.style.color = isFav ? "#FFD700" : "#ccc";
        this.starBtn.style.borderColor = isFav ? "#FFD700" : "rgba(255,255,255,0.2)";
        this.starBtn.title = isFav ? "Remove from favorites" : "Add to favorites";

        if (this.resetBtn) {
            const colorChanged = hex.toLowerCase() !== this.initialColor.toLowerCase();
            const shapeChanged = this.shapeConfig && (this.currentShape !== this.shapeConfig.initialShapes?.[0]);
            
            if (colorChanged || shapeChanged) {
                this.resetBtn.classList.add("modified");
            } else {
                this.resetBtn.classList.remove("modified");
            }
        }
        
        // Update darker header button title
        if (this.darkerHeaderBtn) {
            this.darkerHeaderBtn.title = this.darkerHeader ? "Disable darker header" : "Enable darker header";
        }
    }

    renderFavorites(currentHex) {
        this.favContainer.innerHTML = "";
        const favs = FavoritesManager.load();
        if (favs.length === 0) {
            $el("div", { className: "cp-fav-empty", text: "No favorites", parent: this.favContainer });
            return;
        }
        favs.forEach(c => {
            $el("div", { 
                className: `cp-swatch ${c.toUpperCase() === currentHex.toUpperCase() ? "active" : ""}`,
                style: { background: c }, attrs: { title: c },
                events: { click: () => this.applyColor(c) },
                parent: this.favContainer 
            });
        });
    }

    setShape(shapeValue) {
        if (!this.shapeConfig) return;
        this.currentShape = shapeValue;
        
        // Update button states
        Object.entries(this.shapeButtons).forEach(([val, btn]) => {
            const btnShapeVal = val === "null" ? null : parseInt(val);
            btn.classList.toggle("active", btnShapeVal === shapeValue);
        });
        
        // Apply shape to nodes
        if (this.shapeConfig.onShapeChange) {
            this.shapeConfig.onShapeChange(shapeValue);
        }
        
        // Update UI to reflect changes (e.g., Reset button state)
        this.updateUI();
    }

    toggleDarkerHeader() {
        this.darkerHeader = !this.darkerHeader;
        if (this.darkerHeaderBtn) {
            this.darkerHeaderBtn.classList.toggle("active", this.darkerHeader);
            this.darkerHeaderBtn.setAttribute("title", this.darkerHeader ? "Disable darker header" : "Enable darker header");
        }
        
        if (this.onHeaderStyleChange) {
            this.onHeaderStyleChange(this.darkerHeader, this.getCurrentHex());
        }
    }

    cancel() {
        if (this.onCancel) {
            this.onCancel();
        } else if (this.onColorChange) {
            this.onColorChange(this.initialColor);
        }
        this.close();
    }

    close() {
        LovelyColorPicker.isOpen = false;
        if (this.clickOutsideHandler) {
            document.removeEventListener("pointerdown", this.clickOutsideHandler, { capture: true });
            this.clickOutsideHandler = null;
        }
        if (this.el?.parentNode) this.el.parentNode.removeChild(this.el);
    }
}