/*
  This file sets global default props for Text and TextInput components.
  Importing this module once (e.g., in your root layout) guarantees that
  every Text and TextInput in the application inherits the explicit styles
  needed for reliable rendering in production APKs.
*/

import { Text, TextInput } from "react-native";

// Ensure defaultProps exist
if (!Text.defaultProps) Text.defaultProps = {};
if (!TextInput.defaultProps) TextInput.defaultProps = {};

// Merge existing style with ours (preserve developer styles by making ours default)
Text.defaultProps.style = [
  { color: "#333", fontFamily: "System" },
  ...(Array.isArray(Text.defaultProps.style)
    ? Text.defaultProps.style
    : Text.defaultProps.style
    ? [Text.defaultProps.style]
    : []),
];

TextInput.defaultProps.style = [
  { color: "#333", fontFamily: "System", fontSize: 16 },
  ...(Array.isArray(TextInput.defaultProps.style)
    ? TextInput.defaultProps.style
    : TextInput.defaultProps.style
    ? [TextInput.defaultProps.style]
    : []),
];

// Set a safe placeholder text color if not provided
if (!TextInput.defaultProps.placeholderTextColor) {
  TextInput.defaultProps.placeholderTextColor = "#999";
}

// Note: Picker.Item doesn't expose a global default prop hook.
// We rely on developers to pass `itemStyle` & `style` explicitly where needed.
