#!/bin/bash
aws dynamodb scan --table-name students \
--filter-expression 'age = :age' \
--expression-attribute-values '{ ":age": { "N": "12" } }' \
--endpoint-url http://localhost:8000