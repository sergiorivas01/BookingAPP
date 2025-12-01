# Guía de Configuración de Application Insights

## Verificar la Connection String

El error 400 generalmente indica un problema con la connection string. Sigue estos pasos para verificar:

### 1. Obtener la Connection String Correcta

1. Ve a [Azure Portal](https://portal.azure.com)
2. Navega a tu recurso de Application Insights
3. En el menú izquierdo, busca **"Overview"** o **"Essentials"**
4. Haz clic en **"Connection String"** o **"Show connection strings"**
5. Copia la connection string completa

### 2. Formato Correcto de Connection String

La connection string debe tener este formato:

```
InstrumentationKey=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;IngestionEndpoint=https://spaincentral-0.in.applicationinsights.azure.com/
```

**Componentes importantes:**
- `InstrumentationKey`: Debe ser un GUID válido (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
- `IngestionEndpoint`: Debe apuntar a la región correcta de tu recurso
- Ambos deben estar separados por `;`

### 3. Verificar en el Código

Agrega la connection string a tu archivo `.env` en `frontend/`:

```env
VITE_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/
```

### 4. Ejecutar Diagnóstico

Abre la consola del navegador (F12) y ejecuta:

```javascript
window.diagnoseApplicationInsights()
```

Esto mostrará información detallada sobre la configuración actual.

## Problemas Comunes y Soluciones

### Error 400: Bad Request

**Causas posibles:**

1. **Connection String Incorrecta**
   - ✅ Verifica que la connection string esté completa
   - ✅ Asegúrate de que no tenga espacios extra
   - ✅ Verifica que el InstrumentationKey sea un GUID válido

2. **Región Incorrecta**
   - ✅ El IngestionEndpoint debe coincidir con la región de tu recurso
   - ✅ Si tu recurso está en "Spain Central", el endpoint debe ser `spaincentral-0.in.applicationinsights.azure.com`

3. **Recurso Deshabilitado o Eliminado**
   - ✅ Verifica en Azure Portal que el recurso esté activo
   - ✅ Verifica que no haya sido eliminado o movido

4. **Formato de Datos Inválido**
   - ✅ El código ahora valida y sanitiza todos los datos automáticamente
   - ✅ Si persiste, revisa los logs en la consola del navegador

### Verificar la Connection String en Azure Portal

1. Ve a tu recurso de Application Insights en Azure Portal
2. En **"Overview"**, busca la sección **"Essentials"**
3. Verifica que:
   - El **Subscription** sea correcto
   - El **Resource Group** sea correcto
   - El **Location/Region** coincida con el endpoint en tu connection string

### Probar con una Connection String de Prueba

Si tienes acceso a otro recurso de Application Insights, prueba temporalmente con esa connection string para verificar si el problema es específico de tu recurso.

## Pasos de Diagnóstico

1. **Verificar Variables de Entorno**
   ```bash
   # En frontend/
   cat .env | grep APPINSIGHTS
   ```

2. **Verificar en el Navegador**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña "Console"
   - Ejecuta: `window.diagnoseApplicationInsights()`
   - Revisa los resultados

3. **Verificar Network Requests**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña "Network"
   - Filtra por "applicationinsights"
   - Revisa las solicitudes fallidas
   - Haz clic en la solicitud y revisa:
     - **Headers**: Verifica que la URL sea correcta
     - **Payload**: Revisa el contenido enviado (puede estar vacío o mal formateado)

4. **Verificar en Azure Portal**
   - Ve a tu recurso de Application Insights
   - En el menú izquierdo, busca **"Logs"** o **"Live Metrics"**
   - Verifica si hay datos llegando (puede tomar unos minutos)

## Solución Paso a Paso

1. **Obtén la connection string correcta desde Azure Portal**
2. **Copia la connection string completa** (incluye InstrumentationKey e IngestionEndpoint)
3. **Agrega a `frontend/.env`:**
   ```env
   VITE_APPINSIGHTS_CONNECTION_STRING=tu_connection_string_completa_aqui
   ```
4. **Reinicia el servidor de desarrollo:**
   ```bash
   # Detén el servidor (Ctrl+C) y reinícialo
   cd frontend
   pnpm dev
   ```
5. **Recarga el navegador** (Ctrl+Shift+R para hard refresh)
6. **Ejecuta el diagnóstico:**
   ```javascript
   window.diagnoseApplicationInsights()
   ```
7. **Revisa la consola** para ver si hay errores o advertencias

## Si el Problema Persiste

1. Verifica que el recurso de Application Insights esté activo en Azure Portal
2. Verifica que tengas permisos para escribir telemetría en el recurso
3. Prueba crear un nuevo recurso de Application Insights y usar esa connection string
4. Revisa los logs en Azure Portal para ver si hay errores del lado del servidor

## Contacto y Soporte

Si después de seguir estos pasos el problema persiste:
- Revisa la [documentación oficial de Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript)
- Consulta los [foros de Azure](https://learn.microsoft.com/en-us/answers/topics/azure-monitor.html)
- Contacta con el soporte de Azure si tienes una suscripción de soporte

