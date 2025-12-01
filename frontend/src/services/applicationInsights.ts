/**
 * Azure Application Insights service
 * Configures and provides telemetry tracking for the frontend application
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import type { IDependencyTelemetry } from '@microsoft/applicationinsights-web';

let appInsights: ApplicationInsights | null = null;
let isEnabled = true; // Flag to enable/disable Application Insights
let errorCount = 0; // Track consecutive errors
const MAX_ERRORS = 5; // Disable after 5 consecutive errors

/**
 * Disable Application Insights (useful if getting persistent 400 errors)
 * Can be called from browser console: window.disableApplicationInsights()
 */
export function disableApplicationInsights(): void {
  isEnabled = false;
  appInsights = null;
  console.warn('Application Insights has been disabled');
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as Window & { disableApplicationInsights?: () => void }).disableApplicationInsights = disableApplicationInsights;
}

/**
 * Check if Application Insights is enabled
 */
export function isApplicationInsightsEnabled(): boolean {
  return isEnabled && appInsights !== null;
}

/**
 * Diagnostic function to check Application Insights configuration
 * Call from browser console: window.diagnoseApplicationInsights()
 */
export function diagnoseApplicationInsights(): void {
  console.log('=== Application Insights Diagnostic ===');
  
  const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;
  
  console.log('1. Environment Check:');
  console.log('   - VITE_APPINSIGHTS_DISABLED:', import.meta.env.VITE_APPINSIGHTS_DISABLED || 'not set');
  console.log('   - Connection String:', connectionString ? 'Set (hidden)' : 'NOT SET');
  
  if (connectionString) {
    const parts = connectionString.split(';').reduce((acc, part) => {
      const [key, ...valueParts] = part.split('=');
      if (key && valueParts.length > 0) {
        acc[key.trim()] = valueParts.join('=');
      }
      return acc;
    }, {} as Record<string, string>);
    
    console.log('2. Connection String Analysis:');
    console.log('   - Has InstrumentationKey:', !!(parts['InstrumentationKey'] || parts['ikey']));
    console.log('   - Has IngestionEndpoint:', !!parts['IngestionEndpoint']);
    
    if (parts['IngestionEndpoint']) {
      const endpoint = parts['IngestionEndpoint'];
      const regionMatch = endpoint.match(/https?:\/\/([^.]+)/);
      console.log('   - Endpoint Region:', regionMatch ? regionMatch[1] : 'unknown');
      console.log('   - Endpoint URL:', endpoint);
    }
    
    if (parts['InstrumentationKey']) {
      const ikey = parts['InstrumentationKey'];
      console.log('   - InstrumentationKey length:', ikey.length, 'characters');
      console.log('   - InstrumentationKey format:', /^[a-f0-9-]+$/i.test(ikey) ? 'Valid GUID format' : 'Invalid format');
    }
  }
  
  console.log('3. SDK Status:');
  console.log('   - Is Enabled:', isEnabled);
  console.log('   - Is Initialized:', appInsights !== null);
  console.log('   - SDK Instance:', appInsights ? 'Available' : 'Not available');
  
  if (appInsights) {
    try {
      // Access config through type assertion for diagnostic purposes
      const config = (appInsights as ApplicationInsights & { config?: { 
        connectionString?: string;
        enableAutoRouteTracking?: boolean;
        disableFetchTracking?: boolean;
        disableExceptionTracking?: boolean;
      }}).config;
      console.log('4. SDK Configuration:');
      console.log('   - Connection String Set:', !!config?.connectionString);
      console.log('   - Auto Route Tracking:', config?.enableAutoRouteTracking);
      console.log('   - Fetch Tracking:', !config?.disableFetchTracking);
      console.log('   - Exception Tracking:', !config?.disableExceptionTracking);
    } catch (error) {
      console.warn('   - Could not read SDK config:', error);
    }
  }
  
  console.log('5. Recommendations:');
  if (!connectionString) {
    console.error('   ❌ Set VITE_APPINSIGHTS_CONNECTION_STRING in your .env file');
  } else if (!isEnabled || !appInsights) {
    console.warn('   ⚠️  Application Insights is not initialized. Check console for errors.');
  } else {
    console.log('   ✅ Application Insights appears to be configured correctly');
    console.log('   💡 If you see 400 errors, verify the connection string in Azure Portal');
    console.log('   💡 Ensure the connection string matches your Application Insights resource');
  }
  
  console.log('=== End Diagnostic ===');
}

