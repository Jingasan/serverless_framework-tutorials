#!/bin/bash
aws dynamodb batch-write-item --request-items file://data.json --endpoint-url http://localhost:8000