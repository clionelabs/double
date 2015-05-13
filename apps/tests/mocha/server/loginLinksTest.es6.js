if (!(typeof MochaWeb === 'undefined')) {
  MochaWeb.testOnly(function() {
    describe("loginLinks", function() {
      var user = {
        _id: '1',
        emails: [{address: 'test@test.com'}]
      }
      beforeEach(function() {
        this.clock = sinon.useFakeTimers();
        LoginLinks.remove({});
      });

      afterEach(function() {
        this.clock.restore();
        LoginLinks.remove({});
      });

      describe("create", function() {
        it("valid", function() {
          chai.assert.equal(LoginLinks.find().count(), 0);
          var id = LoginLinks.create(user);

          var doc = LoginLinks.findOne(id, {transform: null});
          var secret = doc.secret;
          chai.assert.equal(secret.length, 43);

          var expectedDoc = {
            _id: id,
            userId: '1',
            email: 'test@test.com',
            secret: secret,
            accessedAt: null,
            createdAt: 0
          }
          chai.assert.deepEqual(doc, expectedDoc);
        });
      });

      describe("loginHandler", function() {
        it("successful", function() {
          var id = LoginLinks.create(user);
          var secret = LoginLinks.findOne(id).secret;
          this.clock.tick(10);
          var result = LoginLinks.loginHandler({secret: secret});
          chai.assert.deepEqual(result, {userId: '1'});

          var doc = LoginLinks.findOne(id);
          chai.assert.equal(doc.isValid(), false);
          chai.assert.equal(doc.accessedAt, 10);
        });

        it("fail - secret not found", function() {
          var id = LoginLinks.create(user);
          chai.assert.throw(function() {
            var result = LoginLinks.loginHandler({secret: 'wrong'});
          }, 'secret not found');
        });

        it("fail - secret accessed before", function() {
          var id = LoginLinks.create(user);
          var secret = LoginLinks.findOne(id).secret;
          var result1 = LoginLinks.loginHandler({secret: secret});
          chai.assert.throw(function() {
            var result2 = LoginLinks.loginHandler({secret: secret});
          }, 'invalid secret');
        });
      });
    });
  });
}
