const chai = require('chai');
const chaiHttp = require('chai-http');
const should = require('chai').should();

require('dotenv').config();

chai.use(chaiHttp);

const envVars = [ 'AUTH0_DOMAIN', 'API_IDENTIFIER', 'API_URL', 'AUTH0_CLIENT_ID_1', 'AUTH0_CLIENT_SECRET_1', 'AUTH0_CLIENT_ID_2', 'AUTH0_CLIENT_SECRET_2', 'AUTH0_CLIENT_ID_3', 'AUTH0_CLIENT_SECRET_3', 'AUTH0_CLIENT_ID_4', 'AUTH0_CLIENT_SECRET_4' ]

const missingEnvVars = envVars.filter(envVar => process.env[envVar] === '' || process.env[envVar] === undefined);

if (missingEnvVars.length > 0) {
  throw `Make sure you have set the variables in your .env file, you are missing ${missingEnvVars.join(', ')}`
}

const apiURL = process.env.API_URL;

let expectedErrorCodes = {
  'request_without_authorization_header_private': 401,
  'request_without_authorization_header_private_scoped': 401,
  // Authorization: 'Bearer '
  'authorization_header_with_value_Bearer_private': 401,
  'authorization_header_with_value_Bearer_private_scoped': 401,
  // Authorization: ' '
  'authorization_header_with_empty_value_private': 401,
  'authorization_header_with_empty_value_private_scoped': 401,
  // Authorization: 'Bearer invalidToken'
  'authorization_header_with_value_Bearer_invalidToken_private': 401,
  'authorization_header_with_value_Bearer_invalidToken_private_scoped': 401,
  // Authorization: 'Bearer invalidToken abc'
  'authorization_header_with_value_Bearer_invalidToken_abc_private': 401,
  'authorization_header_with_value_Bearer_invalidToken_abc_private_scoped': 401,
  // Token with invalid signature
  'token_with_invalid_signature_private': 401,
  'token_with_invalid_signature_private_scoped': 401,
  'token_without_scope_private_scoped': 403,
  'token_with_scope_write:messages_private_scoped': 403,
}

if (process.env.quickstart === 'symfony') {
  expectedErrorCodes['request_without_authorization_header_private'] = 403;
  expectedErrorCodes['request_without_authorization_header_private_scoped'] = 403;
  expectedErrorCodes['authorization_header_with_value_Bearer_private'] = 500;
  expectedErrorCodes['authorization_header_with_value_Bearer_private_scoped'] = 500;
  expectedErrorCodes['authorization_header_with_empty_value_private'] = 403;
  expectedErrorCodes['authorization_header_with_empty_value_private_scoped'] = 403;
  expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_private'] = 500;
  expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_private_scoped'] = 500;
  expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_abc_private'] = 500;
  expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_abc_private_scoped'] = 500;
  expectedErrorCodes['token_with_invalid_signature_private'] = 500;
  expectedErrorCodes['token_with_invalid_signature_private_scoped'] = 500;
}

const getToken = function(clientId, clientSecret) {
  tokenRequestBody = {
    'client_id': clientId,
    'client_secret': clientSecret,
    'audience': process.env.API_IDENTIFIER,
    'grant_type': 'client_credentials'
  }

  return chai.request('https://' + process.env.AUTH0_DOMAIN)
    .post('/oauth/token')
    .set('Content-Type', 'application/json')
    .send(tokenRequestBody)
}

describe('Request without authorization header field', function() {
  it('GET /api/public return 200 OK', function(done) {
    chai.request(apiURL)
    .get('/api/public')
    .end(function(err, res) {
      res.should.have.to.be.json;
      res.should.have.status(200);
      done();
    });
  });

  it('GET /api/private return ' + expectedErrorCodes['request_without_authorization_header_private'] + ' Unauthorized', function(done) {
    chai.request(apiURL)
    .get('/api/private')
    .end(function(err, res) {
      res.should.have.status(expectedErrorCodes['request_without_authorization_header_private']);
      done();
    });
  });

  it('GET /api/private-scoped return ' + expectedErrorCodes['request_without_authorization_header_private_scoped'] + ' Unauthorized', function(done) {
    chai.request(apiURL)
    .get('/api/private-scoped')
    .end(function(err, res) {
      res.should.have.status(expectedErrorCodes['request_without_authorization_header_private_scoped']);
      done();
    });
  });
});

