import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { CD } from '../types';

interface CDCardProps {
  cd: CD;
  onDelete: (id: string) => void;
}

export const CDCard: React.FC<CDCardProps> = ({ cd, onDelete }) => {
  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${cd.title}" by ${cd.artist}?`
      );
      if (confirmed && cd.id) {
        onDelete(cd.id);
      }
    } else {
      Alert.alert(
        'Delete CD',
        `Are you sure you want to delete "${cd.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => cd.id && onDelete(cd.id)
          }
        ]
      );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {cd.coverUrl && (
          <Image source={{ uri: cd.coverUrl }} style={styles.coverImage} />
        )}
        <View style={styles.textContent}>
          <Text style={styles.title}>{cd.title}</Text>
          <Text style={styles.artist}>{cd.artist}</Text>
          <View style={styles.details}>
            <Text style={styles.detailText}>{cd.year}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.detailText}>{cd.genre}</Text>
          </View>
          {cd.barcode && (
            <Text style={styles.barcode}>Barcode: {cd.barcode}</Text>
          )}
          {cd.notes && (
            <Text style={styles.notes}>{cd.notes}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  coverImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#888',
  },
  separator: {
    marginHorizontal: 8,
    color: '#888',
  },
  barcode: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  notes: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
