"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const formCore = require("@tanstack/form-core");
const reactStore = require("@tanstack/react-store");
const createFormHook = require("./createFormHook.cjs");
const useField = require("./useField.cjs");
const useFieldGroup = require("./useFieldGroup.cjs");
const useForm = require("./useForm.cjs");
const useFormGroup = require("./useFormGroup.cjs");
const useIsomorphicLayoutEffect = require("./useIsomorphicLayoutEffect.cjs");
Object.defineProperty(exports, "useSelector", {
  enumerable: true,
  get: () => reactStore.useSelector
});
Object.defineProperty(exports, "useStore", {
  enumerable: true,
  get: () => reactStore.useStore
});
exports.createFormHook = createFormHook.createFormHook;
exports.createFormHookContexts = createFormHook.createFormHookContexts;
exports.Field = useField.Field;
exports.useField = useField.useField;
exports.useFieldGroup = useFieldGroup.useFieldGroup;
exports.useForm = useForm.useForm;
exports.FormGroup = useFormGroup.FormGroup;
exports.useFormGroup = useFormGroup.useFormGroup;
exports.useIsomorphicLayoutEffect = useIsomorphicLayoutEffect.useIsomorphicLayoutEffect;
Object.keys(formCore).forEach((k) => {
  if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: () => formCore[k]
  });
});
//# sourceMappingURL=index.cjs.map
