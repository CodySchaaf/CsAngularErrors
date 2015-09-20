module cs.errors {
  cs.csErrors.directive("csErrorsSubmit", (): ng.IDirective => {
    return {
      restrict:   "A",
      scope:      false,
      require:    "^form",
      priority:   1, //ensure it is run before ng-click with a 0 priority
      controller: ($scope: Scope, $element: JQuery): void => {
        $element.on("click", (event: JQueryEventObject) => {
          if ($scope.attrs.csErrorsSubmit !== $scope.formCtrl.$name) {
            throw "Provided name (" + $scope.attrs.csErrorsSubmit + ") of form does not match:" + $scope.formCtrl.$name;
          }
          if ($scope.formCtrl.$invalid) {
            $scope.$emit(errors.Link.REVEAL_ERRORS_EVENT + $scope.formCtrl.$name);
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        })
      },
      link:       (scope: Scope, element: ng.IAugmentedJQuery, attrs: Attr, formCtrl: FormCtrl): void => {
        scope.formCtrl = formCtrl;
        scope.attrs    = attrs;
      }
    }
  });

  interface Attr extends ng.IAttributes {
    csErrorsSubmit: string;
  }

  interface FormCtrl extends ng.IFormController {
    $name: string
  }

  interface Scope extends ng.IScope {
    formCtrl: FormCtrl;
    attrs:    Attr;
  }
}
