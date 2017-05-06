# CsAngularErrors - ([Tutorial](http://blog.codyschaaf.com/angular/2015/09/14/angular-form-errors.html))

Angular form validation with errors. These directives work in together to apply nice error message handling to 
Angular forms. They will hide error messages on load, and then only reveal invalid fields on blur, or when the user
attempts to submit an incomplete form. Followed by a nice scroll animation to the invalid field.
 
JQuery is not required, but is needed for smooth scrolling animation. Without jQuery it will just jump to the right position.

###Usage

```html 

<form name="userForm" cs-errors-form>
  <h5>Create a user here:</h5>
  <div cs-errors class="form-group">
    <input type="text" name="name" ng-model="name" ng-required="true" />
    <div ng-messages="userForm.name.$error">
      <p class="text-danger" ng-message="required">You forgot your name.</p>
    </div>
  </div>
  <button cs-errors-submit="userForm" ng-click="save()">Create User</button>
</form>

```

See html-sample.html and styles-sample.scss for full usage instructions. 

Either include app/build/index.min.js in your applications directly, or install with bower `cs-angular-errors`.

Working example can be found on [CodePen](http://codepen.io/codyschaaf/pen/qONaJw).

These directives work nicely with bootstrap classes, but you can also just add the classes without bootstrap.

Apply `cs-errors-form` on the parent form (remember to give it a name). Add cs-errors to your form-groups, these should 
wrap your inputs and your error messages. Apply ng-model validators to the input elements, and text-danger to your error
message. Either use Angular's built in ng-messages (requires the ng-messages module be installed) or apply your own ng-if 
(ng-if instead of show/hide for nice animations), based on the input's invalid property on the form. Finally add 
`cs-errors-submit` to the submit button, and don't forget to pass in the form name. 

###Customizations

- `cs-errors-form="no-scroll"` option to prevent auto scrolling on validation.
 
- `{ needsRenderCheck: true }` option to `cs-errors` directive (`cs-errors="{ needsRenderCheck: true }"`) to allow the directive
to work with custom ui components. This also requires the `cs-errors-helper` to be placed on the custom directive. This will allow 
the ui component to render before the `cs-errors` directive initializes. See the `dropdown-menu` directive in `html-sample.html` 
for an example. This can also be achieved by wrapping your custom component in an ng-form with a name attribute.

- By default cs-errors watches the top level element with a name attribute for a blur event. On this blur event it will
reveal any errors that exist. If you are using a custom component, that needs something other than the top level element
to be watched, apply `data-cs-errors-on-blur` attribute to an input element that should be watched for an additional blur event. 
This is useful if you have a dropdown that will need an additional blur, or multiple inputs that represent a single input (such as 
a ssn or a name input field). To get this working pass in `{ multiInput: true }` to the `cs-errors` directive (`cs-errors="{ multiInput: true }"`).


###More Info

To see a step-by-step tutorial of the creation of these directives check out my [blog](http://blog.codyschaaf.com/angular/2015/09/14/angular-form-errors.html)
