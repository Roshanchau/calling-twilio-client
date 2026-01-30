// src/hooks/useTwilioCall.ts
import { Device, Call } from "@twilio/voice-sdk";
import { useRef } from "react";

export function useTwilioCall() {
  const deviceRef = useRef<Device | null>(null);
  const activeCallRef = useRef<Call | null>(null);
  const incomingCallRef = useRef<Call | null>(null);

  const initDevice = async (token: string) => {
    if (deviceRef.current) return;

    const device = new Device(token, {
      codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      closeProtection: true,
    });

    // Listen for incoming calls
    device.on("incoming", (call: Call) => {
      console.log("📞 Twilio incoming call received");
      incomingCallRef.current = call;

      call.on("accept", () => {
        console.log("✅ Twilio call accepted");
      });

      call.on("disconnect", () => {
        console.log("❌ Twilio call disconnected");
        incomingCallRef.current = null;
        activeCallRef.current = null;
      });

      call.on("cancel", () => {
        console.log("🚫 Twilio call cancelled");
        incomingCallRef.current = null;
      });

      call.on("reject", () => {
        console.log("🚫 Twilio call rejected");
        incomingCallRef.current = null;
      });
    });

    device.on("registered", () => {
      console.log("✅ Twilio device registered");
    });

    device.on("error", (error) => {
      console.error("❌ Twilio device error:", error);
    });

    await device.register();
    deviceRef.current = device;
  };

  const startTwilioCall = async (toClientId: string) => {
    if (!deviceRef.current) {
      throw new Error("Device not initialized");
    }

    console.log("📞 Starting Twilio call to:", toClientId);

    const call = await deviceRef.current.connect({
      params: {
        To: toClientId,
      },
    });

    // Listen for outgoing call events
    call.on("accept", () => {
      console.log("✅ Outgoing Twilio call accepted by recipient");
    });

    call.on("disconnect", () => {
      console.log("❌ Outgoing Twilio call disconnected");
      activeCallRef.current = null;
    });

    call.on("ringing", () => {
      console.log("🔔 Twilio call is ringing...");
    });

    call.on("cancel", () => {
      console.log("🚫 Outgoing Twilio call cancelled");
      activeCallRef.current = null;
    });

    activeCallRef.current = call;
    return call;
  };

  const acceptIncomingCall = () => {
    if (incomingCallRef.current) {
      console.log("✅ Accepting Twilio incoming call");
      incomingCallRef.current.accept();
      activeCallRef.current = incomingCallRef.current;
      incomingCallRef.current = null;
    } else {
      console.warn("⚠️ No Twilio incoming call to accept");
    }
  };

  const endCall = () => {
    console.log("❌ Ending Twilio call");
    if (activeCallRef.current) {
      activeCallRef.current.disconnect();
      activeCallRef.current = null;
    }
    if (incomingCallRef.current) {
      incomingCallRef.current.reject();
      incomingCallRef.current = null;
    }
  };

  return {
    initDevice,
    startTwilioCall,
    acceptIncomingCall,
    endCall,
  };
}