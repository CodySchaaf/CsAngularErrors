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
      private csErrorsCtrl: Ctrl
    ) {
      if (!scope.thisForm) {
        scope.thisForm = formCtrl;
      }
      if (attrs.csErrors && scope.$eval(attrs.csErrors)["needsRenderCheck"]) {
        /**
         * needsRenderCheck is used when a custom directive needs to render before the named element would be visible
         *
         * <div class="form-group" cs-errors="{ needsRenderCheck: true }">
         *   <div dropdown-menu
         *        options="someOptions"
         *        dropdown-menu-required="true" //to be fed to inner ng-required
         *        dropdown-menu-name="dropdownForm" //adds name to inner ng-form that needs render check
         *        cs-errors-helper></div>
         *   <div ng-messages="outerForm.dropdownForm.$error"> //notice matching dropdown form from what is passed in to ng-form
         *      <p class="text-danger" ng-message="required">Please Select Something.</p>
         *   </div>
         *  </div>
         */
        var rendered: boolean = false;
        scope.$watch(Ctrl.DONE_RENDERING_PREFIX + csErrorsCtrl.uniqueId, (newValue: boolean): void => {
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
      var inputEl:   ng.IAugmentedJQuery = this.element.find("[name]");
      var inputName: string              = inputEl.attr("name");
      if (!inputName) {throw "cs-errors element has no child input elements with a 'name' attribute";}

      if (this.attrs.csErrors && this.scope.$eval(this.attrs.csErrors)["multiInput"]) {
        // this can be used for custom directives like a dropdown-menu with a tab index, where the focused element might not be an input
        // it can also be used if the named element is an ng-form that is tied to a single ng-model that multiple inputs feed into, this would then bind a focusout event to the input with data-cs-errors-on-blur that should control the error reveal (likely the last one)
        // Since it is using focusout the child gets the [data-cs-errors-on-blur] attribute and the parent this.element will receive the event
        this.element.on("focusout", "[data-cs-errors-on-blur]", (event: JQueryEventObject): void => { //http://api.jquery.com/on/#additional-notes blur doesnt bubble but focusout does
          angular.element(event.currentTarget).addClass(errors.Link.REVEAL_ERRORS_CLASS);
          var elName: string = (<HTMLElement>event.currentTarget).attributes["name"].value;
          if (this.formCtrl[inputName][elName] && this.formCtrl[inputName][elName].$invalid) {
            this.toggleClasses();
          }
        });
      }
      inputEl.on("blur", this.toggleClasses.bind(this));
      this.scope.$on(Link.REVEAL_ERRORS_EVENT, this.toggleClasses.bind(this));
    }

    private toggleClasses(): void {
      this.element.addClass(Link.REVEAL_ERRORS_CLASS);
    }
  }

  export interface Attrs extends ng.IAttributes {
    csErrors: string;
  }

  export interface Scope extends ng.IScope {
    thisForm: ng.IFormController;
    doneRendering: boolean;
  }
}