describe('Request with authorization header field', function() {
  context('Authorization header field with value \'Bearer \'', function() {
    it('GET /api/private return ' + expectedErrorCodes['authorization_header_with_value_Bearer_private'] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer ')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['authorization_header_with_value_Bearer_private']);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes['authorization_header_with_value_Bearer_private_scoped'] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer ')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['authorization_header_with_value_Bearer_private_scoped']);
        done();
      });
    });
  });

  context('Authorization header field with value \' \'', function() {
    it('GET /api/private return ' + expectedErrorCodes['authorization_header_with_empty_value_private'] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', ' ')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['authorization_header_with_empty_value_private']);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes['authorization_header_with_empty_value_private_scoped'] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', ' ')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['authorization_header_with_empty_value_private_scoped']);
        done();
      });
    });
  });

  context('Authorization header with invalid token', function() {
    it('GET /api/private return ' + expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_private'] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer invalidToken')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_private']);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_private_scoped'] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer invalidToken')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_private_scoped']);
        done();
      });
    });
  });

  context('Authorization header field with value \'Bearer invalidToken abc\'', function() {
    it('GET /api/private return ' + expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_abc_private'] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer invalidToken abc')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_abc_private']);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_abc_private_scoped'] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer invalidToken abc')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['authorization_header_with_value_Bearer_invalidToken_abc_private_scoped']);
        done();
      });
    });
  });

  context('Token with invalid signature', function() {
    let validToken = null;

    before(async function() {
      let clientId = process.env.AUTH0_CLIENT_ID_1;
      let clientSecret = process.env.AUTH0_CLIENT_SECRET_1;

      const token =  await(getToken(clientId, clientSecret));
      validToken = token.body.access_token;
    });

    it('GET /api/private return ' + expectedErrorCodes['token_with_invalid_signature_private'] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer ' + validToken + 'string')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['token_with_invalid_signature_private']);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes['token_with_invalid_signature_private_scoped'] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer ' + validToken + 'string')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['token_with_invalid_signature_private_scoped']);
        done();
      });
    });
  });

  context('Valid token without any scope', function() {
    let validToken = null;
    
    before(async function() {
      let clientId = process.env.AUTH0_CLIENT_ID_1;
      let clientSecret = process.env.AUTH0_CLIENT_SECRET_1;

      const token =  await(getToken(clientId, clientSecret));
      validToken = token.body.access_token;
    });

    it('GET /api/private return 200 OK', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer ' + validToken)
      .end(function(err, res) {
        res.should.have.to.be.json;
        res.should.have.status(200);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes['token_without_scope_private_scoped'] + ' Insufficent scope', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer ' + validToken)
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['token_without_scope_private_scoped']);
        done();
      });
    });
  });

  context('Valid token with read:messages scope', function() {
    before(async function() {
      let clientId = process.env.AUTH0_CLIENT_ID_2;
      let clientSecret = process.env.AUTH0_CLIENT_SECRET_2;

      const token =  await(getToken(clientId, clientSecret));
      validToken = token.body.access_token;
    });

    it('GET /api/private return 200 OK', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer ' + validToken)
      .end(function(err, res) {
        res.should.have.to.be.json;
        res.should.have.status(200);
        done();
      });
    });

    it('GET /api/private-scoped return 200 OK', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer ' + validToken)
      .end(function(err, res) {
        res.should.have.to.be.json;
        res.should.have.status(200);
        done();
      });
    });
  });

  context('Valid token with write:messages scope', function() {
    before(async function() {
      let clientId = process.env.AUTH0_CLIENT_ID_3;
      let clientSecret = process.env.AUTH0_CLIENT_SECRET_3;

      const token =  await(getToken(clientId, clientSecret));
      validToken = token.body.access_token;
    });

    it('GET /api/private return 200 OK', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer ' + validToken)
      .end(function(err, res) {
        res.should.have.to.be.json;
        res.should.have.status(200);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes['token_with_scope_write:messages_private_scoped'] + ' Insufficent scope', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer ' + validToken)
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes['token_with_scope_write:messages_private_scoped']);
        done();
      });
    });
  });

  context('Valid token with read:messages and write:messages scopes', function() {
    before(async function() {
      let clientId = process.env.AUTH0_CLIENT_ID_4;
      let clientSecret = process.env.AUTH0_CLIENT_SECRET_4;

      const token =  await(getToken(clientId, clientSecret));
      validToken = token.body.access_token;
    });

    it('GET /api/private return 200 OK', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer ' + validToken)
      .end(function(err, res) {
        res.should.have.to.be.json;
        res.should.have.status(200);
        done();
      });
    });

    it('GET /api/private-scoped return 200 OK', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer ' + validToken)
      .end(function(err, res) {
        res.should.have.to.be.json;
        res.should.have.status(200);
        done();
      });
    });
  });
});
