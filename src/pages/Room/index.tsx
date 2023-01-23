/* eslint-disable react/jsx-no-comment-textnodes */
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

import { useSocket } from "../../providers/Socket";
import { usePeer } from "../../providers/Peer";

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
  const [remoteEmailId, setRemoveEmailId] = useState("");

  const handleNewUserJoined = useCallback(
    async ({ emailId }: UserJoinedProps) => {
      const offer = await createOffer();

      socket.emit("call-user", { emailId, offer });
      setRemoveEmailId(emailId);
    },
    [createOffer, socket]
  );

  const handleIncommingCall = useCallback(
    async ({ from, offer }: IncommingCallProps) => {
      const ans = await createAnswer(offer);

      socket.emit("call-accepted", { emailId: from, ans });
      setRemoveEmailId(from);
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
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setMyStream(stream);
  }, []);

  const handleNegotiation = useCallback(() => {
    const localOffer = peer.localDescription;
    socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
    console.log("Ops! negotiation needed");
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
  }, [getUserMediaStream]);

  if (!myStream) {
    return null;
  }

  return (
    <>
      <ReactPlayer url={myStream} playing />
      <h4>You are connected to {remoteEmailId}</h4>
      <button onClick={(e) => sendStream(myStream)}>Send My Video</button>

      {<ReactPlayer url={remoteStream as MediaStream} playing />}
    </>
  );
}
