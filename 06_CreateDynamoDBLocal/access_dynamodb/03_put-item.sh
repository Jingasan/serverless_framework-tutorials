#!/bin/bash
aws dynamodb put-item --table-name students \
--item '{"id": {"S": "003"}, "name": {"S": "Shiro"}, "age": {"N": "8"}}' \
--endpoint-url http://localhost:8000