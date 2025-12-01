/**
 * Azure Application Insights service
 * Configures and provides telemetry tracking for the frontend application
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';

let appInsights: ApplicationInsights | null = null;

/**
 * Initialize Application Insights with connection string from environment
 */
export function initializeApplicationInsights(): void {
  const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.warn('Application Insights: Connection string not found. Telemetry will not be sent.');
    return;
  }

  try {
    appInsights = new ApplicationInsights({
      config: {
        connectionString: connectionString,
        enableAutoRouteTracking: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        enableCorsCorrelation: true,
        enableAjaxPerfTracking: true,
        enableAjaxErrorStatusText: true,
        // Enable automatic exception tracking (false means tracking is enabled)
        disableExceptionTracking: false,
      },
    });

    appInsights.loadAppInsights();
    appInsights.trackPageView();

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
  if (!appInsights) {
    console.warn('Application Insights not initialized. Event not tracked:', name);
    return;
  }

  try {
    appInsights.trackEvent({
      name,
      properties,
      measurements,
    });
  } catch (error) {
    console.error('Failed to track event:', error);
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
  if (!appInsights) {
    console.warn('Application Insights not initialized. Page view not tracked:', name || uri);
    return;
  }

  try {
    appInsights.trackPageView({
      name,
      uri,
      properties,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
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
  if (!appInsights) {
    console.warn('Application Insights not initialized. Exception not tracked:', exception.message);
    return;
  }

  try {
    appInsights.trackException({
      exception,
      properties,
      measurements,
    });
  } catch (error) {
    console.error('Failed to track exception:', error);
  }
}

/**
 * Track a trace message
 * @param message Trace message
 * @param severityLevel Severity level (Verbose, Information, Warning, Error, Critical)
 * @param properties Optional trace properties
 */
export function trackTrace(
  message: string,
  severityLevel?: 0 | 1 | 2 | 3 | 4,
  properties?: { [key: string]: string }
): void {
  if (!appInsights) {
    console.warn('Application Insights not initialized. Trace not tracked:', message);
    return;
  }

  try {
    appInsights.trackTrace({
      message,
      severityLevel,
      properties,
    });
  } catch (error) {
    console.error('Failed to track trace:', error);
  }
}

/**
 * Track a metric
 * @param name Metric name
 * @param average Average value
 * @param sampleCount Sample count
 * @param min Minimum value
 * @param max Maximum value
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
  if (!appInsights) {
    console.warn('Application Insights not initialized. Metric not tracked:', name);
    return;
  }

  try {
    appInsights.trackMetric({
      name,
      average,
      sampleCount,
      min,
      max,
      properties,
    });
  } catch (error) {
    console.error('Failed to track metric:', error);
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
  if (!appInsights) {
    console.warn('Application Insights not initialized. Dependency not tracked:', name);
    return;
  }

  try {
    appInsights.trackDependencyData({
      name,
      id: `${name}-${Date.now()}`,
      target: command,
      duration: elapsed,
      success,
      responseCode: responseCode || (success ? 200 : 500),
      type: dependencyTypeName || 'HTTP',
      data: command,
      properties,
    });
  } catch (error) {
    console.error('Failed to track dependency:', error);
  }
}

/**
 * Flush any pending telemetry
 */
export function flushTelemetry(): void {
  if (!appInsights) {
    return;
  }

  try {
    appInsights.flush();
  } catch (error) {
    console.error('Failed to flush telemetry:', error);
  }
}

/**
 * Check if Application Insights is initialized
 */
export function isInitialized(): boolean {
  return appInsights !== null;
}

