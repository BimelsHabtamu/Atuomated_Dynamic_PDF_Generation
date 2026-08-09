import { useState, useCallback } from 'react';

export function useForm(initialValues, validationRules = {}) {
  const [values, setValues]   = useState(initialValues);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((vals = values) => {
    const errs = {};
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = vals[field];
      for (const rule of rules) {
        const msg = rule(value, vals);
        if (msg) { errs[field] = msg; break; }
      }
    });
    return errs;
  }, [values, validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setValues(prev => ({ ...prev, [name]: newVal }));
    if (touched[name]) {
      const errs = validate({ ...values, [name]: newVal });
      setErrors(prev => ({ ...prev, [name]: errs[name] || '' }));
    }
  }, [values, touched, validate]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errs = validate(values);
    setErrors(prev => ({ ...prev, [name]: errs[name] || '' }));
  }, [values, validate]);

  const set = useCallback((key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const validateAll = useCallback(() => {
    const allTouched = Object.keys(validationRules).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(values);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [validate, values, validationRules]);

  return { values, errors, touched, handleChange, handleBlur, set, reset, validateAll, setValues };
}

// Common validators
export const required  = msg => v => (!v || !String(v).trim()) ? (msg || 'This field is required') : '';
export const minLen    = (n, msg) => v => v && v.length < n ? (msg || `Minimum ${n} characters`) : '';
export const email     = msg => v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? (msg || 'Enter a valid email') : '';
export const numeric   = msg => v => v && isNaN(Number(v)) ? (msg || 'Must be a number') : '';
export const minVal    = (n, msg) => v => v && Number(v) < n ? (msg || `Minimum value is ${n}`) : '';
export const maxLen    = (n, msg) => v => v && v.length > n ? (msg || `Maximum ${n} characters`) : '';
export const otpDigits = msg => v => v && !/^\d{6}$/.test(v) ? (msg || 'Must be a 6-digit number') : '';
