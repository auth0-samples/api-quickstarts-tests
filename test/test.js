const chai = require('chai');
const chaiHttp = require('chai-http');
const should = require('chai').should();
const async = require('asyncawait/async');
const await = require('asyncawait/await');

require('dotenv').config();

chai.use(chaiHttp);

if (!process.env.AUTH0_DOMAIN || !process.env.API_IDENTIFIER || !process.env.API_URL
    || !process.env.AUTH0_CLIENT_ID_1 || !process.env.AUTH0_CLIENT_SECRET_1
    || !process.env.AUTH0_CLIENT_ID_2 || !process.env.AUTH0_CLIENT_SECRET_2
    || !process.env.AUTH0_CLIENT_ID_3 || !process.env.AUTH0_CLIENT_SECRET_3
    || !process.env.AUTH0_CLIENT_ID_4 || !process.env.AUTH0_CLIENT_SECRET_4) {
  throw 'Make sure you have set the variables in your .env file'
}

const apiURL = process.env.API_URL;

switch(process.env.quickstart) {
  case 'symfony':
    // Error codes returned by Symfony API quickstart
    var expectedErrorCodes = [403, 403, 500, 500, 403, 403, 500, 500, 500, 500, 500, 500, 403, 403];
    break;
  case 'express':
    // Error codes returned by Node.js Express API quickstart
    var expectedErrorCodes = [401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 401];
    break;
  default:
    // Standard error codes returned by API quickstarts
    var expectedErrorCodes = [401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 403, 403];
    break;
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

  it('GET /api/private return ' + expectedErrorCodes[0] + ' Unauthorized', function(done) {
    chai.request(apiURL)
    .get('/api/private')
    .end(function(err, res) {
      res.should.have.status(expectedErrorCodes[0]);
      done();
    });
  });

  it('GET /api/private-scoped return ' + expectedErrorCodes[1] + ' Unauthorized', function(done) {
    chai.request(apiURL)
    .get('/api/private-scoped')
    .end(function(err, res) {
      res.should.have.status(expectedErrorCodes[1]);
      done();
    });
  });
});

describe('Request with authorization header field', function() {
  context('Authorization header field with value \'Bearer \'', function() {
    it('GET /api/private return ' + expectedErrorCodes[2] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer ')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[2]);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes[3] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer ')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[3]);
        done();
      });
    });
  });

  context('Authorization header field with value \' \'', function() {
    it('GET /api/private return ' + expectedErrorCodes[4] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', ' ')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[4]);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes[5] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', ' ')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[5]);
        done();
      });
    });
  });

  context('Authorization header with invalid token', function() {
    it('GET /api/private return ' + expectedErrorCodes[6] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer invalidToken')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[6]);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes[7] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer invalidToken')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[7]);
        done();
      });
    });
  });

  context('Authorization header field with value \'Bearer invalidToken abc\'', function() {
    it('GET /api/private return ' + expectedErrorCodes[8] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer invalidToken abc')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[8]);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes[9] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer invalidToken abc')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[9]);
        done();
      });
    });
  });

  context('Token with invalid signature', function() {
    let validToken = null;

    before(async(function() {
      let clientId = process.env.AUTH0_CLIENT_ID_1;
      let clientSecret = process.env.AUTH0_CLIENT_SECRET_1;

      const token =  await(getToken(clientId, clientSecret));
      validToken = token.body.access_token;
    }));

    it('GET /api/private return ' + expectedErrorCodes[10] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private')
      .set('Authorization', 'Bearer ' + validToken + 'string')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[10]);
        done();
      });
    });

    it('GET /api/private-scoped return ' + expectedErrorCodes[11] + ' Unauthorized', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer ' + validToken + 'string')
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[11]);
        done();
      });
    });
  });

  context('Valid token without any scope', function() {
    let validToken = null;
    
    before(async(function() {
      let clientId = process.env.AUTH0_CLIENT_ID_1;
      let clientSecret = process.env.AUTH0_CLIENT_SECRET_1;

      const token =  await(getToken(clientId, clientSecret));
      validToken = token.body.access_token;
    }));

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

    it('GET /api/private-scoped return ' + expectedErrorCodes[12] + ' Insufficent scope', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer ' + validToken)
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[12]);
        done();
      });
    });
  });

  context('Valid token with read:messages scope', function() {
    before(async(function() {
      let clientId = process.env.AUTH0_CLIENT_ID_2;
      let clientSecret = process.env.AUTH0_CLIENT_SECRET_2;

      const token =  await(getToken(clientId, clientSecret));
      validToken = token.body.access_token;
    }));

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
    before(async(function() {
      let clientId = process.env.AUTH0_CLIENT_ID_3;
      let clientSecret = process.env.AUTH0_CLIENT_SECRET_3;

      const token =  await(getToken(clientId, clientSecret));
      validToken = token.body.access_token;
    }));

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

    it('GET /api/private-scoped return ' + expectedErrorCodes[13] + ' Insufficent scope', function(done) {
      chai.request(apiURL)
      .get('/api/private-scoped')
      .set('Authorization', 'Bearer ' + validToken)
      .end(function(err, res) {
        res.should.have.status(expectedErrorCodes[13]);
        done();
      });
    });
  });

  context('Valid token with read:messages and write:messages scopes', function() {
    before(async(function() {
      let clientId = process.env.AUTH0_CLIENT_ID_4;
      let clientSecret = process.env.AUTH0_CLIENT_SECRET_4;

      const token =  await(getToken(clientId, clientSecret));
      validToken = token.body.access_token;
    }));

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
