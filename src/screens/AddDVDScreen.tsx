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
  Modal,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { addDVD, updateDVD, checkDuplicateDVDBarcode } from '../services/firebase';

type AddDVDScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddDVD'>;
type AddDVDScreenRouteProp = RouteProp<RootStackParamList, 'AddDVD'>;

interface Props {
  navigation: AddDVDScreenNavigationProp;
  route: AddDVDScreenRouteProp;
}

export const AddDVDScreen: React.FC<Props> = ({ navigation, route }) => {
  const editDVD = route.params?.editDVD;
  const isEditing = !!editDVD;

  const [title, setTitle] = useState(editDVD?.title || '');
  const [director, setDirector] = useState(editDVD?.director || '');
  const [year, setYear] = useState(editDVD?.year?.toString() || '');
  const [genre, setGenre] = useState(editDVD?.genre || '');
  const [barcode, setBarcode] = useState(editDVD?.barcode || route.params?.barcode || '');
  const [coverUrl, setCoverUrl] = useState(editDVD?.coverUrl || '');
  const [runtime, setRuntime] = useState(editDVD?.runtime || 0);
  const [rating, setRating] = useState(editDVD?.rating || '');
  const [notes, setNotes] = useState(editDVD?.notes || '');
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [showRatingPicker, setShowRatingPicker] = useState(false);

  const genres = [
    'Action',
    'Adventure',
    'Animation',
    'Biography',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Family',
    'Fantasy',
    'Film Noir',
    'History',
    'Horror',
    'Musical',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Sport',
    'Thriller',
    'War',
    'Western',
    'Other',
  ];

  const ratings = [
    'U',
    'PG',
    '12',
    '12A',
    '15',
    '18',
    'R18',
    'TBC',
    'Unrated',
  ];

  const lookupBarcode = async (barcodeValue: string) => {
    if (!barcodeValue || barcodeValue.length < 8) return;

    setLookingUp(true);
    try {
      let movieTitle = '';
      let searchYear = '';
      let foundData = false;

      // Step 1: Try UPC database to get the product title
      try {
        const upcResponse = await fetch(
          `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcodeValue}`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (upcResponse.ok) {
          const upcData = await upcResponse.json();
          
          if (upcData.items && upcData.items.length > 0) {
            const item = upcData.items[0];
            
            // Extract title and year from UPC data
            if (item.title) {
              // Try to extract movie title and year from various formats
              // "Movie Title (2023) [Blu-ray]" or "Movie Title - DVD (2023)"
              const titleMatch = item.title.match(/^(.+?)\s*[\(\[](\d{4})[\)\]]/);
              if (titleMatch) {
                movieTitle = titleMatch[1].replace(/\s*[-–]\s*(DVD|Blu-ray|Blu Ray).*$/i, '').trim();
                searchYear = titleMatch[2];
              } else {
                // Remove DVD/Blu-ray mentions and brackets
                movieTitle = item.title
                  .replace(/\s*[-–]\s*(DVD|Blu-ray|Blu Ray).*$/i, '')
                  .replace(/\s*\[.*?\]\s*/g, '')
                  .trim();
              }
            }
          }
        }
      } catch (error) {
        console.log('UPC lookup failed, will try direct search:', error);
      }

      // Step 2: If we got a title, search OMDb
      if (movieTitle) {
        try {
          const omdbResponse = await fetch(
            `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&type=movie&apikey=5ff2a838${searchYear ? `&y=${searchYear}` : ''}`
          );

          if (omdbResponse.ok) {
            const omdbData = await omdbResponse.json();
            
            if (omdbData.Response === 'True') {
              foundData = true;
              
              // Populate form with OMDb data
              if (omdbData.Title) setTitle(omdbData.Title);
              if (omdbData.Director && omdbData.Director !== 'N/A') setDirector(omdbData.Director);
              if (omdbData.Year) setYear(omdbData.Year);
              if (omdbData.Genre && omdbData.Genre !== 'N/A') {
                const firstGenre = omdbData.Genre.split(',')[0].trim();
                setGenre(firstGenre);
              }
              if (omdbData.Runtime && omdbData.Runtime !== 'N/A') {
                const runtimeMatch = omdbData.Runtime.match(/(\d+)/);
                if (runtimeMatch) {
                  setRuntime(parseInt(runtimeMatch[1]));
                }
              }
              // Note: OMDb returns US ratings, not UK BBFC ratings
              if (omdbData.Rated && omdbData.Rated !== 'N/A') {
                // Map US ratings to UK ratings where possible
                const ratingMap: { [key: string]: string } = {
                  'G': 'U',
                  'PG': 'PG',
                  'PG-13': '12A',
                  'R': '15',
                  'NC-17': '18'
                };
                setRating(ratingMap[omdbData.Rated] || 'Unrated');
              }
              if (omdbData.Poster && omdbData.Poster !== 'N/A') setCoverUrl(omdbData.Poster);
              if (omdbData.Plot && omdbData.Plot !== 'N/A') {
                setNotes(`${omdbData.Plot}\n\nUS Rating: ${omdbData.Rated}`);
              }

              if (Platform.OS === 'web') {
                window.alert(
                  `✅ DVD Found!\n\n${omdbData.Title} (${omdbData.Year})\nDirected by ${omdbData.Director}\n\nDetails auto-filled!\n\nNote: Rating converted from US to UK (verify accuracy)`
                );
              } else {
                Alert.alert(
                  'DVD Found!',
                  `${omdbData.Title} (${omdbData.Year})\nDirected by ${omdbData.Director}\n\nDetails auto-filled!`,
                  [{ text: 'OK' }]
                );
              }
            }
          }
        } catch (error) {
          console.log('OMDb lookup failed:', error);
        }
      }

      if (!foundData) {
        // No results found after all attempts
        if (Platform.OS === 'web') {
          window.alert(
            `⚠️ DVD Not Found\n\n` +
            `Barcode: ${barcodeValue}\n\n` +
            `This barcode isn't in the available databases.\n\n` +
            `Please enter the details manually from the DVD case.`
          );
        } else {
          Alert.alert(
            'DVD Not Found',
            'This barcode is not in the database. Please enter details manually.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      
      if (Platform.OS === 'web') {
        window.alert(
          `⚠️ Lookup Failed\n\n` +
          `Could not complete the lookup.\n\n` +
          `Please enter the details manually from the DVD case.`
        );
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
  };

  const handleSave = async () => {
    if (!title.trim() || !director.trim()) {
      Alert.alert('Missing Information', 'Please enter at least a title and director.');
      return;
    }

    const yearNum = parseInt(year);
    if (year && (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear())) {
      Alert.alert('Invalid Year', 'Please enter a valid year.');
      return;
    }

    // Check for duplicate barcode first (only when adding new or if barcode changed)
    if (barcode.trim()) {
      try {
        const duplicate = await checkDuplicateDVDBarcode(barcode.trim(), isEditing ? editDVD?.id : undefined);
        
        if (duplicate) {
          const message = `A DVD with this barcode already exists:\n\n"${duplicate.title}" directed by ${duplicate.director}\n\nDo you want to add it anyway?`;
          
          let shouldContinue = false;
          
          if (Platform.OS === 'web') {
            shouldContinue = window.confirm(`⚠️ Duplicate Found!\n\n${message}`);
          } else {
            shouldContinue = await new Promise<boolean>((resolve) => {
              Alert.alert(
                'Duplicate Found',
                message,
                [
                  { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                  { text: 'Add Anyway', onPress: () => resolve(true) }
                ]
              );
            });
          }
          
          if (!shouldContinue) {
            return;
          }
        }
      } catch (error) {
        console.error('Error checking duplicate:', error);
      }
    }

    setSaving(true);
    try {
      const dvdData: any = {
        title: title.trim(),
        director: director.trim(),
        year: yearNum || new Date().getFullYear(),
        genre: genre.trim() || 'Unknown',
        dateAdded: new Date(),
      };

      if (barcode.trim()) {
        dvdData.barcode = barcode.trim();
      }
      if (coverUrl) {
        dvdData.coverUrl = coverUrl;
      }
      if (runtime && runtime > 0) {
        dvdData.runtime = runtime;
      }
      if (rating) {
        dvdData.rating = rating;
      }
      if (notes.trim()) {
        dvdData.notes = notes.trim();
      }

      if (isEditing && editDVD?.id) {
        await updateDVD(editDVD.id, dvdData);
      } else {
        await addDVD(dvdData);
      }

      const successMessage = isEditing 
        ? `✅ Success!\n\n"${title}" directed by ${director} has been updated!`
        : `✅ Success!\n\n"${title}" directed by ${director} has been added to your collection!`;

      if (Platform.OS === 'web') {
        window.confirm(successMessage);
        navigation.goBack();
      } else {
        Alert.alert(
          'Success', 
          successMessage, 
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error saving DVD:', error);
      if (Platform.OS === 'web') {
        window.alert('❌ Error: Failed to save DVD. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save DVD. Please try again.');
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
          placeholder="Enter DVD title"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Director *</Text>
        <TextInput
          style={styles.input}
          value={director}
          onChangeText={setDirector}
          placeholder="Enter director name"
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

        <Text style={styles.label}>Runtime (minutes)</Text>
        <TextInput
          style={styles.input}
          value={runtime > 0 ? runtime.toString() : ''}
          onChangeText={(text) => {
            const numValue = parseInt(text, 10);
            setRuntime(isNaN(numValue) ? 0 : numValue);
          }}
          placeholder="Enter runtime in minutes"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Genre</Text>
        <TouchableOpacity
          style={styles.genrePicker}
          onPress={() => setShowGenrePicker(true)}
        >
          <Text style={genre ? styles.genrePickerText : styles.genrePickerPlaceholder}>
            {genre || 'Select a genre'}
          </Text>
          <Text style={styles.genrePickerArrow}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Rating</Text>
        <TouchableOpacity
          style={styles.genrePicker}
          onPress={() => setShowRatingPicker(true)}
        >
          <Text style={rating ? styles.genrePickerText : styles.genrePickerPlaceholder}>
            {rating || 'Select a rating'}
          </Text>
          <Text style={styles.genrePickerArrow}>▼</Text>
        </TouchableOpacity>

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
          <Text style={styles.lookupText}>🔍 Looking up DVD information...</Text>
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

        <Text style={styles.label}>Cover URL (Optional)</Text>
        <TextInput
          style={styles.input}
          value={coverUrl}
          onChangeText={setCoverUrl}
          placeholder="Enter image URL for cover art"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes about this DVD"
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
            {saving ? 'Saving...' : (isEditing ? 'Update DVD' : 'Save DVD')}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showGenrePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenrePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Genre</Text>
              <TouchableOpacity onPress={() => setShowGenrePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={genres}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.genreOption}
                  onPress={() => {
                    setGenre(item);
                    setShowGenrePicker(false);
                  }}
                >
                  <Text style={[
                    styles.genreOptionText,
                    genre === item && styles.genreOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {genre === item && <Text style={styles.genreCheckmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRatingPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Rating</Text>
              <TouchableOpacity onPress={() => setShowRatingPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={ratings}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.genreOption}
                  onPress={() => {
                    setRating(item);
                    setShowRatingPicker(false);
                  }}
                >
                  <Text style={[
                    styles.genreOptionText,
                    rating === item && styles.genreOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {rating === item && <Text style={styles.genreCheckmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  googleButton: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  googleButtonText: {
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
  genrePicker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genrePickerText: {
    fontSize: 16,
    color: '#333',
  },
  genrePickerPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  genrePickerArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  genreOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  genreOptionText: {
    fontSize: 16,
    color: '#333',
  },
  genreOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  genreCheckmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
});
