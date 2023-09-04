import serverlessExpress from "@vendia/serverless-express";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as sourceMapSupport from "source-map-support";
import * as RDS from "./rdsConnector";
// SourceMapを有効化
sourceMapSupport.install();
// 初期化
const app: Application = express();
const rdsConnector = new RDS.RDSConnector();
// リクエストボディのパース用設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// CORS
app.use(cors());
// SecretIDの設定
const secretId = "postgres-public-secret";
// DBの設定
const dbName = "postgres";
const tableName = "test";
// GET
app.get("/", async (_req: Request, res: Response, _next: NextFunction) => {
  // RDSとの接続初期化
  if (!(await rdsConnector.initConnectionSequelize(secretId, dbName))) {
    return res.status(503).json("Failure");
  }
  // SQLの実行
  const sql = `select * from public.${tableName}`;
  //const sql = `show all`;
  console.log("ExecutionSQL: " + sql);
  const result = await rdsConnector.runSQLSequelize(sql);
  if (!result) {
    return res.status(503).json("Failure");
  }
  return res.status(200).json(result);
});
export const handler = serverlessExpress({ app });
