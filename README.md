# jsholat-bot
Bot telegram buat ngecek jadwal sholat

## Cara Install
1. Clone repo ini
```bash	
git clone https://github.com/caliphdev/jsholat-bot
```	
2. Install dependensi
```bash
npm install
```
3. Buat bot telegram
buat bot telegram dengan cara chat ke [@BotFather](https://t.me/BotFather) dengan perintah `/newbot` lalu ikuti petunjuknya
4. Buat file `.env` lalu isi
```bash
MONGO_URI=Isi dengan mongo uri
BOT_TOKEN=Isi dengan token bot telegram
API_ROOT=
```
Untuk `MONGO_URI` bisa diisi dengan mongo uri dari [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) atau mongo uri lokal
5. Jalankan bot
```bash
npm start
```

## Cara Pakai
1. Chat ke bot telegram
2. Ketik `/start` untuk memulai
3. Ketik `/help` untuk bantuan

## Kontak
Jika mengalami kesulitan, silahkan kontak saya di 
- [Telegram](https://t.me/caliphdev)
- [Instagram](https://instagram.com/caliph.dev)
- [Twitter](https://twitter.com/caliphdev)

## Lisensi
[Apache License 2.0][LICENSE]