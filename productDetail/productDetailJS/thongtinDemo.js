/* Demo product data (kept separate) */
const DEMO_SAN_PHAM = {
  id: 'SP-IPH17P-256',
  ten: 'iPhone 17 Pro (Demo)',
  ma: 'IP17P-256',
  moTa: '<p>iPhone 17 Pro mẫu demo: hiệu năng cao, camera nâng cấp, pin lâu.</p>',
  hinh: [
    'https://via.placeholder.com/1200x900?text=iPhone+17+Pro+1',
    'https://via.placeholder.com/1200x900?text=iPhone+17+Pro+2',
    'https://via.placeholder.com/1200x900?text=iPhone+17+Pro+3'
  ],
  giaGoc: 43990000,
  variants: [],
  specs: [
    ['Công nghệ màn hình','Super Retina XDR OLED, ProMotion 120Hz, HDR, True Tone, Haptic Touch'],
    ['Độ phân giải màn hình','2868 x 1320 pixels (460 ppi)'],
    ['Camera','Hệ thống 48MP Pro Fusion, Zoom quang 8x, Deep Fusion'],
    ['Hệ điều hành & CPU','iOS 26 — Apple A19 Pro'],
    ['Bộ nhớ trong','256GB (tùy từng phiên bản)'],
    ['Pin','Lên đến 39 giờ (xem video)']
  ],
  related: [
    { id:'SP-001', ten:'Ốp lưng da', gia:299000, img:'https://via.placeholder.com/300x200?text=Ốp+lưng' },
    { id:'SP-002', ten:'Sạc nhanh 60W', gia:790000, img:'https://via.placeholder.com/300x200?text=Sạc+nhanh' },
    { id:'SP-003', ten:'Tai nghe True', gia:1990000, img:'https://via.placeholder.com/300x200?text=Tai+nghe' }
  ]
};

/* Generate demo variants */
(function genDemoVariants(){
  const CAPACITIES = [
    { key: '256GB', delta: 0, stock: 12 },
    { key: '512GB', delta: 8000000, stock: 5 },
    { key: '1TB',   delta: 15000000, stock: 3 },
    { key: '2TB',   delta: 25000000, stock: 1 }
  ];
  const COLORS = [
    { name: 'Đen', hex:'#111111' },
    { name: 'Trắng', hex:'#f5f5f7' },
    { name: 'Xanh', hex:'#0b5cff' },
    { name: 'Vàng', hex:'#ffd700' }
  ];
  const GENERATED = [];
  CAPACITIES.forEach(cap=>{
    COLORS.forEach(col=>{
      GENERATED.push({
        id: `v-${cap.key.replace(/[^0-9a-z]/gi,'')}-${col.name.toLowerCase()}`,
        capacity: cap.key,
        color: col.name,
        colorHex: col.hex,
        priceDelta: cap.delta,
        stock: cap.stock,
        img: `https://via.placeholder.com/900x600?text=${encodeURIComponent(cap.key + ' ' + col.name)}`
      });
    });
  });
  DEMO_SAN_PHAM.variants = GENERATED;
})();
