if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function(){
    describe("tasks", function(){
      beforeEach(function() {
      }),

      afterEach(function() {
      }),

      describe("permissions insert", function() {
        it("valid requestor", function(){
          var doc = {requestorId: '1'};
          chai.assert.equal(TasksPermission.insert('1', doc), true);
        });

        it("valid responder", function() {
          var doc = {responderId: '1'};
          chai.assert.equal(TasksPermission.insert('1', doc), true);
        });

        it("invalid", function() {
          var doc = {responderId: '1', responderId: '2'};
          chai.assert.equal(TasksPermission.insert('3', doc), false);
        });
      });

      describe("permissions update", function() {
        it("valid requestor", function(){
          var doc = {requestorId: '1'};
          chai.assert.equal(TasksPermission.update('1', doc), true);
        });

        it("valid responder", function() {
          var doc = {responderId: '1'};
          chai.assert.equal(TasksPermission.update('1', doc), true);
        });

        it("invalid", function() {
          var doc = {responderId: '1', responderId: '2'};
          chai.assert.equal(TasksPermission.insert('3', doc), false);
        });
      });
    });
  });
}


