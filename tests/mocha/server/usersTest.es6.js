if (Meteor.isServer) {
  if (!(typeof MochaWeb === 'undefined')) {
    MochaWeb.testOnly(function () {
      describe("users current task", function () {
        let userId;
        let taskId = 1;
        beforeEach(function () {
          userId = Meteor.users.insert({profile : {}});
          this.clock = sinon.useFakeTimers();
          this.clock.tick(1);
        });

        it("should start current work", function () {
          Assistants.startTask(userId, taskId);
          console.log("users", Meteor.users.findOne(userId));
          chai.assert.equal(Meteor.users.findOne(userId).profile.currentTask.taskId, taskId);
          chai.assert.equal(Meteor.users.findOne(userId).profile.currentTask.status, Assistants.TaskStatus.Started);
          chai.assert.equal(Meteor.users.findOne(userId).profile.currentTask.startedAt, 1);
        });
        it("should end current work", function () {
          Assistants.startTask(userId, taskId);
          this.clock.tick(10);
          Assistants.endTask(userId, taskId);
          chai.assert.equal(Meteor.users.findOne(userId).profile.currentTask.taskId, taskId);
          chai.assert.equal(Meteor.users.findOne(userId).profile.currentTask.status, Assistants.TaskStatus.Stopped);
          chai.assert.equal(Meteor.users.findOne(userId).profile.currentTask.startedAt, 1);
          chai.assert.equal(Meteor.users.findOne(userId).profile.currentTask.endedAt, 11);
        });
        it("should not start if there is current work", function () {
          Assistants.startTask(userId, taskId);
          this.clock.tick(10);
          chai.assert.throw(function() {
            Assistants.startTask(userId, taskId);
          }, Meteor.Error, 'There is running or stopped task');
        });
        it("should not end if there is no current work", function () {
          Meteor.users.update(userId, { $unset : { currentTask : "" }});
          chai.assert.throw(function() {
            Assistants.endTask(userId, taskId);
          }, Meteor.Error, 'There is no running task');
        });
        it("should bank stopped work", function () {
          let oriTs = Meteor.users.findOne(userId).profile.lastBankTaskTimestamp;
          Assistants.startTask(userId, taskId);
          this.clock.tick(10);
          Assistants.endTask(userId, taskId);
          this.clock.tick(10);
          console.log('user', Meteor.users.findOne(userId));
          Assistants.bankTask(userId, taskId);
          chai.assert(!Meteor.users.findOne(userId).profile.currentTask);
          chai.assert.notEqual(Meteor.users.findOne(userId).profile.lastBankTasksTimestamp[taskId], oriTs);
        });
        it("should not bank started work", function () {
          Assistants.startTask(userId, taskId);
          this.clock.tick(10);
          chai.assert.throw(function() {
            Assistants.bankTask(userId, taskId);
          }, Meteor.Error, 'There is no stopped task');
        });
        it("should not bank no work", function () {
          chai.assert.throw(function() {
            Assistants.bankTask(userId, taskId);
          }, Meteor.Error, 'There is no stopped task');
        });

        afterEach(function () {
          Meteor.users.remove({ _id: userId });
          this.clock.restore();
        });
      });
    });
  }
}
