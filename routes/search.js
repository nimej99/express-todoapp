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

//binary search을 위한 indexing
router.get('/search', async function (요청, 응답) {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    // 요청 쿼리 파라미터에서 검색어를 가져옵니다.
    const 검색어 = 요청.query.value;

    if (!검색어) {
      // 검색어가 없으면 렌더링만 하고 함수 종료
      응답.render('search.ejs', {
        posts: []
      });
      return;
    }

    let 조건 = [
      {
        $search: {
          index: "titleSearch",
          text: {
            query: 검색어,
            path: ['title', 'date']
          }
        }
      }
    ]

    // aggregate는 검색조건을 넣어줄 수 있다 데이터 파이프라이닝
    const cursor = client.db('todoapp').collection('post').aggregate(조건);

    // 커서에서 문서를 배열로 변환
    const documents = await cursor.toArray();

    // 결과를 콘솔에 출력
    console.log(documents);

    응답.render('search.ejs', {
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