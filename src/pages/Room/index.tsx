/* eslint-disable react/jsx-no-comment-textnodes */
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

import { useSocket } from "../../providers/Socket";
import { usePeer } from "../../providers/Peer";

import * as S from "./styles";

interface UserJoinedProps {
  emailId: string;
}

interface IncommingCallProps {
  from: string;
  offer: RTCSessionDescriptionInit;
}

interface CallAccptedProps {
  ans: RTCSessionDescriptionInit;
}

export function Room() {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteStream,
  } = usePeer();

  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteEmailId, setRemoteEmailId] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  function addToLog(text: string) {
    setLogs((prevState) => [...prevState, text]);
  }

  const handleNewUserJoined = useCallback(
    async ({ emailId }: UserJoinedProps) => {
      const offer = await createOffer();

      socket.emit("call-user", { emailId, offer });
      addToLog(`Call user ${emailId}`);
      setRemoteEmailId(emailId);
    },
    [createOffer, socket]
  );

  const handleIncommingCall = useCallback(
    async ({ from, offer }: IncommingCallProps) => {
      const ans = await createAnswer(offer);

      socket.emit("call-accepted", { emailId: from, ans });
      addToLog(`Call accepted ${from}`);
      setRemoteEmailId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(
    async ({ ans }: CallAccptedProps) => {
      await setRemoteAns(ans);
    },
    [setRemoteAns]
  );

  const getUserMediaStream = useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: devices.find((device) => device.kind === "audioinput"),
      video: devices.find((device) => device.kind === "videoinput"),
    });

    setMyStream(stream);
  }, []);

  const handleNegotiation = useCallback(() => {
    const localOffer = peer.localDescription;
    socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
    addToLog(`Call user ${remoteEmailId}`);
  }, [peer, remoteEmailId, socket]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleIncommingCall, handleCallAccepted]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiation);

    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [handleNegotiation, peer]);

  useEffect(() => {
    getUserMediaStream();
    if (myStream) {
      sendStream(myStream);
    }
  }, [getUserMediaStream, sendStream, myStream]);

  if (!myStream) {
    return null;
  }

  return (
    <S.Container>
      <main>
        <ReactPlayer width={320} height={320} url={myStream} playing />
        <ReactPlayer
          width={320}
          height={320}
          url={remoteStream as MediaStream}
          playing
        />
      </main>
      <aside>
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </aside>
    </S.Container>
  );
}
