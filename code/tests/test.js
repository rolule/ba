const prompt = require("prompt");
const fs = require("fs");
const yaml = require("js-yaml");
const { format, add, formatDistanceToNow } = require("date-fns");
const { de } = require("date-fns/locale");
const { exec } = require("child_process");
const { exit } = require("process");

// command lint args
// confg file path
let configFile = "config.yaml";
if (process.argv.includes("--config")) {
  configFile = process.argv[process.argv.findIndex((a) => a === "--config") + 1];
}

// not using datadog
let datadog = "--out datadog";
if (process.argv.includes("--no-datadog")) {
  datadog = "";
}

// creating all artifacts in debug folder
// this is for local testing without adding to git
let debug = "";
if (process.argv.includes("--debug")) {
  debug = "debug/";
}

// lambda or fargate
let serviceType = "";
if (process.argv.includes("--service")) {
  serviceType = process.argv[process.argv.findIndex((a) => a === "--service") + 1];
}

// 128, 26, 512, 1024
let memorySize = "";
if (process.argv.includes("--memory")) {
  memorySize = parseInt(process.argv[process.argv.findIndex((a) => a === "--memory") + 1]);
}

// Task count
let taskCount = "";
if (process.argv.includes("--memory")) {
  taskCount = parseInt(process.argv[process.argv.findIndex((a) => a === "--tasks") + 1]);
}

// k6 script file of the use-case
let useCaseFile = "";
if (process.argv.includes("--use-case")) {
  useCaseFile = process.argv[process.argv.findIndex((a) => a === "--use-case") + 1];
}

// k6 options file
let strategyFile = "";
if (process.argv.includes("--strategy")) {
  strategyFile = process.argv[process.argv.findIndex((a) => a === "--strategy") + 1];
}

const formatDE = (date, formatStr = "PP") => {
  return format(date, formatStr, { locale: de, timeZone: "Europe/Berlin" });
};

// open config file
let config;
try {
  config = yaml.load(fs.readFileSync(configFile, "utf8"));
} catch (e) {
  console.log(
    "Config file not found! Please provide a config.yaml file in this folder or use --config to specify the path."
  );
  exit(-1);
}

// starts the prompt input
prompt.start();
prompt.delimiter = "";

