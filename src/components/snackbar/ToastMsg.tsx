// SnackbarComponent.tsx
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';


export interface ToastMsgRef {
  showAlert: (message: string, severity: AlertProps['severity']) => void;
}

const ToastMsg: React.ForwardRefRenderFunction<ToastMsgRef> = (_, ref) => {
   const theme=useTheme()
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [severity, setSeverity] = useState<string>('success');
  const vertical = 'bottom';
    const  horizontal ='center';


  const colorSelector=(status:String)=>{
   if(status==='success')
   {
    return "#00AD07"
   }
   if(status==='error')
   {
    return "#FC2727"
   }
  }
  const handleClose = () => {
    setOpen(false);
  };

  const showAlert = (newMessage: string, newSeverity:string='success') => {
    setMessage(newMessage);
    setSeverity(newSeverity);
    setOpen(true);
  };

  useImperativeHandle(ref, () => ({
    showAlert,
  }));

  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}   anchorOrigin={{ vertical,horizontal }} >
      {/* <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          This is a success message!
        </Alert> */}
        <Box sx={{backgroundColor:theme.palette.mode==="dark"?'#242433':"#F0F0F0",padding:'10px 20px',borderRadius:'10px'}} display={'flex'} flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
       {/* <Typography>{message}</Typography> */}
      {severity === "success" && <CheckCircleIcon sx={{color:'#00AD07',mr:'5px',fontSize:'1.2rem'}} />}
      {severity === "error" && <ReportProblemIcon sx={{color:'#FC2727',mr:'5px',fontSize:'1.2rem'}}/>}
       <Typography sx={{fontWeight:'500',fontSize:'1.1rem',color:colorSelector(severity)}}>{message}</Typography>

       {/* <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton> */}
       
        </Box>
    </Snackbar>
  );
};

export default forwardRef(ToastMsg);
