import React from 'react'
import { FieldValues, UseFormRegister, Validate } from 'react-hook-form'

import styles from './index.module.scss';

type Props = {
  name: string
  label: string
  register: UseFormRegister<FieldValues & any>
  required?: boolean
  error: any
  type?: 'text' | 'number' | 'password' | 'email'
  validate?: (value: string) => boolean | string
  disabled?: boolean
}

export const Input: React.FC<Props> = ({
  name,
  label,
  required,
  register,
  error,
  type = 'text',
  validate,
  disabled,
}) => {
  return (
    <div>
      <label htmlFor={name} className={styles.formLabel}>
        {label}
        {required ? <span>&nbsp;*</span> : ''}
      </label>
      <input
        className={`${styles.formInput} ${error ? styles.error : ''}`}
        {...{ type }}
        {...register(name, {
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
        })}
        disabled={disabled}
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