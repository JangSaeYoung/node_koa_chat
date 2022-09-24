// @ts-check

const Koa = require('koa');

// 웹 소켓 가져오기
const websockify = require('koa-websocket');
const route = require('koa-route');

//KOA STATIC
const serve = require('koa-static');
const mount = require('koa-mount');

//PUG
const Pug = require('koa-pug');
const path = require('path');

//MONGO
const mongoClient = require('./public/mongo');
const _client = mongoClient.connect();
//resolv 상태임. 사용할 때는 await 적고 하면 됨.

const app = websockify(new Koa());
const PORT = 4050;

app.use(mount('/public', serve('public')));

// PUG View engine
const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  app,
});

app.ws.use(
  route.all('/chat', async (ctx) => {
    const { server } = app.ws;

    const client = await _client;
    const cursor = client.db('talk').collection('chat');
    console.log(cursor);
    const chats = cursor.find(
      {},
      {
        sort: {
          createdAt: 1,
        },
      }
    );
    const chatsData = await chats.toArray(); // 데이터를 배열로 만들 때 await 필요함.

    //<접속한 사람에게만 보내주기
    ctx.websocket.send(
      JSON.stringify({
        type: 'sync',
        data: {
          chatsData,
        },
      })
    );

    //< 새로운 유저 참여
    server?.clients.forEach((client) => {
      // client.send('모든 클라이언트에게 데이터를 보낸다 실시!');
      client.send(
        JSON.stringify({
          type: 'chat',
          data: {
            name: '서버',
            msg: `새로운 유저가 참여 했습니다. 현재 유저 수 ${server?.clients.size}`,
            // bg: 'bg-danger',
            text: 'text-black',
          },
        })
      );
    });
    // ctx.websocket.send('환영합니다. 서버입니다. ');
    ctx.websocket.on('message', async (message) => {
      const chat = JSON.parse(message);

      const insertClient = await _client;
      //프로미스가 팬딩이 되었다가 풀리게됨
      const chatCursor = insertClient.db('talk').collection('chat');
      await chatCursor.insertOne({
        ...chat,
        // name: chat.name,
        // msg: chat.msg,
        // bg: chat.bg,
        // text: chat.text,
        createdAt: new Date(),
      });

      server?.clients.forEach((client) => {
        // client.send(message.toString());
        client.send(
          JSON.stringify({
            type: 'chat',
            data: {
              ...chat,
            },
          })
        );
      });

      // console.log(message.toString());

      ctx.websocket.on('close', (client) => {
        server?.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              type: 'chat',
              data: {
                name: '서버',
                msg: `유저가 나갔습니다. 현재 유저 수 ${server.clients.size}`,
                bg: 'bg-dark',
                text: 'text-white',
              },
            })
          );
        });
      });
      // close>
    });
  })
);

app.use(async (ctx, next) => {
  await ctx.render('chat');
});

app.listen(PORT, () => {
  console.log(`${PORT}에서 작동 중입니다. `);
});
