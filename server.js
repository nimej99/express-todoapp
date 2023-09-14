const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_URL;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.listen(process.env.PORT, function () {
  console.log('litening on 8080')
});

//app.use는 미들웨어로 응답,요청 사이에 함수를 실행하겠다는 뜻이다.
app.use(express.urlencoded({ extended: true })) //post로 요청한 값 url 인코딩으로 알아서 해석해서 가져오기 json 변형인듯
app.use('/public', express.static('public')) //public 폴더 사용하겠다 선언

//메소드 오버라이드 라이브러리로 html상에서 put, delete 사용가능
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

//세션부문
app.use(session({ secret: '99', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

//ejs 라이브러리
app.set('view engine', 'ejs');

app.get('/', function (요청, 응답) {
  응답.render(__dirname + '/views/index.ejs')
});

app.get('/write', function (요청, 응답) {
  응답.render(__dirname + '/views/write.ejs')
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

app.get('/detail/:id', async function (요청, 응답) {
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


app.get('/edit/:id', async function (요청, 응답) {
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

app.get('/login', function (요청, 응답) {
  응답.render(__dirname + '/views/login.ejs')
});

//로컬방식 인증, 실패시 /fail로 이동
app.post('/login', passport.authenticate('local', {
  failureRedirect: '/fail',
  successRedirect: '/'
}), (요청, 응답) => {
  응답.redirect('/')
});

//인증방법 = strategy를 사용해 인증검사
passport.use(new LocalStrategy({
  usernameField: 'id', //form name = id
  passwordField: 'pw', //form name = pw
  session: true, //세션 저장여부
  passReqToCallback: false,
}, async (입력한아이디, 입력한비번, done) => {
  try {

    await client.connect();

    await client.db("todoapp").command({ ping: 1 });

    let result = await client.db('todoapp').collection('login').findOne({ id: 입력한아이디 });

    if (!result) return done(null, false, { message: '존재하지않는 아이디요' })

    // 비밀번호 해싱을 사용하지 않으므로 단순 비교
    if (입력한비번 === result.pw) {
      return done(null, result); // 결과 = 세션 데이터 생성, 세션 id 정보 쿠키 생성
    } else {
      return done(null, false, { message: '비번틀렸어요' });
    }


  }
  catch (에러) {
    console.error(에러);
  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
}));

//인증성공 했다면 세션생성
passport.serializeUser(function (user, done) {
  done(null, user.id); // 또는 사용자의 고유 식별자
});

passport.deserializeUser(async function (아이디, done) {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    // MongoDB에서 사용자 정보 조회
    const result = await client.db('todoapp').collection('login').findOne({ id: 아이디 });

    if (result) {
      done(null, result); // 사용자 객체를 세션에 저장
    } else {
      done(null, false); // 사용자를 찾지 못한 경우
    }
  } catch (에러) {
    console.error(에러);
    done(에러);
  } finally {
    // 클라이언트 연결 닫기
    await client.close();
  }
});

app.get('/mypage', isLogin, (요청, 응답) => {
  console.log(요청.user)
  응답.render(__dirname + '/views/mypage.ejs', { data: 요청.user })
})

function isLogin(요청, 응답, next) {
  if (요청.user) {
    next()
  } else {
    응답.send('로그인시 이용가능 합니다.')
  }
}

app.put('/edit', async (요청, 응답) => {
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
        date: 요청.body.date
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

app.get('/search', async function (요청, 응답) {
  try {
    // MongoDB 클라이언트 연결
    await client.connect();

    const searchValue = 요청.query.value; // 검색어

    // find 메서드를 사용하여 title 필드에 검색어가 포함된 문서 가져오기
    const cursor = client.db('todoapp').collection('post').find({
      title: {
        $regex: `.*${searchValue}.*`, // 검색어를 포함하는 정규 표현식
        $options: 'i' // 대소문자 구분 없이 검색
      }
    });

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
