import { useState, useEffect, useRef } from "react";
import {
  TextField,
  List,
  ListItem,
  Avatar,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useSearchUsersQuery } from "../Api/user/userApi";

const SearchUsers = () => {

  const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(""); // 🕒 متغير للتأخير
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

  // 🕒 تأخير إرسال الـ query لمدة 500ms بعد توقف الكتابة
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);
  const { data: results = [], isLoading } = useSearchUsersQuery(debouncedQuery,{
    skip: debouncedQuery.trim() === "",   // هنا بنستخدم skip لتجنب الفetch لما يكون البحث فاضي

  });

  // غلق القائمة عند الضغط خارج المكون
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{ position: "relative", width: 320, maxWidth: "100%",p:2 }}
    >
      <TextField
        size="small"
        placeholder="search for users ..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        fullWidth
        InputProps={{
          endAdornment: isLoading && (
            <CircularProgress size={18} sx={{ color: "text.secondary" }} />
          ),
        }}
      />

      {isFocused && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 1,
            mt: 1,
            maxHeight: 300,
            overflowY: "auto",
            zIndex: 10,
          }}
        >
          {isLoading ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <CircularProgress size={22} />
            </Box>
          ) : results.length > 0 ? (
            <List>
              {results.map((user) => (
                <ListItem
                  key={user._id}
                  component="a"
                  href={`/user/${user.username}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1,
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Avatar
                    src={user.profilePicture}
                    alt={user.username}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {user.name || "بدون اسم"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: 13 }}
                    >
                      @{user.username}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : query.trim() !== "" ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ p: 2, textAlign: "center" }}
            >
              لا توجد نتائج مطابقة
            </Typography>
          ) : null}
        </Box>
      )}
    </Box>
  );
};

export default SearchUsers;

