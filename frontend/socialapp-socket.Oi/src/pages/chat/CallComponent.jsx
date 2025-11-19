import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSocket } from '../../Api/notifications/context/SocketContext';
import { useSelector } from 'react-redux';
import { Button, Box, Typography } from '@mui/material';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // أضف المزيد هنا لزيادة الموثوقية
    ],
};

const CallComponent = ({ targetUserId }) => {
    const socket = useSocket();
    // @ts-ignore
    const { user: currentUser } = useSelector(state => state.auth);
    
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
  
    const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, calling, connected
    const incomingOfferRef = useRef(null);
    // -----------------------------------------------------
    // 1. إدارة الوسائط (Local Stream)
    // -----------------------------------------------------

    const setupLocalMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideoRef.current.srcObject = stream;
            return stream;
        } catch (error) {
            console.error("Error accessing media devices: ", error);
            setCallStatus('error');
            return null;
        }
    };
    
    // -----------------------------------------------------
    // 2. إدارة PeerConnection (WebRTC)
    // -----------------------------------------------------

    const initializePeerConnection = (stream) => {
        peerConnection.current = new RTCPeerConnection(STUN_SERVERS);

        // إضافة البث المحلي لـ PeerConnection
        stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

        // استقبال البث من الطرف الآخر
        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current.srcObject !== event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // تبادل ICE Candidates عبر السوكيت
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('ice-candidate', {
                    targetUserId: targetUserId,
                    candidate: event.candidate
                });
            }
        };
    };

    // -----------------------------------------------------
    // 3. وظائف المكالمات (Call Functions)
    // -----------------------------------------------------
    
    // أ. بدء المكالمة
    const startCall = useCallback(async () => {
        const stream = await setupLocalMedia();
        if (!stream) return;
        
        initializePeerConnection(stream);
        
        // إنشاء الـ Offer وإرساله
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        
        socket.emit('call-user', { 
            targetUserId: targetUserId, 
            offer: offer 
        });
        
        setCallStatus('calling');
    }, [socket, targetUserId]);


    // ب. إنهاء المكالمة
    const endCall = useCallback(() => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        if (localVideoRef.current?.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }
        
        socket.emit('call-end', { targetUserId: targetUserId });
        setCallStatus('idle');
    }, [socket, targetUserId]);


    // ج. الرد على المكالمة
    const answerCall = useCallback(async (offer) => {
        const stream = await setupLocalMedia();
        if (!stream) return;
        
        initializePeerConnection(stream);
        
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        
        socket.emit('call-answered', { 
            targetUserId: targetUserId, 
            answer: answer 
        });
        
        setCallStatus('connected');
    }, [socket, targetUserId]);


    // -----------------------------------------------------
    // 4. إدارة أحداث السوكيت (Call Signaling)
    // -----------------------------------------------------
    useEffect(() => {
        if (!socket || !currentUser) return;
        
        // المتغير لتخزين الـ Offer الوارد
        // let incomingOffer = null;

        // أ. استقبال مكالمة واردة
        const handleIncomingCall = ({ callerId, offer }) => {
            setCallStatus('ringing');
        incomingOfferRef.current = offer;
        console.log(`Incoming call received from: ${callerId}`);
        };

        // ب. استقبال الـ Answer من المتلقي
        const handleAnswerReceived = async ({ answer }) => {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
                setCallStatus('connected');
            }
        };
        
        // ج. استقبال الـ ICE Candidate
        const handleIceCandidateReceived = async ({ candidate }) => {
            if (peerConnection.current && candidate) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        };

        // د. إنهاء المكالمة من الطرف الآخر
        const handleCallEndedByPeer = () => {
            endCall(); // استخدام دالة الإنهاء المحلية
        };

        socket.on('incoming-call', handleIncomingCall);
        socket.on('answer-received', handleAnswerReceived);
        socket.on('ice-candidate-received', handleIceCandidateReceived);
        socket.on('call-ended-by-peer', handleCallEndedByPeer);

        return () => {
            socket.off('incoming-call', handleIncomingCall);
            socket.off('answer-received', handleAnswerReceived);
            socket.off('ice-candidate-received', handleIceCandidateReceived);
            socket.off('call-ended-by-peer', handleCallEndedByPeer);
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
        <Box sx={{ p: 2, border: '1px solid #ccc', mt: 2 }}>
            <Typography variant="h6">حالة المكالمة: {callStatus}</Typography>

            {/* فيديو الطرف المحلي */}
            <video ref={localVideoRef} autoPlay muted style={{ width: '100px', height: '100px', backgroundColor: '#000', margin: '5px' }} />
            
            {/* فيديو الطرف البعيد */}
            <video ref={remoteVideoRef} autoPlay style={{ width: '200px', height: '150px', backgroundColor: '#333', margin: '5px' }} />
            
            <Box sx={{ mt: 2 }}>
                {(callStatus === 'idle' || callStatus === 'error') && (
                    <Button variant="contained" color="primary" onClick={startCall} disabled={!targetUserId || !socket}>
                        بدء مكالمة
                    </Button>
                )}
                
                {callStatus === 'ringing' && (
                    <>
                        <Typography color="secondary">مكالمة واردة...</Typography>
                        <Button variant="contained" color="success" onClick={handleAnswerClick} sx={{ mr: 1 }}>
                            رد
                        </Button>
                    </>
                )}
                
                {(callStatus === 'calling' || callStatus === 'connected') && (
                    <Button variant="contained" color="error" onClick={endCall}>
                        إنهاء المكالمة
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default CallComponent;