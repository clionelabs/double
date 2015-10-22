Template.assistantTasksListItem.helpers({
  isSelected() {
    return this.isCurrent ? "selected" : "";
  },
  getLastModified() {
    return this.lastModified - moment().valueOf();
  },
  getCompleted() {
    return this.completedAt - moment().valueOf();
  },
  getRouteData() {
    return { _id : this._id };
  }
});
