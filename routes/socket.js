let router = require('express').Router();

//socket.io
const http = require('http');
const { Server } = require("socket.io");
const io = new Server(http);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.DB_URL;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});

function isLogin(요청, 응답, next) {
  if (요청.user) {
    next()
  } else {
    응답.send('로그인시 이용가능 합니다.')
  }
}

function socket(io) {

  router.get('/socket', async function (요청, 응답) {
    try {
      // MongoDB 클라이언트 연결
      await client.connect();

      // const document = await client.db('todoapp').collection('chat').insertOne(schema);

      io.on('connection', function (socket) {
        console.log('유저접속됨');
        // console.log(socket);

        socket.on('user-send', function (data) {
          console.log(data);
        })
      });

      응답.render('../views/socket.ejs');

    } catch (에러) {
      console.error(에러);
      응답.status(404).send('페이지를 찾을 수 없습니다.'); // 또는 다른 에러 처리 방식을 사용할 수 있음

    } finally {
      // 클라이언트 연결 닫기
      await client.close();
    }
  });

  return router
}


module.exports = socket;