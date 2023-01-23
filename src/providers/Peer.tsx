import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface PeerProviderProps {
  children: ReactNode;
}

interface PeerContextProvider {
  peer: RTCPeerConnection;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (
    offer: RTCSessionDescriptionInit
  ) => Promise<RTCSessionDescriptionInit>;
  setRemoteAns: (ans: RTCSessionDescriptionInit) => Promise<void>;
  sendStream: (stream: MediaStream) => void;
  remoteStream: MediaStream | null;
}

const PeerContext = createContext({} as PeerContextProvider);

export const usePeer = () => useContext(PeerContext);

export const PeerProvider = ({ children }: PeerProviderProps) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      }),
    []
  );

  const createOffer = async () => {
    const offer = await peer.createOffer();
    console.log(offer);
    await peer.setLocalDescription(offer);

    return offer;
  };

  const createAnswer = async (offer: RTCSessionDescriptionInit) => {
    await peer.setRemoteDescription(offer);

    const answer = await peer.createAnswer();

    console.log(answer);

    await peer.setLocalDescription(answer);

    return answer;
  };

  const setRemoteAns = async (ans: RTCSessionDescriptionInit) => {
    await peer.setRemoteDescription(ans);
  };

  const sendStream = async (stream: MediaStream) => {
    const tracks = stream.getTracks();

    for (const track of tracks) {
      peer.addTrack(track, stream);
    }
  };

  const handleTrackEvent = useCallback((event: RTCTrackEvent) => {
    const streams = event.streams[0];

    console.log(streams);

    setRemoteStream(streams);
  }, []);

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);

    return () => {
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, [peer, handleTrackEvent]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAns,
        sendStream,
        remoteStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
