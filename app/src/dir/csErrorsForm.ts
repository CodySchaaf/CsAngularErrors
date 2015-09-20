module cs.errors {
  cs.csErrors.directive("csErrorsForm", (): ng.IDirective => {
    return {
      restrict: "A",
      scope:    false,
      link:     (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: Attrs): void => {
        element.addClass(cs.errors.Link.HIDE_ERRORS_CLASS);
        scope.$on(errors.Link.REVEAL_ERRORS_EVENT + attrs.name, (): void => {
          scope.$broadcast(errors.Link.REVEAL_ERRORS_EVENT); //no longer need form name namespace
          element.addClass(cs.errors.Link.REVEAL_ERRORS_CLASS).removeClass(cs.errors.Link.HIDE_ERRORS_CLASS);
          if (attrs.noScroll !== undefined) {return;}

          var firstErroredElement: JQuery = element.find(".ng-invalid").first();
          if (firstErroredElement.length !== 0) {
            angular.element('html, body').animate({
              scrollTop: firstErroredElement.offset().top - 100 //100 px padding on scroll to top
            }, 600);
          }
        });
      }
    }
  });

  interface Attrs extends ng.IAttributes {
    name: string;
    noScroll?: boolean;
  }
}
