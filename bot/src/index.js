import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import TelegramBot from 'node-telegram-bot-api';
import * as api from './api.js';
import { CATEGORIES, TYPE_LABELS, categoryLabel } from './categories.js';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';

const HEALTH_PORT = Number(process.env.PORT) || 10000;
http
  .createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'eco-tashkent-bot' }));
  })
  .listen(HEALTH_PORT, () => {
    console.log(`🩺 Bot health server port ${HEALTH_PORT} da ishlamoqda`);
  });

if (!TOKEN) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN berilmagan — bot ishga tushmaydi. @BotFather dan token oling.');
  process.exit(0);
}

const bot = new TelegramBot(TOKEN, { polling: true });

const MAIN_KB = {
  reply_markup: {
    keyboard: [
      [{ text: '🔎 Buyum qidirish' }],
      [{ text: '🔔 Obuna bo\'lish' }, { text: '🔕 Obunani olib tashlash' }],
      [{ text: '🔗 Hisobni bog\'lash' }, { text: '🌐 Saytga o\'tish' }],
    ],
    resize_keyboard: true,
  },
};

function categoriesKb(selected = [], prefix = 'cat') {
  return {
    reply_markup: {
      inline_keyboard: [
        ...CATEGORIES.map((c) => [
          {
            text: `${selected.includes(c.value) ? '✅' : '⬜'} ${c.label}`,
            callback_data: `${prefix}_${c.value}`,
          },
        ]),
        [{ text: 'Tayyor', callback_data: `${prefix}_done` }],
      ],
    },
  };
}

function sendItemCard(chatId, item) {
  const text = [
    `🛍 <b>${item.title}</b>`,
    `📂 ${categoryLabel(item.category)} · ${TYPE_LABELS[item.type] || item.type}`,
    `📍 ${item.district}`,
    `👤 ${item.owner?.name || 'Anonim'}`,
    ``,
    `🔗 <a href="${WEB_URL}/items/${item.id}">Saytda ochish</a>`,
  ].join('\n');
  bot.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '💬 Qiziqaman', callback_data: `interest_${item.id}` }]],
    },
  });
}

import axios from 'axios';

const userCache = new Map();
async function tgUserId(chatId, from) {
  if (userCache.has(chatId)) return userCache.get(chatId);
  const phone = `tg_${chatId}`;
  const password = `tg-pass-${chatId}`;
  try {
    const loginRes = await axios.post(`${api.API_URL}/api/auth/login`, { phone, password });
    userCache.set(chatId, loginRes.data.user.id);
    return loginRes.data.user.id;
  } catch {
    try {
      const regRes = await axios.post(`${api.API_URL}/api/auth/register`, {
        name: from?.first_name ? `${from.first_name} (Telegram)` : 'Telegram foydalanuvchisi',
        phone,
        password,
      });
      userCache.set(chatId, regRes.data.user.id);
      return regRes.data.user.id;
    } catch {
      return null;
    }
  }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    `🌿 <b>Eco Tashkent botiga xush kelibsiz!</b>\n\n` +
      `Bu bot — Toshkent buyumlar almashinuvi platformasining yordamchisi:\n` +
      `🔎 kerakli buyumni toping\n` +
      `🔔 tanlangan kategoriya bo'yicha yangi e'lon bildirishnomalarini oling\n` +
      `💬 "Qiziqaman" tugmasi orqali egasi bilan bog'laning\n\n` +
      `🌐 Sayt: <a href="${WEB_URL}">Eco Tashkent</a>`,
    { parse_mode: 'HTML', ...MAIN_KB }
  );
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '🔎 Buyum qidirish') {
    return bot.sendMessage(chatId, 'Qaysi kategoriyadan qidiramiz?', categoriesKb([], 'search'));
  }
  if (text === '🔔 Obuna bo\'lish') {
    return bot.sendMessage(chatId, 'Qaysi kategoriyalarga obuna bo\'lasiz? (bosing — ✅, tayyor bo\'lgach "Tayyor")', categoriesKb([], 'sub'));
  }
  if (text === '🔕 Obunani olib tashlash') {
    return bot.sendMessage(chatId, 'Qaysi kategoriya obunasini olib tashlaymiz?', categoriesKb([], 'unsub'));
  }
  if (text === '🌐 Saytga o\'tish') {
    return bot.sendMessage(chatId, `Eco Tashkent sayti:\n${WEB_URL}`, { reply_markup: { inline_keyboard: [[{ text: '🌐 Saytga o\'tish', url: WEB_URL }]] } });
  }
  if (text === '🔗 Hisobni bog\'lash') {
    return bot.sendMessage(chatId, `Hisobingizni bog'lash uchun shu formatda yozing:\n\n<code>/link telefon_raqam parol</code>\n\nMasalan:\n<code>/link +998901234567 parolim123</code>\n\nShundan so'ng buyumingizga kelgan so'rovlar botga ham keladi.`, { parse_mode: 'HTML' });
  }
});

