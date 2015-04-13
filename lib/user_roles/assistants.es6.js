class Assistants {
  constructor() {
    _.extend(this, Requesters.prototype);
  }
  getNameWithInitial() {
    return this.profile.firstName + " " + this.profile.lastName[0] + ".";
  }
}

