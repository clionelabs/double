if (!(typeof MochaWeb === 'undefined')) {
  MochaWeb.testOnly(function() {
    describe("taskSchedulers", function() {
      var timeToString = function(time) {
        var str = time.format("YYYYMMDD") + "T" + time.format("HHmmss") + "Z";
        return str;
      };

      beforeEach(function() {
        this.clock = sinon.useFakeTimers();
        Tasks.remove({});
        TaskSchedulers.remove({});
      });

      afterEach(function() {
        this.clock.restore();
        Tasks.remove({});
        TaskSchedulers.remove({});
      });

      describe("create", function() {
        it("valid", function() {
          chai.assert.equal(Tasks.find().count(), 0);
          chai.assert.equal(TaskSchedulers.find().count(), 0);

          // repeated every day starting from now
          var taskSchedulerId = TaskSchedulers.create({requestorId: '1', responderId: '2', title: 'title', ruleString: 'FREQ=DAILY'});

          // validate created successfully
          chai.assert.equal(Tasks.find().count(), 1);
          chai.assert.equal(TaskSchedulers.find().count(), 1);

          // validate the content of the generated taskt
          var task = Tasks.findOne({transform: null});
          chai.assert.equal(task.requestorId, '1');
          chai.assert.equal(task.responderId, '2');
          chai.assert.equal(task.title, 'title');
          chai.assert.equal(task.schedulerId, taskSchedulerId);

          var expectedDoc = {
            _id: taskSchedulerId,
            requestorId: '1',
            responderId: '2',
            title: 'title',
            ruleString: 'FREQ=DAILY',
            instances: [{at: 0, taskId: task._id}],
            createdAt: moment().valueOf()
          };
          chai.assert.deepEqual(TaskSchedulers.findOne(taskSchedulerId, {transform: null}), expectedDoc);
        });

        it("invalid - missing requestorId", function() {
          chai.assert.throw(function() {
            TaskSchedulers.create({responderId: '2', title: 'title', ruleString: 'FREQ=DAILY'});
          }, 'Invalid requestorId');
        });

        it("invalid - missing responderId", function() {
          chai.assert.throw(function() {
            TaskSchedulers.create({requestorId: '1', title: 'title', ruleString: 'FREQ=DAILY'});
          }, 'Invalid responderId');
        });

        it("invalid - missing title", function() {
          chai.assert.throw(function() {
            TaskSchedulers.create({requestorId: '1', responderId: '2', ruleString: 'FREQ=DAILY'});
          }, 'Invalid title');
        });

        it("invalid - missing rule", function() {
          chai.assert.throw(function() {
            TaskSchedulers.create({requestorId: '1', responderId: '2', title: 'title'});
          }, 'Invalid rule');
        });
      });

      describe("nextAt", function() {
        it("has next - first one", function() {
          var startTime = moment.utc();
          var startTimeString = timeToString(startTime);

          var schedulerId = TaskSchedulers.create({requestorId: '1', responderId: '2', title: 'title', ruleString: 'FREQ=HOURLY;DTSTART='+startTimeString});
          var scheduler = TaskSchedulers.findOne(schedulerId);
          chai.assert.equal(scheduler.nextAt(), startTime.valueOf());
        });

        it("has next - second one", function() {
          var startTime = moment.utc();
          var startTimeString = timeToString(startTime);

          var schedulerId = TaskSchedulers.create({requestorId: '1', responderId: '2', title: 'title', ruleString: 'FREQ=HOURLY;DTSTART='+startTimeString});
          var scheduler = TaskSchedulers.findOne(schedulerId);
          clock.tick(1000); // 1 second passed, so the next one would be an hour later
          chai.assert.equal(scheduler.nextAt(), startTime.valueOf() + 3600 * 1000);
        });

        it("has no next", function() {
          var startTime = moment.utc();
          var endTime = moment(startTime).add(10, 's');
          var startTimeString = timeToString(startTime);
          var endTimeString = timeToString(endTime);

          var schedulerId = TaskSchedulers.create({requestorId: '1', responderId: '2', title: 'title', ruleString: 'FREQ=HOURLY;DTSTART='+startTimeString+';UNTIL='+endTimeString});
          var scheduler = TaskSchedulers.findOne(schedulerId);
          clock.tick(11 * 1000); // 11 second passed, so schedule has ended
          chai.assert.equal(scheduler.nextAt(), null);
        });
      });

      describe("nextInstanceId", function() {
        it("found", function() {
          var startTime = moment.utc();
          var startTimeString = timeToString(startTime);
          var schedulerId = TaskSchedulers.create({requestorId: '1', responderId: '2', title: 'title', ruleString: 'FREQ=HOURLY;DTSTART='+startTimeString});
          var scheduler = TaskSchedulers.findOne(schedulerId);
          chai.assert.equal(scheduler.nextInstanceId(), Tasks.findOne()._id);
        });

        it("not found", function() {
          var startTime = moment.utc();
          var startTimeString = timeToString(startTime);
          var schedulerId = TaskSchedulers.create({requestorId: '1', responderId: '2', title: 'title', ruleString: 'FREQ=HOURLY;DTSTART='+startTimeString});
          var scheduler = TaskSchedulers.findOne(schedulerId);
          clock.tick(1); // 1 second passed, and next instance has not been generated yet.
          chai.assert.equal(scheduler.nextInstanceId(), null);
        });
      });

      describe("generateNextIfNotExisted", function() {
        it("not already existed", function() {
          var startTime = moment.utc();
          var startTimeString = timeToString(startTime);
          var schedulerId = TaskSchedulers.create({requestorId: '1', responderId: '2', title: 'title', ruleString: 'FREQ=HOURLY;DTSTART='+startTimeString});
          var scheduler = TaskSchedulers.findOne(schedulerId);
          chai.assert.equal(scheduler.instances.length, 1);
          clock.tick(1);
          scheduler.generateNextIfNotExisted();

          scheduler = TaskSchedulers.findOne(schedulerId);
          chai.assert.equal(scheduler.instances.length, 2);
        });

        it("already existed", function() {
          var startTime = moment.utc();
          var startTimeString = timeToString(startTime);
          var schedulerId = TaskSchedulers.create({requestorId: '1', responderId: '2', title: 'title', ruleString: 'FREQ=HOURLY;DTSTART='+startTimeString});
          var scheduler = TaskSchedulers.findOne(schedulerId);
          chai.assert.equal(scheduler.instances.length, 1);
          scheduler.generateNextIfNotExisted(); // the first instance is already been generated upon create, so it won't do anything

          scheduler = TaskSchedulers.findOne(schedulerId);
          chai.assert.equal(scheduler.instances.length, 1);
        });

        it("no next", function() {
          var startTime = moment.utc();
          var endTime = moment(startTime).add(10, 's');
          var startTimeString = timeToString(startTime);
          var endTimeString = timeToString(endTime);

          var schedulerId = TaskSchedulers.create({requestorId: '1', responderId: '2', title: 'title', ruleString: 'FREQ=HOURLY;DTSTART='+startTimeString+';UNTIL='+endTimeString});
          var scheduler = TaskSchedulers.findOne(schedulerId);
          chai.assert.equal(scheduler.instances.length, 1);

          clock.tick(11 * 1000); // 11 second passed, so schedule has ended
          scheduler.generateNextIfNotExisted(); // the first instance is already been generated upon create, so it won't do anything

          scheduler = TaskSchedulers.findOne(schedulerId);
          chai.assert.equal(scheduler.instances.length, 1);
        });
      });
    });
  });
}
