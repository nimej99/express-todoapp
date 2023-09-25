let router = require('express').Router();

const { MongoClient, ServerApiVersion } = require('mongodb');
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

router.get('/chat', isLogin, async function (요청, 응답) {
  try {

    // MongoDB 클라이언트 연결
    await client.connect();

    const chat = await client.db('todoapp').collection('chat').find({
      member: 요청.user.id
    });

    const chatroom = await chat.toArray();

    // 문서가 없는 경우 처리
    if (!chatroom) {
      throw new Error('게시물을 찾을 수 없음');
    }

    // 결과를 콘솔에 출력
    console.log(chatroom);

    응답.render('../views/chat.ejs', {
      posts: chatroom
    });

  } catch (에러) {
    console.error(에러);

    // 에러 메시지를 클라이언트에게 전달
    응답.status(404).send('페이지를 찾을 수 없습니다.'); // 또는 다른 에러 처리 방식을 사용할 수 있음

  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
});

router.post('/chat', isLogin, async function (요청, 응답) {
  try {

    let schema = {
      title: '무슨채팅방',
      member: [요청.body.피신청인, 요청.user.id],
      date: new Date()
    }

    // MongoDB 클라이언트 연결
    await client.connect();

    const document = await client.db('todoapp').collection('chat').insertOne(schema);

    console.log(document)

    응답.redirect('/chat');

  } catch (에러) {
    console.error(에러);

    // 에러 메시지를 클라이언트에게 전달
    응답.status(404).send('페이지를 찾을 수 없습니다.'); // 또는 다른 에러 처리 방식을 사용할 수 있음

  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
});

module.exports = router;