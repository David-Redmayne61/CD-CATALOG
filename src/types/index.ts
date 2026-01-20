export interface CD {
  id?: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  barcode?: string;
  coverUrl?: string;
  duration?: number; // Total playing time in minutes
  notes?: string;
  dateAdded: Date;
}

export interface DVD {
  id?: string;
  title: string;
  director: string;
  year: number;
  genre: string;
  barcode?: string;
  coverUrl?: string;
  runtime?: number; // Runtime in minutes
  rating?: string; // e.g., PG, PG-13, R, etc.
  notes?: string;
  dateAdded: Date;
}

export type RootStackParamList = {
  Dashboard: undefined;
  Home: undefined;
  AddCD: { barcode?: string; editCD?: CD } | undefined;
  AddDVD: { barcode?: string; editDVD?: DVD } | undefined;
  BarcodeScanner: { mediaType: 'cd' | 'dvd' } | undefined;
};
