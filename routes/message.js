let router = require('express').Router();

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

router.post('/message', isLogin, async (요청, 응답) => {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    var post = {
      post: new ObjectId(요청.body.post),
      content: 요청.body.content,
      date: new Date(),
      user: 요청.user.id // 사용자 정보를 게시물에 추가
    }

    console.log(post);

    // post에 게시물 추가
    await client.db('todoapp').collection('message').insertOne(post);


  } catch (에러) {
    console.error(에러);
  } finally {
    // 클라이언트 연결 닫기
    // await client.close();
  }
});

//header 수정을 통해 1회성이 아닌 지속적인 응답
router.get('/message/:post', isLogin, async function (요청, 응답) {
  try {
    응답.writeHead(200, {
      "Connection": "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    });

    // MongoDB 클라이언트 연결
    await client.connect();

    // post에 게시물 추가
    let cursor = client.db('todoapp').collection('message').find({ post: new ObjectId(요청.params.post) });

    await cursor.toArray()
      .then((결과) => {
        console.log(결과);
        응답.write('event: chat\n'); //보낼 데이터 이름
        응답.write(`data: ${JSON.stringify(결과)}\n\n`); //보낼 데이터 쿼리스트링=문자 json변환
      });

    const pipeline = [
      { $match: { 'fullDocument.post': new ObjectId(요청.params.post) } } //선택한 채팅방 글 변동시
    ];
    const collection = client.db('todoapp').collection('message');
    const changeStream = collection.watch(pipeline); //실시간 감지
    changeStream.on('change', (result) => {
      console.log(result.fullDocument);
      let newChat = [result.fullDocument];
      응답.write('event: chat\n'); //보낼 데이터 이름
      응답.write(`data: ${JSON.stringify(newChat)}\n\n`);
    });


  } catch (에러) {
    console.error(에러);
  } finally {
    // 클라이언트 연결 닫기
    // await client.close();
  }
});



module.exports = router;