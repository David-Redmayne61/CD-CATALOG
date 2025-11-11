import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { addCD } from '../services/firebase';

type AddCDScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddCD'>;
type AddCDScreenRouteProp = RouteProp<RootStackParamList, 'AddCD'>;

interface Props {
  navigation: AddCDScreenNavigationProp;
  route: AddCDScreenRouteProp;
}

export const AddCDScreen: React.FC<Props> = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const [barcode, setBarcode] = useState(route.params?.barcode || '');
  const [coverUrl, setCoverUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const lookupTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const lookupBarcode = async (barcodeValue: string) => {
    if (!barcodeValue || barcodeValue.length < 8) return;

    setLookingUp(true);
    try {
      // Try different barcode formats
      const barcodesToTry = [
        barcodeValue,
        barcodeValue.padStart(13, '0'), // Add leading zeros for EAN-13
        barcodeValue.padStart(12, '0'), // Add leading zeros for UPC
      ];

      let foundRelease = null;
      let usedBarcode = '';

      // MusicBrainz API - try each barcode format
      for (const bc of barcodesToTry) {
        console.log('Trying barcode format:', bc);
        
        try {
          const response = await fetch(
            `https://musicbrainz.org/ws/2/release?query=barcode:${bc}&fmt=json`,
            {
              headers: {
                'User-Agent': 'CDCatalog/1.0.0 (davidnredmayne@gmail.com)',
                'Accept': 'application/json'
              },
              cache: 'no-cache'
            }
          );

          console.log('MusicBrainz response status:', response.status);
          console.log('Response headers:', response.headers);
          
          if (!response.ok) {
            console.log('Response not OK:', response.status, response.statusText);
            if (response.status === 503) {
              throw new Error('MusicBrainz service temporarily unavailable. Please wait a moment and try again.');
            }
            continue; // Try next format
          }

          const responseText = await response.text();
          console.log('Raw response:', responseText.substring(0, 200));
          
          const data = JSON.parse(responseText);
          console.log('Parsed data:', data);
          console.log('Number of releases found:', data.releases?.length || 0);
        
          if (data.releases && data.releases.length > 0) {
            foundRelease = data.releases[0];
            usedBarcode = bc;
            console.log('Found release with barcode:', bc);
            break;
          } else {
            console.log('No releases in response for:', bc);
          }
        } catch (fetchError) {
          console.error('Fetch error for barcode', bc, ':', fetchError);
        }

        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (foundRelease) {
        const release = foundRelease;
        const releaseId = release.id;
        
        console.log('Found release:', release.title, 'by', release['artist-credit']?.[0]?.name);
        
        // Populate fields - always update when lookup succeeds
        if (release.title) {
          setTitle(release.title);
        }
        
        if (release['artist-credit'] && release['artist-credit'].length > 0) {
          const artistName = release['artist-credit'].map((ac: any) => ac.name).join(', ');
          setArtist(artistName);
        }
        
        if (release.date) {
          const releaseYear = release.date.split('-')[0];
          setYear(releaseYear);
        }

        // Fetch cover art from Cover Art Archive
        if (releaseId) {
          try {
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const coverResponse = await fetch(
              `https://coverartarchive.org/release/${releaseId}`,
              {
                headers: {
                  'User-Agent': 'CDCatalog/1.0.0 (davidnredmayne@gmail.com)'
                }
              }
            );
            
            console.log('Cover Art response status:', coverResponse.status);
            
            if (coverResponse.ok) {
              const coverData = await coverResponse.json();
              if (coverData.images && coverData.images.length > 0) {
                // Use the front cover if available, or the first image
                const frontCover = coverData.images.find((img: any) => img.front) || coverData.images[0];
                if (frontCover && frontCover.thumbnails && frontCover.thumbnails['500']) {
                  setCoverUrl(frontCover.thumbnails['500']);
                  console.log('Cover art found:', frontCover.thumbnails['500']);
                }
              }
            }
          } catch (coverError) {
            console.log('Cover art not available:', coverError);
          }
        }

        if (Platform.OS === 'web') {
          window.alert(
            `✅ CD Found!\n\n${release.title}\nby ${release['artist-credit']?.[0]?.name || 'Unknown Artist'}`
          );
        } else {
          Alert.alert(
            'CD Found!',
            `Found: ${release.title}\nby ${release['artist-credit']?.[0]?.name || 'Unknown Artist'}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log('No releases found for barcode:', barcodeValue);
        console.log('Tried formats:', barcodesToTry);
        if (Platform.OS === 'web') {
          window.alert(
            `❌ No CD information found\n\n` +
            `Barcode searched: ${barcodeValue}\n` +
            `Formats tried:\n- ${barcodesToTry.join('\n- ')}\n\n` +
            `The barcode may not be in the MusicBrainz database yet.\n` +
            `You can enter the details manually and we'll save the barcode for future reference.`
          );
        } else {
          Alert.alert(
            'Not Found',
            'No CD information found for this barcode. Please enter details manually.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (Platform.OS === 'web') {
        window.alert(`❌ Lookup Failed\n\n${errorMessage}\n\nPlease enter details manually.`);
      } else {
        Alert.alert(
          'Lookup Failed',
          'Could not look up barcode. Please enter details manually.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLookingUp(false);
    }
  };

  const handleBarcodeChange = (value: string) => {
    setBarcode(value);
    
    // Disable auto-lookup - users can use the manual lookup button instead
    // This prevents triggering searches before the barcode is complete
  };

  const handleSave = async () => {
    if (!title.trim() || !artist.trim()) {
      Alert.alert('Missing Information', 'Please enter at least a title and artist.');
      return;
    }

    const yearNum = parseInt(year);
    if (year && (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear())) {
      Alert.alert('Invalid Year', 'Please enter a valid year.');
      return;
    }

    setSaving(true);
    try {
      const cdData: any = {
        title: title.trim(),
        artist: artist.trim(),
        year: yearNum || new Date().getFullYear(),
        genre: genre.trim() || 'Unknown',
        dateAdded: new Date(),
      };

      // Only add optional fields if they have values
      if (barcode.trim()) {
        cdData.barcode = barcode.trim();
      }
      if (coverUrl) {
        cdData.coverUrl = coverUrl;
      }
      if (notes.trim()) {
        cdData.notes = notes.trim();
      }

      await addCD(cdData);

      // Show success alert - using platform-specific handling
      if (Platform.OS === 'web') {
        const userConfirmed = window.confirm(
          `✅ Success!\n\n"${title}" by ${artist} has been added to your collection!`
        );
        navigation.goBack();
      } else {
        Alert.alert(
          'Success', 
          `"${title}" by ${artist} has been added to your collection!`, 
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error saving CD:', error);
      if (Platform.OS === 'web') {
        window.alert('❌ Error: Failed to save CD. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save CD. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
        nestedScrollEnabled={true}
      >
        {coverUrl && (
          <View style={styles.coverContainer}>
            <Image source={{ uri: coverUrl }} style={styles.coverImage} />
            <Text style={styles.coverLabel}>Cover Art</Text>
          </View>
        )}

        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter CD title"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Artist *</Text>
        <TextInput
          style={styles.input}
          value={artist}
          onChangeText={setArtist}
          placeholder="Enter artist name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Year</Text>
        <TextInput
          style={styles.input}
          value={year}
          onChangeText={setYear}
          placeholder="e.g., 2023"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          maxLength={4}
        />

        <Text style={styles.label}>Genre</Text>
        <TextInput
          style={styles.input}
          value={genre}
          onChangeText={setGenre}
          placeholder="e.g., Rock, Pop, Jazz"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Barcode (Optional)</Text>
        <TextInput
          style={styles.input}
          value={barcode}
          onChangeText={handleBarcodeChange}
          placeholder="Type 12-13 digit barcode (UPC/EAN)"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          editable={!lookingUp}
        />
        {lookingUp ? (
          <Text style={styles.lookupText}>🔍 Looking up CD information...</Text>
        ) : barcode.length >= 8 ? (
          <TouchableOpacity 
            style={styles.lookupButton}
            onPress={() => lookupBarcode(barcode)}
          >
            <Text style={styles.lookupButtonText}>🔍 Look Up This Barcode</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.helpText}>
            💡 Enter the full barcode, then tap the lookup button
          </Text>
        )}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes about this CD"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save CD'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === 'web' ? {
      overflowY: 'scroll' as any,
      WebkitOverflowScrolling: 'touch' as any,
    } : {}),
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  coverImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  coverLabel: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  lookupText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 6,
    marginBottom: 8,
    fontWeight: '600',
  },
  lookupButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  lookupButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    ...(Platform.OS === 'web' ? {
      position: 'sticky' as any,
      bottom: 0,
    } : {}),
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
