const express = require('express');
const app = express();

app.listen(8080, function () {
  console.log('litening on 8080')
});

app.get('/app', function (요청, 응답) {
  응답.send('TODOAPP 입니다.');
});