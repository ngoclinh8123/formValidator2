function Validator(formSelector) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var formRules = {};

  var validatorRules = {
    required: function (value) {
      return value ? undefined : "Vui lòng nhập trường này";
    },
    email: function (value) {
      var regex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(value) ? undefined : "Trường này phải là email";
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Vui lòng nhập ít nhất ${min} kí tự`;
      };
    },
  };

  //lay ra form element trong DOM
  formElement = document.querySelector(formSelector);

  //chi xu ly khi co element
  if (formElement) {
    var inputs = formElement.querySelectorAll("[name][rules]");
    for (var input of inputs) {
      var rules = input.getAttribute("rules").split("|");
      for (var rule of rules) {
        var isRuleHasValue = rule.includes(":");
        var ruleInfo;

        if (isRuleHasValue) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }

        var ruleFunc = validatorRules[rule];

        if (isRuleHasValue) {
          ruleFunc = ruleFunc(ruleInfo[1]);
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [validatorRules[rule]];
        }
      }

      //lang nghe su kien de validate
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }
    //ham thuc hien validate
    function handleValidate(event) {
      var rules = formRules[event.target.name];
      var errorMessage;
      for (var rule of rules) {
        errorMessage = rule(event.target.value);
        if (errorMessage) break;
      }

      if (errorMessage) {
        var formGroup = getParent(event.target, ".form-group");

        if (formGroup) {
          var formMessage = formGroup.querySelector(".form-message");
          formGroup.classList.add("invalid");

          if (formMessage) {
            formMessage.innerText = errorMessage;
          }
        }
      }
      return !errorMessage;
    }

    //ham clear message loi
    function handleClearError(event) {
      var formGroup = getParent(event.target, ".form-group");
      var formMessage = formGroup.querySelector(".form-message");
      if (formGroup.classList.contains("invalid")) {
        formGroup.classList.remove("invalid");
        if (formMessage) {
          formMessage.innerText = "";
        }
      }
    }
  }

  var _this = this;
  //xu li hanh vi submit
  formElement.onsubmit = function (event) {
    event.preventDefault();
    var inputs = formElement.querySelectorAll("[name][rules]");
    var isValid = true;
    for (var input of inputs) {
      if (!handleValidate({ target: input })) {
        isValid = false;
      }
    }

    if (isValid) {
      if (typeof _this.onSubmit === "function") {
        var enableInputs = formElement.querySelectorAll("[name]");
        var formValue = Array.from(enableInputs).reduce(function (
          values,
          input
        ) {
          switch (input.type) {
            case "checkbox":
              if (!input.matches(":checked")) {
                values[input.name] = "";
                return values;
              }
              if (!Array.isArray(values[input.name])) {
                values[input.name] = [];
              }

              values[input.name].push(input.value);
              break;
            case "radio":
              values[input.name] = formElement.querySelector(
                'input[name="' + input.name + '"]:checked'
              ).value;
              break;

            case "file":
              values[input.name] = input.files;
              break;

            default:
              values[input.name] = input.value;
          }

          return values;
        },
        {});

        _this.onSubmit(formValue);
      } else {
        formElement.onsubmit();
      }
    }
  };
}