bot.onText(/\/link (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const parts = match[1].trim().split(/\s+/);
  if (parts.length < 2) {
    return bot.sendMessage(chatId, 'Format: <code>/link telefon parol</code>', { parse_mode: 'HTML' });
  }
  const [phone, ...rest] = parts;
  const password = rest.join(' ');
  try {
    const res = await api.linkAccount(phone, password, chatId, msg.from?.username || null);
    await bot.sendMessage(chatId, `✅ Hisob bog'landi: <b>${res.user.name}</b>\nEko-ball: ${res.user.ecoPoints}\n\nEndi buyumingizga kelgan so'rovlar botga ham keladi!`, { parse_mode: 'HTML' });
  } catch (err) {
    await bot.sendMessage(chatId, '❌ Bog\'lash amalga oshmadi. Telefon yoki parol noto\'g\'ri bo\'lishi mumkin. Saytda ro\'yxatdan o\'tgan bo\'lishingiz kerak.');
  }
});

async function searchByCategory(chatId, category) {
  try {
    const items = await api.getItems({ category, status: 'active' });
    if (items.length === 0) {
      return bot.sendMessage(chatId, `Bu kategoriyada hozircha e'lon yo'q: ${categoryLabel(category)} 🍃`);
    }
    await bot.sendMessage(chatId, `«${categoryLabel(category)}» bo'yicha ${items.length} ta e'lon topildi:`);
    for (const item of items.slice(0, 5)) {
      await sendItemCard(chatId, item);
    }
    if (items.length > 5) {
      await bot.sendMessage(chatId, `Yana ${items.length - 5} ta e'lon bor — saytda ko'ring: ${WEB_URL}`);
    }
  } catch {
    await bot.sendMessage(chatId, 'Xatolik yuz berdi. API ishlayotganini tekshiring.');
  }
}

