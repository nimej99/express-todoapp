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

router.get('/user', (요청, 응답) => {
  if (요청.isAuthenticated()) {
    // 사용자가 로그인한 경우 사용자 정보 전송
    응답.json({ user: 요청.user.id });
  } else {
    // 사용자가 로그인하지 않은 경우 빈 객체 전송 또는 다른 처리
    응답.json({ user: null });
  }
});

module.exports = router;