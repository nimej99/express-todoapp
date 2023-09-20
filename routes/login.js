let router = require('express').Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_URL;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});

// router.use('/mypage', isLogin);

router.get('/login', function (요청, 응답) {
  응답.render('../views/login.ejs')
});

//로컬방식 인증, 실패시 /fail로 이동
router.post('/login', passport.authenticate('local', {
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
    // await client.close();
  }
});

module.exports = router;