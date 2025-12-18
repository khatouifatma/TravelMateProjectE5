// /**
//  * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
//  * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
//  */

import { Platform } from 'react-native';

const tintColorLight = '#ED7868';
const tintColorDark = '#a5bb80';

export const Colors = {
  light: {
    text: '#11181C', 
    textSecondary: '#6b7280',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
    primary: '#ED7868',  
    secondary: '#a5bb80', 
    gradient: ['#ED7868', '#a5bb80'],
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9ca3af',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#a5bb80',     
    secondary: '#ED7868',  
    gradient: ['#a5bb80', '#ED7868'],
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
