import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { DVD } from '../types';

interface DVDCardProps {
  dvd: DVD;
  onDelete: (id: string) => void;
  onEdit: (dvd: DVD) => void;
}

export const DVDCard: React.FC<DVDCardProps> = ({ dvd, onDelete, onEdit }) => {
  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${dvd.title}" directed by ${dvd.director}?`
      );
      if (confirmed && dvd.id) {
        onDelete(dvd.id);
      }
    } else {
      Alert.alert(
        'Delete DVD',
        `Are you sure you want to delete "${dvd.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => dvd.id && onDelete(dvd.id)
          }
        ]
      );
    }
  };

  const formatRuntime = (minutes: number): string => {
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
        {dvd.coverUrl && (
          <Image source={{ uri: dvd.coverUrl }} style={styles.coverImage} />
        )}
        <View style={styles.textContent}>
          <Text style={styles.title}>{dvd.title}</Text>
          <Text style={styles.director}>{dvd.director}</Text>
          <View style={styles.details}>
            <Text style={styles.detailText}>{dvd.year}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.detailText}>{dvd.genre}</Text>
            {dvd.runtime && dvd.runtime > 0 && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.detailText}>{formatRuntime(dvd.runtime)}</Text>
              </>
            )}
            {dvd.rating && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.detailText}>{dvd.rating}</Text>
              </>
            )}
          </View>
          {dvd.barcode && (
            <Text style={styles.barcode}>Barcode: {dvd.barcode}</Text>
          )}
          {dvd.notes && (
            <Text style={styles.notes}>{dvd.notes}</Text>
          )}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(dvd)}>
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
  director: {
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
