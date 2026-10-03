# Integración Formulario Grupak → Webhook n8n (WhatsApp / InfinityMind)

Documento de referencia sobre cómo el widget de formulario del sitio (`widgets/formulario/`) envía datos al webhook de n8n provisto por InfinityMind.

## 1. Resumen

El widget tiene dos pestañas — **Contacto** y **Quiero ser proveedor**. Ambas envían sus datos al mismo endpoint de n8n. Antes usaban Formspree, pero esa integración nunca se configuró con un ID real (el envío no funcionaba). El webhook de n8n la reemplaza por completo.

## 2. Endpoint

```
POST https://infinity-mind.app.n8n.cloud/webhook/grupak-landing-consent
Content-Type: application/json
```

Sin autenticación (endpoint público), tal como lo especificó InfinityMind.

## 3. Valores fijos enviados en cada solicitud

| Campo | Valor |
|---|---|
| `source` | `landing-grupak-whatsapp` |
| `campaign_id` | `grupak-sitio-web` |
| `campaign_name` | `Formulario sitio web Grupak` |

Se usan valores genéricos porque el formulario vive en el sitio principal, no en una landing dedicada a una campaña de ads específica. Si más adelante se lanza una landing para una campaña puntual (ej. Facebook Ads), avisar para actualizar estos tres valores en `widgets/formulario/formulario.js` (líneas 15-16).

## 4. Mapeo de campos — pestaña "Contacto"

