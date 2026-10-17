import { batch, createStore } from "@tanstack/store";
import { standardSchemaValidators, isStandardSchemaValidator } from "./standardSchemaValidator.js";
import { defaultFieldMeta } from "./metaHelper.js";
import { evaluate, mergeOpts, getSyncValidatorArray, getAsyncValidatorArray, isFieldInGroup, determineFieldLevelErrorSourceAndValue } from "./utils.js";
import { defaultValidationLogic } from "./ValidationLogic.js";
class FieldApi {
  /**
   * Initializes a new `FieldApi` instance.
   */
  constructor(opts) {
    this.options = {};
    this.mount = () => {
      if (this.options.defaultValue !== void 0 && !this.getMeta().isTouched) {
        this.form.setFieldValue(this.name, this.options.defaultValue, {
          dontUpdateMeta: true
        });
      }
      const info = this.getInfo();
      info.instance = this;
      this.update(this.options);
      const { onMount } = this.options.validators || {};
      if (onMount) {
        const error = this.runValidator({
          validate: onMount,
          value: {
            value: this.state.value,
            fieldApi: this,
            validationSource: "field"
          },
          type: "validate"
        });
        if (error) {
          this.setMeta(
            (prev) => ({
              ...prev,
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              errorMap: { ...prev?.errorMap, onMount: error },
              errorSourceMap: {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                ...prev?.errorSourceMap,
                onMount: "field"
              }
            })
          );
        }
      }
      this.options.listeners?.onMount?.({
        value: this.state.value,
        fieldApi: this
      });
      return () => {
        for (const [key, timeout] of Object.entries(
          this.timeoutIds.validations
        )) {
          if (timeout) {
            clearTimeout(timeout);
            this.timeoutIds.validations[key] = null;
          }
        }
        for (const [key, timeout] of Object.entries(this.timeoutIds.listeners)) {
          if (timeout) {
            clearTimeout(timeout);
            this.timeoutIds.listeners[key] = null;
          }
        }
        for (const [key, timeout] of Object.entries(
          this.timeoutIds.formListeners
        )) {
          if (timeout) {
            clearTimeout(timeout);
            this.timeoutIds.formListeners[key] = null;
          }
        }
        const fieldInfo = this.form.fieldInfo[this.name];
        if (!fieldInfo) return;
        if (fieldInfo.instance !== this) return;
        for (const [key, validationMeta] of Object.entries(
          fieldInfo.validationMetaMap
        )) {
          validationMeta?.lastAbortController.abort();
          fieldInfo.validationMetaMap[key] = void 0;
        }
        this.form.baseStore.setState((prev) => ({
          // Preserve interaction flags so field-level defaultValue does not
          // reseed user-entered values on remount.
          ...prev,
          fieldMetaBase: {
            ...prev.fieldMetaBase,
            [this.name]: {
              ...defaultFieldMeta,
              isTouched: prev.fieldMetaBase[this.name]?.isTouched ?? defaultFieldMeta.isTouched,
              isBlurred: prev.fieldMetaBase[this.name]?.isBlurred ?? defaultFieldMeta.isBlurred,
              isDirty: prev.fieldMetaBase[this.name]?.isDirty ?? defaultFieldMeta.isDirty
            }
          }
        }));
        fieldInfo.instance = null;
        this.options.listeners?.onUnmount?.({
          value: this.state.value,
          fieldApi: this
        });
        this.form.options.listeners?.onFieldUnmount?.({
          formApi: this.form,
          fieldApi: this
        });
      };
    };
    this.update = (opts2) => {
      this.options = opts2;
      this.name = opts2.name;
      if (!this.state.meta.isTouched && this.options.defaultValue !== void 0) {
        const formField = this.form.getFieldValue(this.name);
        if (!evaluate(formField, opts2.defaultValue)) {
          this.form.setFieldValue(this.name, opts2.defaultValue, {
            dontUpdateMeta: true,
            dontValidate: true,
            dontRunListeners: true
          });
        }
      }
      if (!this.form.getFieldMeta(this.name)) {
        this.form.setFieldMeta(this.name, this.state.meta);
      }
    };
    this.getValue = () => {
      return this.form.getFieldValue(this.name);
    };
    this.setValue = (updater, options) => {
      this.form.setFieldValue(
        this.name,
        updater,
        mergeOpts(options, { dontRunListeners: true, dontValidate: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
      if (!options?.dontValidate) {
        this.validate("change");
      }
    };
    this.getMeta = () => this.store.state.meta;
    this.setMeta = (updater) => this.form.setFieldMeta(this.name, updater);
    this.getInfo = () => this.form.getFieldInfo(this.name);
    this.pushValue = (value, options) => {
      this.form.pushFieldValue(
        this.name,
        value,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.insertValue = (index, value, options) => {
      this.form.insertFieldValue(
        this.name,
        index,
        value,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.replaceValue = (index, value, options) => {
      this.form.replaceFieldValue(
        this.name,
        index,
        value,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.removeValue = (index, options) => {
      this.form.removeFieldValue(
        this.name,
        index,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.swapValues = (aIndex, bIndex, options) => {
      this.form.swapFieldValues(
        this.name,
        aIndex,
        bIndex,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.moveValue = (aIndex, bIndex, options) => {
      this.form.moveFieldValues(
        this.name,
        aIndex,
        bIndex,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.clearValues = (options) => {
      this.form.clearFieldValues(
        this.name,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.getLinkedFields = (cause) => {
      const fields = Object.values(this.form.fieldInfo);
      const linkedFields = [];
      for (const field of fields) {
        if (!field.instance) continue;
        if (!(field.instance instanceof FieldApi)) {
          continue;
        }
        const { onChangeListenTo, onBlurListenTo } = field.instance.options.validators || {};
        if (cause === "change" && onChangeListenTo?.includes(this.name)) {
          linkedFields.push(field.instance);
        }
        if (cause === "blur" && onBlurListenTo?.includes(this.name)) {
          linkedFields.push(field.instance);
        }
      }
      return linkedFields;
    };
    this.validateSync = (cause, errorFromForm) => {
      const validates = getSyncValidatorArray(cause, {
        ...this.options,
        form: this.form,
        fieldName: this.name,
        validationLogic: this.form.options.validationLogic || defaultValidationLogic
      });
      const linkedFields = this.getLinkedFields(cause);
      const linkedFieldValidates = linkedFields.reduce(
        (acc, field) => {
          const fieldValidates = getSyncValidatorArray(cause, {
            ...field.options,
            form: field.form,
            fieldName: field.name,
            validationLogic: field.form.options.validationLogic || defaultValidationLogic
          });
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      let hasErrored = false;
      batch(() => {
        const validateFieldFn = (field, validateObj) => {
          const errorMapKey = getErrorMapKey(validateObj.cause);
          const fieldLevelError = validateObj.validate ? normalizeError(
            field.runValidator({
              validate: validateObj.validate,
              value: {
                value: field.store.state.value,
                validationSource: "field",
                fieldApi: field
              },
              type: "validate"
            })
          ) : void 0;
          const formLevelError = errorFromForm[errorMapKey];
          const { newErrorValue, newSource } = determineFieldLevelErrorSourceAndValue({
            formLevelError,
            fieldLevelError
          });
          if (field.state.meta.errorMap?.[errorMapKey] !== newErrorValue) {
            field.setMeta((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: newErrorValue
              },
              errorSourceMap: {
                ...prev.errorSourceMap,
                [errorMapKey]: newSource
              }
            }));
          }
          if (newErrorValue) {
            hasErrored = true;
          }
        };
        for (const validateObj of validates) {
          validateFieldFn(this, validateObj);
        }
        for (const fieldValitateObj of linkedFieldValidates) {
          if (!fieldValitateObj.validate) continue;
          validateFieldFn(fieldValitateObj.field, fieldValitateObj);
        }
      });
      const submitErrKey = getErrorMapKey("submit");
      if (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.state.meta.errorMap?.[submitErrKey] && cause !== "submit" && !hasErrored
      ) {
        this.setMeta((prev) => ({
          ...prev,
          errorMap: {
            ...prev.errorMap,
            [submitErrKey]: void 0
          },
          errorSourceMap: {
            ...prev.errorSourceMap,
            [submitErrKey]: void 0
          }
        }));
      }
      return { hasErrored };
    };
    this.validateAsync = async (cause, formValidationResultPromise) => {
      const validates = getAsyncValidatorArray(cause, {
        ...this.options,
        form: this.form,
        fieldName: this.name,
        validationLogic: this.form.options.validationLogic || defaultValidationLogic
      });
      const asyncFormValidationResults = await formValidationResultPromise;
      const linkedFields = this.getLinkedFields(cause);
      const linkedFieldValidates = linkedFields.reduce(
        (acc, field) => {
          const fieldValidates = getAsyncValidatorArray(cause, {
            ...field.options,
            form: field.form,
            fieldName: field.name,
            validationLogic: field.form.options.validationLogic || defaultValidationLogic
          });
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      const validatesPromises = [];
      const linkedPromises = [];
      const hasAsyncValidators = validates.some((v) => v.validate);
      const linkedFieldsWithAsyncValidators = Array.from(
        new Set(
          linkedFieldValidates.filter((v) => v.validate).map((v) => v.field)
        )
      );
      batch(() => {
        if (hasAsyncValidators) {
          this.startValidation();
        }
        for (const linkedField of linkedFieldsWithAsyncValidators) {
          linkedField.startValidation();
        }
      });
      const validateFieldAsyncFn = (field, validateObj, promises) => {
        const errorMapKey = getErrorMapKey(validateObj.cause);
        const fieldInfo = field.getInfo();
        const fieldValidatorMeta = fieldInfo.validationMetaMap[errorMapKey];
        fieldValidatorMeta?.lastAbortController.abort();
        const controller = new AbortController();
        fieldInfo.validationMetaMap[errorMapKey] = {
          lastAbortController: controller
        };
        promises.push(
          new Promise(async (resolve) => {
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                if (field.timeoutIds.validations[validateObj.cause]) {
                  clearTimeout(field.timeoutIds.validations[validateObj.cause]);
                  field.endValidation();
                }
                field.timeoutIds.validations[validateObj.cause] = setTimeout(
                  async () => {
                    if (controller.signal.aborted) return rawResolve(void 0);
                    try {
                      rawResolve(
                        await this.runValidator({
                          validate: validateObj.validate,
                          value: {
                            value: field.store.state.value,
                            fieldApi: field,
                            signal: controller.signal,
                            validationSource: "field"
                          },
                          type: "validateAsync"
                        })
                      );
                    } catch (e) {
                      rawReject(e);
                    }
                  },
                  validateObj.debounceMs
                );
              });
            } catch (e) {
              rawError = e;
            }
            if (controller.signal.aborted) return resolve(void 0);
            const fieldLevelError = normalizeError(rawError);
            const formLevelError = asyncFormValidationResults[field.name]?.[errorMapKey];
            const { newErrorValue, newSource } = determineFieldLevelErrorSourceAndValue({
              formLevelError,
              fieldLevelError
            });
            if (field.getInfo().instance !== field) {
              return resolve(void 0);
            }
            field.setMeta((prev) => {
              return {
                ...prev,
                errorMap: {
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  ...prev?.errorMap,
                  [errorMapKey]: newErrorValue
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: newSource
                }
              };
            });
            resolve(newErrorValue);
          })
        );
      };
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        validateFieldAsyncFn(this, validateObj, validatesPromises);
      }
      for (const fieldValitateObj of linkedFieldValidates) {
        if (!fieldValitateObj.validate) continue;
        validateFieldAsyncFn(
          fieldValitateObj.field,
          fieldValitateObj,
          linkedPromises
        );
      }
      let results = [];
      if (validatesPromises.length || linkedPromises.length) {
        results = await Promise.all(validatesPromises);
        await Promise.all(linkedPromises);
      }
      batch(() => {
        if (hasAsyncValidators) {
          this.endValidation();
        }
        for (const linkedField of linkedFieldsWithAsyncValidators) {
          linkedField.endValidation();
        }
      });
      return results.filter(Boolean);
    };
    this.validate = (cause, opts2) => {
      if (!this.state.meta.isTouched) return [];
      const encompassingGroups = opts2?.skipGroupValidation ? [] : Array.from(this.form.formGroupApis).filter(
        (group) => this.name.startsWith(group.name)
      );
      const formSyncResult = opts2?.skipFormValidation ? { fieldsErrorMap: {} } : this.form.validateSync(cause);
      let fieldsErrorMap = formSyncResult.fieldsErrorMap[this.name] ?? {};
      if (!opts2?.skipFormValidation) {
        for (const group of encompassingGroups) {
          if (group.state.meta.submissionAttempts === 0) continue;
          const { fieldsErrorMap: groupFormErrors } = this.form.validateSync(
            cause,
            {
              group,
              dontUpdateFormErrorMap: true,
              filterFieldNames: (fieldName) => isFieldInGroup(group.name, fieldName)
            }
          );
          fieldsErrorMap = {
            ...fieldsErrorMap,
            ...groupFormErrors[this.name] ?? {}
          };
        }
      }
      const { hasErrored } = this.validateSync(cause, fieldsErrorMap);
      const groupHasErroredWeakMap = /* @__PURE__ */ new WeakMap();
      for (const group of encompassingGroups) {
        const { hasErrored: groupHasErrored } = group.validateSync(
          cause,
          {},
          { skipRelatedFieldValidation: true }
        );
        groupHasErroredWeakMap.set(group, groupHasErrored);
      }
      if (hasErrored && !this.options.asyncAlways) {
        this.getInfo().validationMetaMap[getErrorMapKey(cause)]?.lastAbortController.abort();
        const groupErrors = [];
        for (const group of encompassingGroups) {
          group.getInfo().validationMetaMap[getErrorMapKey(cause)]?.lastAbortController.abort();
          groupErrors.push(group.state.meta.errors);
        }
        return [...this.state.meta.errors, ...groupErrors.flat()];
      }
      const formValidationResultPromise = opts2?.skipFormValidation ? Promise.resolve({}) : this.form.validateAsync(cause);
      const fieldAsyncResults = this.validateAsync(
        cause,
        formValidationResultPromise
      );
      const groupAsyncResults = [];
      for (const group of encompassingGroups) {
        if (groupHasErroredWeakMap.get(group) && !group.options.asyncAlways) {
          continue;
        }
        groupAsyncResults.push(
          group.validateAsync(cause, formValidationResultPromise, {
            skipRelatedFieldValidation: true
          })
        );
      }
      if (groupAsyncResults.length === 0) {
        return fieldAsyncResults;
      }
      return Promise.all([fieldAsyncResults, ...groupAsyncResults]).then(
        (results) => results.flat()
      );
    };
    this.handleChange = (updater) => {
      this.setValue(updater);
    };
    this.handleBlur = () => {
      const prevTouched = this.state.meta.isTouched;
      if (!prevTouched) {
        this.setMeta((prev) => ({ ...prev, isTouched: true }));
      }
      if (!this.state.meta.isBlurred) {
        this.setMeta((prev) => ({ ...prev, isBlurred: true }));
      }
      this.validate("blur");
      this.triggerOnBlurListener();
    };
    this.setErrorMap = (errorMap) => {
      this.setMeta((prev) => ({
        ...prev,
        errorMap: {
          ...prev.errorMap,
          ...errorMap
        }
      }));
    };
    this.parseValueWithSchema = (schema) => {
      return standardSchemaValidators.validate(
        { value: this.state.value, validationSource: "field" },
        schema
      );
    };
    this.parseValueWithSchemaAsync = (schema) => {
      return standardSchemaValidators.validateAsync(
        { value: this.state.value, validationSource: "field" },
        schema
      );
    };
    this.triggerOnBlurListener = () => {
      const formDebounceMs = this.form.options.listeners?.onBlurDebounceMs;
      if (formDebounceMs && formDebounceMs > 0) {
        if (this.timeoutIds.formListeners.blur) {
          clearTimeout(this.timeoutIds.formListeners.blur);
        }
        this.timeoutIds.formListeners.blur = setTimeout(() => {
          this.form.options.listeners?.onBlur?.({
            formApi: this.form,
            fieldApi: this
          });
        }, formDebounceMs);
      } else {
        this.form.options.listeners?.onBlur?.({
          formApi: this.form,
          fieldApi: this
        });
      }
      const fieldDebounceMs = this.options.listeners?.onBlurDebounceMs;
      if (fieldDebounceMs && fieldDebounceMs > 0) {
        if (this.timeoutIds.listeners.blur) {
          clearTimeout(this.timeoutIds.listeners.blur);
        }
        this.timeoutIds.listeners.blur = setTimeout(() => {
          this.options.listeners?.onBlur?.({
            value: this.state.value,
            fieldApi: this
          });
        }, fieldDebounceMs);
      } else {
        this.options.listeners?.onBlur?.({
          value: this.state.value,
          fieldApi: this
        });
      }
    };
    this.triggerOnChangeListener = () => {
      const formDebounceMs = this.form.options.listeners?.onChangeDebounceMs;
      if (formDebounceMs && formDebounceMs > 0) {
        if (this.timeoutIds.formListeners.change) {
          clearTimeout(this.timeoutIds.formListeners.change);
        }
        this.timeoutIds.formListeners.change = setTimeout(() => {
          this.form.options.listeners?.onChange?.({
            formApi: this.form,
            fieldApi: this
          });
        }, formDebounceMs);
      } else {
        this.form.options.listeners?.onChange?.({
          formApi: this.form,
          fieldApi: this
        });
      }
      const fieldDebounceMs = this.options.listeners?.onChangeDebounceMs;
      if (fieldDebounceMs && fieldDebounceMs > 0) {
        if (this.timeoutIds.listeners.change) {
          clearTimeout(this.timeoutIds.listeners.change);
        }
        this.timeoutIds.listeners.change = setTimeout(() => {
          this.options.listeners?.onChange?.({
            value: this.state.value,
            fieldApi: this
          });
        }, fieldDebounceMs);
      } else {
        this.options.listeners?.onChange?.({
          value: this.state.value,
          fieldApi: this
        });
      }
      for (const group of this.form.formGroupApis) {
        if (isFieldInGroup(group.name, this.name)) {
          group.triggerOnChangeListener();
        }
      }
    };
    this.triggerOnSubmitListener = () => {
      this.options.listeners?.onSubmit?.({
        value: this.state.value,
        fieldApi: this
      });
    };
    this.form = opts.form;
    this.name = opts.name;
    this.options = opts;
    this.timeoutIds = {
      validations: {},
      listeners: {},
      formListeners: {}
    };
    this.store = createStore(
      (prevVal) => {
        this.form.store.get();
        const meta = this.form.getFieldMeta(this.name) ?? {
          ...defaultFieldMeta,
          ...opts.defaultMeta
        };
        let value = this.form.getFieldValue(this.name);
        if (!meta.isTouched && value === void 0 && this.options.defaultValue !== void 0 && !evaluate(value, this.options.defaultValue)) {
          value = this.options.defaultValue;
        }
        if (prevVal && prevVal.value === value && prevVal.meta === meta) {
          return prevVal;
        }
        return {
          value,
          meta
        };
      }
    );
  }
  /**
   * The current field state.
   */
  get state() {
    return this.store.state;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (isStandardSchemaValidator(props.validate)) {
      return standardSchemaValidators[props.type](
        props.value,
        props.validate
      );
    }
    return props.validate(props.value);
  }
  /**
   * `@private`
   * Starts tracking an async validation, incrementing the counter and setting isValidating if needed.
   */
  startValidation() {
    this.setMeta((prev) => {
      const newCount = prev._pendingValidationsCount + 1;
      return {
        ...prev,
        _pendingValidationsCount: newCount,
        isValidating: newCount > 0 && !prev.isValidating ? true : prev.isValidating
      };
    });
  }
  /**
   * `@private`
   * Ends tracking an async validation, decrementing the counter and clearing isValidating if no validations remain.
   */
  endValidation() {
    this.setMeta((prev) => {
      const newCount = Math.max(0, prev._pendingValidationsCount - 1);
      return {
        ...prev,
        _pendingValidationsCount: newCount,
        isValidating: newCount === 0 && prev.isValidating ? false : prev.isValidating
      };
    });
  }
}
function normalizeError(rawError) {
  if (rawError) {
    return rawError;
  }
  return void 0;
}
function getErrorMapKey(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "dynamic":
      return "onDynamic";
    case "change":
    default:
      return "onChange";
  }
}
export {
  FieldApi
};
//# sourceMappingURL=FieldApi.js.map
