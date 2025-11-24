import React, { useRef, useEffect, useState, useCallback } from "react";
import { useSocket } from "../../Api/notifications/context/SocketContext";
import { useSelector } from "react-redux";
import { Button, Box, Typography } from "@mui/material";

const STUN_SERVERS = {
  iceServers:[
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

const CallComponent = ({ targetUserId }) => {
  const socket = useSocket();
  // @ts-ignore
  const { user: currentUser } = useSelector((state) => state.auth);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  const [callStatus, setCallStatus] = useState("idle"); // idle, ringing, calling, connected
  const incomingOfferRef = useRef(null);
  const [openVedioCallCard, setopenVedioCallCard] = useState(false);
   useEffect(() => {
    if (socket && currentUser?._id) {
      socket.emit("join_call", { userId: currentUser._id });
    }
  }, [socket, currentUser]);
  // -----------------------------------------------------
  // 1. إدارة الوسائط (Local Stream)
  // -----------------------------------------------------

  const setupLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;
      return stream;
    } catch (error) {
      console.error("Error accessing media devices: ", error);
      setCallStatus("error");
      alert(`Media access failed: ${error.name} - ${error.message}`); // تنبيه للمستخدم
      return null;
    }
  };

  // -----------------------------------------------------
  // 2. إدارة PeerConnection (WebRTC)
  // -----------------------------------------------------

  const initializePeerConnection = (stream) => {
    peerConnection.current = new RTCPeerConnection(STUN_SERVERS);

    // إضافة البث المحلي لـ PeerConnection
    stream
      .getTracks()
      .forEach((track) => peerConnection.current.addTrack(track, stream));

    // استقبال البث من الطرف الآخر
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current.srcObject !== event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // تبادل ICE Candidates عبر السوكيت
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("send_ice_candidate", {
          targetUserId: targetUserId,
          candidate: event.candidate,
        });
      }
    };
  };

  // -----------------------------------------------------
  // 3. وظائف المكالمات (Call Functions)
  // -----------------------------------------------------

  // أ. بدء المكالمة
  const startCall = useCallback(async () => {
    setopenVedioCallCard(true);
    const stream = await setupLocalMedia();
    if (!stream) return;

    initializePeerConnection(stream);

    // إنشاء الـ Offer وإرساله
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("send_offer", {
      targetUserId: targetUserId,
      offer: offer,
    });

    setCallStatus("calling");
  }, [socket, targetUserId]);

  // ب. إنهاء المكالمة
  const endCall = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }

    socket.emit("call-end", { targetUserId: targetUserId });
    setCallStatus("idle");
    setopenVedioCallCard(false); //close video box
  }, [socket, targetUserId]);

  // ج. الرد على المكالمة
  const answerCall = useCallback(
    async (offer) => {
      const stream = await setupLocalMedia();
      if (!stream) return;

      initializePeerConnection(stream);

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("send_answer", {
        targetUserId: targetUserId,
        answer: answer,
      });
      setopenVedioCallCard(true); // open videobox
      setCallStatus("connected");
    },
    [socket, targetUserId]
  );

  // -----------------------------------------------------
  // 4. إدارة أحداث السوكيت (Call Signaling)
  // -----------------------------------------------------
  useEffect(() => {
    if (!socket || !currentUser) return;

    // المتغير لتخزين الـ Offer الوارد
    // let incomingOffer = null;

    // أ. استقبال مكالمة واردة
    const handleIncomingCall = ({ offer }) => {
      setCallStatus("ringing");
      incomingOfferRef.current = offer;
      setopenVedioCallCard(true);
      console.log(`Incoming call received from: (offer)`);
    };

    // ب. استقبال الـ Answer من المتلقي
    const handleAnswerReceived = async ({ answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        setCallStatus("connected");
      }
      setopenVedioCallCard(true);
    };

    // ج. استقبال الـ ICE Candidate
    const handleIceCandidateReceived = async ({ candidate }) => {
      if (peerConnection.current && candidate) {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    };

    // د. إنهاء المكالمة من الطرف الآخر
    const handleCallEndedByPeer = () => {
      endCall(); // استخدام دالة الإنهاء المحلية
      setopenVedioCallCard(false);
    };

    socket.on("receive_offer", handleIncomingCall);
    socket.on("receive_answer", handleAnswerReceived);
    socket.on("receive_ice_candidate", handleIceCandidateReceived);
    socket.on("call-ended-by-peer", handleCallEndedByPeer);

    return () => {
      socket.off("receive_offer", handleIncomingCall);
      socket.off("receive_answer", handleAnswerReceived);
      socket.off("receive_ice_candidate", handleIceCandidateReceived);
      socket.off("call-ended-by-peer", handleCallEndedByPeer);
    };
  }, [socket, targetUserId, endCall, currentUser]); // *إضافة endCall إلى dependencies*

  // -----------------------------------------------------
  // 5. العرض (Render)
  // -----------------------------------------------------

  const handleAnswerClick = () => {
    const offerToAnswer = incomingOfferRef.current;

    if (offerToAnswer) {
      answerCall(offerToAnswer);
      // مسح الـ Offer بعد الرد
      incomingOfferRef.current = null;
    }
  };

  return (
    <Box sx={{ p: 2, border: "1px solid #ccc", mt: 2 }}>
      <Typography variant="h6">call status : {callStatus}</Typography>
      {openVedioCallCard && (
        <Box sx={{width:"100%",display:"flex",justifyContent:"center",flexDirection:"column",zIndex:"1000",alignItems:"center"}}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            style={{
              width: "80%",
              height: "20vh",
              backgroundColor: "#000",
              margin: "5px",
            }}
          />

          {/* فيديو الطرف البعيد */}
          <video
            ref={remoteVideoRef}
            autoPlay
            style={{
              width: "80%",
              height: "20vh",
            
              backgroundColor: "#333",
              margin: "5px",
            }}
          />
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        {(callStatus === "idle" || callStatus === "error") && (
          <Button
            variant="contained"
            color="primary"
            onClick={startCall}
            disabled={!targetUserId || !socket}
          >
            start call
          </Button>
        )}

        {callStatus === "ringing" && (
          <>
            <Typography color="secondary">مكالمة واردة...</Typography>
            <Button
              variant="contained"
              color="success"
              onClick={handleAnswerClick}
              sx={{ mr: 1 }}
            >
              accept
            </Button>
          </>
        )}

        {(callStatus === "calling" || callStatus === "connected") && (
          <Button variant="contained" color="error" onClick={endCall}>
             end call
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CallComponent;
