import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

// Universal Text component with explicit styling
export const SafeText = ({ style, children, ...props }) => {
  return (
    <Text style={[styles.baseText, style]} {...props}>
      {children}
    </Text>
  );
};

// Universal TextInput component with explicit styling
export const SafeTextInput = ({ style, placeholderTextColor, ...props }) => {
  return (
    <TextInput
      style={[styles.baseInput, style]}
      placeholderTextColor={placeholderTextColor || "#999"}
      {...props}
    />
  );
};

// Pre-styled title component
export const SafeTitle = ({ style, children, ...props }) => {
  return (
    <Text style={[styles.title, style]} {...props}>
      {children}
    </Text>
  );
};

// Pre-styled subtitle component
export const SafeSubtitle = ({ style, children, ...props }) => {
  return (
    <Text style={[styles.subtitle, style]} {...props}>
      {children}
    </Text>
  );
};

// Pre-styled label component for forms
export const SafeLabel = ({ style, children, ...props }) => {
  return (
    <Text style={[styles.label, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  baseText: {
    color: '#333',
    fontFamily: 'System',
    fontSize: 16,
  },
  baseInput: {
    color: '#333',
    fontFamily: 'System',
    fontSize: 16,
  },
  title: {
    color: '#333',
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#333',
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    color: '#333',
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 