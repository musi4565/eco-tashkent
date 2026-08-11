export const CATEGORIES = [
  { value: 'texnika', label: 'Texnika' },
  { value: 'mebel', label: 'Mebel' },
  { value: 'kitob', label: 'Kitob' },
  { value: 'kiyim', label: 'Kiyim' },
  { value: 'boshqa', label: 'Boshqa' },
];

export const CONDITIONS = [
  { value: 'yangi', label: 'Yangi' },
  { value: 'yaxshi', label: 'Yaxshi' },
  { value: 'o\'rtacha', label: 'O\'rtacha' },
];

export const TYPES = [
  { value: 'free', label: 'Bepul beraman' },
  { value: 'exchange', label: 'Almashtiraman' },
  { value: 'charity', label: 'Xayriya' },
];

export const DISTRICTS = [
  'Chilonzor',
  'Yunusobod',
  'Mirzo Ulug\'bek',
  'Yakkasaroy',
  'Shayxontohur',
  'Uchtepa',
  'Yashnobod',
  'Olmazor',
  'Sergeli',
  'Bektemir',
  'Mirobod',
  'Yangihayot',
];

export const categoryLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label || v;
export const conditionLabel = (v) => CONDITIONS.find((c) => c.value === v)?.label || v;
export const typeLabel = (v) => TYPES.find((t) => t.value === v)?.label || v;

export const TYPE_COLORS = {
  free: 'bg-emerald-100 text-emerald-800',
  exchange: 'bg-sky-100 text-sky-800',
  charity: 'bg-amber-100 text-amber-800',
};

export const STATUS_LABELS = {
  active: 'Faol',
  reserved: 'Band qilingan',
  done: 'Topshirilgan',
  deleted: 'O\'chirilgan',
};

export const REQUEST_STATUS_LABELS = {
  pending: 'Kutilmoqda',
  accepted: 'Qabul qilindi',
  rejected: 'Rad etildi',
};
