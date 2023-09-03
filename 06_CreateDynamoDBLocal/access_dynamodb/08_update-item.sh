#!/bin/bash
aws dynamodb update-item --table-name students \
--key '{"id": {"S": "001"}, "age": {"N": "14"}}' \
--update-expression 'set hometown = :hometown, hobby=:hobby' \
--expression-attribute-values '{":hometown": {"S": "Saitama"}, ":hobby": {"S": "TV Game"}}' \
--return-values 'ALL_NEW' \
--endpoint-url http://localhost:8000