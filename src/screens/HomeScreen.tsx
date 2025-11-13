import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Platform } from 'react-native';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const handlePrint = () => {
    if (Platform.OS !== 'web') {
      return; // Print only works on web
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cdsToPrint = searchQuery.trim() ? filteredCDs : filteredCDs;
    const totalDuration = cdsToPrint.reduce((sum, cd) => sum + (cd.duration || 0), 0);
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;

    const formatDuration = (mins: number): string => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}`;
      }
      return `${m} min`;
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CD Catalog - ${searchQuery.trim() ? 'Search Results' : 'Complete Collection'}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            h1 {
              color: #007AFF;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #666;
              margin-bottom: 30px;
              font-size: 14px;
            }
            .summary {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background: #007AFF;
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
            }
            td {
              padding: 10px 8px;
              border-bottom: 1px solid #e0e0e0;
            }
            tr:hover {
              background: #f9f9f9;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
            @media print {
              body { margin: 20px; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>CD Catalog</h1>
          <div class="subtitle">
            ${searchQuery.trim() ? `Search Results for: "${searchQuery}"` : 'Complete Collection'}<br>
            Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
          
          <div class="summary">
            <strong>Total CDs:</strong> ${cdsToPrint.length}<br>
            <strong>Total Playing Time:</strong> ${hours}:${minutes.toString().padStart(2, '0')}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Artist</th>
                <th>Year</th>
                <th>Genre</th>
                <th>Duration</th>
                <th>Barcode</th>
              </tr>
            </thead>
            <tbody>
              ${cdsToPrint.map((cd, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${cd.title}</strong></td>
                  <td>${cd.artist}</td>
                  <td>${cd.year}</td>
                  <td>${cd.genre}</td>
                  <td>${cd.duration ? formatDuration(cd.duration) : '-'}</td>
                  <td style="font-family: monospace; font-size: 11px;">${cd.barcode || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            CD Catalog App - https://cd-catalog.web.app
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Filter and sort CDs based on search query
  const filteredCDs = cds
    .filter(cd => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase().trim();
      return (
        cd.title?.toLowerCase().includes(query) ||
        cd.artist?.toLowerCase().includes(query) ||
        cd.genre?.toLowerCase().trim().includes(query) ||
        cd.barcode?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically by title

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

      {cds.length > 0 && (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title, artist, genre, or barcode..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {Platform.OS === 'web' && (
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={styles.printButton}
                onPress={handlePrint}
              >
                <Text style={styles.printButtonText}>🖨️ Print / Save as PDF</Text>
              </TouchableOpacity>
              {searchQuery.trim() && (
                <Text style={styles.resultCount}>
                  {filteredCDs.length} result{filteredCDs.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          )}
        </>
      )}

      {cds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No CDs in your collection yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first CD</Text>
        </View>
      ) : filteredCDs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {filteredCDs.map((cd) => (
            <CDCard 
              key={cd.id}
              cd={cd} 
              onDelete={handleDelete}
              onEdit={(cd) => navigation.navigate('AddCD', { editCD: cd })}
            />
          ))}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
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
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 24,
    top: 16,
    padding: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  printButton: {
    backgroundColor: '#34C759',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  printButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    zIndex: 1000,
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
