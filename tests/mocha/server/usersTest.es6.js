if (Meteor.isServer) {
  if (!(typeof MochaWeb === 'undefined')) {
    MochaWeb.testOnly(function () {
      describe("users current task", function () {
        let userId;
        let taskId = 1;
        beforeEach(function () {
          userId = Meteor.users.insert({});
          this.clock = sinon.useFakeTimers();
          this.clock.tick(1);
        });

        it("should start current work", function () {
          Customers.startTask(userId, taskId);
          chai.assert.equal(Meteor.users.findOne(userId).currentTask.taskId, taskId);
          chai.assert.equal(Meteor.users.findOne(userId).currentTask.status, Customers.TaskStatus.Started);
          chai.assert.equal(Meteor.users.findOne(userId).currentTask.startedAt, 1);
        });
        it("should end current work", function () {
          Customers.startTask(userId, taskId);
          this.clock.tick(10);
          Customers.endTask(userId, taskId);
          chai.assert.equal(Meteor.users.findOne(userId).currentTask.taskId, taskId);
          chai.assert.equal(Meteor.users.findOne(userId).currentTask.status, Customers.TaskStatus.Stopped);
          chai.assert.equal(Meteor.users.findOne(userId).currentTask.startedAt, 1);
          chai.assert.equal(Meteor.users.findOne(userId).currentTask.endedAt, 11);
        });
        it("should not start if there is current work", function () {
          Customers.startTask(userId, taskId);
          this.clock.tick(10);
          chai.assert.throw(function() {
            Customers.startTask(userId, taskId);
          }, Meteor.Error, 'There is running or stopped task');
        });
        it("should not end if there is no current work", function () {
          Meteor.users.update(userId, { $unset : { currentTask : "" }});
          chai.assert.throw(function() {
            Customers.endTask(userId, taskId);
          }, Meteor.Error, 'There is no running task');
        });
        it("should bank stopped work", function () {
          Customers.startTask(userId, taskId);
          this.clock.tick(10);
          Customers.endTask(userId, taskId);
          this.clock.tick(10);
          console.log('user', Meteor.users.findOne(userId));
          Customers.bankTask(userId, taskId);
          chai.assert(!Meteor.users.findOne(userId).currentTask);
        });
        it("should not bank started work", function () {
          Customers.startTask(userId, taskId);
          this.clock.tick(10);
          chai.assert.throw(function() {
            Customers.bankTask(userId, taskId);
          }, Meteor.Error, 'There is no stopped task');
        });
        it("should not bank no work", function () {
          chai.assert.throw(function() {
            Customers.bankTask(userId, taskId);
          }, Meteor.Error, 'There is no stopped task');
        });

        afterEach(function () {
          Meteor.users.remove({_id: userId});
          this.clock.restore();
        });
      });
    });
  }
}
