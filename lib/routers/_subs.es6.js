RouterSubs = new SubsManager();
/**
 * a method only for route for one invoice, as iron router changed `this`
 */
_isStatic = (router) => {
  return (
    router &&
    router.params &&
    router.params.query &&
    router.params.query.isStatic &&
    router.params.query.isStatic === 'true') || false;
};

