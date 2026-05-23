export interface MetalConfig {
  key: string;        // 'SILVER' | 'GOLD'
  label: string;      // Display Name
  icon: string;       // Icon for the button
  colorTheme: string; // Tailwind color prefix (e.g., 'blue', 'amber')
  sections: string[]; // List of tabs for this metal
}

export const METALS: MetalConfig[] = [
  {
    key: 'SILVER',
    label: 'Silver',
    icon: '⚪', // White circle looks more like silver than the gold coin
    colorTheme: 'blue', 
    sections: ['RUPA', 'CHORSA', 'JUNU']
  },
  {
    key: 'GOLD',
    label: 'Gold',
    icon: '🟡', // Yellow circle
    colorTheme: 'amber',
    sections: ['RANI', 'IMPORTED', 'KADU']
  }
];
