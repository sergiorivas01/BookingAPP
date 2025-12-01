# Azure Application Insights - Guía de Uso

Esta aplicación está configurada para usar Azure Application Insights para el registro de telemetría y monitoreo.

## Configuración

### Variable de Entorno

Para habilitar Application Insights, necesitas configurar la variable de entorno `VITE_APPINSIGHTS_CONNECTION_STRING` con tu connection string de Azure Application Insights.

Crea un archivo `.env` en la raíz del proyecto `frontend/` con:

```env
VITE_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxx;IngestionEndpoint=https://xxxxx.in.applicationinsights.azure.com/
```

O configura la variable de entorno en tu sistema antes de ejecutar la aplicación.

## Funcionalidades Automáticas

La aplicación rastrea automáticamente:

1. **Vistas de página**: Se rastrean automáticamente cuando cambias de ruta usando React Router
2. **Llamadas API**: Todas las llamadas al backend se rastrean como dependencias con métricas de rendimiento
3. **Excepciones**: Los errores de JavaScript se rastrean automáticamente
4. **Errores de red**: Los errores de red y API se rastrean como excepciones

## Uso en Componentes

### Hook para Rastrear Eventos Personalizados

```typescript
import { useApplicationInsights } from '../hooks/useApplicationInsights';

function MyComponent() {
  const { trackEvent, trackException, trackTrace } = useApplicationInsights();

  const handleButtonClick = () => {
    // Rastrear un evento personalizado
    trackEvent('ButtonClicked', {
      buttonName: 'Submit',
      page: 'Dashboard',
    });
  };

  const handleError = (error: Error) => {
    // Rastrear una excepción personalizada
    trackException(error, {
      component: 'MyComponent',
      action: 'handleSubmit',
    });
  };

  const logInfo = () => {
    // Rastrear un mensaje de trace
    trackTrace('User performed action', 1, {
      userId: '123',
      action: 'viewDetails',
    });
  };

  return (
    // ... tu componente
  );
}
```

### Rastrear Métricas Personalizadas

```typescript
import { useApplicationInsights } from '../hooks/useApplicationInsights';

function MyComponent() {
  const { trackMetric } = useApplicationInsights();

  const trackPerformance = (duration: number) => {
    trackMetric('ComponentRenderTime', duration, 1, duration, duration, {
      component: 'MyComponent',
    });
  };

  return (
    // ... tu componente
  );
}
```

### Rastrear Dependencias Personalizadas

```typescript
import { useApplicationInsights } from '../hooks/useApplicationInsights';

function MyComponent() {
  const { trackDependency } = useApplicationInsights();

  const callExternalService = async () => {
    const startTime = performance.now();
    try {
      const response = await fetch('https://external-api.com/data');
      const elapsed = performance.now() - startTime;

      trackDependency(
        'External API Call',
        'https://external-api.com/data',
        Math.round(elapsed),
        response.ok,
        'HTTP',
        { service: 'ExternalAPI' },
        response.status
      );
    } catch (error) {
      const elapsed = performance.now() - startTime;
      trackDependency(
        'External API Call',
        'https://external-api.com/data',
        Math.round(elapsed),
        false,
        'HTTP',
        { service: 'ExternalAPI', error: error.message }
      );
    }
  };

  return (
    // ... tu componente
  );
}
```

## Funciones Disponibles

### Desde el servicio (`applicationInsights.ts`)

- `initializeApplicationInsights()`: Inicializa Application Insights (ya se llama en `main.tsx`)
- `trackEvent(name, properties?, measurements?)`: Rastrea un evento personalizado
- `trackPageView(name?, uri?, properties?)`: Rastrea una vista de página
- `trackException(exception, properties?, measurements?)`: Rastrea una excepción
- `trackTrace(message, severityLevel?, properties?)`: Rastrea un mensaje de trace
- `trackMetric(name, average, sampleCount?, min?, max?, properties?)`: Rastrea una métrica
- `trackDependency(name, command, elapsed, success, type?, properties?, responseCode?)`: Rastrea una dependencia
- `flushTelemetry()`: Fuerza el envío de telemetría pendiente
- `isInitialized()`: Verifica si Application Insights está inicializado

### Desde el hook (`useApplicationInsights`)

- `usePageTracking()`: Hook que rastrea automáticamente los cambios de ruta (ya se usa en `App.tsx`)
- `useApplicationInsights()`: Hook que proporciona todas las funciones de tracking

## Niveles de Severidad para Traces

- `0`: Verbose
- `1`: Information
- `2`: Warning
- `3`: Error
- `4`: Critical

## Notas

- Si Application Insights no está inicializado (por falta de connection string), las funciones de tracking mostrarán advertencias en la consola pero no fallarán
- La telemetría se envía de forma asíncrona, por lo que no afecta el rendimiento de la aplicación
- Todas las llamadas API ya están siendo rastreadas automáticamente en `services/api.ts`
