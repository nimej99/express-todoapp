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

router.get('/detail/:id', async function (요청, 응답) {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    // 요청 파라미터에서 _id를 정수로 변환
    const postId = parseInt(요청.params.id);

    // _id가 유효한지 확인
    if (isNaN(postId)) {
      throw new Error('유효하지 않은 게시물 ID');
    }

    // findOne 메서드를 사용하여 해당 _id의 문서 가져오기
    const document = await client.db('todoapp').collection('post').findOne({ _id: postId });

    // 문서가 없는 경우 처리
    if (!document) {
      throw new Error('게시물을 찾을 수 없음');
    }

    // 결과를 콘솔에 출력
    console.log(document);

    응답.render('detail.ejs', {
      posts: document
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

module.exports = router;