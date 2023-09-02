"use strict";

module.exports.main = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      ENV_VAL: process.env.ENV_VAL,
      ENV_JSON_VAL: process.env.ENV_JSON_VAL,
      ENV_YAML_VAL: process.env.ENV_YAML_VAL,
    }),
  };
};
