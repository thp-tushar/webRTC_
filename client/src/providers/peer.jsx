import React, { useMemo, useEffect, useState} from 'react';
import { useCallback } from 'react';

const PeerContext = React.createContext(null);

export const usePeer = () => {
   return React.useContext(PeerContext);
}

export const PeerProvider = (props) => {
    const [remoteStream, set_remote_stream] = useState(null);

    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [
            {
            urls : [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478",
            ]
        }
        ]
    }) ,[]);

    const createOffer = async() => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    };

    const createAnswer = async(offer) =>{
        peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }
    const set_remote_answer = async(ans) =>{
        await peer.setLocalDescription(ans);
    }

    const sendStream = async(stream) => {
        const tracks = stream.getTracks();
        for(const track of tracks){
            peer.addTrack(track, stream);
        }
    };

    const handle_track_event = useCallback((ev) =>{
        const streams = ev.streams;
        set_remote_stream(streams[0]);
    }, [])

    
    useEffect(() => {
        peer.addEventListener("track" ,handle_track_event);
        return () =>{
            peer.removeEventListener("track", handle_track_event);
        }},[handle_track_event, peer]);

    return(
        <PeerContext.Provider value={{
            peer,
            createOffer,
            createAnswer, 
            set_remote_answer, 
            sendStream, 
            remoteStream,}}>
            
            {props.children}
        </PeerContext.Provider>
    )
}