// Make diagnostic function available globally
if (typeof window !== 'undefined') {
  (window as Window & { diagnoseApplicationInsights?: () => void }).diagnoseApplicationInsights = diagnoseApplicationInsights;
}

/**
 * Initialize Application Insights with connection string from environment
 */
export function initializeApplicationInsights(): void {
  // Check if Application Insights should be disabled via environment variable
  if (import.meta.env.VITE_APPINSIGHTS_DISABLED === 'true') {
    console.warn('Application Insights: Disabled via VITE_APPINSIGHTS_DISABLED environment variable');
    return;
  }

  const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.warn('Application Insights: Connection string not found. Telemetry will not be sent.');
    return;
  }

  // Validate and parse connection string format
  const connectionStringParts = connectionString.split(';').reduce((acc, part) => {
    const [key, ...valueParts] = part.split('=');
    if (key && valueParts.length > 0) {
      acc[key.trim()] = valueParts.join('=');
    }
    return acc;
  }, {} as Record<string, string>);

  // Check for required parts
  const hasInstrumentationKey = connectionStringParts['InstrumentationKey'] || connectionStringParts['ikey'];
  const hasIngestionEndpoint = connectionStringParts['IngestionEndpoint'];

  if (!hasInstrumentationKey) {
    console.error('Application Insights: Connection string missing InstrumentationKey or ikey');
    console.error('Expected format: InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/');
    return;
  }

  if (!hasIngestionEndpoint) {
    console.warn('Application Insights: Connection string missing IngestionEndpoint. SDK will use default endpoint.');
  } else {
    // Validate endpoint format
    const endpoint = hasIngestionEndpoint;
    if (!endpoint.startsWith('https://') && !endpoint.startsWith('http://')) {
      console.warn('Application Insights: IngestionEndpoint should start with https:// or http://');
    }
    console.log('Application Insights: Connection string validated', {
      hasInstrumentationKey: !!hasInstrumentationKey,
      hasIngestionEndpoint: !!hasIngestionEndpoint,
      endpointRegion: endpoint ? endpoint.match(/https?:\/\/([^.]+)/)?.[1] : 'unknown',
    });
  }

  try {
    // Use minimal, safe configuration
    appInsights = new ApplicationInsights({
      config: {
        connectionString: connectionString,
        // Minimal configuration to avoid issues
        enableAutoRouteTracking: false, // We track manually
        enableCorsCorrelation: false, // Disable to avoid CORS issues
        enableAjaxPerfTracking: false, // Disable automatic AJAX tracking
        enableAjaxErrorStatusText: false,
        disableExceptionTracking: false, // Keep exception tracking enabled
        disableFetchTracking: true, // Disable automatic fetch tracking
        enableUnhandledPromiseRejectionTracking: false, // Disable to prevent issues
        // Ensure proper endpoint configuration
        endpointUrl: hasIngestionEndpoint ? connectionStringParts['IngestionEndpoint'] : undefined,
      },
    });

    // Load Application Insights
    appInsights.loadAppInsights();

    // Log successful initialization
    console.log('Application Insights: SDK loaded successfully');

    // Monitor for 400 errors to help diagnose issues (but don't auto-disable)
    let consecutive400Errors = 0;
    const MAX_400_ERRORS = 5; // Log warning after 5 errors

    // Intercept fetch/XHR calls to detect 400 errors from Application Insights
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0]?.toString() || '';
      const isAppInsightsCall = url.includes('applicationinsights.azure.com') || 
                                url.includes('applicationinsights.io');
      
      if (isAppInsightsCall && isEnabled) {
        return originalFetch.apply(this, args)
          .then((response) => {
            if (response.status === 400) {
              consecutive400Errors++;
              console.warn(`Application Insights: Received 400 error (${consecutive400Errors}/${MAX_400_ERRORS}). This usually indicates an invalid connection string or configuration issue.`);
              
              if (consecutive400Errors >= MAX_400_ERRORS) {
                console.error('Application Insights: Multiple 400 errors detected. This usually indicates:');
                console.error('1. Invalid or incorrect connection string');
                console.error('2. Connection string format issue');
                console.error('3. Problem with Application Insights resource in Azure Portal');
                console.error('4. Region mismatch between connection string and resource');
                console.error('Please verify your connection string in Azure Portal and ensure it matches your resource.');
                console.error('Connection string should be in format: InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/');
                // Don't auto-disable - let user fix the issue
              }
            } else if (response.ok) {
              // Reset error count on success
              consecutive400Errors = 0;
            }
            return response;
          })
          .catch((error) => {
            console.warn('Application Insights: Network error:', error);
            return Promise.reject(error);
          });
      }
      return originalFetch.apply(this, args);
    };

    // Also intercept XMLHttpRequest for older SDK versions
    const originalXHROpen = XMLHttpRequest.prototype.open;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
      const urlString = url.toString();
      const isAppInsightsCall = urlString.includes('applicationinsights.azure.com') || 
                                urlString.includes('applicationinsights.io');
      
      if (isAppInsightsCall && isEnabled) {
        this.addEventListener('load', function() {
          if (this.status === 400) {
            consecutive400Errors++;
            console.warn(`Application Insights: Received 400 error via XHR (${consecutive400Errors}/${MAX_400_ERRORS})`);
            
            if (consecutive400Errors >= MAX_400_ERRORS) {
              console.error('Application Insights: Multiple 400 errors via XHR. Check connection string configuration.');
            }
          } else if (this.status >= 200 && this.status < 300) {
            consecutive400Errors = 0;
          }
        });
      }
      
      return originalXHROpen.call(this, method, url, async ?? true, username ?? null, password ?? null);
    };

    // Add telemetry initializer to validate and sanitize all telemetry before sending
    appInsights.addTelemetryInitializer((envelope) => {
      try {
        // Validate envelope structure
        if (!envelope || !envelope.data) {
          console.warn('Application Insights: Invalid telemetry envelope, dropping');
          return false; // Drop invalid telemetry
        }

        // Validate and sanitize base data
        const baseData = envelope.data.baseData;
        if (baseData) {
          // Sanitize properties if they exist
          if (baseData.properties && typeof baseData.properties === 'object') {
            const sanitizedProperties: { [key: string]: string } = {};
            for (const [key, value] of Object.entries(baseData.properties)) {
              if (value !== undefined && value !== null) {
                const sanitizedKey = String(key).substring(0, 150);
                const sanitizedValue = String(value).substring(0, 8192);
                sanitizedProperties[sanitizedKey] = sanitizedValue;
              }
            }
            baseData.properties = sanitizedProperties;
          }

          // Validate measurements if they exist
          if (baseData.measurements && typeof baseData.measurements === 'object') {
            const sanitizedMeasurements: { [key: string]: number } = {};
            for (const [key, value] of Object.entries(baseData.measurements)) {
              if (typeof value === 'number' && isFinite(value)) {
                const sanitizedKey = String(key).substring(0, 150);
                sanitizedMeasurements[sanitizedKey] = value;
              }
            }
            baseData.measurements = sanitizedMeasurements;
          }

          // Validate name field if it exists
          if (baseData.name && typeof baseData.name === 'string') {
            baseData.name = baseData.name.substring(0, 1024);
          }

          // Validate message field if it exists
          if (baseData.message && typeof baseData.message === 'string') {
            baseData.message = baseData.message.substring(0, 32768);
          }

          // Validate duration if it exists (for dependencies)
          if (baseData.duration !== undefined) {
            if (typeof baseData.duration === 'number' && isFinite(baseData.duration)) {
              baseData.duration = Math.max(0, Math.min(Math.round(baseData.duration), 2147483647));
            } else {
              delete baseData.duration; // Remove invalid duration
            }
          }

          // Validate responseCode if it exists (for dependencies)
          if (baseData.responseCode !== undefined) {
            if (typeof baseData.responseCode === 'number' && baseData.responseCode >= 100 && baseData.responseCode < 600) {
              baseData.responseCode = Math.round(baseData.responseCode);
            } else {
              delete baseData.responseCode; // Remove invalid response code
            }
          }

          // Validate id if it exists (for dependencies)
          if (baseData.id && typeof baseData.id === 'string') {
            baseData.id = baseData.id.substring(0, 512);
          }

          // Validate type if it exists (for dependencies)
          if (baseData.type && typeof baseData.type === 'string') {
            baseData.type = baseData.type.substring(0, 1024);
          }

          // Validate data and target if they exist (for dependencies)
          if (baseData.data && typeof baseData.data === 'string') {
            baseData.data = baseData.data.substring(0, 8192);
          }
          if (baseData.target && typeof baseData.target === 'string') {
            baseData.target = baseData.target.substring(0, 1024);
          }
        }

        // Validate envelope name
        if (envelope.name && typeof envelope.name === 'string') {
          envelope.name = envelope.name.substring(0, 1024);
        }

        // Validate time field
        if (envelope.time && typeof envelope.time === 'string') {
          // Ensure time is in ISO 8601 format
          try {
            new Date(envelope.time);
          } catch {
            // If invalid date, use current time
            envelope.time = new Date().toISOString();
          }
        }

        return true; // Allow telemetry to be sent
      } catch (error) {
        // If validation fails, drop the telemetry to prevent 400 errors
        errorCount++;
        console.warn(`Application Insights: Telemetry validation failed (${errorCount}/${MAX_ERRORS}), dropping:`, 
          error instanceof Error ? error.message : error);
        
        // Disable Application Insights after too many validation failures
        if (errorCount >= MAX_ERRORS) {
          console.error('Application Insights: Too many validation failures. Disabling to prevent further 400 errors.');
          disableApplicationInsights();
        }
        
        return false; // Drop invalid telemetry
      }
    });
    
    // Wait longer before tracking initial page view to ensure SDK is fully ready
    // Use the public function instead of direct call for better error handling
    setTimeout(() => {
      if (appInsights && isEnabled) {
        try {
          // Use the public trackPageView function which has better error handling
          trackPageView(window.location.pathname, window.location.href);
        } catch (error) {
          console.warn('Failed to track initial page view (non-blocking):', 
            error instanceof Error ? error.message : error);
        }
      }
    }, 1000); // Increased delay to 1 second

    console.log('Application Insights initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Application Insights:', error);
  }
}

