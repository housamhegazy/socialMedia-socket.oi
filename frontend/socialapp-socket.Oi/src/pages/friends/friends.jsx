import React from "react";
import {
  Box,
  Typography,
  Grid, // لاستخدام نظام الشبكة (Grid)
  Card, // لاستخدام البطاقات (Cards)
  CardContent,
  CardActions,
  Avatar,
  Button,
  Tooltip,
  Divider,
} from "@mui/material";
import { Person, Send, Close, Group } from "@mui/icons-material";
import { useGetFriendsListQuery, useRemoveFriendMutation } from "../../Api/friendRequistApi/friendRequistApi";
import LoadingPage from "../../components/loadingPage";
import { useNavigate } from "react-router";
import { useCreateChatMutation } from "../../Api/chatApi/chatApi";
import Swal from "sweetalert2";

const FriendsList = () => {
  const navigate = useNavigate();
  //=========================================== handleSendmessage =========================================
  const [createChat] = useCreateChatMutation(); // تم استدعاؤه بالفعل
  const { data: friends = [], isLoading } = useGetFriendsListQuery();
    //============================================== remove friend ===========================================================
    const [removeFriend] =
      useRemoveFriendMutation();
  const handleSendmessage = async (receiverId) => {
    try {
      const newChat = await createChat({
        receiverId: receiverId,
      }).unwrap();
      navigate(`/chatdetails/${newChat._id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnfriend = async (friend) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await removeFriend(friend._id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: `Your friend ${friend.username} has been removed.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("فشل في حذف الصديق:", error);
        Swal.fire({
          title: "Error!",
          text:
            error?.data?.message ||
            "Something went wrong while deleting the post.",
          icon: "error",
        });
      }
    }
  };

  if (isLoading) return <LoadingPage />;
  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        p: 3,
        // backgroundColor: "primary", // خلفية خفيفة
        borderRadius: 4,
      }}
      className="w-full"
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 800,
          color: "#3f51b5",
          textAlign: "right",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        قائمة الأصدقاء ({friends.length}) <Group sx={{ mr: 1, fontSize: 35 }} />
      </Typography>

      <Grid container spacing={4} justifyContent="flex-end">
        {friends.map((friend) => (
          // كل صديق في عمود يأخذ 3 وحدات من أصل 12 (4 بطاقات في الصف الواحد)
          <Grid key={friend._id}>
            <Card
              sx={{
                textAlign: "center",
                p: 2,
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                },
              }}
              className="h-full"
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={friend.avatar || ""}
                  alt={friend.username}
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    border: "4px solid #3f51b5",
                  }}
                >
                  <Person sx={{ fontSize: 60 }} />
                </Avatar>

                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {friend.name}
                </Typography>
                <Divider sx={{ my: 1.5, width: "80%" }} />
                <Typography sx={{ fontWeight: 100 }}>
                  @{friend.username}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: "center", gap: 1, pb: 2 }}>
                {/* زر إرسال رسالة (بدون معالج) */}
                <Tooltip title={`مراسلة ${friend.username}`} placement="bottom">
                  <Button
                    onClick={() => {
                      const receiverId = friend._id;
                      handleSendmessage(receiverId);
                    }}
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<Send />}
                    sx={{
                      borderRadius: 5,
                      width: "45%",
                      textTransform: "none",
                    }}
                  >
                    message
                  </Button>
                </Tooltip>

                {/* زر إزالة صديق (بدون معالج) */}
                <Tooltip title={`delete ${friend.username}`} placement="bottom">
                  <Button
                  onClick={()=>{handleUnfriend(friend)}}
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<Close />}
                    sx={{
                      borderRadius: 5,
                      width: "45%",
                      textTransform: "none",
                    }}
                  >
                    delete
                  </Button>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FriendsList;
