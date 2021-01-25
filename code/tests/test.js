const { format } = require("date-fns");
const prompt = require("prompt");
const fs = require("fs");
const { exec } = require("child_process");

prompt.start();
prompt.delimiter = "";

async function start() {
  // Get API Url
  prompt.message = "\n1 Lambda\n2 Fargate\n";
  const { service } = await prompt.get({
    properties: {
      service: {
        pattern: /^(1|2)$/,
        required: true,
      },
    },
  });

  const serviceType = service === "1" ? "lambda" : "fargate";

  const apiUrl =
    service === "1"
      ? "https://6wxqnxn37k.execute-api.eu-central-1.amazonaws.com/dev"
      : "http://ec2co-ecsel-14dnyt6ihjqi3-1173665240.eu-central-1.elb.amazonaws.com";

  // get memory size
  prompt.message = `1 128MB
2 256MB
3 512MB
4 1024MB
`;
  const { memory } = await prompt.get({
    properties: {
      memory: {
        pattern: /^(1|2|3|4)$/,
        required: true,
      },
    },
  });

  let memorySize = 0;
  switch (memory) {
    case "1":
      memorySize = 128;
      break;
    case "2":
      memorySize = 256;
      break;
    case "3":
      memorySize = 512;
      break;
    case "4":
      memorySize = 1024;
      break;
  }

  // Get use-case file
  const useCaseFiles = fs.readdirSync("./use-cases");
  if (useCaseFiles.length === 0) {
    console.log("No use-case files found");
    return;
  }

  prompt.message = useCaseFiles.reduce((s, n, i) => `${s}${i + 1} ${n}\n`, ``);
  const { useCase } = await prompt.get({
    properties: {
      useCase: {
        pattern: new RegExp(`^[${1}-${useCaseFiles.length}]$`),
        required: true,
      },
    },
  });

  const useCaseFile = useCaseFiles[useCase - 1];

  // Get strategy
  const fileNames = fs.readdirSync("./strategies");
  if (fileNames.length === 0) {
    console.log("No strategy files found");
    return;
  }

  prompt.message = fileNames.reduce((s, n, i) => `${s}${i + 1} ${n}\n`, ``);
  const { strategy } = await prompt.get({
    properties: {
      strategy: {
        pattern: new RegExp(`^[${1}-${fileNames.length}]$`),
        required: true,
      },
    },
  });

  const strategyFile = fileNames[strategy - 1];

  // summary
  console.log();
  console.log("RUNNING TEST");
  console.log(`API_URL: ${apiUrl}`);
  console.log(`Memory: ${memorySize}`);
  console.log(`Use Case: use-cases/${useCaseFile}`);
  console.log(`Strategy: strategies/${strategyFile}`);

  const useCaseName = useCaseFile.replace(".js", "");
  const strategyName = strategyFile.replace(".json", "");

  // create folder
  const testFolder = `./${serviceType}/${useCaseName}/${memorySize}/${strategyName}`;
  if (!fs.existsSync(testFolder)) {
    fs.mkdirSync(testFolder, { recursive: true });
  }

  // run test
  const outputFile = `${testFolder}/${format(new Date(), "MMdd-kkmm")}`;

  exec(
    `k6 run use-cases/${useCaseFile} --config strategies/${strategyFile} -e API_URL="${apiUrl}" --out csv="${outputFile}.csv"`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`ERROR: ${error}`);
        return;
      }
      if (stderr) {
        console.log(`STDERR: ${stderr}`);
        return;
      }

      // write output file
      console.log("Done. Saving summary...");
      fs.writeFileSync(`${outputFile}.json`, stdout, (err) => {
        if (err) {
          console.error("There was an error saving k6 summary. Please save this manually:");
          console.log(stdout);
        }
      });
    }
  );
}

start();
