export const CATEGORIES = [
  { value: 'texnika', label: '💻 Texnika' },
  { value: 'mebel', label: '🪑 Mebel' },
  { value: 'kitob', label: '📚 Kitob' },
  { value: 'kiyim', label: '👕 Kiyim' },
  { value: 'boshqa', label: '📦 Boshqa' },
];

export const categoryLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label || v;

export const TYPE_LABELS = {
  free: '🆓 Bepul beraman',
  exchange: '🔄 Almashtiraman',
  charity: '💛 Xayriya',
};
