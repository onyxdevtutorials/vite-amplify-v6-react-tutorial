import { Amplify } from "aws-amplify";
import amplifyconfig from "./amplifyconfiguration.json";

Amplify.configure(amplifyconfig);

export const S3_URL = `https://${amplifyconfig.aws_user_files_s3_bucket}.s3.amazonaws.com/public/`;
