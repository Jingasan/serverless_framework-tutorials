import * as S3 from "@aws-sdk/client-s3";
import * as S3RequestPresigner from "@aws-sdk/s3-request-presigner";

// Bucket Policy の設定型
export type PutBucketPolicyCommandInput = S3.PutBucketPolicyCommandInput;

// Bucket CORS の設定型
export type PutBucketCorsCommandInput = S3.PutBucketCorsCommandInput;

// S3コネクタ
export class S3Connector {
  // メンバ変数
  private s3client: S3.S3Client;

  // コンストラクタ
  constructor() {
    this.s3client = new S3.S3Client();
  }

  // S3バケット作成
  public createBucket = async (bucketName: string): Promise<boolean> => {
    try {
      const createBucketParam: S3.CreateBucketCommandInput = {
        Bucket: bucketName,
      };
      const res = await this.s3client.send(
        new S3.CreateBucketCommand(createBucketParam)
      );
      console.log("Success", res);
      return true;
    } catch (err) {
      if ((err as any).Code === "BucketAlreadyOwnedByYou") {
        console.log("Bucket " + bucketName + " is already created.");
        return true;
      }
      console.error("Error", err);
      return false;
    }
  };

  // S3バケットへのBucket Policyの適用
  public putBucketPolicy = async (
    putBucketPolicyParam: S3.PutBucketPolicyCommandInput
  ): Promise<boolean> => {
    try {
      const res = await this.s3client.send(
        new S3.PutBucketPolicyCommand(putBucketPolicyParam)
      );
      console.log("Success", res);
      return true;
    } catch (err) {
      console.log("Error", err);
      return false;
    }
  };

  // S3バケットへのCORSの設定
  public putBucketCORS = async (
    putBucketCORSParam: S3.PutBucketCorsCommandInput
  ): Promise<boolean> => {
    try {
      const res = await this.s3client.send(
        new S3.PutBucketCorsCommand(putBucketCORSParam)
      );
      console.log("Success", res);
      return true;
    } catch (err) {
      console.log("Error", err);
      return false;
    }
  };

  // S3バケット一覧の取得
  public listBuckets = async (): Promise<string[]> => {
    const bucketlist: string[] = [];
    try {
      const data = await this.s3client.send(new S3.ListBucketsCommand({}));
      console.log("Success", data);
      data.Buckets?.forEach((bucket: S3.Bucket) => {
        if (bucket.Name) bucketlist.push(bucket.Name);
      });
    } catch (err) {
      console.error("Error", err);
    }
    return bucketlist;
  };

  // S3バケットへのオブジェクト作成
  public putObject = async (
    bucketName: string,
    key: string,
    json: any
  ): Promise<boolean> => {
    try {
      console.log("Create s3://" + bucketName + "/" + key);
      const putObjectParam: S3.PutObjectCommandInput = {
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(json),
      };
      const res = await this.s3client.send(
        new S3.PutObjectCommand(putObjectParam)
      );
      console.log("Success", res);
      return true;
    } catch (err) {
      console.error("Error", err);
      return false;
    }
  };

  // S3バケットからのオブジェクト取得
  public getObject = async (
    bucketName: string,
    key: string
  ): Promise<string | undefined> => {
    try {
      const getObjectParam: S3.GetObjectCommandInput = {
        Bucket: bucketName,
        Key: key,
      };
      const res = await this.s3client.send(
        new S3.GetObjectCommand(getObjectParam)
      );
      console.log("Success", res);
      return await res.Body?.transformToString();
    } catch (err) {
      console.error("Error", err);
      return undefined;
    }
  };

  // S3バケットのオブジェクト一覧取得
  public listObjects = async (
    bucketName: string,
    prefix: string
  ): Promise<string[]> => {
    const listObjectsParam: S3.ListObjectsCommandInput = {
      Bucket: bucketName,
      Prefix: prefix,
    };
    let truncated: boolean | undefined = true;
    let pageMarker: string | undefined;
    let filelist: string[] = [];
    while (truncated) {
      try {
        const res = await this.s3client.send(
          new S3.ListObjectsCommand(listObjectsParam)
        );
        res.Contents?.forEach((item: any) => {
          if (item.Key) filelist.push(item.Key);
        });
        truncated = res.IsTruncated;
        if (truncated) {
          pageMarker = res.Contents?.slice(-1)[0].Key;
          listObjectsParam.Marker = pageMarker;
        }
      } catch (err) {
        console.error("Error", err);
        truncated = false;
      }
    }
    return filelist;
  };

  // S3 PutのPresigned URL取得
  public getPutPresignedURL = async (
    bucketName: string,
    key: string,
    json: any
  ): Promise<string | boolean> => {
    try {
      const putObjectParam: S3.PutObjectCommandInput = {
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(json),
      };
      const url = await S3RequestPresigner.getSignedUrl(
        this.s3client,
        new S3.PutObjectCommand(putObjectParam),
        {
          expiresIn: 3600,
        }
      );
      console.log("Success", url);
      return url;
    } catch (err) {
      console.error("Error", err);
      return false;
    }
  };

  // S3バケットのオブジェクト削除
  public deleteObject = async (
    bucketName: string,
    key: string
  ): Promise<boolean> => {
    try {
      console.log("Delete s3://" + bucketName + "/" + key);
      const deleteObjectParam: S3.DeleteObjectCommandInput = {
        Bucket: bucketName,
        Key: key,
      };
      const res = await this.s3client.send(
        new S3.DeleteObjectCommand(deleteObjectParam)
      );
      console.log("Success", res);
      return true;
    } catch (err) {
      console.error("Error", err);
      return false;
    }
  };

  // S3バケットの削除
  public deeleteBucket = async (bucketName: string): Promise<boolean> => {
    try {
      const deleteBucketParam: S3.DeleteBucketCommandInput = {
        Bucket: bucketName,
      };
      const res = await this.s3client.send(
        new S3.DeleteBucketCommand(deleteBucketParam)
      );
      console.log("Success", res);
      return true;
    } catch (err) {
      console.log("Error", err);
      return false;
    }
  };
}
