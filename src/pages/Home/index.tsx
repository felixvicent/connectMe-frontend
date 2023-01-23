import { useSocket } from "../../providers/Socket";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import * as S from "./styles";

interface SocketJoinRoomProps {
  roomId: string;
}

export function Home() {
  const { socket } = useSocket();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleRoomJoined = useCallback(
    ({ roomId }: SocketJoinRoomProps) => {
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);

    return () => {
      socket.off("joined-room", handleRoomJoined);
    };
  }, [socket, handleRoomJoined]);

  const handleJoinRoom = () => {
    socket.emit("join-room", { roomId, emailId: email });
  };

  return (
    <S.Container>
      <div className="input-container">
        <input
          type="email"
          placeholder="Enter your email here"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomId}
          onChange={(event) => setRoomId(event.target.value)}
        />
        <button onClick={handleJoinRoom}>Enter Room</button>
      </div>
    </S.Container>
  );
}
