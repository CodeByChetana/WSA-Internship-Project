import { batch } from "@tanstack/store";
import { deepCopy } from "./utils.js";
function mergeAndUpdate(form, fn) {
  if (!fn) return;
  const newObj = Object.assign({}, form, {
    state: deepCopy(form.state)
  });
  fn(newObj);
  if (newObj.fieldInfo !== form.fieldInfo) {
    form.fieldInfo = newObj.fieldInfo;
  }
  if (newObj.options !== form.options) {
    form.options = newObj.options;
  }
  const baseFormKeys = Object.keys({
    values: null,
    validationMetaMap: null,
    fieldMetaBase: null,
    formGroupStateBase: null,
    isSubmitting: null,
    isSubmitted: null,
    isValidating: null,
    submissionAttempts: null,
    isSubmitSuccessful: null,
    _force_re_eval: null
    // Do not remove this, it ensures that we have all the keys in `BaseFormState`
  });
  const diffedObject = baseFormKeys.reduce((prev, key) => {
    if (form.state[key] !== newObj.state[key]) {
      prev[key] = newObj.state[key];
    }
    return prev;
  }, {});
  batch(() => {
    if (Object.keys(diffedObject).length) {
      form.baseStore.setState((prev) => ({ ...prev, ...diffedObject }));
    }
    if (newObj.state.errorMap !== form.state.errorMap) {
      form.setErrorMap(newObj.state.errorMap);
    }
  });
  return newObj;
}
export {
  mergeAndUpdate
};
//# sourceMappingURL=transform.js.map
