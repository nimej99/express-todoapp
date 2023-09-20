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

router.post('/register', async (요청, 응답) => {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    let result = await client.db('todoapp').collection('login').findOne({ id: 요청.body.id });

    if (!result) {
      // 회원가입
      const result = await client.db('todoapp').collection('login').insertOne({
        // _id: totalPost + 1,
        id: 요청.body.id,
        pw: 요청.body.pw
      });
    }


    응답.redirect('/'); // 게시물 추가 후 목록 페이지로 리다이렉트

  } catch (에러) {
    console.error(에러);
  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
});

module.exports = router;