// async function because it is needed for await syntax of prompt
async function start() {
  // Get API Url
  if (!serviceType) {
    prompt.message = "\n1 Lambda\n2 Fargate\n";
    const { service } = await prompt.get({
      properties: {
        service: {
          pattern: /^(1|2)$/,
          required: true,
        },
      },
    });

    serviceType = service === "1" ? "lambda" : "fargate";
  }

  const apiUrl = serviceType === "lambda" ? config.lambda : config.fargate;

  // get memory size
  if (!memorySize) {
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
  }

  // get task count
  if (serviceType === "fargate" && !taskCount) {
    prompt.message = `How many Fargate Tasks?\n`;
    const { tasks } = await prompt.get({
      properties: {
        tasks: {
          pattern: /^[1-9]+$/,
          required: true,
        },
      },
    });

    taskCount = parseInt(tasks);
  }

  // Get use-case file
  if (!useCaseFile) {
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

    useCaseFile = `./use-cases/${useCaseFiles[useCase - 1]}`;
  }

  // Get strategy
  if (!strategyFile) {
    const fileNames = fs.readdirSync("./strategies");
    if (fileNames.length === 0) {
      console.log("No strategy files found");
      return;
    }

    prompt.message = fileNames.reduce((s, n, i) => `${s}${i + 1} ${n}\n`, ``);
    const { strategy } = await prompt.get({
      properties: {
        strategy: {
          pattern: new RegExp(`^[1-9]+$`),
          required: true,
        },
      },
    });

    strategyFile = `strategies/${fileNames[strategy - 1]}`;
  }

  // summary
  console.log();
  console.log(`${serviceType.toUpperCase()}: ${apiUrl}`);
  console.log(`Memory: ${memorySize}`);
  console.log(`Use Case: ${useCaseFile}`);
  console.log(`Strategy: ${strategyFile}`);

  // log strategy
  const { stages } = JSON.parse(fs.readFileSync(strategyFile));
  let totalSeconds = 0;
  stages.forEach(({ duration, target }, i) => {
    console.log(`  ${i + 1}: ${duration} -> ${target} VUs`);

    // parse duration into seconds
    const hoursMatch = /([0-9]+)h/.exec(duration);
    if (hoursMatch) {
      totalSeconds += parseInt(hoursMatch.match) * 3600;
    }

    const minutesMatch = /([0-9]+)m/.exec(duration);
    if (minutesMatch) {
      totalSeconds += parseInt(minutesMatch[1]) * 60;
    }

    const secondMatch = /([0-9]+)s/.exec(duration);
    if (secondMatch) {
      totalSeconds += parseInt(secondMatch[1]);
    }
  });

  // get file name of use case
  const useCasePathSplit = useCaseFile.split("/");
  const useCaseName = useCasePathSplit[useCasePathSplit.length - 1].replace(".js", "");

  // get file name of strategy
  const strategyPathSplit = strategyFile.split("/");
  const strategyName = strategyPathSplit[strategyPathSplit.length - 1].replace(".json", "");

  // create artifact ouput folder
  const totalTaskMemory = taskCount !== 1 && serviceType === "fargate" ? taskCount + "x" + memorySize : memorySize;
  const outputFolder = `./${debug}${serviceType}/${useCaseName}/${totalTaskMemory}/${strategyName}`;
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  // run test
  const fileName = formatDE(new Date(), "MMdd-kkmm");
  const outputFile = `${outputFolder}/${fileName}`;
  console.log(`Output: ${outputFile}.csv`);
  console.log(`Datadog: ${datadog ? "yes" : "no"}`);
  const endDate = add(new Date(), { seconds: totalSeconds });
  console.log(`Expected dur: ${formatDistanceToNow(endDate)}`);
  console.log(`Expected end: ${formatDE(endDate, "kk:mm")}`);
  console.log();

  exec(
    `k6 -q --log-output none run ${useCaseFile} --config ${strategyFile} -e API_URL="${apiUrl}" --out csv="${outputFile}.csv" ${datadog} --summary-export="${outputFile}.json"`,
    { maxBuffer: 1024 * 1024 * 100 },
    (error, stdout, stderr) => {
      if (error) {
        console.log(`ERROR: ${error}`);
        return;
      }
      if (stderr) {
        console.log(`STDERR: ${stderr}`);
        return;
      }

      // rounds two decimal places
      const round = (num) => {
        return (Math.round(num * 100) / 100).toFixed(2);
      };

      // print k6 summary
      // console.log(stdout);
      const { metrics } = JSON.parse(fs.readFileSync(`${outputFile}.json`));
      const { http_reqs: requests } = metrics;
      console.log(`Total requests  : ${requests.count}`);
      console.log(`Avg request rate: ${round(requests.rate)}/s`);

      const { http_req_duration: duration } = metrics;
      console.log(`Duration
  - med: ${round(duration.med)}ms
  - min: ${round(duration.min)}ms
  - max: ${round(duration.max)}ms
  - avg: ${round(duration.avg)}ms
  - p90: ${round(duration["p(90)"])}ms
  - p95: ${round(duration["p(95)"])}ms`);

      console.log(`VUs
  - min: ${metrics.vus.min}
  - max: ${metrics.vus.max}
  - val: ${metrics.vus.value}`);

      // create tar.gz archive of output files and go back in tests directory
      const tarArchiveName = `${fileName}.tar.gz`;
      const tarArchivePath = `${outputFolder}/${tarArchiveName}`;
      exec(
        `cd ${outputFolder} && tar cfz ${tarArchiveName} ${fileName}.csv ${fileName}.json && cd -`,
        (error, stdout, stderr) => {
          if (error) {
            console.log(error);
            return;
          }

          if (stderr) {
            console.log(stderr);
            return;
          }

          // git add ouput folder if it exists and commit
          if (fs.existsSync(outputFolder) && !debug) {
            const commitMsg = `Add test: ${serviceType.toUpperCase()} ${totalTaskMemory}MB UC-${useCaseName.toUpperCase()} ${strategyName}`;
            console.log(commitMsg);
            exec(`git add ${tarArchivePath} && git commit -m "${commitMsg}"`, (error, stdout, stderr) => {
              if (error) {
                console.log(`ERROR: ${error}`);
                return;
              }
              if (stderr) {
                console.log(`STDERR: ${stderr}`);
                return;
              }
            });
          } else {
            console.log("Did not add anything to git");
          }
        }
      );
    }
  );
}

start();
