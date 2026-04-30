import { Car } from "./types";

export const BUSINESS_RULES = `
Eres el Asesor de Negocio Inteligente para "AutoFlux.io", una PWA (Progressive Web App) de marketplace de autos de intermediación digital pura en Venezuela. Tu función es simular el funcionamiento del sistema centralizado, interactuando como el gestor de la plataforma. Tu objetivo es demostrar la eficiencia del modelo de negocio, basándote en las siguientes reglas y flujos:

**1. Contexto del Negocio:**
- **Nicho:** Exclusivamente vehículos de los años 2021 en adelante.
- **Precio Máximo:** $100,000 USD.
- **Modelo:** Intermediación digital pura (consignación digital). El comprador y el vendedor nunca se comunican directamente. El funnel de ventas es centralizado y gestionado exclusivamente por los Asesores de AutoFlux. El cliente nunca ve el contacto del vendedor.

**2. Flujo de Intermediación Digital Pura (Simulación):**
- **Trigger:** Un cliente pulsa "Solicitar Video Detallado" o "Conversar" en la PWA.
- **Acción:** Tú como asesor central recibes el Lead. Tu misión es calificar al cliente (verificar interés y presupuesto).
- **Interacción con Vendedor:** Si el cliente es serio, el administrador contacta al vendedor en USA de forma privada. El vendedor graba el video y lo envía al administrador.
- **Entrega al Cliente:** El administrador entrega el video al cliente. El cliente nunca tiene contacto directo con el vendedor.

**3. Módulo de Cobro y Proceso de Compra (Simulación):**
Tu objetivo es motivar al cliente fusionando la eficiencia logística con la seguridad del proceso. Si el usuario pregunta por el proceso o costos, presenta exactamente esta ruta de mensaje base (pero reemplazando obligatoriamente y SIEMPRE la palabra [Vehículo de Interés] por la marca, modelo o nombre del auto por el que el cliente ha mostrado interés real):

¡Excelente elección! El [Vehículo de Interés] es adrenalina pura. En AutoFlux.io, garantizamos un proceso de importación directo, seguro y transparente. 🛡️

Aquí tienes tu Ruta de Compra Segura en 4 pasos claros:

1️⃣ Reserva ($300 USD) - Hoy.

Activamos tu agente exclusivo, congelamos la tarifa logística y solicitamos un video detallado del [Vehículo de Interés] en USA para tu aprobación.

2️⃣ Logística USA ($3,000 USD) - Tras aprobar video.

Cubre la grúa terrestre al puerto en EE.UU. y toda la documentación legal de exportación.

3️⃣ Inicial del Vehículo (40% del costo total).

Procedemos a la compra formal. El vehículo se titula a tu nombre antes del embarque.

4️⃣ Entrega (Saldo + Impuestos) - Semanas 8-12.

Nacionalización completa en Venezuela y entrega de llaves en tus manos en Margarita.

¿Listo para iniciar la Etapa 1 ($300)? 👇

[PayPal] [Cripto] [PagoMovil] [$tranferencia]

**4. Calculadora Cripto Real-Time & "Crypto Price Lock" (Simulación):**
- **Trigger:** Cliente dice: "Quiero pagar en BTC" o alguna criptomoneda.
- **Tu Acción:** Generas una cotización en tiempo real para la etapa correspondiente.
- **Crypto Price Lock:** Garantizas el precio por **15 MINUTOS**.

---

**Tu Comportamiento:**
1. Responde con un tono profesional, tecnológico y altamente motivador.
2. Si el usuario pregunta por el proceso o costos, presenta las **4 Etapas** de forma clara y estructurada.
3. Siempre cierra con una llamada a la acción: "¿Estás listo para comenzar con la Etapa 1 ($300) y dar el primer paso hacia tu nuevo vehículo? 👇"
4. Incluye simbólicamente los botones al final de tu respuesta: [PayPal] [Cripto] [PagoMovil] [$tranferencia].

**5. Estatus Finales del Lead (Métricas de Éxito):**
- **🏆 Vendido por Nuestra App:** El cliente gestionado compró el carro y tú cobraste tu ganancia total ($500).
- **🤝 Vendido por Fuera:** El vendedor vendió el carro por otro medio antes de que tú entregaras el lead.
- **🚫 Lead No Calificado:** El cliente no tenía el dinero, no respondió, o era un revendedor.
- **⏳ Apartado/En Pausa:** El cliente está interesado pero necesita tiempo.
- **❌ Error de Configuración:** Si detectas que el cliente tiene problemas con la plataforma.

**6. Métodos de Pago y Cierre:**
- **IMPORTANTE:** No menciones Zelle bajo ninguna circunstancia.
- **Opciones de Pago:** Ofrece PayPal, Cripto (Binance), Pago Movil, y Transferencia Bank (Digital Waves).
- **Pregunta de Cierre de Pago:** Cuando el cliente afirme que quiere reservar o pagar, debes responder integrando este mensaje exacto (siempre adaptando el Vehículo de Interés): "¡Excelente decisión! Estás a un paso de asegurar tu [Vehículo de Interés] y activar todo nuestro engranaje logístico para traerlo a Venezuela. Al completar este pago, congelamos tu tarifa y asignamos a tu agente exclusivo para la inspección visual en USA.\n\n¿Deseas pagar con PayPal, prefieres que te genere la dirección de la Wallet para el pago Cripto, usar Pago Movil a la tasa del día, o realizar una transferencia bancaria? 👇"
- **Si eligen PayPal:** Crea un link para proceder, indicando que es tu link oficial de pagos (Ej: https://paypal.me/autoflux).
- **Si eligen Cripto:** Indica que será procesado a través de **Binance** y proporcionarás la wallet correspondiente.
- **Si eligen PagoMovil:** Debes responder exactamente con los siguientes datos: "BANCAMIGA 04248691131 - V11739552 PAGO A LA TASA DEL DIA".
- **Si eligen Transferencia o $transferencia:** Indica que se usarán las cuentas bancarias a nombre de la corporación **DIGITAL WAVES**.
- **DESPUÉS de que el cliente elige el método:** Cuando entregues los datos de pago finales al cliente (ya sea cuenta, wallet o link), DEBES incluir exactamente la etiqueta "[Enviar Comprobante]" al final de tu mensaje y pedirle al cliente que envíe la captura de pantalla por WhatsApp usando el botón. **BAJO NINGUNA CIRCUNSTANCIA vuelvas a imprimir las etiquetas [PayPal], [Cripto], [PagoMovil] ni [$tranferencia] en esta respuesta.**

**7. Formato de Reportes y Análisis:**
- Al realizar comparaciones estratégicas entre modelos, precios o de mercado, utiliza SIEMPRE una tabla titulada "📊 COMPARATIVA ESTRATÉGICA".
- Asegúrate de que las columnas sean: Modelo, Año, Precio, Kilometraje, Estatus Intel.
- El "Estatus Intel" debe calificar la oportunidad (ej: Prioridad Alta (Colección), Oportunidad de Mercado, Riesgo por Kilometraje, etc.).

---
`;

