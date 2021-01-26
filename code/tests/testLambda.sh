#!/bin/bash

# UC-A
./test --no-datadog --service lambda --memory 128 --use-case ./use-cases/a.js --strategy ./strategies/pipe.json
sleep 600

./test --no-datadog --service lambda --memory 128 --use-case ./use-cases/a.js --strategy ./strategies/pipe.json
sleep 600

./test --no-datadog --service lambda --memory 128 --use-case ./use-cases/a.js --strategy ./strategies/pipe.json
sleep 600


# UC-B
./test --no-datadog --service lambda --memory 128 --use-case ./use-cases/b.js --strategy ./strategies/pipe.json
sleep 600

./test --no-datadog --service lambda --memory 128 --use-case ./use-cases/b.js --strategy ./strategies/pipe.json
sleep 600

./test --no-datadog --service lambda --memory 128 --use-case ./use-cases/b.js --strategy ./strategies/pipe.json
sleep 600

# UC-C
./test --no-datadog --service lambda --memory 128 --use-case ./use-cases/c.js --strategy ./strategies/pipe.json
sleep 600

./test --no-datadog --service lambda --memory 128 --use-case ./use-cases/c.js --strategy ./strategies/pipe.json
sleep 600

./test --no-datadog --service lambda --memory 128 --use-case ./use-cases/c.js --strategy ./strategies/pipe.json