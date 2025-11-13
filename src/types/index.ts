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

export type RootStackParamList = {
  Home: undefined;
  AddCD: { barcode?: string; editCD?: CD } | undefined;
  BarcodeScanner: undefined;
};
