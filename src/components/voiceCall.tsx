// src/components/VoiceCall.tsx
import { useEffect, useState } from "react";
import { useTwilioCall } from "../hooks/useTwilioCall";
import {
  fetchTwilioToken,
  createCall,
  acceptCallApi,
  endCallApi,
} from "../api/callApi";
import { socket, connectSocket, disconnectSocket } from "../socket";

export function VoiceCall({ userId }: { userId: string }) {
  const [callId, setCallId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<any>(null);
  const [callState, setCallState] = useState<"idle" | "calling" | "ringing" | "connected">("idle");

  const {
    initDevice,
    startTwilioCall,
    acceptIncomingCall,
    endCall,
  } = useTwilioCall();

  // 🔹 1. Init Twilio with userId as identity
  useEffect(() => {
    if (!userId) return;
    
    console.log("🔑 Fetching Twilio token for userId:", userId);
    fetchTwilioToken(userId).then((token) => {
      console.log("✅ Token received, initializing device");
      initDevice(token);
    });
  }, [userId]);

  // 🔹 2. Socket listeners
  useEffect(() => {
    if (!userId) return;

    connectSocket(userId);

    socket.on("incomingCall", (data) => {
      console.log("📞 Incoming call from:", data.callerId);
      setIncoming(data);
      setCallState("ringing");
      // Note: Twilio incoming call event will fire separately in useTwilioCall
    });

    socket.on("answer", () => {
      console.log("✅ Recipient answered via socket");
      setCallState("connected");
      // Don't start Twilio call here - it's already connected!
    });

    socket.on("endCall", () => {
      console.log("❌ Call ended via socket");
      endCall();
      setIncoming(null);
      setCallId(null);
      setRecipientId(null);
      setCallState("idle");
    });

    socket.on("callRejected", () => {
      console.log("🚫 Call rejected via socket");
      endCall();
      setIncoming(null);
      setCallId(null);
      setRecipientId(null);
      setCallState("idle");
    });

    return () => {
      socket.off("incomingCall");
      socket.off("answer");
      socket.off("endCall");
      socket.off("callRejected");
      disconnectSocket();
    };
  }, [userId]);

  // 🔹 3. Initiate call - START TWILIO CALL IMMEDIATELY
  const callUser = async (recipientUserId: string) => {
    try {
      console.log("📞 Initiating call to:", recipientUserId);
      setRecipientId(recipientUserId);
      setCallState("calling");
      
      // 1. Create call record in backend
      const call = await createCall(recipientUserId);
      setCallId(call.id);
      
      // 2. Start Twilio call immediately (this will ring the recipient)
      console.log("📞 Starting Twilio call to:", recipientUserId);
      await startTwilioCall(recipientUserId);
      
      console.log("✅ Twilio call initiated successfully");
    } catch (error) {
      console.error("❌ Error initiating call:", error);
      setCallState("idle");
      setRecipientId(null);
    }
  };

  // 🔹 4. Accept incoming call
  const accept = async () => {
    if (!incoming?.callId) return;

    try {
      console.log("✅ Accepting call:", incoming.callId);
      
      // 1. Accept the Twilio incoming call FIRST
      acceptIncomingCall();
      
      // 2. Then notify backend/socket
      await acceptCallApi(incoming.callId);
      
      setCallState("connected");
      setCallId(incoming.callId);
      setIncoming(null);
    } catch (error) {
      console.error("❌ Error accepting call:", error);
    }
  };

  // 🔹 5. Reject/End call
  const hangup = async () => {
    console.log("❌ Hanging up call");
    
    if (callId) {
      await endCallApi(callId);
    }
    
    endCall();
    setIncoming(null);
    setCallId(null);
    setRecipientId(null);
    setCallState("idle");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Voice Call - User: {userId}</h3>
      <p>Call State: <strong>{callState}</strong></p>

      {/* Incoming call UI */}
      {incoming?.callId && callState === "ringing" && (
        <div style={{ border: "2px solid green", padding: "20px", marginBottom: "10px" }}>
          <p>📞 Incoming call from {incoming.callerId}</p>
          <button onClick={accept} style={{ marginRight: "10px" }}>Accept</button>
          <button onClick={hangup}>Reject</button>
        </div>
      )}

      {/* Calling UI */}
      {callState === "calling" && (
        <div style={{ border: "2px solid orange", padding: "20px", marginBottom: "10px" }}>
          <p>📞 Calling {recipientId}...</p>
          <p>🔔 Ringing...</p>
          <button onClick={hangup}>Cancel</button>
        </div>
      )}

      {/* Connected UI */}  
      {callState === "connected" && (
        <div style={{ border: "2px solid blue", padding: "20px", marginBottom: "10px" }}>
          <p>🎙️ Call in progress with {recipientId || incoming?.callerId}</p>
          <button onClick={hangup}>End Call</button>
        </div>
      )}

      {/* Idle UI */}
      {callState === "idle" && (
        <div>
          <button onClick={() => callUser("b6c9b9bc-4256-46a2-a201-627e2fc021e2")}>
            Call User
          </button>
        </div>
      )}
    </div>
  );
}