/**
 * Track a custom event
 * @param name Event name
 * @param properties Optional event properties
 * @param measurements Optional event measurements
 */
export function trackEvent(
  name: string,
  properties?: { [key: string]: string },
  measurements?: { [key: string]: number }
): void {
  if (!isEnabled || !appInsights) {
    return; // Silently skip if disabled
  }

  try {
    // Validate and sanitize inputs
    const sanitizedName = String(name).substring(0, 512);
    if (!sanitizedName || sanitizedName.length === 0) {
      console.warn('Skipping event tracking: invalid name');
      return;
    }

    // Sanitize properties
    const sanitizedProperties: { [key: string]: string } | undefined = properties && Object.keys(properties).length > 0
      ? Object.entries(properties)
          .filter(([_, value]) => value !== undefined && value !== null)
          .reduce((acc, [key, value]) => {
            const sanitizedKey = String(key).substring(0, 150);
            const sanitizedValue = String(value).substring(0, 8192);
            acc[sanitizedKey] = sanitizedValue;
            return acc;
          }, {} as { [key: string]: string })
      : undefined;

    // Sanitize measurements
    const sanitizedMeasurements: { [key: string]: number } | undefined = measurements && Object.keys(measurements).length > 0
      ? Object.entries(measurements)
          .filter(([_, value]) => typeof value === 'number' && isFinite(value))
          .reduce((acc, [key, value]) => {
            const sanitizedKey = String(key).substring(0, 150);
            acc[sanitizedKey] = value;
            return acc;
          }, {} as { [key: string]: number })
      : undefined;

    appInsights.trackEvent({
      name: sanitizedName,
      properties: sanitizedProperties && Object.keys(sanitizedProperties).length > 0 
        ? sanitizedProperties 
        : undefined,
      measurements: sanitizedMeasurements && Object.keys(sanitizedMeasurements).length > 0
        ? sanitizedMeasurements
        : undefined,
    });
  } catch (error) {
    // Silently handle errors to prevent breaking the application
    console.warn('Failed to track event (non-blocking):', error instanceof Error ? error.message : error);
  }
}

