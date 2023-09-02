'use strict';

/**
 * GET /(stage)/echo?foo=xxxxx
 */
module.exports.echo1 = async event => {
  const query = event.queryStringParameters;
  const foo = ((query !== null) && ("foo" in query))?  query.foo:"foo is empty";

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Im echo1',
        query: foo,
      },
      null,
      2
    ),
  };
};


/**
 * POST /(stage)/echo/
 * foo=xxxxx
 */
module.exports.echo2 = async event => {
  const body = JSON.parse(event.body)
  const foo = ((body !== null) && ("foo" in body))?  body.foo:"foo is empty";

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Im echo2',
        body: foo,
      },
      null,
      2
    ),
  };
};