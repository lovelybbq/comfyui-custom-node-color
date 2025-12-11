class HexColorInput:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                # Standard string input for HEX value
                "hex_color": ("STRING", {"default": "#000000", "multiline": False}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("HEX",)
    FUNCTION = "process_hex"
    CATEGORY = "LovelyBBQ/Utils"

    def process_hex(self, hex_color):
        # Validation mostly happens on JS side.
        # Here we just ensure we return a safe string.
        if not hex_color or not isinstance(hex_color, str):
            return ("#000000",)
        return (hex_color,)


class ConvertHEXToRGB:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "hex_color": ("STRING", {"default": "#000000"}),
            },
        }

    RETURN_TYPES = ("INT", "INT", "INT", "STRING")
    RETURN_NAMES = ("R", "G", "B", "RGB")
    FUNCTION = "convert_to_rgb"
    CATEGORY = "LovelyBBQ/Utils"

    def convert_to_rgb(self, hex_color):
        # Clean hex input
        hex_color = (hex_color or "#000000").replace("#", "").strip()
        
        # Handle invalid hex
        if not hex_color or len(hex_color) < 6:
            hex_color = "000000"
        
        # Ensure 6 characters
        hex_color = hex_color[:6].upper()
        
        # Convert to RGB
        try:
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
        except ValueError:
            r, g, b = 0, 0, 0
        
        # Return individual values and string format
        rgb_string = f"{r}, {g}, {b}"
        return (r, g, b, rgb_string)


# Register the nodes
NODE_CLASS_MAPPINGS = {
    "HexColorInput": HexColorInput,
    "ConvertHEXToRGB": ConvertHEXToRGB,
}

# Human-readable names
NODE_DISPLAY_NAME_MAPPINGS = {
    "HexColorInput": "Hex Color Input",
    "ConvertHEXToRGB": "Convert HEX To RGB",
}