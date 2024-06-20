import AWS from "aws-sdk";
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";
import { fromEnv } from "@aws-sdk/credential-provider-env";

dotenv.config();

const s3Config = new S3Client({
  region: "eu-north-1",
  credentials: fromEnv(),
});


const upload = multer({
  storage: multerS3({
    s3: s3Config,
      bucket: "mern-ecom",
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

export const singleUpload = upload.single("photo");
