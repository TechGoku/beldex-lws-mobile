import React from 'react';
import { TransitionProps } from '@mui/material/transitions';
import { styles } from './dialogStyles';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Slide } from '@mui/material';
import BaseButton from '../button/BaseButton';

export interface DialogProps {
  keepMounted: boolean;
  open: boolean;
  onClose: (value?: string) => void
}


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});


export const DialogSlide = (props: any) => {
  const {open, buttonConfig, message, fullWidth, maxWidth} = props;

  return (
    <Box sx={styles.boxWrapper}>
      <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      open={open}
      TransitionComponent={Transition}
      keepMounted
      >
        <DialogTitle>{message && message.title}</DialogTitle>
        <DialogContent>
          {message && message.content}
        </DialogContent>
        <DialogActions>
          {buttonConfig.map((btn: any) => 
          <BaseButton key={btn.id} variant={btn.variant} color={btn.color} cbFunction={btn.handleCallback} label={btn.title}/>)}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

DialogSlide.defaultProps = {
  open: false,
  message: {
    title: '',
    content: ''
  },
  fullWidth: false,
  maxWidth: 'md'
}