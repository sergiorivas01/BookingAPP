/**
 * React hook for Application Insights
 * Provides easy access to telemetry tracking in React components
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPageView,
  trackEvent,
  trackException,
  trackTrace,
  trackMetric,
  trackDependency,
  isInitialized,
} from '../services/applicationInsights';

/**
 * Hook to automatically track page views on route changes
 */
export function usePageTracking(): void {
  const location = useLocation();

  useEffect(() => {
    if (isInitialized()) {
      trackPageView(location.pathname + location.search, window.location.href);
    }
  }, [location]);
}

/**
 * Hook that provides Application Insights tracking functions
 */
export function useApplicationInsights() {
  return {
    trackEvent,
    trackException,
    trackTrace,
    trackMetric,
    trackDependency,
    isInitialized,
  };
}

