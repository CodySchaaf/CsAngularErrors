module cs.errors {
  cs.csErrors.directive("csErrorsHelper", ($timeout: ng.ITimeoutService): ng.IDirective => {
    return {
      restrict:   "A",
      scope:      false,
      priority:   100, //ensure it runs after average link functions (post link runs in opposite priority)
      require:    "^csErrors",
      link:       (scope: ng.IScope, elem: JQuery, attrs: ng.IAttributes, csErrorsCtrl: cs.errors.Ctrl): void => {
        if (elem.closest("[cs-errors]").length === 0) {
          throw "Needs to be accompanied by cs-errors directive"
        }
        $timeout(() => csErrorsCtrl.setDoneRendering("csErrorsHelper:Done"));
      }
    }
  });
}
