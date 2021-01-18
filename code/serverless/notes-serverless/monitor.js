import aws from "aws-sdk";

const lambda = new aws.Lambda({ region: "eu-central-1" });

const functions = ["list", "get", "update", "test"];

functions.forEach((f) => {
  lambda.getFunction(
    {
      FunctionName: `notes-serverless-dev-${f}`,
    },
    (err, data) => {
      console.log(`${f}: ${data.Configuration.State}`);
    }
  );
});
