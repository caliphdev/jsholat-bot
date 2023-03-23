// Jadwal Sholat
// Telegram Bot

const { Telegraf } = require("telegraf");
const axios = require("axios");
const dotenv = require("dotenv");
const moment = require("moment-timezone");
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const db = require("./lib/db");
const bot = new Telegraf(BOT_TOKEN, {
  telegram: { apiRoot: process.env.API_ROOT || "https://api.telegram.org" },
});
const client = bot.telegram;
const users = db.get("users");

bot.on("message", async (ctx) => {
  let chatId = ctx.message.chat.id;
  let msgId = ctx.message.message_id;
  let userId = ctx.message.from.id;
  let username = ctx.message.from.username || ctx.message.from.first_name;
  let text = ctx.message.text || ctx.message.caption || "";
  let command = text.split(" ")[0];
  let args = text.split(" ").slice(1);

  if (ctx.message.location) {
    let userondb = await users.findOne({ id: userId });
    if (!userondb) {
      // get timezone
      let { data } = await axios.get(
        `https://api.aladhan.com/v1/timings/${moment
          .tz("Asia/Jakarta")
          .format("DD-MM-yyyy")}?` +
          new URLSearchParams({
            latitude: ctx.message.location.latitude,
            longitude: ctx.message.location.longitude,
            method: 15,
          })
      );
      let { meta } = data.data;
      let { timezone } = meta;
      await users.insert({
        id: userId,
        username: username,
        latitude: ctx.message.location.latitude,
        longitude: ctx.message.location.longitude,
        timezone: timezone,
      });
      ctx.reply(
        `Yeyy, lokasi kamu berhasil disimpan. Ketik /jadwal untuk melihat jadwal sholat hari ini.`,
        { reply_to_message_id: msgId, reply_markup: { remove_keyboard: true } }
      );
    } else {
      // get timezone
      let { data } = await axios.get(
        `https://api.aladhan.com/v1/timings/${moment
          .tz("Asia/Jakarta")
          .format("DD-MM-yyyy")}?` +
          new URLSearchParams({
            latitude: ctx.message.location.latitude,
            longitude: ctx.message.location.longitude,
            method: 15,
          })
      );
      let { meta } = data.data;
      let { timezone } = meta;
      await users.update(
        { id: userId },
        {
          $set: {
            latitude: ctx.message.location.latitude,
            longitude: ctx.message.location.longitude,
            timezone: timezone,
          },
        }
      );
      await ctx.reply(
        `Yeyy, lokasi kamu berhasil diperbarui. Ketik /jadwal untuk melihat jadwal sholat hari ini.`,
        { reply_to_message_id: msgId, reply_markup: { remove_keyboard: true } }
      );
    }
  }

  switch (command) {
    case "/start":
      if (args[0] == "help") {
        let help = `Halo, <b><a href="tg://user?id=${userId}">${ctx.message.from.first_name}</a></b>! Ini adalah daftar perintah yang tersedia.\n\n<b>/jadwal</b> - Melihat jadwal sholat hari ini.\n<b>/help</b> - Melihat daftar perintah yang tersedia.`;
        return ctx.reply(help, {
          parse_mode: "HTML",
          reply_to_message_id: msgId,
        });
      }
      textshare = `Halo saya menggunakan bot jadwal sholat yang sangat mudah untuk digunakan.\nKamu juga bisa menggunakannya di https://t.me/${bot.options.username} 😍\n\nJangan lupa share ke teman-teman kamu ya!`;
      client.sendMessage(
        chatId,
        `Halo <b><a href="tg://user?id=${userId}">${username}</a></b>.\nSelamat datang di Jadwal Sholat Bot.\n\nKetik /help untuk melihat daftar perintah yang tersedia.`,
        {
          parse_mode: "HTML",
          reply_to_message_id: msgId,
          reply_markup: {
            inline_keyboard: [
              [
                { text: `Contact`, url: `https://t.me/caliphdev` },
                {
                  text: `Source Code`,
                  url: `https://github.com/caliphdev/jsholat-bot`,
                },
              ],
              [
                {
                  text: `Share`,
                  url: `https://t.me/share/url?url=${encodeURIComponent(
                    textshare
                  )}`,
                },
              ],
            ],
          },
        }
      );
      break;
    case "/jadwal":
      let user = await users.findOne({ id: userId });
      console.log(user);
      if (!user)
        return ctx.reply(
          `Kayaknya kamu belum menyimpan lokasi kamu. Kirim lokasi kamu terlebih dahulu.`,
          {
            reply_to_message_id: msgId,
            reply_markup: {
              keyboard: [[{ text: "Kirim Lokasi", request_location: true }]],
              resize_keyboard: true,
            },
          }
        );
      let { latitude, longitude } = user;
      let { data } = await axios.get(
        `https://api.aladhan.com/v1/timings/${moment
          .tz("Asia/Jakarta")
          .format("DD-MM-yyyy")}?` +
          new URLSearchParams({ latitude, longitude, method: 15 })
      );
      let { timings } = data.data;
      let { Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha } = timings;
      let jadwal = `Halo, <b><a href="tg://user?id=${userId}">${username}</a></b>! Ini adalah jadwal sholat hari ini berdasarkan lokasi kamu.\n\n<b>Tanggal</b> : ${data.data.date.readable} (${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year})\n<b>Subuh</b> : ${Fajr}\n<b>Terbit</b> : ${Sunrise}\n<b>Dzuhur</b> : ${Dhuhr}\n<b>Ashar</b> : ${Asr}\n<b>Maghrib</b> : ${Maghrib}\n<b>Isya</b> : ${Isha}`;
      ctx.reply(jadwal, { parse_mode: "HTML", reply_to_message_id: msgId });
      break;
    case "/help":
      let help = `Halo, <b><a href="tg://user?id=${userId}">${username}</a></b>! Ini adalah daftar perintah yang tersedia.\n\n<b>/jadwal</b> - Melihat jadwal sholat hari ini.\n<b>/help</b> - Melihat daftar perintah yang tersedia.`;
      ctx.reply(help, { parse_mode: "HTML", reply_to_message_id: msgId });
      break;
    default:
      // Show button url help
      if (!text) return;
      if (ctx.message.chat.type !== "private") return;
      ctx.reply(
        `Maaf, perintah yang kamu masukkan tidak valid. Silahkan cek daftar perintah yang tersedia.`,
        {
          reply_to_message_id: msgId,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Bantuan",
                  url: `https://t.me/${bot.botInfo.username}?start=help`,
                },
              ],
            ],
          },
        }
      );
  }
});

//   console.log("Connected correctly to server database");
db.then(() => {
  bot.launch();
  client
    .getMe()
    .then((botInfo) => {
      bot.options.username = botInfo.username;
      console.log(`Bot ${botInfo.username} is running...`);
    })
    .catch((err) => console.log(err));
}).catch((err) => console.log(err));
