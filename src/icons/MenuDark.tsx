import SvgIcon from "@mui/material/SvgIcon";

const MenuDark = (props: any) => {
  const iconStyles = props.styles ?? {};
  const { fill, ...restStyles } = iconStyles;

  return (
    <SvgIcon
      sx={{
        color: fill ?? "currentColor",
        ...restStyles,
      }}
      viewBox="0 0 23.547 16.483"
    >
      <path
        id="icons8-menu"
        d="M3.177,5a1.177,1.177,0,1,0,0,2.355H24.369a1.177,1.177,0,1,0,0-2.355Zm0,7.064a1.177,1.177,0,1,0,0,2.355H24.369a1.177,1.177,0,1,0,0-2.355Zm0,7.064a1.177,1.177,0,1,0,0,2.355H24.369a1.177,1.177,0,1,0,0-2.355Z"
        transform="translate(-2 -5)"
        fill="currentColor"
      />
    </SvgIcon>
  );
};

export default MenuDark;
