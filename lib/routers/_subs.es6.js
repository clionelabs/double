RouterSubs = new SubsManager();
/**
 * a method only for route for one invoice, as iron router changed `this`
 */
_isStatic = function() {
  const isStatic = (this.params.query.isStatic && this.params.query.isStatic === 'true');
  return isStatic;
};

