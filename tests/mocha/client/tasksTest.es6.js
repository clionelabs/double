if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function(){
    describe("tasks", function(){
      beforeEach(function() {
        this.clock = sinon.useFakeTimers();
      }),

      afterEach(function() {
        this.clock.restore();
      }),

      describe("create", function() {
        it("valid", function() {
          var mock = sinon.mock(Tasks);
          var expectedDoc = {
            requestorId: '1',
            responderId: '2',
            title: 'title',
            statuses: [],
            references: [],
            timesheets: [],
            deadline: null,
            createdAt: moment().valueOf(),
            completedAt: null
          };
          mock.expects("insert").once().withArgs(expectedDoc);
          Tasks.create({requestorId: '1', responderId: '2', title: 'title'});
          mock.verify();
          mock.restore();
        });
      });

      describe("works", function() {
        it("valid start - empty", function() {
          var mock = sinon.mock(Tasks);
          var newWork = {
            startedAt: moment().valueOf(),
            endedAt: null
          }
          mock.expects("update").once().withArgs("task1", {$push: {timesheets: newWork}});
          Tasks.startWork("task1");
          mock.verify();
          mock.restore();
        });

        it("valid start - previous completed", function() {
          var findOneStub = sinon.stub(Tasks, 'findOne', function() {
            return {timesheets: [{startedAt: 1, endedAt: 2}]}
          });
          var mock = sinon.mock(Tasks);
          var newWork = {
            startedAt: moment().valueOf(),
            endedAt: null
          }
          mock.expects("update").once().withArgs("task1", {$push: {timesheets: newWork}});
          Tasks.startWork("task1");
          mock.verify();
          mock.restore();
          Tasks.findOne.restore();
        });

        it("invalid start - work already started", function() {
          var findOneStub = sinon.stub(Tasks, 'findOne', function() {
            return {timesheets: [{startedAt: 1, endedAt: null}]}
          });
          chai.assert.throw(function() {
            Tasks.startWork("task1");
          }, 'previous work has not ended yet');
          Tasks.findOne.restore();
        });

        it("valid end", function() {
          var findOneStub = sinon.stub(Tasks, 'findOne', function() {
            return {timesheets: [{startedAt: 1, endedAt: null}]}
          });
          var mock = sinon.mock(Tasks);
          var newWork = {
            startedAt: 1,
            endedAt: moment().valueOf()
          }
          mock.expects("update").withArgs("task1", {$pop: {timesheets: 1}});
          mock.expects("update").withArgs("task1", {$push: {timesheets: newWork}});
          Tasks.endWork("task1");
          mock.verify();
          mock.restore();
          Tasks.findOne.restore();
        });
      });
    });
  });
}

