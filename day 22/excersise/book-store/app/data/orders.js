const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;

export const orders = [
  {
    id: "ord_101",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Bole",
    status: "out_for_delivery",
    total: 1250,
    items: [
      { name: "Things Fall Apart", quantity: 2, price: 320 },
      { name: "The Shadow King", quantity: 1, price: 610 }
    ],
    deliveryLocation: {
      address: "Bole Atlas, House 402",
      lat: 9.0125,
      lng: 38.7750
    },
    courierLocation: {
      name: "Dawit Haile",
      phone: "0922334455",
      vehicle: "Yamaha Motorbike (ET-3401)",
      lat: 9.0040,
      lng: 38.7820,
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date(now - 0.2 * oneDayMs).toISOString()
  },
  {
    id: "ord_102",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe, Junior",
    phone: "0911223344",
    area: "Kazanchis",
    status: "packing",
    total: 820,
    items: [
      { name: "The Selfish Gene, Annotated Edition", quantity: 2, price: 280 },
      { name: "The Mediterranean World, Illustrated Edition", quantity: 2, price: 130 }
    ],
    deliveryLocation: {
      address: "Kazanchis, UNECA Lane 4",
      lat: 9.0180,
      lng: 38.7650
    },
    courierLocation: {
      name: "Tadesse Woldie",
      phone: "0933445566",
      vehicle: "Honda Scooter (ET-8912)",
      lat: 9.0150,
      lng: 38.7680,
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date(now - 0.5 * oneDayMs).toISOString()
  },
  {
    id: "ord_103",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: 'Kidus "The Runner"',
    phone: "0911223344",
    area: "Piassa",
    status: "preparing",
    total: 1850,
    items: [
      { name: 'Things Fall Apart, Signed First Edition', quantity: 3, price: 340 },
      { name: 'Special "Lega" Tibs', quantity: 1, price: 550 },
      { name: 'The Scramble for Africa', quantity: 2, price: 140 }
    ],
    deliveryLocation: {
      address: 'Piassa, Churchill Ave, "Taytu Hotel"',
      lat: 9.0350,
      lng: 38.7520
    },
    courierLocation: {
      name: "Solomon Getachew",
      phone: "0944556677",
      vehicle: "Bajaj TVS (ET-5502)",
      lat: 9.0280,
      lng: 38.7580,
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date(now - 0.8 * oneDayMs).toISOString()
  },
  {
    id: "ord_104",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: 'Sara "Chef", Bekele',
    phone: "0911223344",
    area: "Sarbet",
    status: "delivered",
    total: 1950,
    items: [
      { name: 'Kitfo "Special", with Ayib & Gomen', quantity: 2, price: 650 },
      { name: 'Things Fall Apart, 60th Anniversary Edition', quantity: 1, price: 350 },
      { name: 'A History of Ethiopia, Vol. 1', quantity: 2, price: 150 }
    ],
    deliveryLocation: {
      address: "Sarbet, Near Karl Square",
      lat: 9.0010,
      lng: 38.7420
    },
    courierLocation: {
      name: "Ermias Kassa",
      phone: "0955667788",
      vehicle: "Suzuki Bike (ET-1204)",
      lat: 9.0010,
      lng: 38.7420,
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date(now - 1.2 * oneDayMs).toISOString()
  },
  {
    id: "ord_105",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Gerji",
    status: "delivered",
    total: 1400,
    items: [
      { name: "A History of Ethiopia", quantity: 2, price: 380 },
      { name: "Things Fall Apart", quantity: 2, price: 320 }
    ],
    deliveryLocation: {
      address: "Gerji Mebrat Hayl, Villa 12",
      lat: 8.9980,
      lng: 38.8100
    },
    courierLocation: {
      name: "Dawit Haile",
      phone: "0922334455",
      vehicle: "Yamaha Motorbike (ET-3401)",
      lat: 8.9980,
      lng: 38.8100,
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date(now - 1.7 * oneDayMs).toISOString()
  },
  {
    id: "ord_106",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "CMC",
    status: "delivered",
    total: 620,
    items: [
      { name: "Cutting for Stone", quantity: 2, price: 220 },
      { name: "Half of a Yellow Sun", quantity: 2, price: 90 }
    ],
    deliveryLocation: {
      address: "CMC Heights, Block B, Flat 3",
      lat: 9.0250,
      lng: 38.8300
    },
    courierLocation: {
      name: "Tadesse Woldie",
      phone: "0933445566",
      vehicle: "Honda Scooter (ET-8912)",
      lat: 9.0250,
      lng: 38.8300,
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date(now - 2.1 * oneDayMs).toISOString()
  },
  {
    id: "ord_107",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Bole",
    status: "delivered",
    total: 2100,
    items: [
      { name: "A Brief History of Time", quantity: 3, price: 520 },
      { name: "Things Fall Apart", quantity: 1, price: 320 },
      { name: "The Scramble for Africa", quantity: 2, price: 110 }
    ],
    createdAt: new Date(now - 2.4 * oneDayMs).toISOString()
  },
  {
    id: "ord_108",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Bole",
    status: "delivered",
    total: 800,
    items: [
      { name: "Purple Hibiscus", quantity: 2, price: 400 }
    ],
    createdAt: new Date(now - 2.7 * oneDayMs).toISOString()
  },
  {
    id: "ord_109",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "CMC",
    status: "delivered",
    total: 540,
    items: [
      { name: "The Famished Road", quantity: 2, price: 270 }
    ],
    createdAt: new Date(now - 2.9 * oneDayMs).toISOString()
  },
  {
    id: "ord_110",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Kazanchis",
    status: "delivered",
    total: 1750,
    items: [
      { name: "The Shadow King", quantity: 2, price: 610 },
      { name: "Beneath the Lion's Gaze", quantity: 1, price: 450 },
      { name: "The Mediterranean World", quantity: 1, price: 80 }
    ],
    createdAt: new Date(now - 3.4 * oneDayMs).toISOString()
  },
  {
    id: "ord_111",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Bole",
    status: "delivered",
    total: 1100,
    items: [
      { name: "Things Fall Apart", quantity: 2, price: 320 },
      { name: "Beneath the Lion's Gaze", quantity: 1, price: 460 }
    ],
    createdAt: new Date(now - 4.2 * oneDayMs).toISOString()
  },
  {
    id: "ord_112",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Sarbet",
    status: "delivered",
    total: 680,
    items: [
      { name: "Cutting for Stone", quantity: 2, price: 220 },
      { name: "The Beautiful Ones Are Not Yet Born", quantity: 2, price: 120 }
    ],
    createdAt: new Date(now - 4.5 * oneDayMs).toISOString()
  },
  {
    id: "ord_113",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Kazanchis",
    status: "delivered",
    total: 2400,
    items: [
      { name: "The Shadow King", quantity: 3, price: 610 },
      { name: "A Brief History of Time", quantity: 1, price: 570 }
    ],
    createdAt: new Date(now - 4.8 * oneDayMs).toISOString()
  },
  {
    id: "ord_114",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Piassa",
    status: "delivered",
    total: 890,
    items: [
      { name: "The Selfish Gene", quantity: 2, price: 280 },
      { name: "A History of Ethiopia", quantity: 1, price: 330 }
    ],
    createdAt: new Date(now - 5.2 * oneDayMs).toISOString()
  },
  {
    id: "ord_115",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Bole",
    status: "delivered",
    total: 1300,
    items: [
      { name: "Things Fall Apart", quantity: 2, price: 320 },
      { name: "The Shadow King", quantity: 1, price: 610 },
      { name: "The Mediterranean World", quantity: 1, price: 50 }
    ],
    createdAt: new Date(now - 5.7 * oneDayMs).toISOString()
  },
  {
    id: "ord_116",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "CMC",
    status: "delivered",
    total: 1500,
    items: [
      { name: "A Brief History of Time", quantity: 2, price: 520 },
      { name: "Beneath the Lion's Gaze", quantity: 1, price: 460 }
    ],
    createdAt: new Date(now - 6.2 * oneDayMs).toISOString()
  },
  {
    id: "ord_117",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Gerji",
    status: "delivered",
    total: 750,
    items: [
      { name: "Cutting for Stone", quantity: 2, price: 220 },
      { name: "The Selfish Gene", quantity: 1, price: 280 },
      { name: "The Beautiful Ones Are Not Yet Born", quantity: 1, price: 30 }
    ],
    createdAt: new Date(now - 6.8 * oneDayMs).toISOString()
  }
];
