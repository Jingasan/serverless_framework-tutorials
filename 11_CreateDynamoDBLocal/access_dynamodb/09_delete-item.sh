#!/bin/bash
aws dynamodb delete-item --table-name students \
--key '{"id": {"S": "000"}, "age": {"N": "12"}}' \
--endpoint-url http://localhost:8000