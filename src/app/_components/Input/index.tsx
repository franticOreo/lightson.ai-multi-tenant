import React from 'react'
import { FieldValues, UseFormRegister, Validate } from 'react-hook-form'

import styles from './index.module.scss';

type Props = {
  name: string
  label: string
  value?: string
  register?: UseFormRegister<FieldValues & any>
  required?: boolean
  error?: any
  type?: 'text' | 'number' | 'password' | 'email'
  validate?: (value: string) => boolean | string
  disabled?: boolean,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const Input: React.FC<Props> = ({
  name,
  label,
  value = '',
  required,
  register,
  error,
  type = 'text',
  validate,
  disabled,
  onChange,
}) => {
  const registerProps = register
    ? register(name, {
        required,
        validate,
        ...(type === 'email'
          ? {
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Please enter a valid email',
              },
            }
          : {}),
      })
    : {};

  return (
    <div>
      <label htmlFor={name} className={styles.formLabel}>
        {label}
        {required ? <span>&nbsp;*</span> : ''}
      </label>
      <input
        className={`${styles.formInput} ${error ? styles.error : ''}`}
        {...{ type }}
        {...registerProps}
        defaultValue={value}
        disabled={disabled}
        onChange={onChange}
      />
      {error && (
        <div className={styles.errorMessage}>
          {!error?.message && error?.type === 'required'
            ? 'This field is required'
            : error?.message}
        </div>
      )}
    </div>
  )
}