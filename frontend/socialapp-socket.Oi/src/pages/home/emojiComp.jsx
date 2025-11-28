//npm install emoji-picker-react
// npm install material-ui-popup-state
import { IconButton, Popover, Box } from "@mui/material";
import { SentimentSatisfiedOutlined } from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";

export default function EmojiButton({ onSelectEmoji }) {
  return (
    <PopupState variant="popover" popupId="emoji-popup">
      {(popupState) => (
        <>
          <IconButton {...bindTrigger(popupState)}>
            <SentimentSatisfiedOutlined
              sx={{
                fontSize: 20,
                color: (theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.text.secondary
                    : theme.palette.primary.main,
              }}
            />
          </IconButton>

          <Popover
          
            {...bindPopover(popupState)}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
            disableAutoFocus
          >
            <Box sx={{ p: 1 }}>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  onSelectEmoji(emojiData.emoji); // ← بيرجع لك الإيموجي
                  popupState.close();
                }}
                height={350}
                width={300}
              />
            </Box>
          </Popover>
        </>
      )}
    </PopupState>
  );
}
