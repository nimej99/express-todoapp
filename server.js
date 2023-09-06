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

app.get('/', function (요청, 응답) {
  응답.sendFile(__dirname + '/index.html')
});

app.get('/write', function (요청, 응답) {
  응답.sendFile(__dirname + '/write.html')
});

app.post('/add', (요청, 응답) => {
  
  async function run() {
    try {

      await client.db("todoapp").command({ ping: 1 });

      await client.db('todoapp').collection('post').insertOne({
        title: 요청.body.title, //html에서 받아온 name=title
        date: 요청.body.date, //html에서 받아온 name=date
        // _id : 요청.body.index //MongoDB에서 부여한 기본 유니크key 부여 안하면 알아서 이상한코드 부여함
      })

    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
}
);