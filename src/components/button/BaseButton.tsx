import React from 'react';
import { Button } from '@mui/material';
const BaseButton = ({ cbFunction, variant, label, disabled, color, size, startIcon }: any) => {
  return (
    <Button variant={variant} disabled={disabled} color={color} size={size} startIcon={startIcon} onClick={cbFunction}>{label}</Button>
  )
}

BaseButton.defaultProps = {
  variant: 'contained',
  disabled: false,
  color: 'primary',
  size: 'medium',
  cbFunction: () => {},
  label: ''
}

export default BaseButton;
