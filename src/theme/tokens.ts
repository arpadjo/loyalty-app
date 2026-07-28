export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  display: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '700',
    letterSpacing: -1,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
} as const;

const sharedColors = {
  primary: '#176B4D',
  primaryPressed: '#10553D',
  onPrimary: '#FFFFFF',
  success: '#147D64',
  error: '#B42318',
  errorPressed: '#8F1C13',
} as const;

export const lightColors = {
  ...sharedColors,
  background: '#F4F7F3',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF0EB',
  text: '#17231D',
  textMuted: '#637067',
  border: '#D9E2DB',
  inputBackground: '#FFFFFF',
  errorSurface: '#FEF3F2',
  disabled: '#A8B3AB',
  disabledSurface: '#E3E8E4',
  focus: '#2A8664',
} as const;

export const darkColors: ThemeColors = {
  ...sharedColors,
  primary: '#60D4A5',
  primaryPressed: '#46B98D',
  onPrimary: '#092D20',
  background: '#101713',
  surface: '#18231D',
  surfaceMuted: '#202E27',
  text: '#F0F5F1',
  textMuted: '#A6B5AA',
  border: '#33443A',
  inputBackground: '#18231D',
  errorSurface: '#3D1D1A',
  disabled: '#6E7C72',
  disabledSurface: '#28342C',
  focus: '#70DDB1',
};

export type ThemeColors = {
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  success: string;
  error: string;
  errorPressed: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  inputBackground: string;
  errorSurface: string;
  disabled: string;
  disabledSurface: string;
  focus: string;
};

export type TypographyVariant = keyof typeof typography;
