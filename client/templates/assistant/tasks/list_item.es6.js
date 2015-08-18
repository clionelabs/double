Template.assistantTasksListItem.helpers({
  isSelected() {
    return this.isCurrent ? "selected" : "";
  },
  status() {
    //TODO
    return "offline";
  },
  getLastModified() {
    return moment().subtract(moment(this.lastModified));
  },
  getRouteData() {
    return { _id : this._id };
  }
});
