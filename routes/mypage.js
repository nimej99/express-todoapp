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

router.get('/mypage', isLogin, (요청, 응답) => {
  console.log(요청.user)
  응답.render('../views/mypage.ejs', { data: 요청.user })
})



module.exports = router;