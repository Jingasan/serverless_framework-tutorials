import serverlessExpress from "@vendia/serverless-express";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as sourceMapSupport from "source-map-support";
import * as RDSSigner from "@aws-sdk/rds-signer";
import * as PG from "pg";
import * as Sequelize from "sequelize";
// SourceMapを有効化
sourceMapSupport.install();
// 初期化
const app: Application = express();
// リクエストボディのパース用設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// CORS
app.use(cors());
// RDS関連の情報
const rdsProxyHostname = "xxxxx.ap-northeast-1.rds.amazonaws.com"; // RDS Proxyのホスト名
const rdsPort = 5432; // RDSポート番号
const rdsDatabaseName = "postgres"; // RDSデータベース名
const rdsUsername = "postgres"; // RDSマスターユーザー名
const rdsRegion = "ap-northeast-1"; // RDSとRDS Proxyを配置したRegion
// RDS Proxy接続のためのトークンの取得
const getRDSProxyToken = async (): Promise<string | false> => {
  const rdsSigner = new RDSSigner.Signer({
    hostname: rdsProxyHostname, // RDS Proxyのホスト名
    port: rdsPort, // RDSのポート番号
    username: rdsUsername, // RDSのマスターユーザー名
    region: rdsRegion, // RDS Proxyを配置したRegion
  });
  try {
    console.log("> RDS Proxy 接続のためのトークンの取得");
    const token = await rdsSigner.getAuthToken();
    console.log("token: " + token);
    return token;
  } catch (err) {
    console.error(err);
    return false;
  }
};
// RDS Proxyとの接続初期化
const initRDSProxyConnection = async (): Promise<
  Sequelize.Sequelize | false
> => {
  // RDS Proxy接続のためのトークンの取得
  const token = await getRDSProxyToken();
  if (!token) return false;
  try {
    console.log("> RDS Proxy 接続");
    const sequelize = new Sequelize.Sequelize(
      rdsDatabaseName, // RDSデータベース名
      rdsUsername, // RDSマスターユーザー名
      token, // RDS Proxy接続トークン
      {
        host: rdsProxyHostname, // RDS Proxyホスト名
        port: rdsPort, // RDSポート番号
        dialect: "postgres",
        dialectModule: PG,
        dialectOptions: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }
    );
    return sequelize;
  } catch (err) {
    console.error(err);
    return false;
  }
};
// GET
app.get("/", async (_req: Request, res: Response, _next: NextFunction) => {
  // RDS Proxyとの接続初期化
  const sequelize = await initRDSProxyConnection();
  if (!sequelize) return res.status(503).json("Internal Server Error");
  // SQLの実行
  const sql = `show all`;
  console.log("> SQL 実行：" + sql);
  const result = await sequelize.query(sql);
  return res.status(200).json(result);
});
// 関数のエンドポイント
export const handler = serverlessExpress({ app });
