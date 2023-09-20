let router = require('express').Router();

router.get('/', function (요청, 응답) {
  응답.render('../views/index.ejs')
});

module.exports = router;