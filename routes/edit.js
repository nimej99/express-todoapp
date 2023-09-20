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

router.put('/edit', async (요청, 응답) => {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    await client.db("todoapp").command({ ping: 1 });

    // post에 게시물 추가
    const result = await client.db('todoapp').collection('post').updateOne({
      _id: parseInt(요청.body._id)
    }, {
      $set: {
        title: 요청.body.title,
        date: 요청.body.date,
        user: 요청.body.user
      }
    });

    응답.redirect('/list'); // 게시물 추가 후 목록 페이지로 리다이렉트

  } catch (에러) {
    console.error(에러);
  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
});

router.get('/edit/:id', async function (요청, 응답) {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    //파라미터를 정수로 변환
    const postId = parseInt(요청.params.id);

    // _id가 유효한지 확인
    if (isNaN(postId)) {
      throw new Error('유효하지 않은 게시물 ID');
    }

    // find 메서드를 사용하여 모든 문서 가져오기
    const documents = await client.db('todoapp').collection('post').findOne({ _id: postId });

    // 문서가 없는 경우 처리
    if (!documents) {
      throw new Error('게시물을 찾을 수 없음');
    }

    // 결과를 콘솔에 출력
    console.log(documents);

    응답.render('edit.ejs', {
      posts: documents
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