import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, CD, DVD } from '../types';
import { getCDs, getDVDs } from '../services/firebase';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [cds, setCds] = useState<CD[]>([]);
  const [dvds, setDvds] = useState<DVD[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const [fetchedCDs, fetchedDVDs] = await Promise.all([
        getCDs(),
        getDVDs()
      ]);
      setCds(fetchedCDs);
      setDvds(fetchedDVDs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRuntime = () => {
    const cdMinutes = cds.reduce((sum, cd) => sum + (cd.duration || 0), 0);
    const dvdMinutes = dvds.reduce((sum, dvd) => sum + (dvd.runtime || 0), 0);
    const totalHours = Math.floor((cdMinutes + dvdMinutes) / 60);
    return totalHours;
  };

  const getRecentItems = () => {
    const allItems = [
      ...cds.map(cd => ({ ...cd, type: 'CD' as const })),
      ...dvds.map(dvd => ({ ...dvd, type: 'DVD' as const }))
    ];
    return allItems
      .sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const recentItems = getRecentItems();
  const totalHours = getTotalRuntime();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Media Collection</Text>
        <Text style={styles.headerSubtitle}>Your Library Overview</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{cds.length}</Text>
            <Text style={styles.statLabel}>CDs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dvds.length}</Text>
            <Text style={styles.statLabel}>DVDs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{cds.length + dvds.length}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalHours}h</Text>
            <Text style={styles.statLabel}>Runtime</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('BarcodeScanner', { mediaType: 'cd' })}
          >
            <Text style={styles.actionIcon}>💿</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Scan CD Barcode</Text>
              <Text style={styles.actionSubtitle}>Use your barcode scanner</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('BarcodeScanner', { mediaType: 'dvd' })}
          >
            <Text style={styles.actionIcon}>📀</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Scan DVD Barcode</Text>
              <Text style={styles.actionSubtitle}>Use your barcode scanner</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddCD')}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Manual CD Entry</Text>
              <Text style={styles.actionSubtitle}>Add CD details manually</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddDVD')}
          >
            <Text style={styles.actionIcon}>✍️</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Manual DVD Entry</Text>
              <Text style={styles.actionSubtitle}>Add DVD details manually</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.actionIcon}>📚</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Browse Collection</Text>
              <Text style={styles.actionSubtitle}>View all CDs and DVDs</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Additions */}
        {recentItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Additions</Text>
            {recentItems.map((item, index) => (
              <View key={`${item.type}-${item.id}-${index}`} style={styles.recentItem}>
                <Text style={styles.recentIcon}>{item.type === 'CD' ? '💿' : '📀'}</Text>
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentTitle}>{item.title}</Text>
                  <Text style={styles.recentSubtitle}>
                    {item.type === 'CD' 
                      ? (item as CD).artist 
                      : (item as DVD).director}
                  </Text>
                </View>
                <Text style={styles.recentType}>{item.type}</Text>
              </View>
            ))}
          </View>
        )}

        {(cds.length === 0 && dvds.length === 0) && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>Your collection is empty</Text>
            <Text style={styles.emptySubtext}>Start adding CDs and DVDs using the quick actions above</Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
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
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionArrow: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '300',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  recentSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  recentType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#E3F2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
