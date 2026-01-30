// src/hooks/useCallSocket.ts
import { useEffect } from "react";
import { socket } from "../socket";

export function useCallSocket({
  onIncoming,
  onAnswered,
  onEnded,
}: {
  onIncoming: (data: any) => void;
  onAnswered: (data: any) => void;
  onEnded: (data: any) => void;
}) {
  useEffect(() => {
    socket.connect();

    socket.on("incomingCall", onIncoming);
    socket.on("answer", onAnswered);
    socket.on("endCall", onEnded);
    socket.on("callRejected", onEnded);

    return () => {
      socket.disconnect();
    };
  }, []);
}
