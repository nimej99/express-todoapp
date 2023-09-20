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

router.post('/add', isLogin, async (요청, 응답) => {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    // counter 게시물 갯수
    const counterQuery = await client.db('todoapp').collection('counter').findOne({ name: '게시물갯수' });
    const totalPost = counterQuery ? counterQuery.totalPost : 0;

    console.log(요청.user.id);

    var post = {
      _id: totalPost + 1,
      title: 요청.body.title,
      date: 요청.body.date,
      user: 요청.user.id // 사용자 정보를 게시물에 추가
    }

    console.log(post);

    // post에 게시물 추가
    await client.db('todoapp').collection('post').insertOne(post);

    // 게시물 갯수 업데이트
    await client.db('todoapp').collection('counter').updateOne(
      { name: '게시물갯수' },
      { $set: { totalPost: totalPost + 1 } }
    );

    응답.redirect('/list'); // 게시물 추가 후 목록 페이지로 리다이렉트
  } catch (에러) {
    console.error(에러);
  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
});



module.exports = router;