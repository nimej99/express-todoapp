const express = require('express');
const app = express();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://jamm:jamjam1!@nimej99.zjvkpmi.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.listen(8080, function () {
  console.log('litening on 8080')
});

app.use(express.urlencoded({ extended: true })) //post로 요청한 값 url 인코딩으로 알아서 해석해서 가져오기

app.set('view engine', 'ejs');


app.get('/', function (요청, 응답) {
  응답.sendFile(__dirname + '/index.html')
});

app.get('/write', function (요청, 응답) {
  응답.sendFile(__dirname + '/write.html')
});

app.get('/list', async function (요청, 응답) {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    // find 메서드를 사용하여 모든 문서 가져오기
    const cursor = client.db('todoapp').collection('post').find();

    // 커서에서 문서를 배열로 변환
    const documents = await cursor.toArray();

    // 결과를 콘솔에 출력
    console.log(documents);

    응답.render('list.ejs', {
      posts: documents
    });

  } catch (에러) {
    console.error(에러);
  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
});

app.post('/add', async (요청, 응답) => {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    await client.db("todoapp").command({ ping: 1 });

    // counter 게시물 갯수
    const counterQuery = await client.db('todoapp').collection('counter').findOne({ name: '게시물갯수' });
    const totalPost = counterQuery ? counterQuery.totalPost : 0;

    // post에 게시물 추가
    const result = await client.db('todoapp').collection('post').insertOne({
      _id: totalPost + 1,
      title: 요청.body.title,
      date: 요청.body.date
    });

    // 게시물 갯수 업데이트
    await client.db('todoapp').collection('counter').updateOne(
      { name: '게시물갯수' },
      { $set: { totalPost: totalPost + 1 } }
      //$set : {key:바꿀값}
      //$inc : {key:증가할값}
    );

    응답.redirect('/list'); // 게시물 추가 후 목록 페이지로 리다이렉트

  } catch (에러) {
    console.error(에러);
  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
});

app.delete('/delete', async (요청, 응답) => {
  try {
    console.log(요청.body);

    // MongoDB 클라이언트 연결
    await client.connect();

    await client.db("todoapp").command({ ping: 1 });

    // 요청에서 _id를 가져와서 정수로 변환
    const postId = parseInt(요청.body._id);

    // post 컬렉션에서 게시물 삭제
    const 삭제결과 = await client.db('todoapp').collection('post').deleteOne({ _id: postId });

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
