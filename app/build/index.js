var cs;
(function (cs) {
    cs.csErrors = angular.module("csErrors", []);
})(cs || (cs = {}));

var cs;
(function (cs) {
    var errors;
    (function (errors) {
        cs.csErrors.directive("csErrors", function () {
            return {
                restrict: "A",
                require: ["^^form", "csErrors"],
                scope: false,
                controller: Ctrl,
                link: function (scope, elem, attrs, Ctrls) {
                    if (!elem.hasClass("form-group")) {
                        throw "errors element does not have the 'form-group' class";
                    }
                    return new Link(scope, elem, attrs, Ctrls[0], Ctrls[1]);
                }
            };
        });
        var Ctrl = (function () {
            function Ctrl($scope) {
                this.$scope = $scope;
                this.uniqueId = Ctrl.nonce++;
            }
            Ctrl.prototype.setDoneRendering = function (str) {
                this.$scope[Ctrl.DONE_RENDERING_PREFIX + this.uniqueId] = true;
            };
            Ctrl.DONE_RENDERING_PREFIX = "errorsHelperDoneRendering";
            Ctrl.nonce = 1;
            return Ctrl;
        })();
        errors.Ctrl = Ctrl;
        var Link = (function () {
            function Link(scope, element, attrs, formCtrl, csErrorsCtrl) {
                var _this = this;
                this.scope = scope;
                this.element = element;
                this.attrs = attrs;
                this.formCtrl = formCtrl;
                this.csErrorsCtrl = csErrorsCtrl;
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
                    var rendered = false;
                    scope.$watch(Ctrl.DONE_RENDERING_PREFIX + csErrorsCtrl.uniqueId, function (newValue) {
                        if (newValue && !rendered) {
                            rendered = true;
                            _this.initialize();
                        }
                    });
                }
                else {
                    this.initialize();
                }
            }
            Link.prototype.initialize = function () {
                var _this = this;
                var inputEl = angular.element(this.element[0].querySelector("[name]"));
                var inputName = inputEl.attr("name");
                if (!inputName) {
                    throw "cs-errors element has no child input elements with a 'name' attribute";
                }
                if (this.attrs.csErrors && this.scope.$eval(this.attrs.csErrors)["multiInput"]) {
                    // this can be used for custom directives like a dropdown-menu with a tab index, where the focused element might not be an input
                    // it can also be used if the named element is an ng-form that is tied to a single ng-model that multiple inputs feed into, this would then bind a focusout event to the input with data-cs-errors-on-blur that should control the error reveal (likely the last one)
                    // Since it is using focusout the child gets the [data-cs-errors-on-blur] attribute and the parent this.element will receive the event
                    this.element.on("focusout", "[data-cs-errors-on-blur]", function (event) {
                        angular.element(event.currentTarget).addClass(errors.Link.REVEAL_ERRORS_CLASS);
                        var elName = event.currentTarget.attributes["name"].value;
                        if (_this.formCtrl[inputName][elName] && _this.formCtrl[inputName][elName].$invalid) {
                            _this.toggleClasses();
                        }
                    });
                }
                inputEl.on("blur", this.toggleClasses.bind(this));
                this.scope.$on(Link.REVEAL_ERRORS_EVENT, this.toggleClasses.bind(this));
            };
            Link.prototype.toggleClasses = function () {
                this.element.addClass(Link.REVEAL_ERRORS_CLASS);
            };
            Link.REVEAL_ERRORS_EVENT = "RevealErrors:";
            Link.REVEAL_ERRORS_CLASS = "reveal-errors";
            Link.HIDE_ERRORS_CLASS = "hide-errors";
            return Link;
        })();
        errors.Link = Link;
    })(errors = cs.errors || (cs.errors = {}));
})(cs || (cs = {}));

var cs;
(function (cs) {
    var errors;
    (function (errors) {
        cs.csErrors.directive("csErrorsForm", function () {
            return {
                restrict: "A",
                scope: false,
                link: function (scope, element, attrs) {
                    element.addClass(cs.errors.Link.HIDE_ERRORS_CLASS);
                    scope.$on(errors.Link.REVEAL_ERRORS_EVENT + attrs.name, function () {
                        scope.$broadcast(errors.Link.REVEAL_ERRORS_EVENT); //no longer need form name namespace
                        element.addClass(cs.errors.Link.REVEAL_ERRORS_CLASS).removeClass(cs.errors.Link.HIDE_ERRORS_CLASS);
                        if (attrs.noScroll !== undefined) {
                            return;
                        }
                        var firstErroredElement = angular.element(element[0].querySelector(".ng-invalid"));
                        if (firstErroredElement.length !== 0) {
                            if (typeof jQuery == 'undefined') {
                                firstErroredElement[0].scrollIntoView();
                            }
                            else {
                                angular.element('html, body').animate({
                                    scrollTop: firstErroredElement.offset().top - 100 //100 px padding on scroll to top
                                }, 600);
                            }
                        }
                    });
                }
            };
        });
    })(errors = cs.errors || (cs.errors = {}));
})(cs || (cs = {}));

var cs;
(function (cs) {
    var errors;
    (function (errors) {
        cs.csErrors.directive("csErrorsHelper", function ($timeout) {
            return {
                restrict: "A",
                scope: false,
                priority: 100,
                require: "^csErrors",
                link: function (scope, elem, attrs, csErrorsCtrl) {
                    if (elem.closest("[cs-errors]").length === 0) {
                        throw "Needs to be accompanied by cs-errors directive";
                    }
                    $timeout(function () { return csErrorsCtrl.setDoneRendering("csErrorsHelper:Done"); });
                }
            };
        });
    })(errors = cs.errors || (cs.errors = {}));
})(cs || (cs = {}));

var cs;
(function (cs) {
    var errors;
    (function (errors) {
        cs.csErrors.directive("csErrorsSubmit", function () {
            return {
                restrict: "A",
                scope: false,
                require: "^form",
                priority: 1,
                controller: function ($scope, $element) {
                    $element.on("click", function (event) {
                        if ($scope.attrs.csErrorsSubmit !== $scope.formCtrl.$name) {
                            throw "Provided name (" + $scope.attrs.csErrorsSubmit + ") of form does not match:" + $scope.formCtrl.$name;
                        }
                        if ($scope.formCtrl.$invalid) {
                            $scope.$emit(errors.Link.REVEAL_ERRORS_EVENT + $scope.formCtrl.$name);
                            event.preventDefault();
                            event.stopImmediatePropagation();
                        }
                    });
                },
                link: function (scope, element, attrs, formCtrl) {
                    scope.formCtrl = formCtrl;
                    scope.attrs = attrs;
                }
            };
        });
    })(errors = cs.errors || (cs.errors = {}));
})(cs || (cs = {}));