/**
 * Track a page view
 * @param name Page name
 * @param uri Optional page URI
 * @param properties Optional page properties
 */
export function trackPageView(
  name?: string,
  uri?: string,
  properties?: { [key: string]: string }
): void {
  if (!isEnabled || !appInsights) {
    return; // Silently skip if disabled
  }

  // Double-check that appInsights is still valid
  if (!appInsights || typeof appInsights.trackPageView !== 'function') {
    console.warn('Application Insights trackPageView is not available');
    return;
  }

  try {
    // Validate and sanitize inputs before tracking
    const sanitizedName = name ? String(name).substring(0, 1024) : undefined;
    const sanitizedUri = uri ? String(uri).substring(0, 2048) : undefined;
    
    // Sanitize properties
    const sanitizedProperties: { [key: string]: string } | undefined = properties && Object.keys(properties).length > 0
      ? Object.entries(properties)
          .filter(([_, value]) => value !== undefined && value !== null)
          .reduce((acc, [key, value]) => {
            const sanitizedKey = String(key).substring(0, 150);
            const sanitizedValue = String(value).substring(0, 8192);
            acc[sanitizedKey] = sanitizedValue;
            return acc;
          }, {} as { [key: string]: string })
      : undefined;

    // Create a minimal, safe payload
    const pageViewData: {
      name?: string;
      uri?: string;
      properties?: { [key: string]: string };
    } = {};

    if (sanitizedName) {
      pageViewData.name = sanitizedName;
    }
    if (sanitizedUri) {
      pageViewData.uri = sanitizedUri;
    }
    if (sanitizedProperties && Object.keys(sanitizedProperties).length > 0) {
      pageViewData.properties = sanitizedProperties;
    }

    // Use setTimeout to make the call asynchronous and non-blocking
    // Also wrap in requestAnimationFrame for additional safety
    setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          // Double-check everything is still valid
          if (!isEnabled || !appInsights) {
            return;
          }

          // Verify the function exists and is callable
          if (typeof appInsights.trackPageView !== 'function') {
            console.warn('Application Insights trackPageView is not a function');
            return;
          }

          // Try to call with the full data
          try {
            appInsights.trackPageView(pageViewData);
            // Reset error count on success
            errorCount = 0;
          } catch (syncError) {
            // Catch any synchronous errors
            errorCount++;
            console.warn(`Application Insights trackPageView error (${errorCount}/${MAX_ERRORS}):`, 
              syncError instanceof Error ? syncError.message : syncError);
            
            // If it fails, try with minimal data
            try {
              appInsights.trackPageView({
                name: sanitizedName || window.location.pathname,
              });
              errorCount = 0; // Reset on success
            } catch (minimalError) {
              // If even minimal data fails, increment error count
              errorCount++;
              console.warn(`Application Insights error count: ${errorCount}/${MAX_ERRORS}`);
              
              // Disable Application Insights after too many errors
              if (errorCount >= MAX_ERRORS) {
                console.error('Application Insights has failed too many times. Disabling to prevent further issues.');
                disableApplicationInsights();
              }
            }
          }
        } catch (outerError) {
          // Catch any errors in the wrapper itself
          errorCount++;
          console.warn('Failed to track page view (outer catch, non-blocking):', 
            outerError instanceof Error ? outerError.message : outerError);
          
          if (errorCount >= MAX_ERRORS) {
            console.error('Application Insights has failed too many times. Disabling to prevent further issues.');
            disableApplicationInsights();
          }
        }
      });
    }, 0);
  } catch (error) {
    // Silently handle errors to prevent breaking the application
    console.warn('Failed to track page view (non-blocking):', 
      error instanceof Error ? error.message : error);
  }
}

