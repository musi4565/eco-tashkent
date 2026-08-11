import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const RECYCLE_POINTS = [
  {
    name: 'Toshkent shahar chiqindilarni qayta ishlash markazi',
    type: 'recycling',
    lat: 41.3111,
    lng: 69.2797,
    address: 'Yashnobod tumani, Markaziy ko\'chasi',
    acceptedMaterials: ['plastik', 'qog\'oz', 'shisha', 'batareyka'],
  },
  {
    name: 'Ekologiya markazi — Chilonzor filiali',
    type: 'recycling',
    lat: 41.2612,
    lng: 69.2164,
    address: 'Chilonzor tumani, Bunyodkor ko\'chasi 7',
    acceptedMaterials: ['plastik', 'qog\'oz'],
  },
  {
    name: 'Plastik qabul qilish punkti — Yunusobod',
    type: 'sorting',
    lat: 41.3529,
    lng: 69.2847,
    address: 'Yunusobod tumani, Amir Temur ko\'chasi 129',
    acceptedMaterials: ['plastik'],
  },
  {
    name: 'Qog\'oz va karton yig\'ish punkti',
    type: 'sorting',
    lat: 41.3049,
    lng: 69.3043,
    address: 'Mirzo Ulug\'bek tumani, Mirzo Ulug\'bek ko\'chasi',
    acceptedMaterials: ['qog\'oz'],
  },
  {
    name: 'Shisha qabul qilish punkti — Yakkasaroy',
    type: 'sorting',
    lat: 41.2836,
    lng: 69.2513,
    address: 'Yakkasaroy tumani, Shota Rustaveli ko\'chasi 39',
    acceptedMaterials: ['shisha'],
  },
  {
    name: 'Batareyka yig\'ish punkti — Shayxontohur',
    type: 'sorting',
    lat: 41.3272,
    lng: 69.2522,
    address: 'Shayxontohur tumani, Navoiy ko\'chasi 3',
    acceptedMaterials: ['batareyka'],
  },
  {
    name: 'Kiyim-kechak qabul qilish punkti — Uchtepa',
    type: 'recycling',
    lat: 41.2571,
    lng: 69.1692,
    address: 'Uchtepa tumani, Xadra maydoni',
    acceptedMaterials: ['kiyim'],
  },
  {
    name: 'Maishiy texnika qayta ishlash punkti',
    type: 'recycling',
    lat: 41.2926,
    lng: 69.1869,
    address: 'Yunusobod tumani, Mirobod ko\'chasi',
    acceptedMaterials: ['texnika'],
  },
  {
    name: 'Ekologik toza hudud — Sergeli',
    type: 'sorting',
    lat: 41.2117,
    lng: 69.2133,
    address: 'Sergeli tumani, Yangi Sergeli',
    acceptedMaterials: ['plastik', 'qog\'oz', 'shisha'],
  },
  {
    name: 'Olmazor qayta ishlash punkti',
    type: 'recycling',
    lat: 41.3689,
    lng: 69.2913,
    address: 'Olmazor tumani, Talabalar shaharchasi',
    acceptedMaterials: ['plastik', 'qog\'oz', 'shisha', 'batareyka'],
  },
];

const DEMO_ITEMS = [
  {
    title: 'Ishlayotgan monitor (24")',
    description: 'Yaxshi holatda, ekranida hech qanday nuqson yo\'q. Bepul beraman.',
    category: 'texnika',
    condition: 'yaxshi',
    type: 'free',
    district: 'Chilonzor',
    address: 'Bunyodkor ko\'chasi',
  },
  {
    title: 'Bolalar kitoblari to\'plami',
    description: '30 ta bolalar kitobi, yosh chegarasi 5-10 yosh. Xayriyaga beriladi.',
    category: 'kitob',
    condition: 'yaxshi',
    type: 'charity',
    district: 'Yunusobod',
  },
  {
    title: 'Ish stoli (bargi 120x60)',
    description: 'Yig\'ilgan holda, o\'zini o\'zi yig\'adigan mebel.',
    category: 'mebel',
    condition: 'o\'rtacha',
    type: 'exchange',
    district: 'Mirzo Ulug\'bek',
  },
  {
    title: 'Qishki kurtka (48 o\'lcham)',
    description: 'Bir mavsum kiyilgan, toza, yamog\'i yo\'q.',
    category: 'kiyim',
    condition: 'yaxshi',
    type: 'free',
    district: 'Yakkasaroy',
  },
];

async function main() {
  const pointsCount = await prisma.recyclePoint.count();
  if (pointsCount === 0) {
    await prisma.recyclePoint.createMany({ data: RECYCLE_POINTS });
    console.log(`✓ ${RECYCLE_POINTS.length} ta recycle punkt qo'shildi`);
  } else {
    console.log('Recycle punktlar allaqachon mavjud');
  }

  const demoUser = await prisma.user.upsert({
    where: { phone: '+998900000001' },
    update: {},
    create: {
      name: 'Eko Demo',
      phone: '+998900000001',
      password: await bcrypt.hash('demo123', 10),
      ecoPoints: 85,
      savedKg: 42,
    },
  });

  const itemsCount = await prisma.item.count();
  if (itemsCount === 0) {
    for (const d of DEMO_ITEMS) {
      await prisma.item.create({ data: { ...d, ownerId: demoUser.id } });
    }
    console.log(`✓ ${DEMO_ITEMS.length} ta demo e'lon qo'shildi`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
