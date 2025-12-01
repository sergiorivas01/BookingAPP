# Solución de Problemas - Application Insights 400 Bad Request

## Problema

Error 400 Bad Request al enviar telemetría a:

```
https://spaincentral-0.in.applicationinsights.azure.com/v2/track
```

## Posibles Causas y Soluciones

### 1. Verificar Connection String

Asegúrate de que la connection string esté en el formato correcto:

```env
VITE_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxx;IngestionEndpoint=https://spaincentral-0.in.applicationinsights.azure.com/
```

**Formato esperado:**

- Debe incluir `InstrumentationKey=`
- Debe incluir `IngestionEndpoint=`
- Los valores deben estar separados por `;`

### 2. Verificar el Endpoint

El SDK debería usar automáticamente el endpoint correcto desde la connection string. Si el problema persiste:

- Verifica que la connection string incluya el endpoint correcto para tu región
- El endpoint debe ser: `https://spaincentral-0.in.applicationinsights.azure.com/`

### 3. Verificar la Versión del SDK

El proyecto usa `@microsoft/applicationinsights-web@3.3.10`. Si hay problemas, intenta:

```bash
cd frontend
pnpm update @microsoft/applicationinsights-web
```

### 4. Verificar el Formato de los Datos

El código ahora valida y formatea correctamente los datos de telemetría. Si el problema persiste:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña Network
3. Busca las solicitudes a `applicationinsights.azure.com`
4. Revisa el payload de la solicitud que falla
5. Verifica que todos los campos requeridos estén presentes

### 5. Verificar Autenticación

Si tu recurso de Application Insights requiere autenticación con Microsoft Entra ID:

- El SDK web no soporta autenticación con Microsoft Entra ID directamente
- Necesitarías usar un proxy o configuración adicional
- Verifica en Azure Portal si tu recurso requiere autenticación

### 6. Verificar CORS

Aunque es menos probable, verifica que no haya problemas de CORS:

- El endpoint de Application Insights debería aceptar solicitudes desde cualquier origen
- Si hay problemas, verifica la configuración en Azure Portal

### 7. Logs de Depuración

El código ahora incluye mejor logging. Revisa la consola del navegador para:

- Errores de inicialización
- Errores al rastrear dependencias
- Detalles de errores de telemetría

### 8. Deshabilitar Temporalmente el Rastreo Automático

Si el problema persiste, puedes deshabilitar temporalmente el rastreo automático de dependencias en `services/api.ts` para aislar el problema:

```typescript
// Comentar temporalmente estas líneas en fetchApi
// trackDependency(...)
```

### 9. Verificar en Azure Portal

1. Ve a tu recurso de Application Insights en Azure Portal
2. Verifica que el recurso esté activo
3. Revisa los logs de actividad para ver si hay errores del lado del servidor
4. Verifica la configuración de ingesta de datos

### 10. Probar con un Evento Simple

Para aislar el problema, prueba rastrear solo un evento simple:

```typescript
import { trackEvent } from "./services/applicationInsights";

// En un componente
trackEvent("TestEvent", { test: "value" });
```

Si este evento funciona pero las dependencias no, el problema está en el formato de `trackDependencyData`.

## Cambios Realizados

1. ✅ Validación del formato de connection string
2. ✅ Mejora del formato de `trackDependencyData` con validación de campos
3. ✅ Mejor manejo de errores con logging detallado
4. ✅ Asegurar que todos los campos requeridos estén presentes
5. ✅ Validación de tipos con TypeScript

## Deshabilitar Application Insights Temporalmente

Si los errores 400 persisten y no puedes resolverlos, puedes deshabilitar Application Insights temporalmente:

### Opción 1: Variable de Entorno

Agrega esta variable a tu archivo `.env` en `frontend/`:

```env
VITE_APPINSIGHTS_DISABLED=true
```

### Opción 2: Código

En la consola del navegador, ejecuta:

```javascript
// Deshabilitar Application Insights
window.disableApplicationInsights?.();
```

O importa y llama la función:

```typescript
import { disableApplicationInsights } from "./services/applicationInsights";
disableApplicationInsights();
```

## Próximos Pasos

1. Verifica la connection string en tu archivo `.env`
2. Revisa la consola del navegador para errores detallados
3. Verifica el payload de las solicitudes fallidas en Network tab
4. Si el problema persiste, deshabilita temporalmente Application Insights usando `VITE_APPINSIGHTS_DISABLED=true`
5. Verifica en Azure Portal que tu recurso de Application Insights esté activo y configurado correctamente
