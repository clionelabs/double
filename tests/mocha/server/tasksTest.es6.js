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
            statuses: [],
            references: [],
            timesheets: [],
            deadline: null,
            createdAt: moment().valueOf(),
            completedAt: null
          };
          chai.assert.deepEqual(Tasks.findOne(taskId, {transform: null}), expectedDoc);
        });

        it("valid - with schedulerId", function() {
          chai.assert.equal(Tasks.find().count(), 0);
          var taskId = Tasks.create({requestorId: '1', responderId: '2', schedulerId: '3', title: 'title'});
          var expectedDoc = {
            _id: taskId,
            requestorId: '1',
            responderId: '2',
            schedulerId: '3',
            title: 'title',
            statuses: [],
            references: [],
            timesheets: [],
            deadline: null,
            createdAt: moment().valueOf(),
            completedAt: null
          };
          chai.assert.deepEqual(Tasks.findOne(taskId, {transform: null}), expectedDoc);
        });

        it("invalid - missing requestorId", function() {
          chai.assert.throw(function() {
            Tasks.create({responderId: '2', title: 'title'});
          }, 'Invalid requestorId');
        });

        it("invalid - missing responderId", function() {
          chai.assert.throw(function() {
            Tasks.create({requestorId: '1', title: 'title'});
          }, 'Invalid responderId');
        });

        it("invalid - missing title", function() {
          chai.assert.throw(function() {
            Tasks.create({requestorId: '1', responderId: '2'});
          }, 'Invalid title');
        });
      });

      describe("works", function() {
        var taskId;
        var requestorId = '1';
        var responderId = '2';
        beforeEach(function() {
          taskId = Tasks.create({requestorId: requestorId, responderId: responderId, title: 'title'});
        });

        it("valid start - first work", function() {
          var expectedWork = _.extend({
            startedAt: 0,
            endedAt: null
          });
          chai.assert.deepEqual(Tasks.findOne(taskId).timesheets, []);
          Tasks.startWork(taskId);
          chai.assert.deepEqual(
              _.map(Tasks.findOne(taskId).timesheets,
                  function(timesheet) {
                    return {
                      startedAt : timesheet.startedAt,
                      endedAt : timesheet.endedAt
                    };
                  })
              , [expectedWork]
          );
        });

        it("valid start - previous work completed", function() {
          var previousWork = {
            startedAt: 0,
            endedAt: 10
          };
          Tasks.update(taskId, {$set: {timesheets: [previousWork]}});

          this.clock.tick(20);
          var expectedWork = {
            startedAt: 20,
            endedAt: null
          };
          Tasks.startWork(taskId);

          chai.assert.deepEqual(
              _.map(Tasks.findOne(taskId).timesheets,
                  function(timesheet) {
                    return {
                      startedAt: timesheet.startedAt,
                      endedAt: timesheet.endedAt
                    };
                  })
              , [previousWork, expectedWork]);
        });

        it("invalid start - work already started", function() {
          var previousWork = {
            startedAt: 0,
            endedAt: null
          };
          Tasks.update(taskId, {$set: {timesheets: [previousWork]}});

          chai.assert.throw(function() {
            Tasks.startWork(taskId);
          }, 'previous work has not ended yet');
        });

        it("valid end", function() {
          var previousWork = {
            startedAt: 0,
            endedAt: null
          };
          Tasks.update(taskId, {$set: {timesheets: [previousWork]}});

          this.clock.tick(10);
          Tasks.endWork(taskId);

          var expectedWork = {
            startedAt: 0,
            endedAt: 10
          };
          chai.assert.deepEqual(
              _.map(Tasks.findOne(taskId).timesheets, function(timesheet) {
                return {
                  startedAt : timesheet.startedAt,
                  endedAt: timesheet.endedAt
                };
              }), [expectedWork]);
        });

        it("invalid end", function() {
          chai.assert.throw(function() {
            Tasks.endWork(taskId);
          }, 'work has not started yet');
        });
      });

      describe("total duration", function() {
        var taskId;
        beforeEach(function() {
          taskId = Tasks.create({requestorId: '1', responderId: '2', title: 'title'});
        });

        it("empty", function() {
          chai.assert.equal(Tasks.findOne(taskId).totalDuration(), 0);
        });

        it("in progress work", function() {
          var works = [
            {startedAt: 0, endedAt: null}
          ];
          Tasks.update(taskId, {$set: {timesheets: works}});

          this.clock.tick(10);
          chai.assert.equal(Tasks.findOne(taskId).totalDuration(), 10);
        });

        it("single completed work", function() {
          var works = [
            {startedAt: 0, endedAt: 5}
          ];
          Tasks.update(taskId, {$set: {timesheets: works}});
          chai.assert.equal(Tasks.findOne(taskId).totalDuration(), 5);

          this.clock.tick(1000); // time pass should have no effect
          chai.assert.equal(Tasks.findOne(taskId).totalDuration(), 5);
        });

        it("multiple completed work", function() {
          var works = [
            {startedAt: 0, endedAt: 5},
            {startedAt: 10, endedAt: 100},
          ];
          Tasks.update(taskId, {$set: {timesheets: works}});
          chai.assert.equal(Tasks.findOne(taskId).totalDuration(), 95);

          this.clock.tick(1000); // time pass should have no effect
          chai.assert.equal(Tasks.findOne(taskId).totalDuration(), 95);
        });
      });
      describe("edit work", function() {
        var taskId;
        var requestorId = '1';
        var responderId = '2';
        beforeEach(function() {
          taskId = Tasks.create({requestorId: requestorId, responderId: responderId, title: 'title'});
        });

        it('no existing timesheet', function() {

          chai.assert.throw(function() {
            Tasks.editWork(taskId,'2',0,10);
          }, "timesheet is empty");
        });
        it('one timesheet edit', function() {
          var originalWork = {
            _id : Random.id(),
            startedAt : 10,
            endedAt: 20
          };
          Tasks.update({_id : taskId}, { $push : { timesheets : originalWork}});
          var editWork = {
            startedAt : 20,
            endedAt : 30
          };
          Tasks.editWork(taskId, originalWork._id, editWork.startedAt, editWork.endedAt);
          chai.assert.deepEqual(_.map(Tasks.findOne(taskId).timesheets, function(timesheet){
            return {
              startedAt : timesheet.startedAt,
              endedAt: timesheet.endedAt
            };
          }), [editWork]);
        });
        it('two timesheet edit move to after', function() {
          var originalWorks = [{
            _id : Random.id(),
            startedAt : 10,
            endedAt: 20
          }, {
            _id : Random.id(),
            startedAt : 20,
            endedAt: 30
          }];
          Tasks.update({_id : taskId}, { $pushAll : { timesheets : originalWorks}});
          var editWork = {
            _id : originalWorks[0]._id,
            startedAt : 40,
            endedAt : 50
          };

          var expectedWorks = [{
            startedAt : 20,
            endedAt: 30
          }, {
            startedAt : 40,
            endedAt: 50
          }];
          Tasks.editWork(taskId, editWork._id, editWork.startedAt, editWork.endedAt);
          chai.assert.deepEqual(_.map(Tasks.findOne(taskId).timesheets, function(timesheet){
            return {
              startedAt : timesheet.startedAt,
              endedAt: timesheet.endedAt
            };
          }), expectedWorks);
        });
        it('two timesheet edit move before', function() {
          var originalWorks = [{
            _id : Random.id(),
            startedAt : 10,
            endedAt: 20
          }, {
            _id : Random.id(),
            startedAt : 20,
            endedAt: 30
          }];
          Tasks.update({_id : taskId}, { $pushAll : { timesheets : originalWorks}});
          var editWork = {
            _id : originalWorks[1]._id,
            startedAt : 0,
            endedAt : 10
          };

          var expectedWorks = [{
            startedAt : 0,
            endedAt: 10
          }, {
            startedAt : 10,
            endedAt: 20
          }];
          Tasks.editWork(taskId, editWork._id, editWork.startedAt, editWork.endedAt);
          chai.assert.deepEqual(_.map(Tasks.findOne(taskId).timesheets, function(timesheet){
            return {
              startedAt : timesheet.startedAt,
              endedAt: timesheet.endedAt
            };
          }), expectedWorks);
        });
        it('three timesheet edit move between', function() {
          var originalWorks = [{
            _id : Random.id(),
            startedAt : 10,
            endedAt: 20
          }, {
            _id : Random.id(),
            startedAt : 30,
            endedAt: 40
          },{
            _id : Random.id(),
            startedAt : 40,
            endedAt: 50
          }];
          Tasks.update({_id : taskId}, { $pushAll : { timesheets : originalWorks}});
          var editWork = {
            _id : originalWorks[2]._id,
            startedAt : 20,
            endedAt : 30
          };

          var expectedWorks = [{
            startedAt : 10,
            endedAt: 20
          }, {
            startedAt : 20,
            endedAt: 30
          }, {
            startedAt : 30,
            endedAt: 40
          }];
          Tasks.editWork(taskId, editWork._id, editWork.startedAt, editWork.endedAt);
          chai.assert.deepEqual(_.map(Tasks.findOne(taskId).timesheets, function(timesheet){
            return {
              startedAt : timesheet.startedAt,
              endedAt: timesheet.endedAt
            };
          }), expectedWorks);
        });
      });
    });
  });
}


