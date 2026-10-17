"use client";
"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const formCore = require("@tanstack/form-core");
const reactStore = require("@tanstack/react-store");
const React = require("react");
const useField = require("./useField.cjs");
const useIsomorphicLayoutEffect = require("./useIsomorphicLayoutEffect.cjs");
const useFormId = require("./useFormId.cjs");
const useFormGroup = require("./useFormGroup.cjs");
function LocalSubscribe({
  form,
  selector = (state) => state,
  children
}) {
  const data = reactStore.useSelector(form.store, selector);
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: formCore.functionalUpdate(children, data) });
}
function useForm(opts) {
  const fallbackFormId = useFormId.useFormId();
  const [prevFormId, setPrevFormId] = React.useState(opts?.formId);
  const [formApi, setFormApi] = React.useState(() => {
    return new formCore.FormApi({ ...opts, formId: opts?.formId ?? fallbackFormId });
  });
  if (prevFormId !== opts?.formId) {
    const formId = opts?.formId ?? fallbackFormId;
    setFormApi(new formCore.FormApi({ ...opts, formId }));
    setPrevFormId(formId);
  }
  const extendedFormApi = React.useMemo(() => {
    const extendedApi = {
      ...formApi,
      handleSubmit: ((...props) => {
        return formApi._handleSubmit(...props);
      }),
      // We must add all `get`ters from `core`'s `FormApi` here, as otherwise the spread operator won't catch those
      get formId() {
        return formApi._formId;
      },
      get state() {
        return formApi.store.state;
      }
    };
    extendedApi.Field = function APIField(props) {
      return /* @__PURE__ */ jsxRuntime.jsx(useField.Field, { ...props, form: formApi });
    };
    extendedApi.FormGroup = function APIFormGroup(props) {
      return /* @__PURE__ */ jsxRuntime.jsx(useFormGroup.FormGroup, { ...props, form: formApi });
    };
    extendedApi.Subscribe = function Subscribe(props) {
      return /* @__PURE__ */ jsxRuntime.jsx(
        LocalSubscribe,
        {
          form: formApi,
          selector: props.selector,
          children: props.children
        }
      );
    };
    return extendedApi;
  }, [formApi]);
  useIsomorphicLayoutEffect.useIsomorphicLayoutEffect(formApi.mount, []);
  useIsomorphicLayoutEffect.useIsomorphicLayoutEffect(() => {
    formApi.update(opts);
  });
  const hasRan = React.useRef(false);
  useIsomorphicLayoutEffect.useIsomorphicLayoutEffect(() => {
    if (!hasRan.current) return;
    if (!opts?.transform) return;
    formCore.mergeAndUpdate(formApi, opts.transform);
  }, [formApi, opts?.transform]);
  useIsomorphicLayoutEffect.useIsomorphicLayoutEffect(() => {
    hasRan.current = true;
  });
  return extendedFormApi;
}
exports.useForm = useForm;
//# sourceMappingURL=useForm.cjs.map
