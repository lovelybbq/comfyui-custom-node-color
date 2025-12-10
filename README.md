# ComfyUI Custom Node Color 🎨

A modern, GUI-based color picker for ComfyUI nodes. Change any node's background color to **any** custom value using a visual spectrum, HEX/RGB inputs, or an eyedropper tool. Supports multi-selection and favorite colors.

![Screenshot](screenshot.png)

## ✨ Features

- **Modern GUI**: Glassmorphism design with blur effects and smooth animations.
- **Full Color Control**: 
  - Visual Color Picker (Saturation/Value square + Hue slider).
  - Manual **HEX** input (with auto-validation).
  - Manual **RGB** inputs.
- **Eyedropper Tool** 🖊️: Pick any color from your screen (works outside the browser window on supported browsers).
- **Favorites System** ⭐: 
  - Save up to 7 favorite colors.
  - FIFO Queue: Automatically cycles old colors when full.
  - Visual warning when a favorite is about to be overwritten.
- **Batch Coloring**: Select multiple nodes, right-click one, and apply color to **all selected nodes** instantly.
- **Smart UX**: 
  - **Reset Button**: Quickly revert to the original node color (single selection mode).
  - **Auto-Apply**: Click anywhere outside the picker to save and close.

## 📥 Installation

### Method 1: ComfyUI Manager (Recommended)
1. Open **ComfyUI Manager**.
2. Search for `Custom Node Color`.
3. Click **Install**.
4. Restart ComfyUI.

### Method 2: Manual Installation
1. Navigate to your ComfyUI `custom_nodes` directory:
   ```bash
   cd ComfyUI/custom_nodes/
   ```
2. Clone this repository:
   ```bash
   git clone https://github.com/lovelybbq/comfyui-custom-node-color.git
   ```
3. Restart ComfyUI.

## 🚀 Usage

1. **Right-click** on any node (or multiple selected nodes).
2. Select **"Custom Node Color"** from the bottom of the menu.
3. Choose your color using the visual picker, HEX input, or Eyedropper.
4. Click **Done** or simply click anywhere on the canvas to save.

### Controls
- **EyeDropper**: Click the pipette icon to pick a color from your screen.
- **Favorites**: Click the `☆` to save a color. Click `★` to remove it.
- **Reset**: Click the `↺` icon to revert to the node's original color (only available when 1 node is selected).

## 🌐 Browser Support

- **Eyedropper API**: Currently supported in **Chrome**, **Edge**, and **Opera**. 
  - *Note: On Firefox, the eyedropper button will be hidden automatically as the API is not yet supported.*

## 🤝 Contributing

Feel free to open issues or submit pull requests if you have suggestions for improvements!

## 📄 License

MIT License.