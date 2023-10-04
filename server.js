const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();

//socket.io
const http = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);
app.set('io', io);

http.listen(process.env.PORT, function () {
  console.log('litening on 8080')
});

//ejs 라이브러리
app.set('view engine', 'ejs');

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


//index.js
app.use('/', require('./routes/index.js'));

//list.js
app.use('/', require('./routes/list.js'));

//detail.js
app.use('/', require('./routes/detail.js'));

//write.js
app.use('/', require('./routes/write.js'));

//add.js
app.use('/', require('./routes/add.js'));

//edit.js
app.use('/', require('./routes/edit.js'));

//search.js
app.use('/', require('./routes/search.js'));

//login.js
app.use('/', require('./routes/login.js'));

//register.js
app.use('/', require('./routes/register.js'));

//mypage.js
app.use('/', require('./routes/mypage.js'));

//delete.js
app.use('/', require('./routes/delete.js'));

//user.js
app.use('/', require('./routes/user.js'));

//chat.js
app.use('/', require('./routes/chat.js'));

//message.js
app.use('/', require('./routes/message.js'));

//socket.js
app.use('/', require('./routes/socket.js')(io));