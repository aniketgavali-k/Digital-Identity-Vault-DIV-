import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'verified': return styles.verified;
      case 'rejected': return styles.rejected;
      default: return styles.pending;
    }
  };

  return (
    <View style={[styles.badge, getStyle()]}>
      <Text style={styles.text}>{status.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  verified: { backgroundColor: '#4CAF50' },
  pending: { backgroundColor: '#FFC107' },
  rejected: { backgroundColor: '#F44336' },
});

export default StatusBadge;
