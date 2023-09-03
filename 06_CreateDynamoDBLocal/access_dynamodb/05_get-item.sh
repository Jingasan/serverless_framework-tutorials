#!/bin/bash
aws dynamodb get-item --table-name students \
--key '{"id": {"S": "002"}, "age": {"N": "12"}}' \
--endpoint-url http://localhost:8000