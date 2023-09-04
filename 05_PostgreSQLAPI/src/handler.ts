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
// GET
app.get("/", async (_req: Request, res: Response, _next: NextFunction) => {
  // RDSとの接続初期化
  if (!(await rdsConnector.initConnectionSequelize())) {
    return res.status(503).json("Failure");
  }
  // SQLの実行
  const sql = "select * from public.test";
  console.log("ExecutionSQL: " + sql);
  const result = await rdsConnector.runSQL(sql);
  if (!result) {
    return res.status(503).json("Failure");
  }
  return res.status(200).json(result);
});
export const handler = serverlessExpress({ app });
