import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, CD } from '../types';
import { getCDs, deleteCD } from '../services/firebase';
import { CDCard } from '../components/CDCard';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [cds, setCds] = useState<CD[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCDs = async () => {
    try {
      const fetchedCDs = await getCDs();
      setCds(fetchedCDs.sort((a, b) => 
        b.dateAdded.getTime() - a.dateAdded.getTime()
      ));
    } catch (error) {
      console.error('Error loading CDs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCDs();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCDs();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (id: string) => {
    try {
      await deleteCD(id);
      setCds(cds.filter(cd => cd.id !== id));
    } catch (error) {
      console.error('Error deleting CD:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCDs();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My CD Collection</Text>
        <Text style={styles.headerSubtitle}>{cds.length} CDs</Text>
      </View>

      {cds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No CDs in your collection yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first CD</Text>
        </View>
      ) : (
        <FlatList
          data={cds}
          keyExtractor={(item) => item.id || ''}
          renderItem={({ item }) => (
            <CDCard cd={item} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCD')}
        >
          <Text style={styles.buttonText}>+ Add CD</Text>
          <Text style={styles.buttonSubtext}>You can type the barcode manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
    opacity: 0.9,
  },
});
