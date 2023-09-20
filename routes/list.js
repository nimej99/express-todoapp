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

router.get('/list', async function (요청, 응답) {
  try {

    // MongoDB 클라이언트 연결
    await client.connect();

    // find 메서드를 사용하여 모든 문서 가져오기
    const cursor = client.db('todoapp').collection('post').find();

    // 커서에서 문서를 배열로 변환
    const documents = await cursor.toArray();

    // 결과를 콘솔에 출력
    console.log(documents);

    응답.render('../views/list.ejs', {
      posts: documents
    });

  } catch (에러) {
    console.error(에러);
  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
});

module.exports = router;