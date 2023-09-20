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

router.delete('/delete', isLogin, async (요청, 응답) => {
  try {

    // MongoDB 클라이언트 연결
    await client.connect();

    await client.db("todoapp").command({ ping: 1 });

    // 요청에서 _id를 가져와서 정수로 변환
    const postId = parseInt(요청.body._id);

    // post 컬렉션에서 게시물 삭제
    const 삭제결과 = await client.db('todoapp').collection('post').deleteOne({
      _id: postId,
      user: 요청.user.id
    });

    if (삭제결과.deletedCount === 1) {
      console.log('삭제완료');
      응답.status(200).send({ message: '성공' });
    } else {
      console.log('삭제 실패');
      응답.status(400).send({ message: '삭제 실패' });
    }

  } catch (에러) {
    console.error(에러);
    응답.status(500).send({ message: '서버 오류' });
  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
});



module.exports = router;