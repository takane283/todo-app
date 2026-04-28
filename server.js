const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "mysql.railway.internal",
  user: "root",
  password: "qMWrMvmDorYHIZMYlHKSHXGUVJWOqQmp",
  database: "railway",
  port "3306"
});

db.connect((err) => {
  if (err) {
    console.error("DB接続失敗:", err);
    return;
  }
  console.log("DB接続成功！");
});

app.get("/habits", (req, res) => {
  db.query("select h.id,h.habit_name,h.habit_time,l.completed from habits h left join habit_logs l on h.id=l.habbit_id and l.log_date=curdate() where h.weekday is null or h.weekday=dayofweek(curdate()) order by h.habit_time;", (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

app.post("/toggle",(req,res) => {
  const {habit_id} = req.body;

  const sql = `
    INSERT INTO habit_logs (habbit_id,log_date,completed)
    VALUES (?,CURDATE(),1)
    ON DUPLICATE KEY UPDATE completed = NOT completed
  `;

  db.query(sql,[habit_id],(err,result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.send("更新完了");
  });
});

app.post("/addHabit", (req, res) => {
  const { name, time, weekday } = req.body;

  const sql = "INSERT INTO habits (habit_name, habit_time, weekday) VALUES (?, ?, ?)";
  db.query(sql, [name, time, weekday], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.send("追加成功");
  });
});

app.post("/deleteHabit", (req, res) => {
  const { habit_id } = req.body;

  db.query("DELETE FROM habit_logs WHERE habbit_id = ?", [habit_id],(err) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }

   db.query("DELETE FROM habits WHERE id = ?",[habit_id], (err) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    res.send("削除成功");
    });
  });
});

app.post("/updateHabit",(req,res) => {
  const {habit_id,name,time} = req.body;

  const sql = `
    UPDATE habits
    SET habit_name = ?,habit_time = ?
    WHERE id = ?
  `;

  db.query(sql, [name,time,habit_id],(err,result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    res.send("更新成功");
  });
});
 
app.listen(3000, "0.0.0.0", () => {
  console.log("サーバー起動 http://localhost:3000");
});