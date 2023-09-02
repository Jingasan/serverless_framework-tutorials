'use strict';
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const app = express();

// CORS設定
// CORSとは異なるオリジン(ドメイン)からのアクセスを認可するための仕組みである。
// CORS環境下では、ブラウザはサーバーへのリクエスト時に
// リクエスト前に常にpreflightリクエストを行う。
// preflightリクエストとは、
// ブラウザがサーバーのCORS設定を問い合わせるものであり、
// サーバー側がpreflightリクエストに未対応の場合や、CORS設定の
// Access-Control-Allow-Originで許可されていないアクセス元や
// Access-Control-Allow-Methodsで許可されていないメソッドであった場合、
// 403 forbiddenエラーを返す。
const corsOptions = {
	origin: "*",
	methods: "GET, POST, PUT, DELETE",
	allowedHeaders: "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
};

// GET
app.get('/users/:id', cors(corsOptions), function (req, res) {
	// レスポンスでリクエストのクエリの内容を返す
	res.json({ Query: req.query });
});

// POST
app.post('/users/:id', cors(corsOptions), function (req, res) {
	// レスポンスでリクエストのBodyの内容を返す
	const body = JSON.parse(req.body);
	res.json({ PostBody: body });
});

// PUT
app.put('/users/:id', cors(corsOptions), function (req, res) {
	// レスポンスでHTTPリクエストヘッダの内容を返す
	res.json({ RequestHeader: req.headers });
});

// DELETE
app.delete('/users/:id', cors(corsOptions), function (req, res) {
	// レスポンスでURLパラメータを返す
	res.json({ URLParams: req.params.id });
});

module.exports.main = serverless(app);