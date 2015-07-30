if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function(){
    describe("tasks", function(){
      beforeEach(function() {
        this.clock = sinon.useFakeTimers();
        Tasks.remove({});
      });

      afterEach(function() {
        this.clock.restore();
        Tasks.remove({});
      });

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

      describe("create", function() {
        it("valid - without schedulerId", function() {
          chai.assert.equal(Tasks.find().count(), 0);
          var taskId = Tasks.create({requestorId: '1', responderId: '2', title: 'title'});
          var expectedDoc = {
            _id: taskId,
            requestorId: '1',
            responderId: '2',
            schedulerId: null,
            title: 'title',
            statuses: {},
            references: [],
            timesheets: {},
            deadline: null,
            createdAt: moment().valueOf(),
            completedAt: null
          };
          chai.assert.deepEqual(Tasks.findOne(taskId, { transform: null }), expectedDoc);
        });

        it("valid - with schedulerId", function() {
          chai.assert.equal(Tasks.find().count(), 0);
          var taskId = Tasks.create({ requestorId: '1', responderId: '2', schedulerId: '3', title: 'title' });
          var expectedDoc = {
            _id: taskId,
            requestorId: '1',
            responderId: '2',
            schedulerId: '3',
            title: 'title',
            statuses: {},
            references: [],
            timesheets: {},
            deadline: null,
            createdAt: moment().valueOf(),
            completedAt: null
          };
          chai.assert.deepEqual(Tasks.findOne(taskId, { transform: null }), expectedDoc);
        });

        it("invalid - missing requestorId", function() {
          chai.assert.throw(function() {
            Tasks.create({ responderId: '2', title: 'title' });
          }, 'Invalid requestorId');
        });

        it("invalid - missing responderId", function() {
          chai.assert.throw(function() {
            Tasks.create({ requestorId: '1', title: 'title' });
          }, 'Invalid responderId');
        });

        it("invalid - missing title", function() {
          chai.assert.throw(function() {
            Tasks.create({ requestorId: '1', responderId: '2' });
          }, 'Invalid title');
        });
      });

      describe("total duration", function() {
        var taskId;
        var userId = "a";
        var userId2 = "b";
        beforeEach(function() {
          taskId = Tasks.create({requestorId: '1', responderId: '2', title: 'title'});
        });

        it("empty", function() {
          chai.assert.equal(Tasks.findOne(taskId).totalDuration(), 0);
        });

        it("single duration, single action", function() {
          this.clock.tick(10);
          var steps = [
            {
              text : "abc",
              durations : [{
                value : 10,
                date : 5
              }]
            }
          ];
          let modifier = {};
          modifier.$set = {};
          modifier.$set["steps"] = steps;
          Tasks.update(taskId, modifier);
          chai.assert.equal(Tasks.findOne(taskId).totalDuration(), 10);
        });

        it("multiple duration, single work", function() {
          this.clock.tick(10);
          var steps = [
            {
              text : "abc",
              durations : [{
                value : 10,
                date : 5
              }, {
                value : 20,
                date : 6
              }]
            }
          ];
          let modifier = {};
          modifier.$set = {};
          modifier.$set["steps"] = steps;
          Tasks.update(taskId, modifier);
          chai.assert.equal(Tasks.findOne(taskId).totalDuration(), 30);
        });

        it("multiple works", function() {
          this.clock.tick(10);
          var steps = [
            {
              text: "abc",
              durations: [{
                value: 10,
                date: 5
              }]
            }, {
              text: "abc",
              durations: [{
                value : 20,
                date : 6
              }]
            }
          ];
          let modifier = {};
          modifier.$set = {};
          modifier.$set["steps"] = steps;
          Tasks.update(taskId, modifier);
          chai.assert.equal(Tasks.findOne(taskId).totalDuration(), 30);
        });
      });
    });
  });
}


