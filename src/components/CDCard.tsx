import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { CD } from '../types';

interface CDCardProps {
  cd: CD;
  onDelete: (id: string) => void;
  onEdit: (cd: CD) => void;
}

export const CDCard: React.FC<CDCardProps> = ({ cd, onDelete, onEdit }) => {
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

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins} min`;
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
            {cd.duration && cd.duration > 0 && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.detailText}>{formatDuration(cd.duration)}</Text>
              </>
            )}
          </View>
          {cd.barcode && (
            <Text style={styles.barcode}>Barcode: {cd.barcode}</Text>
          )}
          {cd.notes && (
            <Text style={styles.notes}>{cd.notes}</Text>
          )}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(cd)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
