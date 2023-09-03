import * as SES from "@aws-sdk/client-sesv2";

// 送信メールコンテンツの型定義
export type SendEmailCommandInput = SES.SendEmailCommandInput;

// SESコネクタ
export class SESConnector {
  // メンバ変数
  private sesClient: SES.SESv2Client;

  // コンストラクタ
  constructor() {
    this.sesClient = new SES.SESv2Client();
  }

  // メール送信
  public sendEmail = async (
    mailContent: SES.SendEmailCommandInput
  ): Promise<boolean> => {
    try {
      const res = await this.sesClient.send(
        new SES.SendEmailCommand(mailContent)
      );
      console.log(res);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
}