/**
 * Track an exception
 * @param exception The exception object
 * @param properties Optional exception properties
 * @param measurements Optional exception measurements
 */
export function trackException(
  exception: Error,
  properties?: { [key: string]: string },
  measurements?: { [key: string]: number }
): void {
  if (!isEnabled || !appInsights) {
    return; // Silently skip if disabled
  }

  try {
    // Sanitize properties - Application Insights limits: key max 150 chars, value max 8192 chars
    const sanitizedProperties: { [key: string]: string } | undefined = properties && Object.keys(properties).length > 0
      ? Object.entries(properties)
          .filter(([_, value]) => value !== undefined && value !== null)
          .reduce((acc, [key, value]) => {
            const sanitizedKey = String(key).substring(0, 150);
            const sanitizedValue = String(value).substring(0, 8192);
            acc[sanitizedKey] = sanitizedValue;
            return acc;
          }, {} as { [key: string]: string })
      : undefined;

    // Sanitize measurements - ensure all values are finite numbers
    const sanitizedMeasurements: { [key: string]: number } | undefined = measurements && Object.keys(measurements).length > 0
      ? Object.entries(measurements)
          .filter(([_, value]) => typeof value === 'number' && isFinite(value))
          .reduce((acc, [key, value]) => {
            const sanitizedKey = String(key).substring(0, 150);
            acc[sanitizedKey] = value;
            return acc;
          }, {} as { [key: string]: number })
      : undefined;

    appInsights.trackException({
      exception,
      properties: sanitizedProperties && Object.keys(sanitizedProperties).length > 0 
        ? sanitizedProperties 
        : undefined,
      measurements: sanitizedMeasurements && Object.keys(sanitizedMeasurements).length > 0
        ? sanitizedMeasurements
        : undefined,
    });
  } catch (error) {
    // Silently handle errors to prevent breaking the application
    console.warn('Failed to track exception (non-blocking):', 
      error instanceof Error ? error.message : error);
  }
}

