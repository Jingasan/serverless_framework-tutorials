#!/bin/bash
aws dynamodb update-table --table-name students \
--provisioned-throughput '{"ReadCapacityUnits": 10, "WriteCapacityUnits": 10}' \
--endpoint-url http://localhost:8000