"use client";
"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const React = require("react");
const reactStore = require("@tanstack/react-store");
const formCore = require("@tanstack/form-core");
const useIsomorphicLayoutEffect = require("./useIsomorphicLayoutEffect.cjs");
function useFormGroup(opts) {
  const [prevOptions, setPrevOptions] = React.useState(() => ({
    form: opts.form,
    name: opts.name
  }));
  const [formGroupApi, setFormGroupApi] = React.useState(() => {
    return new formCore.FormGroupApi({
      ...opts
    });
  });
  if (prevOptions.form !== opts.form || prevOptions.name !== opts.name) {
    setFormGroupApi(
      new formCore.FormGroupApi({
        ...opts
      })
    );
    setPrevOptions({ form: opts.form, name: opts.name });
  }
  const reactiveStateValue = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.value
  );
  const reactiveMetaIsTouched = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isTouched
  );
  const reactiveMetaIsBlurred = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isBlurred
  );
  const reactiveMetaIsDirty = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isDirty
  );
  const reactiveMetaErrorMap = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.errorMap
  );
  const reactiveMetaErrorSourceMap = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.errorSourceMap
  );
  const reactiveMetaIsValidating = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isValidating
  );
  const reactiveMetaIsSubmitting = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isSubmitting
  );
  const reactiveMetaIsSubmitted = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isSubmitted
  );
  const reactiveMetaSubmissionAttempts = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.submissionAttempts
  );
  const reactiveMetaIsSubmitSuccessful = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isSubmitSuccessful
  );
  const reactiveMetaCanSubmit = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.canSubmit
  );
  const reactiveMetaIsValid = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isValid
  );
  const reactiveMetaIsFieldsValid = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isFieldsValid
  );
  const reactiveMetaIsFieldsValidating = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isFieldsValidating
  );
  const reactiveMetaIsGroupValid = reactStore.useSelector(
    formGroupApi.store,
    (state) => state.meta.isGroupValid
  );
  const extendedFieldApi = React.useMemo(() => {
    const reactiveFieldApi = {
      ...formGroupApi,
      handleSubmit: ((...props) => {
        return formGroupApi._handleSubmit(...props);
      }),
      get state() {
        return {
          ...formGroupApi.state,
          value: reactiveStateValue,
          get meta() {
            return {
              ...formGroupApi.state.meta,
              isTouched: reactiveMetaIsTouched,
              isBlurred: reactiveMetaIsBlurred,
              isDirty: reactiveMetaIsDirty,
              errorMap: reactiveMetaErrorMap,
              errorSourceMap: reactiveMetaErrorSourceMap,
              isValidating: reactiveMetaIsValidating,
              isSubmitting: reactiveMetaIsSubmitting,
              isSubmitted: reactiveMetaIsSubmitted,
              submissionAttempts: reactiveMetaSubmissionAttempts,
              isSubmitSuccessful: reactiveMetaIsSubmitSuccessful,
              canSubmit: reactiveMetaCanSubmit,
              isValid: reactiveMetaIsValid,
              isFieldsValid: reactiveMetaIsFieldsValid,
              isFieldsValidating: reactiveMetaIsFieldsValidating,
              isGroupValid: reactiveMetaIsGroupValid
            };
          }
        };
      }
    };
    const extendedApi = reactiveFieldApi;
    return extendedApi;
  }, [
    formGroupApi,
    reactiveStateValue,
    reactiveMetaIsTouched,
    reactiveMetaIsBlurred,
    reactiveMetaIsDirty,
    reactiveMetaErrorMap,
    reactiveMetaErrorSourceMap,
    reactiveMetaIsValidating,
    reactiveMetaIsSubmitting,
    reactiveMetaIsSubmitted,
    reactiveMetaSubmissionAttempts,
    reactiveMetaIsSubmitSuccessful,
    reactiveMetaCanSubmit,
    reactiveMetaIsValid,
    reactiveMetaIsFieldsValid,
    reactiveMetaIsFieldsValidating,
    reactiveMetaIsGroupValid
  ]);
  useIsomorphicLayoutEffect.useIsomorphicLayoutEffect(formGroupApi.mount, [formGroupApi]);
  useIsomorphicLayoutEffect.useIsomorphicLayoutEffect(() => {
    formGroupApi.update(opts);
  });
  return extendedFieldApi;
}
const FormGroup = (({
  children,
  ...formGroupOptions
}) => {
  const formGroupApi = useFormGroup(formGroupOptions);
  const jsxToDisplay = React.useMemo(
    () => formCore.functionalUpdate(children, formGroupApi),
    [children, formGroupApi]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxToDisplay });
});
exports.FormGroup = FormGroup;
exports.useFormGroup = useFormGroup;
//# sourceMappingURL=useFormGroup.cjs.map