/**
 * Track a trace message
 * @param message Trace message (max 32768 characters)
 * @param severityLevel Severity level (0=Verbose, 1=Information, 2=Warning, 3=Error, 4=Critical)
 * @param properties Optional trace properties
 */
export function trackTrace(
  message: string,
  severityLevel?: 0 | 1 | 2 | 3 | 4,
  properties?: { [key: string]: string }
): void {
  if (!isEnabled || !appInsights) {
    return; // Silently skip if disabled
  }

  try {
    // Validate and sanitize message - Application Insights limit: 32768 characters
    const sanitizedMessage = String(message).substring(0, 32768);
    if (!sanitizedMessage || sanitizedMessage.length === 0) {
      console.warn('Skipping trace tracking: empty message');
      return;
    }

    // Validate severity level
    const validSeverityLevel: 0 | 1 | 2 | 3 | 4 = 
      severityLevel !== undefined && severityLevel >= 0 && severityLevel <= 4
        ? severityLevel
        : 1; // Default to Information

    // Sanitize properties
    const sanitizedProperties: { [key: string]: string } | undefined = properties && Object.keys(properties).length > 0
      ? Object.entries(properties)
          .filter(([_, value]) => value !== undefined && value !== null)
          .reduce((acc, [key, value]) => {
            const sanitizedKey = String(key).substring(0, 150);
            const sanitizedValue = String(value).substring(0, 8192);
            acc[sanitizedKey] = sanitizedValue;
            return acc;
          }, {} as { [key: string]: string })
      : undefined;

    appInsights.trackTrace({
      message: sanitizedMessage,
      severityLevel: validSeverityLevel,
      properties: sanitizedProperties && Object.keys(sanitizedProperties).length > 0 
        ? sanitizedProperties 
        : undefined,
    });
  } catch (error) {
    // Silently handle errors to prevent breaking the application
    console.warn('Failed to track trace (non-blocking):', 
      error instanceof Error ? error.message : error);
  }
}

/**
 * Track a metric
 * @param name Metric name (max 1024 characters)
 * @param average Average value (must be finite number)
 * @param sampleCount Sample count (optional, must be positive integer)
 * @param min Minimum value (optional, must be finite number)
 * @param max Maximum value (optional, must be finite number)
 * @param properties Optional metric properties
 */
export function trackMetric(
  name: string,
  average: number,
  sampleCount?: number,
  min?: number,
  max?: number,
  properties?: { [key: string]: string }
): void {
  if (!isEnabled || !appInsights) {
    return; // Silently skip if disabled
  }

  try {
    // Validate and sanitize metric name
    const sanitizedName = String(name).substring(0, 1024);
    if (!sanitizedName || sanitizedName.length === 0) {
      console.warn('Skipping metric tracking: invalid name');
      return;
    }

    // Validate average is a finite number
    if (!isFinite(average) || typeof average !== 'number') {
      console.warn('Skipping metric tracking: average must be a finite number');
      return;
    }

    // Validate optional parameters
    const validSampleCount = sampleCount !== undefined 
      ? (Number.isInteger(sampleCount) && sampleCount > 0 ? sampleCount : undefined)
      : undefined;
    
    const validMin = min !== undefined && isFinite(min) && typeof min === 'number' ? min : undefined;
    const validMax = max !== undefined && isFinite(max) && typeof max === 'number' ? max : undefined;

    // Sanitize properties
    const sanitizedProperties: { [key: string]: string } | undefined = properties && Object.keys(properties).length > 0
      ? Object.entries(properties)
          .filter(([_, value]) => value !== undefined && value !== null)
          .reduce((acc, [key, value]) => {
            const sanitizedKey = String(key).substring(0, 150);
            const sanitizedValue = String(value).substring(0, 8192);
            acc[sanitizedKey] = sanitizedValue;
            return acc;
          }, {} as { [key: string]: string })
      : undefined;

    appInsights.trackMetric({
      name: sanitizedName,
      average,
      sampleCount: validSampleCount,
      min: validMin,
      max: validMax,
      properties: sanitizedProperties && Object.keys(sanitizedProperties).length > 0 
        ? sanitizedProperties 
        : undefined,
    });
  } catch (error) {
    // Silently handle errors to prevent breaking the application
    console.warn('Failed to track metric (non-blocking):', 
      error instanceof Error ? error.message : error);
  }
}

