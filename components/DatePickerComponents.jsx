import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeText } from './TextComponents';

// Universal Date Picker Component
export const SafeDatePicker = ({ 
  date, 
  onDateChange, 
  placeholder = "Select Date",
  style,
  mode = "date",
  ...props 
}) => {
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate && onDateChange) {
      onDateChange(selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.dateInput}
        onPress={() => setShow(true)}
      >
        <SafeText style={styles.dateText}>
          {date ? formatDate(date) : placeholder}
        </SafeText>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date || new Date()}
          mode={mode}
          display="default"
          onChange={onChange}
          {...props}
        />
      )}
    </View>
  );
};

// Date Range Picker Component
export const SafeDateRangePicker = ({ 
  fromDate, 
  toDate, 
  onFromDateChange, 
  onToDateChange,
  style 
}) => {
  return (
    <View style={[styles.rangeContainer, style]}>
      <SafeText style={styles.label}>Select Date Range</SafeText>
      <View style={styles.rangeInputs}>
        <View style={styles.dateColumn}>
          <SafeText style={styles.subLabel}>From Date</SafeText>
          <SafeDatePicker
            date={fromDate}
            onDateChange={onFromDateChange}
            placeholder="From Date"
            style={styles.rangeDateInput}
          />
        </View>
        <View style={styles.dateColumn}>
          <SafeText style={styles.subLabel}>To Date</SafeText>
          <SafeDatePicker
            date={toDate}
            onDateChange={onToDateChange}
            placeholder="To Date"
            style={styles.rangeDateInput}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  dateInput: {
    height: 50,
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  rangeContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  rangeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateColumn: {
    flex: 0.48,
  },
  rangeDateInput: {
    marginBottom: 0,
  },
}); 