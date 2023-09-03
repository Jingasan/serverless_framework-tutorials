#!/bin/bash
aws dynamodb query --table-name students \
--key-condition-expression 'id = :id and age >= :age' \
--expression-attribute-values '{ ":id": { "S": "001" }, ":age": { "N": "12" } }' \
 --endpoint-url http://localhost:8000