/**
 * Track a dependency (e.g., API call)
 * @param name Dependency name
 * @param command Command/URL
 * @param elapsed Elapsed time in milliseconds
 * @param success Whether the dependency call was successful
 * @param dependencyTypeName Type of dependency (e.g., 'HTTP', 'Ajax')
 * @param properties Optional dependency properties
 * @param responseCode Optional HTTP response code
 */
export function trackDependency(
  name: string,
  command: string,
  elapsed: number,
  success: boolean,
  dependencyTypeName?: string,
  properties?: { [key: string]: string },
  responseCode?: number
): void {
  if (!isEnabled || !appInsights) {
    return; // Silently skip if disabled
  }

  try {
    // trackDependencyData requires specific format for web SDK
    // Ensure all required fields are present and properly formatted
    // Validate and sanitize inputs to prevent 400 errors
    const sanitizedName = (name || 'Unknown').substring(0, 1024); // Max length
    const sanitizedCommand = command ? String(command).substring(0, 2048) : undefined; // Max length
    const sanitizedTarget = command ? String(command).substring(0, 2048) : undefined;
    
    // Ensure duration is valid
    const validDuration = Math.max(0, Math.min(Math.round(elapsed), 2147483647)); // Max int32
    
    // Ensure response code is valid HTTP status code
    const validResponseCode = responseCode && responseCode >= 100 && responseCode < 600 
      ? responseCode 
      : (success ? 200 : 500);
    
    // Sanitize properties - remove any undefined values and limit size
    const sanitizedProperties: { [key: string]: string } | undefined = properties && Object.keys(properties).length > 0
      ? Object.entries(properties)
          .filter(([_, value]) => value !== undefined && value !== null)
          .reduce((acc, [key, value]) => {
            // Limit property key and value length
            const sanitizedKey = key.substring(0, 150);
            const sanitizedValue = String(value).substring(0, 8192);
            acc[sanitizedKey] = sanitizedValue;
            return acc;
          }, {} as { [key: string]: string })
      : undefined;
    
    // Only track if we have valid data
    if (!sanitizedName || sanitizedName === 'Unknown') {
      console.warn('Skipping dependency tracking: invalid name');
      return;
    }
    
    const dependencyTelemetry: IDependencyTelemetry = {
      id: `dep-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`, // Use slice instead of deprecated substr
      name: sanitizedName,
      duration: validDuration,
      success: Boolean(success),
      responseCode: validResponseCode,
      type: (dependencyTypeName || 'HTTP').substring(0, 1024),
      data: sanitizedCommand,
      target: sanitizedTarget,
      properties: sanitizedProperties && Object.keys(sanitizedProperties).length > 0 
        ? sanitizedProperties 
        : undefined,
    };
    
    // Make the call asynchronously to prevent blocking
    setTimeout(() => {
      try {
        if (appInsights && isEnabled) {
          appInsights.trackDependencyData(dependencyTelemetry);
        }
      } catch (asyncError) {
        // Silently handle errors to prevent breaking the application
        console.warn('Failed to track dependency (async, non-blocking):', 
          asyncError instanceof Error ? asyncError.message : asyncError);
      }
    }, 0);
  } catch (error) {
    // Silently handle errors to prevent breaking the application
    console.warn('Failed to track dependency (non-blocking):', 
      error instanceof Error ? error.message : error);
  }
}

/**
 * Flush any pending telemetry
 * This forces immediate sending of any pending telemetry items
 */
export function flushTelemetry(): void {
  if (!isEnabled || !appInsights) {
    return;
  }

  try {
    appInsights.flush();
  } catch (error) {
    // Silently handle errors to prevent breaking the application
    console.warn('Failed to flush telemetry (non-blocking):', 
      error instanceof Error ? error.message : error);
  }
}

/**
 * Check if Application Insights is initialized and enabled
 */
export function isInitialized(): boolean {
  return isEnabled && appInsights !== null;
}

