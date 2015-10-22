Template.assistantTasksListItem.helpers({
  isSelected() {
    return this.isCurrent ? "selected" : "";
  },
  status() {
    //TODO
    return "offline";
  },
  getLastModified() {
    return moment().valueOf() - this.lastModified;
  },
  getRouteData() {
    return { _id : this._id };
  }
});
