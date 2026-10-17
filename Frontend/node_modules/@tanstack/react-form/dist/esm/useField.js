"use client";
import { jsx, Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useSelector } from "@tanstack/react-store";
import { functionalUpdate, FieldApi } from "@tanstack/form-core";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";
function useField(opts) {
  const [prevOptions, setPrevOptions] = useState(() => ({
    form: opts.form,
    name: opts.name
  }));
  const [fieldApiState, setFieldApi] = useState(() => {
    return new FieldApi({
      ...opts
    });
  });
  let fieldApi = fieldApiState;
  if (prevOptions.form !== opts.form || prevOptions.name !== opts.name) {
    fieldApi = new FieldApi({
      ...opts
    });
    setFieldApi(fieldApi);
    setPrevOptions({ form: opts.form, name: opts.name });
  }
  const reactiveStateValue = useSelector(
    fieldApi.store,
    opts.mode === "array" ? (state) => state.meta._arrayVersion || 0 : (state) => state.value
  );
  const reactiveMetaIsTouched = useSelector(
    fieldApi.store,
    (state) => state.meta.isTouched
  );
  const reactiveMetaIsBlurred = useSelector(
    fieldApi.store,
    (state) => state.meta.isBlurred
  );
  const reactiveMetaIsDirty = useSelector(
    fieldApi.store,
    (state) => state.meta.isDirty
  );
  const reactiveMetaErrorMap = useSelector(
    fieldApi.store,
    (state) => state.meta.errorMap
  );
  const reactiveMetaErrorSourceMap = useSelector(
    fieldApi.store,
    (state) => state.meta.errorSourceMap
  );
  const reactiveMetaIsValidating = useSelector(
    fieldApi.store,
    (state) => state.meta.isValidating
  );
  const extendedFieldApi = useMemo(() => {
    const reactiveFieldApi = {
      ...fieldApi,
      get state() {
        return {
          // For array mode, reactiveStateValue is the length (for reactivity tracking),
          // so we need to get the actual value from fieldApi
          value: opts.mode === "array" ? fieldApi.state.value : reactiveStateValue,
          get meta() {
            return {
              ...fieldApi.state.meta,
              isTouched: reactiveMetaIsTouched,
              isBlurred: reactiveMetaIsBlurred,
              isDirty: reactiveMetaIsDirty,
              errorMap: reactiveMetaErrorMap,
              errorSourceMap: reactiveMetaErrorSourceMap,
              isValidating: reactiveMetaIsValidating
            };
          }
        };
      }
    };
    const extendedApi = reactiveFieldApi;
    return extendedApi;
  }, [
    fieldApi,
    opts.mode,
    reactiveStateValue,
    reactiveMetaIsTouched,
    reactiveMetaIsBlurred,
    reactiveMetaIsDirty,
    reactiveMetaErrorMap,
    reactiveMetaErrorSourceMap,
    reactiveMetaIsValidating
  ]);
  useIsomorphicLayoutEffect(fieldApi.mount, [fieldApi]);
  useIsomorphicLayoutEffect(() => {
    fieldApi.update(opts);
  });
  return extendedFieldApi;
}
const Field = (({
  children,
  ...fieldOptions
}) => {
  const fieldApi = useField(fieldOptions);
  const jsxToDisplay = useMemo(
    () => functionalUpdate(children, fieldApi),
    [children, fieldApi]
  );
  return /* @__PURE__ */ jsx(Fragment, { children: jsxToDisplay });
});
export {
  Field,
  useField
};
//# sourceMappingURL=useField.js.map
