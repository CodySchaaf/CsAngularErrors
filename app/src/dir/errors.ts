module cs.errors {

  cs.csErrors.directive("csErrors", (): ng.IDirective => {
    return {
      restrict:   "A",
      require:    ["^^form","csErrors"],
      scope:      false,
      controller: Ctrl,
      link:       (scope: Scope, elem: ng.IAugmentedJQuery, attrs: Attrs, Ctrls: any[]): Link => {
        if (!elem.hasClass("form-group")) {
          throw "errors element does not have the 'form-group' class";
        }
        return new Link(scope, elem, attrs, Ctrls[0], Ctrls[1]);
      }
    }
  });

  export class Ctrl {
    public static DONE_RENDERING_PREFIX: string = "errorsHelperDoneRendering";

    private static nonce: number = 1;

    public uniqueId: number;

    constructor(private $scope: Scope) {
      this.uniqueId = Ctrl.nonce++;
    }

    public setDoneRendering(str: string) {
      this.$scope[Ctrl.DONE_RENDERING_PREFIX + this.uniqueId] = true;
    }
  }

  export class Link {
    public static /* final */ REVEAL_ERRORS_EVENT: string = "RevealErrors:";
    public static /* final */ REVEAL_ERRORS_CLASS: string = "reveal-errors";
    public static /* final */ HIDE_ERRORS_CLASS:   string = "hide-errors";

    constructor(
      private scope:          Scope,
      private element:        ng.IAugmentedJQuery,
      private attrs:          Attrs,
      private formCtrl:       ng.IFormController,
      private showErrorsCtrl: Ctrl
    ) {
      if (!scope.thisForm) {
        scope.thisForm = formCtrl;
      }
      if (attrs.showErrors && scope.$eval(attrs.showErrors)["needsRenderCheck"]) {
        var rendered: boolean = false;
        scope.$watch(Ctrl.DONE_RENDERING_PREFIX + showErrorsCtrl.uniqueId, (newValue: boolean): void => {
          if (newValue && !rendered) {
            rendered = true;
            this.initialize();
          }
        });
      } else {
        this.initialize();
      }
    }

    private initialize(): void {
      var blurred:   boolean             = false;
      var inputEl:   Element             = this.element[0].querySelector("[name]");
      var inputNgEl: ng.IAugmentedJQuery = angular.element(inputEl);
      var inputName: string              = inputNgEl.attr("name");
      if (!inputName) {
        throw "show-errors element has no child input elements with a 'name' attribute";
      }

      if (this.attrs.showErrors && this.scope.$eval(this.attrs.showErrors)["multiInput"]) {
        this.element.on("focusout", "input, [dropdown-menu]", (event: JQueryEventObject): void => { //http://api.jquery.com/on/#additional-notes blur doesnt bubble but focusout does
          angular.element(event.currentTarget).addClass(errors.Link.REVEAL_ERRORS_CLASS);
          var elName: string = (<HTMLElement>event.currentTarget).attributes["name"].value;
          if (
            this.formCtrl[inputName][elName] &&
            this.formCtrl[inputName][elName].$invalid
          ) {
            this.toggleClasses();
          }
        });
      }

      inputNgEl.on("blur", (): void => {
        blurred = true;
        this.toggleClasses();
      });

      this.scope.$on(Link.REVEAL_ERRORS_EVENT, (): void => {
        this.toggleClasses();
      });
    }

    private toggleClasses(): void {
      this.element.addClass(Link.REVEAL_ERRORS_CLASS);
    }
  }

  export interface Attrs extends ng.IAttributes {
    showErrors: string;
  }

  export interface Scope extends ng.IScope {
    thisForm: ng.IFormController;
    doneRendering: boolean;
  }
}