async function updateSubscriptions(chatId, action, category) {
  const subs = (await api.getSubscribers()).find((s) => s.chatId === String(chatId));
  let cats = subs?.subscribedCategories || [];
  if (action === 'sub' && !cats.includes(category)) cats.push(category);
  if (action === 'unsub') cats = cats.filter((c) => c !== category);
  try {
    await api.setSubscriptions(chatId, cats);
    return cats;
  } catch {
    return null;
  }
}

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data || '';

  if (data.startsWith('search_')) {
    const cat = data.replace('search_', '');
    if (cat === 'done') return bot.sendMessage(chatId, '🔎 Kategoriya tugmalarini bosing yoki menyudan foydalaning.', categoriesKb([], 'search'));
    return searchByCategory(chatId, cat);
  }

  if (data.startsWith('interest_')) {
    const itemId = Number(data.replace('interest_', ''));
    await bot.answerCallbackQuery(query.id, { text: 'So\'rov yuborilmoqda...' });
    try {
      const uid = await tgUserId(chatId, query.from);
      if (!uid) return bot.sendMessage(chatId, 'Bot foydalanuvchisini yaratib bo\'lmadi.');
      const req = await api.createRequest(itemId, 'Telegram orqali qiziqish bildirildi 💬');
      return bot.sendMessage(
        chatId,
        `✅ So'rov yuborildi!\n\n«${req.item?.title || ''}» egasi javob berganda chat ochiladi. Saytda: ${WEB_URL}/profile`,
        { reply_markup: { inline_keyboard: [[{ text: '🌐 Profil', url: `${WEB_URL}/profile` }]] } }
      );
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return bot.sendMessage(chatId, `❌ So'rov yuborilmadi: ${message}`);
    }
  }

  if (data.startsWith('sub_') || data.startsWith('unsub_')) {
    const action = data.startsWith('sub_') ? 'sub' : 'unsub';
    const cat = data.split('_')[1];
    if (cat === 'done') {
      const subs = (await api.getSubscribers()).find((s) => s.chatId === String(chatId));
      const list = subs?.subscribedCategories || [];
      await bot.sendMessage(
        chatId,
        list.length
          ? `🔔 Obunangiz:\n${list.map((c) => `• ${categoryLabel(c)}`).join('\n')}\n\nYangi e'lon qo'shilganda sizga xabar keladi!`
          : '🔕 Siz hozircha hech qaysi kategoriyaga obuna emassiz.',
        MAIN_KB
      );
      return;
    }
    const cats = await updateSubscriptions(chatId, action, cat);
    if (!cats) return bot.sendMessage(chatId, 'Sizni obunachilar ro\'yxatida topilmadim — avval biror kategoriyani bosing.');
    await bot.editMessageReplyMarkup(categoriesKb(cats, action).reply_markup.inline_keyboard, {
      chat_id: chatId,
      message_id: query.message.message_id,
    });
    return bot.answerCallbackQuery(query.id, { text: `${cat} ${action === 'sub' ? 'obunaga qo\'shildi' : 'obunadan olib tashlandi'}` });
  }
});

async function pollNewItems() {
  let lastCheck = new Date();
  setInterval(async () => {
    try {
      const items = await api.getNewItems(lastCheck.toISOString());
      const subs = await api.getSubscribers();
      const matched = new Map();
      for (const sub of subs) {
        if (sub.subscribedCategories.length === 0) continue;
        for (const item of items) {
          if (sub.subscribedCategories.includes(item.category)) {
            if (!matched.has(sub.chatId)) matched.set(sub.chatId, []);
            matched.get(sub.chatId).push(item);
          }
        }
      }
      for (const [chatId, list] of matched) {
        for (const item of list) {
          await sendItemCard(Number(chatId), {
            id: item.id,
            title: item.title,
            category: item.category,
            district: item.district,
            type: item.type,
            owner: null,
          });
        }
      }
      if (items.length > 0) lastCheck = new Date(items[items.length - 1].createdAt);
    } catch (err) {
      console.error('Poller (e\'lonlar) xatosi:', api.describeError(err));
    }
  }, 30000);
}

async function pollNewRequests() {
  let lastCheck = new Date();
  setInterval(async () => {
    try {
      const requests = await api.getNewRequests(lastCheck.toISOString());
      const subs = await api.getSubscribers();
      for (const req of requests) {
        const ownerSub = subs.find((s) => s.userId === req.ownerId);
        if (ownerSub) {
          await bot.sendMessage(Number(ownerSub.chatId),
            `💬 <b>Yangi so'rov!</b>\n\n` +
            `🛍 Buyum: ${req.title}\n` +
            `👤 Kimdan: ${req.requesterName}\n` +
            (req.message ? `📝 Xabar: ${req.message}\n` : '') +
            `\nSaytda javob bering: ${WEB_URL}/profile`,
            { parse_mode: 'HTML' }
          );
        }
      }
      if (requests.length > 0) lastCheck = new Date(requests[requests.length - 1].createdAt);
    } catch (err) {
      console.error('Poller (so\'rovlar) xatosi:', api.describeError(err));
    }
  }, 30000);
}

bot.on('polling_error', (err) => console.error('Polling xatosi:', err.message));
bot.on('error', (err) => console.error('Bot xatosi:', err.message));

console.log('🤖 Eco Tashkent bot ishga tushdi (long polling)');
console.log(`🔗 API_URL: ${api.API_URL}`);
console.log(`🌐 WEB_URL: ${WEB_URL}`);
pollNewItems();
pollNewRequests();