| Campo visible en el formulario | Campo en el payload | Notas |
|---|---|---|
| Nombre + Apellido | `nombre` | Se concatenan: `"Juan Pérez"` |
| Empresa / Razón social | `empresa` | |
| Teléfono principal | `telefono` | Se envía tal cual lo escribe el usuario (ver §7) |
| Correo electrónico principal | `correo` | |
| Tarjeta de producto seleccionada | `producto` | Se envía la etiqueta visible, ej. `"Cajas de cartón corrugado"` |
| Cantidad (toneladas o tiraje, según el producto elegido) | `cantidad` | Solo si el usuario seleccionó un producto y llenó ese campo |
| Comentarios adicionales (campo dinámico según producto) | `comentarios` | Solo si el usuario seleccionó un producto y escribió algo |
| Checkbox "Acepto recibir mensajes de WhatsApp…" | `consent_whatsapp` | `true` / `false` |
| — (texto fijo) | `consent_text` | Siempre se envía, sin importar si el checkbox quedó marcado o no |
| URL de la página al momento de enviar | `landing_url` | Incluye los parámetros `utm_*` si los hay |
| `document.referrer` del navegador | `referrer_url` | Vacío si el usuario llegó directo |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` de la URL | `utm_*` | Solo si están presentes en la URL |

**No se envían:** `ciudad`, `medidas` — el formulario actual no tiene esos campos (ver §8, punto 2).

### Ejemplo real de payload — Contacto

```json
{
  "source": "landing-grupak-whatsapp",
  "campaign_id": "grupak-sitio-web",
  "campaign_name": "Formulario sitio web Grupak",
  "nombre": "Juan Pérez",
  "empresa": "Comercial ABC",
  "telefono": "+525524937489",
  "correo": "juan@empresa.com",
  "producto": "Cajas de cartón corrugado",
  "cantidad": "5",
  "comentarios": "Necesito cajas resistentes para producto frágil.",
  "consent_whatsapp": true,
  "consent_text": "Acepto recibir mensajes de WhatsApp de Grupak relacionados con mi solicitud de cotización y entiendo que puedo solicitar dejar de recibirlos.",
  "landing_url": "https://www.grupak.com.mx/?utm_source=facebook&utm_medium=cpc&utm_campaign=grupak-cotiza-empaques-2026-05",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "grupak-cotiza-empaques-2026-05"
}
```

> Los campos que quedan vacíos (ej. `cantidad` si el usuario no eligió producto) se omiten del JSON en vez de enviarse como cadena vacía.

## 5. Mapeo de campos — pestaña "Quiero ser proveedor"

| Campo visible en el formulario | Campo en el payload | Notas |
|---|---|---|
| Nombre + Apellido | `nombre` | |
| Nombre de la empresa | `empresa` | |
| Teléfono principal | `telefono` | |
| Correo electrónico principal | `correo` | |
| — | `producto` | **No se envía a propósito** — este formulario es de un proveedor ofreciendo servicios, no de un prospecto pidiendo cotización, así que no aplica el concepto de "producto de interés" (ver §8, punto 5) |
| Categoría + Especialidad (selects) | prefijo de `comentarios` | Se antepone como `"Categoría: X \| Especialidad: Y — "` antes del texto libre |
| Comentarios * | `comentarios` | Campo obligatorio del formulario |
| Checkbox "Acepto recibir mensajes de WhatsApp…" | `consent_whatsapp` | `true` / `false` |
| — (texto fijo) | `consent_text` | |
| URL, referrer, UTMs | `landing_url`, `referrer_url`, `utm_*` | Igual que en Contacto |

**No se envían:** `producto`, `ciudad`, `medidas`.

### Ejemplo real de payload — Proveedor

```json
{
  "source": "landing-grupak-whatsapp",
  "campaign_id": "grupak-sitio-web",
  "campaign_name": "Formulario sitio web Grupak",
  "nombre": "Ana García",
  "empresa": "Empresa Test",
  "telefono": "+525500000000",
  "correo": "dev@test.com",
  "comentarios": "Categoría: Materia prima | Especialidad: Fibra / papel reciclado — Prueba desde desarrollo",
  "consent_whatsapp": false,
  "consent_text": "Acepto recibir mensajes de WhatsApp de Grupak relacionados con mi solicitud de cotización y entiendo que puedo solicitar dejar de recibirlos.",
  "landing_url": "https://www.grupak.com.mx/?gpkForm=proveedor"
}
```

## 6. Consentimiento de WhatsApp

- El checkbox es **opcional**: no bloquea el envío del formulario si el usuario no lo marca.
- Si **no** se marca → `consent_whatsapp: false`. La solicitud se registra pero no dispara WhatsApp.
- Si **se marca** → `consent_whatsapp: true`. Dispara el template `valeriasolicitallama` (es_MX), según lo indicado por InfinityMind.
- `consent_text` se envía siempre igual al texto mostrado junto al checkbox, sin importar si se marcó o no, para dejar constancia de qué vio el usuario.

## 7. Formato del teléfono

El campo se envía tal cual lo escribe el usuario (sin forzar `+52` ni validar formato E.164 en el frontend). Según la especificación de InfinityMind, n8n normaliza el número automáticamente, pero conviene que el usuario lo escriba ya en formato internacional para reducir errores. No se agregó validación adicional en el formulario porque no fue parte del alcance solicitado; puede añadirse después si se detectan problemas de normalización.

## 8. Decisiones tomadas durante la integración


1. Se agregó el checkbox de consentimiento de WhatsApp en ambas pestañas, con el texto exacto que especificó InfinityMind.
2. **No** se agregaron campos visibles de "ciudad" ni "medidas" al formulario — son opcionales en el payload y simplemente se omiten. Si el cliente necesita capturarlos, hay que añadir esos campos al formulario (desarrollo adicional, no incluido).
3. Se retiró el campo "Subir archivo" de la pestaña Proveedor: el webhook solo acepta JSON y no soporta adjuntos. Si el cliente necesita recibir archivos de proveedores (catálogos, presentaciones), se requiere un servicio adicional en paralelo (ej. una cuenta real de Formspree, o un endpoint de carga de archivos aparte) — actualmente no está conectado nada para esto.
4. En la pestaña Proveedor, el campo `producto` del payload se deja vacío a propósito. Enviar la categoría del proveedor (ej. "Materia prima") en el campo `producto` sería engañoso, ya que ese campo está pensado para "qué producto quiere comprar el prospecto". La categoría y especialidad del proveedor sí se conservan, dentro de `comentarios`.
5. `campaign_id` y `campaign_name` usan valores genéricos de sitio web porque el formulario no vive en una landing dedicada a una campaña de ads. Ver §3.

## 9. Protección anti-spam

El formulario incluye un campo oculto tipo honeypot (`_gotcha`), invisible para usuarios reales pero visible para bots automatizados. Si ese campo llega con contenido, el formulario simula un envío exitoso pero **no** llama al webhook. Esto es importante porque el endpoint no requiere autenticación: sin esta protección, cualquier bot podría disparar mensajes reales de WhatsApp o llenar de basura el dashboard de InfinityMind.

## 10. Respuesta esperada y manejo de errores

- **HTTP 200** → el formulario se limpia y muestra: *"Gracias. Tu información fue enviada correctamente. Nuestro equipo te contactará muy pronto."*
- **HTTP 4xx/5xx o error de red** → se muestra un mensaje de error y el usuario puede reintentar. El formulario **no** se limpia en caso de error, para no perder lo ya escrito.

