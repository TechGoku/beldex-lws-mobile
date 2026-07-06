import SvgIcon from "@mui/material/SvgIcon";

const UnCheckRectIcon = (props: any) => {
  return (
    <SvgIcon sx={props.styles} viewBox="0 0 28 28">
      <svg fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1.5 6C1.5 3.51472 3.51472 1.5 6 1.5H22C24.4853 1.5 26.5 3.51472 26.5 6V22C26.5 24.4853 24.4853 26.5 22 26.5H6C3.51472 26.5 1.5 24.4853 1.5 22V6Z"
          stroke="#8787A8"
          strokeWidth="3"
        />
      </svg>
    </SvgIcon>
  );
};

export default UnCheckRectIcon;
