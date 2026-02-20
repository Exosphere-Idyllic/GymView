import { Dimensions, Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

const { width } = Dimensions.get('window');

export const breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
};

export const isSmallScreen = width < breakpoints.mobile;
export const isTablet = width >= breakpoints.mobile && width < breakpoints.desktop;
export const isDesktop = width >= breakpoints.desktop;

export const getMaxWidth = () => {
    if (isDesktop) return 1200;
    if (isTablet) return 900;
    return '100%';
};