"use client";
import { jsx, Fragment } from "react/jsx-runtime";
import { FormApi, mergeAndUpdate, functionalUpdate } from "@tanstack/form-core";
import { useSelector } from "@tanstack/react-store";
import { useState, useMemo, useRef } from "react";
import { Field } from "./useField.js";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";
import { useFormId } from "./useFormId.js";
import { FormGroup } from "./useFormGroup.js";
function LocalSubscribe({
  form,
  selector = (state) => state,
  children
}) {
  const data = useSelector(form.store, selector);
  return /* @__PURE__ */ jsx(Fragment, { children: functionalUpdate(children, data) });
}
function useForm(opts) {
  const fallbackFormId = useFormId();
  const [prevFormId, setPrevFormId] = useState(opts?.formId);
  const [formApi, setFormApi] = useState(() => {
    return new FormApi({ ...opts, formId: opts?.formId ?? fallbackFormId });
  });
  if (prevFormId !== opts?.formId) {
    const formId = opts?.formId ?? fallbackFormId;
    setFormApi(new FormApi({ ...opts, formId }));
    setPrevFormId(formId);
  }
  const extendedFormApi = useMemo(() => {
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
      return /* @__PURE__ */ jsx(Field, { ...props, form: formApi });
    };
    extendedApi.FormGroup = function APIFormGroup(props) {
      return /* @__PURE__ */ jsx(FormGroup, { ...props, form: formApi });
    };
    extendedApi.Subscribe = function Subscribe(props) {
      return /* @__PURE__ */ jsx(
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
  useIsomorphicLayoutEffect(formApi.mount, []);
  useIsomorphicLayoutEffect(() => {
    formApi.update(opts);
  });
  const hasRan = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (!hasRan.current) return;
    if (!opts?.transform) return;
    mergeAndUpdate(formApi, opts.transform);
  }, [formApi, opts?.transform]);
  useIsomorphicLayoutEffect(() => {
    hasRan.current = true;
  });
  return extendedFormApi;
}
export {
  useForm
};
//# sourceMappingURL=useForm.js.map
