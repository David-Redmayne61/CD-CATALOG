import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, Platform, View } from 'react-native';
import { RootStackParamList } from './src/types';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddCDScreen } from './src/screens/AddCDScreen';
import { AddDVDScreen } from './src/screens/AddDVDScreen';
import { BarcodeScannerScreen } from './src/screens/BarcodeScannerScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Dashboard')}
              style={{ marginRight: 15, padding: 5, flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <Text style={{ color: '#fff', fontSize: 24 }}>🏠</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Home</Text>
            </TouchableOpacity>
          ),
        })}
      >
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Browse Collection',
            headerShown: true
          }}
        />
        <Stack.Screen 
          name="AddCD" 
          component={AddCDScreen}
          options={({ route }) => ({ 
            title: route.params?.editCD ? 'Edit CD' : 'Add New CD' 
          })}
        />
        <Stack.Screen 
          name="AddDVD" 
          component={AddDVDScreen}
          options={({ route }) => ({ 
            title: route.params?.editDVD ? 'Edit DVD' : 'Add New DVD' 
          })}
        />
        <Stack.Screen 
          name="BarcodeScanner" 
          component={BarcodeScannerScreen}
          options={{ 
            title: 'Scan Barcode',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
