# Inventario de Assets Gráficos - x402-Hunter

## Resumen

Este documento lista todos los elementos visuales que actualmente están hechos con CSS puro y que podrían ser reemplazados con arte personalizado (sprites, imágenes, SVGs) para mejorar la experiencia visual del juego.

---

## 1. PERSONAJES - Patos (Duck Sprites)

### Pato Normal - Variaciones de Color
| Asset | Descripción | Tamaño Recomendado | Estados |
|-------|-------------|-------------------|---------|
| `duck-red.png` | Pato color café/rojo | 64x64 px | flying, shot, falling |
| `duck-blue.png` | Pato color azul | 64x64 px | flying, shot, falling |
| `duck-green.png` | Pato color verde | 64x64 px | flying, shot, falling |

### Pato Dorado (Power-Up)
| Asset | Descripción | Tamaño Recomendado | Estados |
|-------|-------------|-------------------|---------|
| `duck-golden.png` | Pato dorado brillante | 64x64 px | flying, shot, falling |
| `duck-golden-glow.png` | Efecto glow del pato dorado | 96x96 px | Overlay animado |

### Sprite Sheets por Pato (Opcional - Animación)
```
Frames recomendados por estado:
- flying: 3-4 frames (aleteo)
- shot: 2 frames (impacto)
- falling: 2 frames (caída con giro)

Direcciones:
- left (espejado de right)
- right
- top-left (diagonal arriba-izquierda)
- top-right (diagonal arriba-derecha)
```

---

## 2. ESCENARIO (Background)

### Fondo Principal
| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `background-sky.png` | Cielo degradado (azul a naranja atardecer) | 1920x1080 px |
| `background-full.png` | Fondo completo con todo integrado | 1920x1080 px |

### Elementos del Escenario (Layers separados)
| Asset | Descripción | Tamaño Recomendado | Posición |
|-------|-------------|-------------------|----------|
| `sky-gradient.png` | Cielo base | 1920x600 px | Top |
| `sun.png` | Sol con rayos | 128x128 px | Top-right |
| `cloud-1.png` | Nube pequeña | 120x60 px | Floating |
| `cloud-2.png` | Nube mediana | 160x80 px | Floating |
| `cloud-3.png` | Nube grande | 200x100 px | Floating |
| `mountains.png` | Montañas de fondo | 1920x400 px | Mid-layer |
| `trees-bg.png` | Árboles de fondo (siluetas) | 1920x300 px | Mid-layer |
| `trees-fg.png` | Árboles de primer plano | 1920x250 px | Foreground |
| `grass.png` | Césped base | 1920x200 px | Bottom |
| `grass-detail.png` | Detalles de hierba alta | 1920x50 px | Bottom overlay |

### Variaciones de Escenario (Opcional por Nivel)
```
Level 1-2: Día soleado (sunny)
Level 3-4: Atardecer (sunset)
Level 5-6: Noche/Oscuro (night)

Archivos:
- background-day.png
- background-sunset.png
- background-night.png
```

---

## 3. INTERFAZ (UI/HUD)

### Logo y Branding
| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `logo-main.png` | Logo principal "x402-Hunter" | 400x100 px |
| `logo-small.png` | Logo pequeño para HUD | 150x40 px |
| `favicon.ico` | Icono del navegador | 32x32 px |
| `og-image.png` | Imagen para redes sociales | 1200x630 px |

### Iconos del HUD
| Asset | Descripción | Tamaño Recomendado | Uso |
|-------|-------------|-------------------|-----|
| `icon-heart.png` | Vida/Corazón | 32x32 px | Vidas |
| `icon-bullet.png` | Bala/Munición | 16x32 px | Balas restantes |
| `icon-score.png` | Estrella/Puntos | 32x32 px | Indicador score |
| `icon-timer.png` | Reloj | 32x32 px | Temporizador |
| `icon-duck.png` | Silueta pato | 32x32 px | Contador patos |
| `icon-pause.png` | Botón pausa | 32x32 px | HUD |
| `icon-sound-on.png` | Sonido activado | 32x32 px | Settings |
| `icon-sound-off.png` | Sonido desactivado | 32x32 px | Settings |

### Power-Up Indicators
| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `powerup-rapidfire.png` | Icono rapid fire (rayo) | 48x48 px |
| `powerup-bar-bg.png` | Barra de progreso fondo | 200x20 px |
| `powerup-bar-fill.png` | Barra de progreso relleno | 200x20 px |

---

## 4. CURSORES

| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `cursor-crosshair.png` | Mira de disparo normal | 32x32 px |
| `cursor-crosshair-gold.png` | Mira durante rapid fire | 32x32 px |
| `cursor-pointer.png` | Cursor para menús | 24x24 px |

---

## 5. EFECTOS VISUALES (VFX)

### Disparos y Impactos
| Asset | Descripción | Tamaño Recomendado | Frames |
|-------|-------------|-------------------|--------|
| `vfx-muzzle-flash.png` | Destello de disparo | 64x64 px | 3 frames |
| `vfx-hit-feathers.png` | Plumas volando al impacto | 128x128 px | 5 frames |
| `vfx-hit-smoke.png` | Humo de impacto | 64x64 px | 4 frames |
| `vfx-miss-splash.png` | Impacto fallido (agua/tierra) | 48x48 px | 3 frames |

### Power-Ups
| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `vfx-powerup-collect.png` | Efecto al recoger power-up | 128x128 px |
| `vfx-golden-sparkle.png` | Brillos del pato dorado | 96x96 px |
| `vfx-rapidfire-aura.png` | Aura durante rapid fire | 64x64 px |

### Transiciones
| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `vfx-level-complete.png` | Efecto nivel completado | 400x200 px |
| `vfx-confetti.png` | Confetti de victoria | Sprite sheet |

