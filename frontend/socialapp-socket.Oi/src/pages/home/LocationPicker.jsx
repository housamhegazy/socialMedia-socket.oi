import { useState } from "react";
import {
  Dialog,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  useTheme,
} from "@mui/material";
import axios from "axios";

export default function LocationPicker({ open, onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const theme = useTheme();
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete`,
        {
          params: {
            text: value,
            // @ts-ignore
            apiKey: import.meta.env.VITE_GEO_API_KEY, // 👈 API KEY هنا
          },
        }
      );

      setResults(res.data.features);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="ابحث عن مدينة..."
          value={search}
          onChange={handleSearch}
        />

        {loading && <CircularProgress sx={{ mt: 2 }} />}

        {!loading && (
          <List>
            {results.map((loc) => (
              <ListItem
                component="button"
                key={loc.properties.place_id}
                onClick={() => {
                  onSelect({
                    city: loc.properties.city || loc.properties.formatted,
                    lat: loc.properties.lat,
                    lng: loc.properties.lon, // ✔️ (lon) = (lng)
                  });
                  onClose();
                }}
                sx={{
                  cursor: "pointer",
                  textAlign: "left",
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <ListItemText
                  primary={loc.properties.city || loc.properties.formatted}
                  secondary={loc.properties.country}
                  primaryTypographyProps={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "text.primary",
                  }}
                  secondaryTypographyProps={{
                    fontSize: "12px",
                    color: "text.secondary",
                    mt: "2px",
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Dialog>
  );
}
