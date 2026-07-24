import SvgIcon from "@mui/material/SvgIcon";

// Monochrome white paper-plane glyph, matching the Discord/Github icons on the
// support page (both are single `fill="white"` glyphs). Previously this was the
// full-colour Telegram badge (blue circle), which stood out from the others.
const TelegramIcon = (props: any) => {
  return (
    <SvgIcon sx={props.sx}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21.94 4.6l-3.03 14.28c-.23 1.01-.83 1.26-1.68.78l-4.64-3.42-2.24 2.16c-.25.25-.46.46-.94.46l.33-4.73L18.63 6.6c.37-.33-.08-.51-.58-.18L7.42 13.06 2.83 11.62c-1-.31-1.02-1 .21-1.48L20.65 3.3c.83-.31 1.56.19 1.29 1.3z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  );
};

export default TelegramIcon;
