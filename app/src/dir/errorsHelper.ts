module cs.errors {
  cs.csErrors.directive("showErrorsHelper", ($timeout: ng.ITimeoutService): ng.IDirective => {
    return {
      restrict:   "A",
      scope:      false,
      priority:   100, //ensure it runs after average link functions (post link runs in opposite priority)
      require:    "^showErrors",
      link:       (scope: ng.IScope, elem: JQuery, attrs: ng.IAttributes, showErrorsCtrl: cs.errors.Ctrl): void => {
        if (elem.closest("[show-errors]").length === 0) {
          throw "Needs to be accompanied by show-errors directive"
        }
        $timeout(() => showErrorsCtrl.setDoneRendering("showErrorsHelper:Done"));
      }
    }
  });
}
