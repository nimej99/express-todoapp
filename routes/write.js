let router = require('express').Router();

router.get('/write', function (요청, 응답) {
  응답.render('../views/write.ejs')
});

module.exports = router;