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
    status: "delivered",
    total: 1250,
    items: [
      { name: "Things Fall Apart", quantity: 2, price: 320 },
      { name: "The Shadow King", quantity: 1, price: 610 }
    ],
    createdAt: new Date(now - 0.2 * oneDayMs).toISOString()
  },
  {
    id: "ord_102",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Bole",
    status: "packing",
    total: 450,
    items: [
      { name: "The Shadow King, Signed Copy", quantity: 1, price: 450 }
    ],
    createdAt: new Date(now - 0.5 * oneDayMs).toISOString()
  },
  {
    id: "ord_103",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Kazanchis",
    status: "preparing",
    total: 1850,
    items: [
      { name: "The Selfish Gene", quantity: 3, price: 280 },
      { name: "Beneath the Lion's Gaze", quantity: 2, price: 450 },
      { name: "The Scramble for Africa", quantity: 1, price: 110 }
    ],
    createdAt: new Date(now - 0.8 * oneDayMs).toISOString()
  },
  {
    id: "ord_104",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Bole",
    status: "delivered",
    total: 950,
    items: [
      { name: "The Shadow King", quantity: 1, price: 610 },
      { name: "Cutting for Stone, Paperback", quantity: 2, price: 170 }
    ],
    createdAt: new Date(now - 1.2 * oneDayMs).toISOString()
  },
  {
    id: "ord_105",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Sarbet",
    status: "delivered",
    total: 1400,
    items: [
      { name: "A History of Ethiopia", quantity: 2, price: 380 },
      { name: "Things Fall Apart", quantity: 2, price: 320 }
    ],
    createdAt: new Date(now - 1.7 * oneDayMs).toISOString()
  },
  {
    id: "ord_106",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Piassa",
    status: "delivered",
    total: 620,
    items: [
      { name: "Cutting for Stone", quantity: 2, price: 220 },
      { name: "Half of a Yellow Sun", quantity: 2, price: 90 }
    ],
    createdAt: new Date(now - 2.1 * oneDayMs).toISOString()
  },
  {
    id: "ord_107",
    userId: "usr_abebe",
    sessionId: "usr_abebe",
    name: "Abebe Bikila",
    phone: "0911223344",
    area: "Gerji",
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
