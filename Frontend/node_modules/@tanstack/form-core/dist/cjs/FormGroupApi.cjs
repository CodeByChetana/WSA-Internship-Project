"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const store = require("@tanstack/store");
const utils = require("./utils.cjs");
const ValidationLogic = require("./ValidationLogic.cjs");
const standardSchemaValidator = require("./standardSchemaValidator.cjs");
const metaHelper = require("./metaHelper.cjs");
const FieldApi = require("./FieldApi.cjs");
function getDefaultFormGroupState(defaultState) {
  return {
    isSubmitted: defaultState.isSubmitted ?? false,
    isSubmitting: defaultState.isSubmitting ?? false,
    isValidating: defaultState.isValidating ?? false,
    submissionAttempts: defaultState.submissionAttempts ?? 0,
    isSubmitSuccessful: defaultState.isSubmitSuccessful ?? false
  };
}
function getDefaultFormGroupMeta(defaultMeta) {
  return {
    ...metaHelper.defaultFieldMeta,
    ...defaultMeta,
    errors: [],
    isPristine: true,
    isValid: true,
    isDefaultValue: true,
    isFieldsValidating: false,
    isFieldsValid: true,
    isGroupValid: true,
    canSubmit: true,
    isSubmitting: false,
    isSubmitted: false,
    isValidating: false,
    submissionAttempts: 0,
    isSubmitSuccessful: false
  };
}
class FormGroupApi {
  constructor(opts) {
    this.options = {};
    this.setFormGroupState = (updater) => {
      this.form.baseStore.setState((prev) => {
        const prevGroupState = prev.formGroupStateBase[this.name] ?? getDefaultFormGroupState({});
        return {
          ...prev,
          formGroupStateBase: {
            ...prev.formGroupStateBase,
            [this.name]: updater(prevGroupState)
          }
        };
      });
    };
    this._lastDistributedFieldNames = {};
    this.update = (opts2) => {
      this.options = opts2;
      this.name = opts2.name;
      if (!this.state.meta.isTouched && this.options.defaultValue !== void 0) {
        const formField = this.form.getFieldValue(this.name);
        if (!utils.evaluate(formField, opts2.defaultValue)) {
          this.form.setFieldValue(this.name, opts2.defaultValue, {
            dontUpdateMeta: true,
            dontValidate: true,
            dontRunListeners: true
          });
        }
      }
      if (!this.form.getFieldMeta(this.name)) {
        this.form.setFieldMeta(this.name, {
          ...metaHelper.defaultFieldMeta,
          ...this.options.defaultMeta
        });
      }
    };
    this.mount = () => {
      this.update(this.options);
      this.form.formGroupApis.add(this);
      this.fieldInfo.instance = this;
      this.form.baseStore.setState((prev) => ({
        ...prev,
        formGroupStateBase: {
          ...prev.formGroupStateBase,
          [this.name]: prev.formGroupStateBase[this.name] ?? getDefaultFormGroupState({
            ...this.options.defaultState
          })
        }
      }));
      const { onMount } = this.options.validators || {};
      if (onMount) {
        const rawError = this.runValidator({
          validate: onMount,
          value: {
            value: this.state.value,
            groupApi: this,
            validationSource: "form"
          },
          type: "validate"
        });
        let groupOwnRawError = rawError;
        let groupFieldErrors = void 0;
        if (isGlobalGroupValidationError(rawError)) {
          groupOwnRawError = rawError.group;
          groupFieldErrors = rawError.fields;
        }
        const error = normalizeError(groupOwnRawError);
        if (error) {
          this.setMeta(
            (prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                onMount: error
              },
              errorSourceMap: {
                ...prev.errorSourceMap,
                onMount: "field"
              }
            })
          );
        }
        this.distributeFieldErrors("onMount", groupFieldErrors);
      }
      this.options.listeners?.onMount?.({
        value: this.state.value,
        groupApi: this
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
        if (this.fieldInfo.instance !== this) return;
        for (const [key, validationMeta] of Object.entries(
          this.fieldInfo.validationMetaMap
        )) {
          validationMeta?.lastAbortController.abort();
          this.fieldInfo.validationMetaMap[key] = void 0;
        }
        this.form.formGroupApis.delete(this);
        this.form.baseStore.setState((prev) => ({
          ...prev,
          formGroupStateBase: {
            ...prev.formGroupStateBase,
            [this.name]: getDefaultFormGroupState({})
          }
        }));
        this.fieldInfo.instance = null;
        this.options.listeners?.onUnmount?.({
          value: this.state.value,
          groupApi: this
        });
      };
    };
    this.setValue = (updater, options) => {
      this.form.setFieldValue(
        this.name,
        updater,
        utils.mergeOpts(options, { dontRunListeners: true, dontValidate: true })
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
    this.getInfo = () => this.fieldInfo;
    this.getRelatedFields = () => {
      const fields = Object.values(this.form.fieldInfo);
      const relatedFields = [];
      for (const field of fields) {
        if (!field.instance) continue;
        if (!(field.instance instanceof FieldApi.FieldApi)) continue;
        if (field.instance.name.startsWith(this.name)) {
          relatedFields.push(field.instance);
        }
      }
      return relatedFields;
    };
    this.getRelatedFieldMetasDerived = () => {
      const fields = Object.entries(this.form.fieldMetaDerived.state);
      const relatedFieldMetas = [];
      for (const [fieldName, fieldMeta] of fields) {
        if (fieldName === this.name) continue;
        if (utils.isFieldInGroup(this.name, fieldName)) {
          relatedFieldMetas.push({ ...fieldMeta, name: fieldName });
        }
      }
      return relatedFieldMetas;
    };
    this.buildChildFieldName = (relativeName) => {
      if (relativeName === "") return this.name;
      if (relativeName.startsWith("[")) return `${this.name}${relativeName}`;
      return `${this.name}.${relativeName}`;
    };
    this.distributeFieldErrors = (errorMapKey, fieldErrors) => {
      const previousNames = this._lastDistributedFieldNames[errorMapKey] ?? /* @__PURE__ */ new Set();
      const currentNames = /* @__PURE__ */ new Set();
      if (fieldErrors) {
        for (const [relativeName, err] of Object.entries(fieldErrors)) {
          if (err === void 0 || err === null || err === false) continue;
          currentNames.add(this.buildChildFieldName(relativeName));
        }
      }
      const allNames = /* @__PURE__ */ new Set([...previousNames, ...currentNames]);
      let hasErrored = false;
      for (const fullName of allNames) {
        const relativeName = fullName.startsWith(this.name + "[") ? fullName.slice(this.name.length) : fullName.slice(this.name.length + 1);
        const newFormValidatorError = fieldErrors?.[relativeName];
        const fieldMeta = this.form.getFieldMeta(fullName);
        if (!fieldMeta && !newFormValidatorError) continue;
        const previousErrorValue = fieldMeta?.errorMap[errorMapKey];
        const isPreviousErrorFromFormValidator = fieldMeta?.errorSourceMap[errorMapKey] === "form";
        const { newErrorValue, newSource } = utils.determineFormLevelErrorSourceAndValue({
          newFormValidatorError,
          isPreviousErrorFromFormValidator,
          previousErrorValue
        });
        if (newErrorValue) hasErrored = true;
        if (previousErrorValue === newErrorValue && fieldMeta?.errorSourceMap[errorMapKey] === newSource) {
          continue;
        }
        this.form.setFieldMeta(fullName, (prev = metaHelper.defaultFieldMeta) => ({
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
      this._lastDistributedFieldNames[errorMapKey] = currentNames;
      return hasErrored;
    };
    this.validateSync = (cause, errorFromForm, opts2 = {}) => {
      const validates = utils.getSyncValidatorArray(cause, {
        ...this.options,
        form: this.form,
        group: this,
        validationLogic: this.options.validationLogic || this.form.options.validationLogic || ValidationLogic.defaultValidationLogic
      });
      const relatedFields = opts2.skipRelatedFieldValidation ? [] : this.getRelatedFields();
      const relatedFieldValidates = relatedFields.reduce(
        (acc, field) => {
          const fieldValidates = utils.getSyncValidatorArray(cause, {
            ...field.options,
            form: field.form,
            validationLogic: field.form.options.validationLogic || ValidationLogic.defaultValidationLogic
          });
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      let hasErrored = false;
      store.batch(() => {
        const validateFieldOrGroupFn = (fieldOrGroup, validateObj) => {
          const errorMapKey = getErrorMapKey(validateObj.cause);
          const isGroup = fieldOrGroup === this;
          let rawError = void 0;
          if (validateObj.validate) {
            rawError = fieldOrGroup.runValidator({
              validate: validateObj.validate,
              value: {
                value: fieldOrGroup.store.state.value,
                // For the group's own validators we want standard schemas to
                // produce a `{ form, fields }` shape (with relative keys) so
                // we can fan errors out to children. Field-level validators on
                // related fields keep the regular field source.
                validationSource: isGroup ? "form" : "field",
                ...fieldOrGroup instanceof FormGroupApi ? {
                  groupApi: fieldOrGroup
                } : { fieldApi: fieldOrGroup }
              },
              type: "validate"
            });
          }
          let groupOwnRawError = rawError;
          let groupFieldErrors = void 0;
          if (isGroup && isGlobalGroupValidationError(rawError)) {
            groupOwnRawError = rawError.group;
            groupFieldErrors = rawError.fields;
          }
          const fieldLevelError = normalizeError(
            groupOwnRawError
          );
          const formLevelError = errorFromForm[errorMapKey];
          const { newErrorValue, newSource } = utils.determineFieldLevelErrorSourceAndValue({
            formLevelError,
            fieldLevelError
          });
          if (fieldOrGroup.state.meta.errorMap?.[errorMapKey] !== newErrorValue) {
            fieldOrGroup.setMeta((prev) => ({
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
          if (isGroup) {
            const distributedHasErrored = this.distributeFieldErrors(
              errorMapKey,
              groupFieldErrors
            );
            if (distributedHasErrored) {
              hasErrored = true;
            }
          }
        };
        for (const validateObj of validates) {
          validateFieldOrGroupFn(this, validateObj);
        }
        for (const fieldValidateObj of relatedFieldValidates) {
          if (!fieldValidateObj.validate) continue;
          validateFieldOrGroupFn(fieldValidateObj.field, fieldValidateObj);
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
    this.validateAsync = async (cause, formValidationResultPromise, opts2 = {}) => {
      const validates = utils.getAsyncValidatorArray(cause, {
        ...this.options,
        form: this.form,
        group: this,
        validationLogic: this.options.validationLogic || this.form.options.validationLogic || ValidationLogic.defaultValidationLogic
      });
      const asyncFormValidationResults = await formValidationResultPromise;
      const relatedFields = opts2.skipRelatedFieldValidation ? [] : this.getRelatedFields();
      const relatedFieldValidates = relatedFields.reduce(
        (acc, field) => {
          const fieldValidates = utils.getAsyncValidatorArray(cause, {
            ...field.options,
            form: field.form,
            validationLogic: field.form.options.validationLogic || ValidationLogic.defaultValidationLogic
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
      const hasAsyncValidators = validates.some((v) => v.validate) || relatedFieldValidates.some((v) => v.validate);
      if (hasAsyncValidators) {
        if (!this.state.meta.isValidating) {
          this.setMeta((prev) => ({ ...prev, isValidating: true }));
        }
        for (const linkedField of relatedFields) {
          linkedField.setMeta((prev) => ({ ...prev, isValidating: true }));
        }
      }
      const validateFieldOrGroupAsyncFn = (fieldOrGroup, validateObj, promises) => {
        const errorMapKey = getErrorMapKey(validateObj.cause);
        const fieldInfo = fieldOrGroup.getInfo();
        const fieldValidatorMeta = fieldInfo.validationMetaMap[errorMapKey];
        fieldValidatorMeta?.lastAbortController.abort();
        const controller = new AbortController();
        fieldInfo.validationMetaMap[errorMapKey] = {
          lastAbortController: controller
        };
        const isGroup = fieldOrGroup === this;
        promises.push(
          new Promise(async (resolve) => {
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                if (fieldOrGroup.timeoutIds.validations[validateObj.cause]) {
                  clearTimeout(
                    fieldOrGroup.timeoutIds.validations[validateObj.cause]
                  );
                }
                fieldOrGroup.timeoutIds.validations[validateObj.cause] = setTimeout(async () => {
                  if (controller.signal.aborted) return rawResolve(void 0);
                  try {
                    rawResolve(
                      await this.runValidator({
                        validate: validateObj.validate,
                        value: {
                          value: fieldOrGroup.store.state.value,
                          signal: controller.signal,
                          // See sync counterpart: produce `{ form, fields }`
                          // from standard schemas attached to the group so we
                          // can fan errors out to children.
                          validationSource: isGroup ? "form" : "field",
                          ...fieldOrGroup instanceof FormGroupApi ? {
                            groupApi: fieldOrGroup
                          } : { fieldApi: fieldOrGroup }
                        },
                        type: "validateAsync"
                      })
                    );
                  } catch (e) {
                    rawReject(e);
                  }
                }, validateObj.debounceMs);
              });
            } catch (e) {
              rawError = e;
            }
            if (controller.signal.aborted) return resolve(void 0);
            let groupOwnRawError = rawError;
            let groupFieldErrors = void 0;
            if (isGroup && isGlobalGroupValidationError(rawError)) {
              groupOwnRawError = rawError.group;
              groupFieldErrors = rawError.fields;
            }
            const fieldLevelError = normalizeError(groupOwnRawError);
            const formLevelError = asyncFormValidationResults[fieldOrGroup.name]?.[errorMapKey];
            const { newErrorValue, newSource } = utils.determineFieldLevelErrorSourceAndValue({
              formLevelError,
              fieldLevelError
            });
            if (fieldOrGroup.getInfo().instance !== fieldOrGroup) {
              return resolve(void 0);
            }
            fieldOrGroup.setMeta((prev) => {
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
            if (isGroup) {
              this.distributeFieldErrors(errorMapKey, groupFieldErrors);
            }
            resolve(newErrorValue);
          })
        );
      };
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        validateFieldOrGroupAsyncFn(this, validateObj, validatesPromises);
      }
      for (const fieldValitateObj of relatedFieldValidates) {
        if (!fieldValitateObj.validate) continue;
        validateFieldOrGroupAsyncFn(
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
      if (hasAsyncValidators) {
        this.setMeta((prev) => ({ ...prev, isValidating: false }));
        for (const linkedField of relatedFields) {
          linkedField.setMeta((prev) => ({ ...prev, isValidating: false }));
        }
      }
      return results.filter(Boolean);
    };
    this.validateAllFields = async (cause) => {
      const fieldValidationPromises = [];
      store.batch(() => {
        void Object.values(this.getRelatedFields()).forEach((fieldInstance) => {
          fieldValidationPromises.push(
            // Remember, `validate` is either a sync operation or a promise
            Promise.resolve().then(
              () => fieldInstance.validate(cause, {
                skipFormValidation: true,
                skipGroupValidation: true
              })
            )
          );
          if (!fieldInstance.store.state.meta.isTouched) {
            fieldInstance.setMeta((prev) => ({ ...prev, isTouched: true }));
          }
        });
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateArrayFieldsStartingFrom = (field, index, cause) => {
      return this.form.validateArrayFieldsStartingFrom(field, index, cause);
    };
    this.validateField = (field, cause) => {
      return this.form.validateField(field, cause);
    };
    this.getFieldValue = (field) => {
      return this.form.getFieldValue(field);
    };
    this.getFieldMeta = (field) => {
      return this.form.getFieldMeta(field);
    };
    this.setFieldMeta = (field, updater) => {
      return this.form.setFieldMeta(field, updater);
    };
    this.setFieldValue = (field, value) => {
      return this.form.setFieldValue(field, value);
    };
    this.deleteField = (field) => {
      return this.form.deleteField(field);
    };
    this.pushFieldValue = (field, value) => {
      return this.form.pushFieldValue(field, value);
    };
    this.insertFieldValue = (field, index, value) => {
      return this.form.insertFieldValue(field, index, value);
    };
    this.replaceFieldValue = (field, index, value) => {
      return this.form.replaceFieldValue(field, index, value);
    };
    this.swapFieldValues = (field, index1, index2) => {
      return this.form.swapFieldValues(field, index1, index2);
    };
    this.moveFieldValues = (field, fromIndex, toIndex) => {
      return this.form.moveFieldValues(field, fromIndex, toIndex);
    };
    this.clearFieldValues = (field) => {
      return this.form.clearFieldValues(field);
    };
    this.resetField = (field) => {
      return this.form.resetField(field);
    };
    this.removeFieldValue = (field, index) => {
      return this.form.removeFieldValue(field, index);
    };
    this.areRelatedFieldsValid = () => {
      return Object.values(this.getRelatedFields()).every(
        (field) => field.state.meta.isValid
      );
    };
    this.validate = (cause, opts2) => {
      const { fieldsErrorMap } = opts2?.skipFormValidation ? { fieldsErrorMap: {} } : this.form.validateSync(cause, {
        dontUpdateFormErrorMap: true,
        filterFieldNames: (fieldName) => utils.isFieldInGroup(this.name, fieldName)
      });
      const { hasErrored } = this.validateSync(
        cause,
        fieldsErrorMap[this.name] ?? {},
        { skipRelatedFieldValidation: opts2?.skipRelatedFieldValidation }
      );
      if (hasErrored && !this.options.asyncAlways) {
        this.getInfo().validationMetaMap[getErrorMapKey(cause)]?.lastAbortController.abort();
        return this.state.meta.errors;
      }
      const formValidationResultPromise = opts2?.skipFormValidation ? Promise.resolve({}) : this.form.validateAsync(cause, {
        dontUpdateFormErrorMap: true,
        filterFieldNames: (fieldName) => utils.isFieldInGroup(this.name, fieldName)
      });
      return this.validateAsync(cause, formValidationResultPromise, {
        skipRelatedFieldValidation: opts2?.skipRelatedFieldValidation
      });
    };
    this.triggerOnChangeListener = () => {
      const formDebounceMs = this.form.options.listeners?.onChangeGroupDebounceMs;
      if (formDebounceMs && formDebounceMs > 0) {
        if (this.timeoutIds.formListeners.change) {
          clearTimeout(this.timeoutIds.formListeners.change);
        }
        this.timeoutIds.formListeners.change = setTimeout(() => {
          this.form.options.listeners?.onChangeGroup?.({
            formApi: this.form,
            groupApi: this
          });
        }, formDebounceMs);
      } else {
        this.form.options.listeners?.onChangeGroup?.({
          formApi: this.form,
          groupApi: this
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
            groupApi: this
          });
        }, fieldDebounceMs);
      } else {
        this.options.listeners?.onChange?.({
          value: this.state.value,
          groupApi: this
        });
      }
    };
    this.triggerOnSubmitListener = () => {
      this.options.listeners?.onSubmit?.({
        value: this.state.value,
        groupApi: this
      });
    };
    this._handleSubmit = async (submitMeta) => {
      this.setFormGroupState((old) => ({
        ...old,
        // Submission attempts mark the form as not submitted
        isSubmitted: false,
        // Count submission attempts
        submissionAttempts: old.submissionAttempts + 1,
        isSubmitSuccessful: false
        // Reset isSubmitSuccessful at the start of submission
      }));
      store.batch(() => {
        void Object.values(this.getRelatedFields()).forEach((field) => {
          if (!field.state.meta.isTouched) {
            field.setMeta((prev) => ({ ...prev, isTouched: true }));
          }
        });
      });
      const submitMetaArg = submitMeta ?? this.options.onSubmitMeta;
      this.setFormGroupState((d) => ({ ...d, isSubmitting: true }));
      const done = () => {
        this.setFormGroupState((prev) => ({ ...prev, isSubmitting: false }));
      };
      await this.validateAllFields("submit");
      if (!this.areRelatedFieldsValid()) {
        done();
        this.options.onGroupSubmitInvalid?.({
          value: this.state.value,
          groupApi: this,
          meta: submitMetaArg
        });
        return;
      }
      await this.validate("submit", {
        // This has already happened in the previous step
        skipRelatedFieldValidation: true
      });
      if (!this.areRelatedFieldsValid() || !this.state.meta.isValid) {
        done();
        this.options.onGroupSubmitInvalid?.({
          value: this.state.value,
          groupApi: this,
          meta: submitMetaArg
        });
        return;
      }
      store.batch(() => {
        void Object.values(this.getRelatedFields()).forEach((field) => {
          field.options.listeners?.onGroupSubmit?.({
            value: field.state.value,
            fieldApi: field
          });
        });
      });
      this.options.listeners?.onSubmit?.({
        groupApi: this,
        value: this.state.value
      });
      try {
        await this.options.onGroupSubmit?.({
          value: this.state.value,
          groupApi: this,
          meta: submitMetaArg
        });
        store.batch(() => {
          this.setFormGroupState((prev) => ({
            ...prev,
            isSubmitted: true,
            isSubmitSuccessful: true
            // Set isSubmitSuccessful to true on successful submission
          }));
          done();
        });
      } catch (err) {
        this.setFormGroupState((prev) => ({
          ...prev,
          isSubmitSuccessful: false
          // Ensure isSubmitSuccessful is false if an error occurs
        }));
        done();
        throw err;
      }
    };
    this.form = opts.form;
    this.name = opts.name;
    this.options = opts;
    this.timeoutIds = {
      validations: {},
      listeners: {},
      formListeners: {}
    };
    this.fieldInfo = {
      instance: null,
      validationMetaMap: {
        onChange: void 0,
        onBlur: void 0,
        onSubmit: void 0,
        onMount: void 0,
        onServer: void 0,
        onDynamic: void 0
      }
    };
    this.store = store.createStore(
      (prevVal) => {
        this.form.formGroupMetaDerived.get();
        this.form.baseStore.get();
        const meta = this.form.getFormGroupMeta(this.name) ?? getDefaultFormGroupMeta(opts.defaultMeta);
        let value = this.form.getFieldValue(this.name);
        if (!meta.isTouched && value === void 0 && this.options.defaultValue !== void 0 && !utils.evaluate(value, this.options.defaultValue)) {
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
    this.handleSubmit = this.handleSubmit.bind(this);
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
    if (standardSchemaValidator.isStandardSchemaValidator(props.validate)) {
      const result = standardSchemaValidator.standardSchemaValidators[props.type](
        props.value,
        props.validate
      );
      if (props.type === "validate") {
        return remapStandardSchemaResultForGroup(result);
      }
      return result.then(
        remapStandardSchemaResultForGroup
      );
    }
    return props.validate(
      props.value
    );
  }
  handleSubmit(submitMeta) {
    return this._handleSubmit(submitMeta);
  }
}
function normalizeError(rawError) {
  if (rawError) {
    return rawError;
  }
  return void 0;
}
function isGlobalGroupValidationError(error) {
  return !!error && typeof error === "object" && "fields" in error;
}
function remapStandardSchemaResultForGroup(result) {
  if (!result || typeof result !== "object") return result;
  if (!("form" in result) && !("fields" in result)) return result;
  const { form, fields, ...rest } = result;
  return { ...rest, group: form, fields };
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
exports.FormGroupApi = FormGroupApi;
exports.getDefaultFormGroupMeta = getDefaultFormGroupMeta;
//# sourceMappingURL=FormGroupApi.cjs.map