export const MOCK_CARS: Car[] = [
  {
    id: "toy-lc300",
    make: "Toyota",
    model: "Land Cruiser 300",
    year: 2024,
    price: 95000,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/toyota-lc/1200/800",
    seller: "AutoFlux Premium",
    sellerId: "official",
    sellerPhoto: "https://i.pravatar.cc/300?u=official",
    sellerBio: "Distribuidor oficial de vehículos premium en Venezuela.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "3.5",
    views: 154,
    interactions: 45
  },
  {
    id: "ford-rap23",
    make: "Ford",
    model: "F-150 Raptor R",
    year: 2023,
    price: 89000,
    mileage: 5000,
    location: "Orlando -> Margarita",
    image: "https://picsum.photos/seed/ford-raptor/1200/800",
    seller: "Juan Rodriguez",
    sellerId: "juan-usa",
    sellerPhoto: "https://i.pravatar.cc/300?u=juan-usa",
    sellerBio: "Especialista en Trucks y Pickups de alto rendimiento.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "5.2",
    views: 210,
    interactions: 68
  },
  {
    id: "chevy-tah24",
    make: "Chevrolet",
    model: "Tahoe High Country",
    year: 2024,
    price: 82000,
    mileage: 1200,
    location: "Houston -> Margarita",
    image: "https://picsum.photos/seed/chevy-tahoe/1200/800",
    seller: "Elite Motors",
    sellerId: "elite-hou",
    sellerPhoto: "https://i.pravatar.cc/300?u=elite-hou",
    sellerBio: "Inventario seleccionado de SUVs de lujo.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "6.2",
    views: 98,
    interactions: 24
  },
  {
    id: "bmw-x7-24",
    make: "BMW",
    model: "X7 M60i",
    year: 2024,
    price: 98000,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/bmw-x7/1200/800",
    seller: "German Tech Auto",
    sellerId: "german-tech",
    sellerPhoto: "https://i.pravatar.cc/300?u=german-tech",
    sellerBio: "Expertos en ingeniería alemana y modelos M.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "4.4",
    views: 167,
    interactions: 52
  },
  {
    id: "jeep-rub-24",
    make: "Jeep",
    model: "Wrangler Rubicon 392",
    year: 2024,
    price: 92000,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/jeep-rubicon/1200/800",
    seller: "4x4 Experts",
    sellerId: "offroad-exp",
    sellerPhoto: "https://i.pravatar.cc/300?u=offroad-exp",
    sellerBio: "Pasión por el Off-Road y ediciones limitadas.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "6.4",
    views: 310,
    interactions: 89
  },
  {
    id: "tesla-mx-24",
    make: "Tesla",
    model: "Model X Plaid",
    year: 2024,
    price: 94000,
    mileage: 0,
    location: "California -> Margarita",
    image: "https://picsum.photos/seed/tesla-modelx/1200/800",
    seller: "EV Evolution",
    sellerId: "ev-evo",
    sellerPhoto: "https://i.pravatar.cc/300?u=ev-evo",
    sellerBio: "Líderes en importación de vehículos eléctricos.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Eléctrico",
    engineLiters: "Tri-Motor",
    views: 420,
    interactions: 110
  },
  {
    id: "merc-gle-24",
    make: "Mercedes-Benz",
    model: "GLE 53 AMG",
    year: 2024,
    price: 85000,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/mercedes-gle/1200/800",
    seller: "AutoFlux Premium",
    sellerId: "official",
    sellerPhoto: "https://i.pravatar.cc/300?u=official",
    sellerBio: "Distribuidor oficial de vehículos premium en Venezuela.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Híbrido",
    engineLiters: "3.0",
    views: 145,
    interactions: 38
  },
  {
    id: "por-cay-24",
    make: "Porsche",
    model: "Cayenne Coupe S",
    year: 2024,
    price: 96000,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/porsche-cayenne/1200/800",
    seller: "Stuttgart Dealer",
    sellerId: "stutt-dealer",
    sellerPhoto: "https://i.pravatar.cc/300?u=stutt-dealer",
    sellerBio: "Coches deportivos y SUVs de alto desempeño.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "4.0",
    views: 189,
    interactions: 56
  },
  {
    id: "audi-q8-24",
    make: "Audi",
    model: "Q8 S-Line",
    year: 2024,
    price: 88000,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/audi-q8/1200/800",
    seller: "Vorsprung Motors",
    sellerId: "vorsprung",
    sellerPhoto: "https://i.pravatar.cc/300?u=vorsprung",
    sellerBio: "A la vanguardia de la tecnología automotriz.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "3.0",
    views: 112,
    interactions: 31
  },
  {
    id: "lex-lx600-24",
    make: "Lexus",
    model: "LX 600 F-Sport",
    year: 2024,
    price: 99500,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/lexus-lx600/1200/800",
    seller: "Luxe Imports",
    sellerId: "luxe-imp",
    sellerPhoto: "https://i.pravatar.cc/300?u=luxe-imp",
    sellerBio: "Sofisticación y confiabilidad japonesa.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "3.5",
    views: 230,
    interactions: 72
  },
  {
    id: "land-def-24",
    make: "Land Rover",
    model: "Defender 110 V8",
    year: 2024,
    price: 97000,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/landrover-defender/1200/800",
    seller: "Adventure Hub",
    sellerId: "adv-hub",
    sellerPhoto: "https://i.pravatar.cc/300?u=adv-hub",
    sellerBio: "Vehículos diseñados para cualquier terreno.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "5.0",
    views: 140,
    interactions: 42
  },
  {
    id: "honda-civic-24",
    make: "Honda",
    model: "Civic Type R",
    year: 2024,
    price: 55000,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/honda-civic/1200/800",
    seller: "JDM Legend",
    sellerId: "jdm-leg",
    sellerPhoto: "https://i.pravatar.cc/300?u=jdm-leg",
    sellerBio: "Importación directa de joyas japonesas.",
    status: 'active',
    transmission: "Manual",
    fuelType: "Gasolina",
    engineLiters: "2.0",
    views: 350,
    interactions: 95
  },
  {
    id: "nissan-patrol-24",
    make: "Nissan",
    model: "Patrol Nismo",
    year: 2024,
    price: 94500,
    mileage: 0,
    location: "Dubai -> Margarita",
    image: "https://picsum.photos/seed/nissan-patrol/1200/800",
    seller: "Desert King",
    sellerId: "desert-king",
    sellerPhoto: "https://i.pravatar.cc/300?u=desert-king",
    sellerBio: "Ediciones especiales del Medio Oriente.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "5.6",
    views: 198,
    interactions: 48
  },
  {
    id: "hyundai-pal-24",
    make: "Hyundai",
    model: "Palisade Calligraphy",
    year: 2024,
    price: 62000,
    mileage: 100,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/hyundai-palisade/1200/800",
    seller: "City Motors",
    sellerId: "city-mot",
    sellerPhoto: "https://i.pravatar.cc/300?u=city-mot",
    sellerBio: "Comodidad para toda la familia.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "3.8",
    views: 85,
    interactions: 15
  },
  {
    id: "kia-tell-24",
    make: "Kia",
    model: "Telluride SX-Prestige",
    year: 2024,
    price: 64000,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/kia-telluride/1200/800",
    seller: "Modern Drive",
    sellerId: "modern-drive",
    sellerPhoto: "https://i.pravatar.cc/300?u=modern-drive",
    sellerBio: "Diseño y tecnología de vanguardia.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "3.8",
    views: 92,
    interactions: 22
  },
  {
    id: "mazda-cx90-24",
    make: "Mazda",
    model: "CX-90 Turbo S",
    year: 2024,
    price: 68000,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/mazda-cx90/1200/800",
    seller: "Zoom Zoom Auto",
    sellerId: "zoom-zoom",
    sellerPhoto: "https://i.pravatar.cc/300?u=zoom-zoom",
    sellerBio: "La elegancia del diseño Kodo.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Híbrido",
    engineLiters: "3.3",
    views: 105,
    interactions: 28
  },
  {
    id: "ram-trx-24",
    make: "Ram",
    model: "1500 TRX Final Edition",
    year: 2024,
    price: 99900,
    mileage: 0,
    location: "Miami -> Margarita",
    image: "https://picsum.photos/seed/ram-trx/1200/800",
    seller: "Truck Nation",
    sellerId: "truck-nat",
    sellerPhoto: "https://i.pravatar.cc/300?u=truck-nat",
    sellerBio: "Solo para los que buscan poder absoluto.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "6.2",
    views: 520,
    interactions: 135
  },
  {
    id: "mits-mon-24",
    make: "Mitsubishi",
    model: "Montero Sport GT",
    year: 2024,
    price: 58000,
    mileage: 0,
    location: "Tailandia -> Margarita",
    image: "https://picsum.photos/seed/mitsubishi-montero/1200/800",
    seller: "AutoFlux Premium",
    sellerId: "official",
    sellerPhoto: "https://i.pravatar.cc/300?u=official",
    sellerBio: "Distribuidor oficial de vehículos premium en Venezuela.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Diesel",
    engineLiters: "2.4",
    views: 128,
    interactions: 34
  },
  {
    id: "volk-amar-24",
    make: "Volkswagen",
    model: "Amarok V6 Extreme",
    year: 2024,
    price: 65000,
    mileage: 0,
    location: "Argentina -> Margarita",
    image: "https://picsum.photos/seed/vw-amarok/1200/800",
    seller: "Euro Trucks",
    sellerId: "euro-trucks",
    sellerPhoto: "https://i.pravatar.cc/300?u=euro-trucks",
    sellerBio: "Fuerza inteligente para el trabajo.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Diesel",
    engineLiters: "3.0",
    views: 145,
    interactions: 39
  },
  {
    id: "volvo-xc90-24",
    make: "Volvo",
    model: "XC90 Recharge",
    year: 2024,
    price: 89000,
    mileage: 0,
    location: "Suecia -> Margarita",
    image: "https://picsum.photos/seed/volvo-xc90/1200/800",
    seller: "Safe Journey",
    sellerId: "safe-journey",
    sellerPhoto: "https://i.pravatar.cc/300?u=safe-journey",
    sellerBio: "La seguridad es nuestro estándar.",
    status: 'active',
    transmission: "Automática",
    fuelType: "Híbrido Enchufable",
    engineLiters: "2.0",
    views: 88,
    interactions: 21
  }
];
