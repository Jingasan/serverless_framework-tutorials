import * as SM from "@aws-sdk/client-secrets-manager";
import * as Sequelize from "sequelize";
import * as PG from "pg";

type RDSSecret = {
  engine: string;
  dbInstance: string;
  host: string;
  port: number;
  username: string;
  password: string;
};

// SESコネクタ
export class RDSConnector {
  // メンバ変数
  private smClient: SM.SecretsManager;
  private sequelize: Sequelize.Sequelize;
  private pg: PG.Client;

  // コンストラクタ
  constructor() {
    this.smClient = new SM.SecretsManager();
  }

  // RDS接続のためのシークレットの取得
  private getRDSSecret = async (): Promise<RDSSecret | false> => {
    try {
      const secret = await this.smClient.getSecretValue({
        SecretId: "test-postgres-secret",
      });
      if (!secret.SecretString) {
        console.log("!secret.SecretString");
        return false;
      }
      const rdsConnectSecret: RDSSecret = {
        engine: JSON.parse(secret.SecretString).engine,
        dbInstance: JSON.parse(secret.SecretString).dbInstanceIdentifier,
        host: JSON.parse(secret.SecretString).host,
        port: JSON.parse(secret.SecretString).port,
        username: JSON.parse(secret.SecretString).username,
        password: JSON.parse(secret.SecretString).password,
      };
      console.log(rdsConnectSecret);
      return rdsConnectSecret;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // DBコネクションの初期化（Sequelizeの場合）
  public initConnectionSequelize = async (): Promise<boolean> => {
    const secret = await this.getRDSSecret();
    if (!secret) return false;
    try {
      this.sequelize = new Sequelize.Sequelize(
        "postgres",
        secret.username,
        secret.password,
        {
          host: secret.host,
          port: secret.port,
          dialect: "postgres",
          dialectModule: PG,
          dialectOptions: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
        }
      );
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // DBコネクションの初期化（PGの場合）
  public initConnectionPG = async (): Promise<boolean> => {
    const secret = await this.getRDSSecret();
    if (!secret) return false;
    try {
      this.pg = new PG.Client({
        database: "postgres",
        user: secret.username,
        password: secret.password,
        host: secret.host,
        port: secret.port,
        ssl: true,
      });
      this.pg.connect();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // SQLの実行（Sequelizeの場合）
  public runSQLSequelize = async (
    sql: string
  ): Promise<[unknown[], unknown] | false> => {
    try {
      const res = await this.sequelize?.query(sql);
      console.log(res);
      return res;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // SQLの実行（PGの場合）
  public runSQL = async (sql: string): Promise<any | false> => {
    try {
      const res = await this.pg.query(sql);
      console.log(res);
      return res;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
}
