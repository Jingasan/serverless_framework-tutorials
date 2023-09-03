import serverlessExpress from "@vendia/serverless-express";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as sourceMapSupport from "source-map-support";
import { v4 as uuidv4 } from "uuid";
import * as S3 from "./s3connector";
// SourceMapを有効化
sourceMapSupport.install();
// 初期化
const app: Application = express();
const s3connector = new S3.S3Connector();
// リクエストボディのパース用設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// CORS
app.use(cors());
// GET
app.get("/", async (_req: Request, res: Response, _next: NextFunction) => {
  const bucketName = "test-bucket-" + uuidv4();

  // S3バケットの作成
  console.log(">>> Create bucket");
  let result = await s3connector.createBucket(bucketName);
  if (!result) return res.status(503).json("Internal Server Error");

  // S3バケット一覧の取得
  console.log(">>> List buckets");
  const bucketlist = await s3connector.listBuckets();
  console.log(bucketlist);

  // S3バケットへのオブジェクト作成
  console.log(">>> Put object");
  const filepath = "json/sample.json";
  const json = {
    data: "sample",
  };
  result = await s3connector.putObject(bucketName, filepath, json);
  if (!result) return res.status(503).json("Internal Server Error");

  // S3バケットからのオブジェクト取得
  console.log(">>> Get object");
  const object = await s3connector.getObject(bucketName, filepath);
  console.log(object !== undefined ? JSON.parse(object) : "");

  // S3バケットのオブジェクト一覧取得(1000件以上)
  console.log(">>> List objects");
  const filelist = await s3connector.listObjects(bucketName, "");

  // S3 PutのPresignedURLの取得
  console.log(">>> Get presigned URL");
  const s3PutPresignedURL = await s3connector.getPutPresignedURL(
    bucketName,
    filepath,
    json
  );
  console.log("PresignedURL for S3 Put: " + s3PutPresignedURL);

  // S3バケットのオブジェクト削除
  console.log(">>> Delete object");
  for (const filepath of filelist) {
    console.log(filepath);
    if (!filepath) continue;
    result = await s3connector.deleteObject(bucketName, filepath);
    if (!result) return res.status(503).json("Internal Server Error");
  }

  // S3バケットの削除
  console.log(">>> Delete bucket");
  result = await s3connector.deeleteBucket(bucketName);
  if (!result) return res.status(503).json("Internal Server Error");

  // レスポンス
  return res.status(200).json("OK");
});
export const handler = serverlessExpress({ app });
