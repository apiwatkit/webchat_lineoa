## Ngrok server

> วิธีทำให้ localhost เป็น server

1. Run คำสั่ง <code>npm install -g ngrok</code> เพื่อติดตั้ง ngrok ลงบนเครื่อง localhost
2. สมัคร https://ngrok-free.app/
3. เข้าเมนู Your Authtoken จะเห็นข้อมูลในส่วนของ Command Line
4. Run คำสั่งใน terminal ของ docker เพื่อตั้งค่า ngrok
   <code>npx ngrok config add-authtoken {{AUTH_TOKEN}}</code>
5. Run คำสั่งใน terminal ของ docker เพื่อตั้งค่า port เป็น 80
   <code>npx ngrok http 80</code>
6. ngrok จะทำการ forward <code>https://xxxx.ngrok-free.app</code> เป็น <code>http://localhost:80</code> อัตโนมัติ

## Line Chatbot

> วิธีทำให้ line เป็นส่งข้อมูลมายัง localhost

1. ต้อง start Ngrok ข้อ 4,5 ก่อน
2. นำ <code>https://xxxx.ngrok-free.app/api/line/webhook</code> ไปใช้ใน <code>https://developers.line.biz/console/</code> ได้เลย

## Stay in touch

- Author - Apiwat Kitsuprung (apiwat.kit@hotmail.com)