---

## 6. PANTALLAS ESPECIALES

### Menú Principal
| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `menu-background.png` | Fondo decorativo menú | 1920x1080 px |
| `menu-frame.png` | Marco/borde del panel | 600x800 px |
| `btn-play.png` | Botón "Jugar" | 250x60 px |
| `btn-play-hover.png` | Botón "Jugar" hover | 250x60 px |

### Game Over
| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `gameover-title.png` | Texto "GAME OVER" estilizado | 400x100 px |
| `gameover-duck-sad.png` | Pato triste/caído | 128x128 px |

### Victoria
| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `victory-title.png` | Texto "VICTORY" estilizado | 400x100 px |
| `victory-trophy.png` | Trofeo dorado | 128x128 px |
| `victory-stars.png` | Estrellas de rating | 48x48 px cada una |

### Wave/Level Complete
| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `wave-complete-banner.png` | Banner "Wave Complete" | 400x80 px |
| `level-complete-banner.png` | Banner "Level Complete" | 400x80 px |

---

## 7. MODAL DE PAGO

| Asset | Descripción | Tamaño Recomendado |
|-------|-------------|-------------------|
| `payment-frame.png` | Marco del modal | 450x550 px |
| `icon-usdc.png` | Logo USDC | 48x48 px |
| `icon-avalanche.png` | Logo Avalanche | 48x48 px |
| `icon-x402.png` | Logo x402 Protocol | 120x40 px |
| `icon-wallet.png` | Icono wallet genérico | 32x32 px |
| `icon-metamask.png` | Logo MetaMask | 32x32 px |
| `icon-core.png` | Logo Core Wallet | 32x32 px |
| `spinner-loading.png` | Spinner de carga | 48x48 px (animated) |
| `icon-success.png` | Check de éxito | 64x64 px |
| `icon-error.png` | X de error | 64x64 px |

---

## 8. ANIMACIONES RECOMENDADAS

### Pato Flying (Sprite Sheet)
```
Estructura recomendada: 4 columnas x 4 filas
- Row 1: Vuelo derecha (4 frames)
- Row 2: Vuelo izquierda (4 frames)
- Row 3: Vuelo diagonal up-right (4 frames)
- Row 4: Vuelo diagonal up-left (4 frames)

Total: 16 frames por pato
Tamaño total: 256x256 px (64x64 por frame)
```

### Pato Shot/Falling
```
- Frame 1: Impacto inicial
- Frame 2: Ojos cerrados/X
- Frame 3-4: Cayendo con rotación

Total: 4 frames
```

---

## 9. PRIORIDADES DE IMPLEMENTACIÓN

### Alta Prioridad (Impacto Visual Máximo)
1. Sprites de patos (los 4 colores)
2. Fondo del escenario completo
3. Logo principal
4. Mira de disparo (crosshair)

### Media Prioridad
5. Iconos del HUD
6. Efectos de impacto (plumas)
7. Pantallas Game Over/Victoria
8. Pato dorado con efectos

### Baja Prioridad (Nice to Have)
9. Variaciones de fondo por nivel
10. Animaciones de transición
11. Cursores personalizados
12. Confetti y efectos extra

---

## 10. ESPECIFICACIONES TÉCNICAS

### Formatos Recomendados
- **Sprites/Iconos**: PNG-24 con transparencia
- **Fondos**: PNG o WebP (mejor compresión)
- **Animaciones**: Sprite sheets PNG o GIF/APNG
- **Vectores (UI)**: SVG cuando sea posible

### Paleta de Colores Sugerida
```css
/* Colores principales del juego */
--gold: #FFD700;
--orange: #FF9800;
--red: #FF6B6B;
--blue: #1E90FF;
--green: #32CD32;
--dark-green: #228B22;
--brown: #8B4513;
--sky-blue: #87CEEB;

/* UI/Branding */
--x402-gold: #FFD700;
--x402-red: #FF6B6B;
--avalanche-red: #E84142;
--usdc-blue: #2775CA;
```

### Estilo Visual Recomendado
- **Estética**: Pixel art 16-bit o cartoon flat
- **Consistencia**: Mantener mismo estilo en todos los assets
- **Contraste**: Alto contraste para visibilidad durante gameplay
- **Animaciones**: Fluidas pero distintas (60fps target)

---

## 11. ESTRUCTURA DE CARPETAS PROPUESTA

```
/public/assets/
├── sprites/
│   ├── ducks/
│   │   ├── duck-red-sheet.png
│   │   ├── duck-blue-sheet.png
│   │   ├── duck-green-sheet.png
│   │   └── duck-golden-sheet.png
│   └── effects/
│       ├── muzzle-flash.png
│       └── feathers.png
├── backgrounds/
│   ├── day/
│   │   ├── sky.png
│   │   ├── mountains.png
│   │   ├── trees.png
│   │   └── grass.png
│   ├── sunset/
│   └── night/
├── ui/
│   ├── icons/
│   │   ├── heart.png
│   │   ├── bullet.png
│   │   └── ...
│   ├── buttons/
│   ├── modals/
│   └── logo/
├── cursors/
│   ├── crosshair.png
│   └── crosshair-gold.png
└── audio/
    └── (placeholder for future audio files)
```

---

## Total de Assets Estimados

| Categoría | Cantidad Mínima | Cantidad Ideal |
|-----------|-----------------|----------------|
| Patos | 4 sprites | 16 (con animaciones) |
| Fondos | 1 completo | 9 (3 variaciones x 3 layers) |
| UI/Iconos | 10 | 25+ |
| Efectos | 3 | 10+ |
| Pantallas | 3 | 8 |
| **TOTAL** | **~21 assets** | **~68+ assets** |

---

*Documento generado para x402-Hunter*
*Fecha: Enero 2026*
