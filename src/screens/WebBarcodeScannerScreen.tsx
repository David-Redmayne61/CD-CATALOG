import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

type WebBarcodeScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BarcodeScanner'>;

interface Props {
  navigation: WebBarcodeScannerScreenNavigationProp;
}

export const WebBarcodeScannerScreen: React.FC<Props> = ({ navigation }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanning = useRef(false);
  const [error, setError] = useState<string>('');
  const [scanningStatus, setScanningStatus] = useState<string>('Initializing camera...');

  useEffect(() => {
    if (Platform.OS === 'web') {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (isScanning.current) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader", {
        verbose: true, // Enable verbose logging
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
        ]
      });
      scannerRef.current = html5QrCode;

      // Request camera permissions and start scanning
      await html5QrCode.start(
        { 
          facingMode: "environment"
        },
        {
          fps: 5, // Slower FPS for more processing time per frame
          qrbox: { width: 250, height: 150 }, // Larger box for easier targeting
          aspectRatio: 1.777778, // 16:9
          disableFlip: false,
        },
        (decodedText, decodedResult) => {
          console.log("Barcode detected:", decodedText, decodedResult);
          handleScan(decodedText);
        },
        (errorMessage) => {
          // Error callback - log but ignore individual frame errors
          if (errorMessage && !errorMessage.includes("NotFoundException")) {
            console.log("Scan error:", errorMessage);
          }
        }
      );

      isScanning.current = true;
      setError('');
      setScanningStatus('Ready - scanning for barcodes...');
    } catch (err) {
      console.error("Error starting scanner:", err);
      setError("Camera access denied or not available. Please check your browser settings.");
      setScanningStatus('');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      isScanning.current = false;
    }
  };

  const handleScan = async (data: string) => {
    await stopScanner();
    
    if (confirm(`Barcode: ${data}\n\nWould you like to add this CD?`)) {
      navigation.navigate('AddCD', { barcode: data });
    } else {
      startScanner();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>✕ Close</Text>
      </TouchableOpacity>

      <div id="qr-reader" style={{ width: '100%', maxWidth: '600px' }}></div>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setError('');
              startScanner();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.instructions}>
          <Text style={styles.statusText}>
            {scanningStatus}
          </Text>
          <Text style={styles.instructionText}>
            📷 Hold barcode steadily in view
          </Text>
          <Text style={styles.instructionSubtext}>
            Distance: 4-10 inches • Keep barcode flat
          </Text>
          <Text style={styles.instructionSubtext}>
            Supported: UPC, EAN, CODE-128/39
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  instructions: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderRadius: 12,
    maxWidth: 400,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionSubtext: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },
  errorContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 12,
    maxWidth: 400,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
