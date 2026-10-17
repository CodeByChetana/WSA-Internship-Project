"use client";
"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const React = require("react");
const reactStore = require("@tanstack/react-store");
const formCore = require("@tanstack/form-core");
const useIsomorphicLayoutEffect = require("./useIsomorphicLayoutEffect.cjs");
function useField(opts) {
  const [prevOptions, setPrevOptions] = React.useState(() => ({
    form: opts.form,
    name: opts.name
  }));
  const [fieldApiState, setFieldApi] = React.useState(() => {
    return new formCore.FieldApi({
      ...opts
    });
  });
  let fieldApi = fieldApiState;
  if (prevOptions.form !== opts.form || prevOptions.name !== opts.name) {
    fieldApi = new formCore.FieldApi({
      ...opts
    });
    setFieldApi(fieldApi);
    setPrevOptions({ form: opts.form, name: opts.name });
  }
  const reactiveStateValue = reactStore.useSelector(
    fieldApi.store,
    opts.mode === "array" ? (state) => state.meta._arrayVersion || 0 : (state) => state.value
  );
  const reactiveMetaIsTouched = reactStore.useSelector(
    fieldApi.store,
    (state) => state.meta.isTouched
  );
  const reactiveMetaIsBlurred = reactStore.useSelector(
    fieldApi.store,
    (state) => state.meta.isBlurred
  );
  const reactiveMetaIsDirty = reactStore.useSelector(
    fieldApi.store,
    (state) => state.meta.isDirty
  );
  const reactiveMetaErrorMap = reactStore.useSelector(
    fieldApi.store,
    (state) => state.meta.errorMap
  );
  const reactiveMetaErrorSourceMap = reactStore.useSelector(
    fieldApi.store,
    (state) => state.meta.errorSourceMap
  );
  const reactiveMetaIsValidating = reactStore.useSelector(
    fieldApi.store,
    (state) => state.meta.isValidating
  );
  const extendedFieldApi = React.useMemo(() => {
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
  useIsomorphicLayoutEffect.useIsomorphicLayoutEffect(fieldApi.mount, [fieldApi]);
  useIsomorphicLayoutEffect.useIsomorphicLayoutEffect(() => {
    fieldApi.update(opts);
  });
  return extendedFieldApi;
}
const Field = (({
  children,
  ...fieldOptions
}) => {
  const fieldApi = useField(fieldOptions);
  const jsxToDisplay = React.useMemo(
    () => formCore.functionalUpdate(children, fieldApi),
    [children, fieldApi]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxToDisplay });
});
exports.Field = Field;
exports.useField = useField;
//# sourceMappingURL=useField.cjs.map
