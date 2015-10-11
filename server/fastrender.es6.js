DoubleFastRender = {
  startup : () => {
    FastRender.onAllRoutes(function(path) {
      const fr = this;
      fr.subscribe('currentUser');
    });
  }
};
