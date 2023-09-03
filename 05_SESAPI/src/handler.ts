import serverlessExpress from "@vendia/serverless-express";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as sourceMapSupport from "source-map-support";
import {
  SESv2Client,
  SendEmailCommand,
  SendEmailCommandInput,
} from "@aws-sdk/client-sesv2";
const app: Application = express();
const sesClient = new SESv2Client();
// SourceMapを有効化
sourceMapSupport.install();
// リクエストボディのパース用設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// CORS
app.use(cors());
// GET
app.get("/", async (_req: Request, res: Response, _next: NextFunction) => {
  // メールコンテンツ
  const input: SendEmailCommandInput = {
    FromEmailAddress: "from@gmail.com",
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
  try {
    // メール送信
    const result = await sesClient.send(new SendEmailCommand(input));
    console.log(result);
    return res.status(200).json("Success");
  } catch (err) {
    console.error(err);
    return res.status(503).json("Failed");
  }
});
export const handler = serverlessExpress({ app });
