import serverlessExpress from "@vendia/serverless-express";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as sourceMapSupport from "source-map-support";
import * as SES from "./sesConnector";
// SourceMapを有効化
sourceMapSupport.install();
// 初期化
const app: Application = express();
const sesConnector = new SES.SESConnector();
// リクエストボディのパース用設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// CORS
app.use(cors());
// GET
app.get("/", async (_req: Request, res: Response, _next: NextFunction) => {
  // 送信メールコンテンツ
  const mailContent: SES.SendEmailCommandInput = {
    FromEmailAddress: "from@gmail.com", // 事前にSESの設定をしておくこと
    Destination: {
      ToAddresses: ["to@gmail.com"],
      CcAddresses: [],
      BccAddresses: [],
    },
    Content: {
      Simple: {
        Subject: {
          Data: "Test email",
        },
        Body: {
          Text: {
            Data: "This is test email.",
          },
        },
      },
    },
  };
  // メール送信
  const result = await sesConnector.sendEmail(mailContent);
  if (!result) return res.status(503).json("Failed");
  return res.status(200).json("Success");
});
export const handler = serverlessExpress({ app });
