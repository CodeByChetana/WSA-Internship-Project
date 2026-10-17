"use client";
import { jsx, Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useSelector } from "@tanstack/react-store";
import { functionalUpdate, FormGroupApi } from "@tanstack/form-core";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";
function useFormGroup(opts) {
  const [prevOptions, setPrevOptions] = useState(() => ({
    form: opts.form,
    name: opts.name
  }));
  const [formGroupApi, setFormGroupApi] = useState(() => {
    return new FormGroupApi({
      ...opts
    });
  });
  if (prevOptions.form !== opts.form || prevOptions.name !== opts.name) {
    setFormGroupApi(
      new FormGroupApi({
        ...opts
      })
    );
    setPrevOptions({ form: opts.form, name: opts.name });
  }
  const reactiveStateValue = useSelector(
    formGroupApi.store,
    (state) => state.value
  );
  const reactiveMetaIsTouched = useSelector(
    formGroupApi.store,
    (state) => state.meta.isTouched
  );
  const reactiveMetaIsBlurred = useSelector(
    formGroupApi.store,
    (state) => state.meta.isBlurred
  );
  const reactiveMetaIsDirty = useSelector(
    formGroupApi.store,
    (state) => state.meta.isDirty
  );
  const reactiveMetaErrorMap = useSelector(
    formGroupApi.store,
    (state) => state.meta.errorMap
  );
  const reactiveMetaErrorSourceMap = useSelector(
    formGroupApi.store,
    (state) => state.meta.errorSourceMap
  );
  const reactiveMetaIsValidating = useSelector(
    formGroupApi.store,
    (state) => state.meta.isValidating
  );
  const reactiveMetaIsSubmitting = useSelector(
    formGroupApi.store,
    (state) => state.meta.isSubmitting
  );
  const reactiveMetaIsSubmitted = useSelector(
    formGroupApi.store,
    (state) => state.meta.isSubmitted
  );
  const reactiveMetaSubmissionAttempts = useSelector(
    formGroupApi.store,
    (state) => state.meta.submissionAttempts
  );
  const reactiveMetaIsSubmitSuccessful = useSelector(
    formGroupApi.store,
    (state) => state.meta.isSubmitSuccessful
  );
  const reactiveMetaCanSubmit = useSelector(
    formGroupApi.store,
    (state) => state.meta.canSubmit
  );
  const reactiveMetaIsValid = useSelector(
    formGroupApi.store,
    (state) => state.meta.isValid
  );
  const reactiveMetaIsFieldsValid = useSelector(
    formGroupApi.store,
    (state) => state.meta.isFieldsValid
  );
  const reactiveMetaIsFieldsValidating = useSelector(
    formGroupApi.store,
    (state) => state.meta.isFieldsValidating
  );
  const reactiveMetaIsGroupValid = useSelector(
    formGroupApi.store,
    (state) => state.meta.isGroupValid
  );
  const extendedFieldApi = useMemo(() => {
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
  useIsomorphicLayoutEffect(formGroupApi.mount, [formGroupApi]);
  useIsomorphicLayoutEffect(() => {
    formGroupApi.update(opts);
  });
  return extendedFieldApi;
}
const FormGroup = (({
  children,
  ...formGroupOptions
}) => {
  const formGroupApi = useFormGroup(formGroupOptions);
  const jsxToDisplay = useMemo(
    () => functionalUpdate(children, formGroupApi),
    [children, formGroupApi]
  );
  return /* @__PURE__ */ jsx(Fragment, { children: jsxToDisplay });
});
export {
  FormGroup,
  useFormGroup
};
//# sourceMappingURL=useFormGroup.js.map
