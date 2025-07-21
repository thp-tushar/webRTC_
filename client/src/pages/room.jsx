import React, { useRef, useEffect, useCallback, useState } from 'react';
import { UseSocket } from "../providers/socket";
import { usePeer } from '../providers/peer';

const Room = () => {
    const { socket } = UseSocket();
    const { peer, createOffer, createAnswer, set_remote_answer, sendStream, remoteStream } = usePeer();

    const [myStream, set_my_stream] = useState(null);
    const [remoteEmailID, set_remote_EmailID] = useState();

    const myVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const handle_NewUser_Joined = useCallback(async (data) => {
        const { emailID } = data;
        console.log("New User Joined Room", emailID);
        const offer = await createOffer();
        socket.emit("Call-user", { emailID, offer });
        set_remote_EmailID(emailID);
    }, [createOffer, socket]);

    const handle_incoming_call = useCallback(async (data) => {
        const { from, offer } = data;
        console.log("Incoming-Call-from", from, offer);
        const ans = await createAnswer(offer);
        socket.emit("Call-Accepted", { emailID: from, ans });
        set_remote_EmailID(from);
    }, [createAnswer, socket]);

    const handle_call_accepted = useCallback(async (data) => {
        const { ans } = data;
        console.log("Call-Got-Accepted", ans);
        await set_remote_answer(ans);
    }, [set_remote_answer]);

    const get_User_Media_Stream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        set_my_stream(stream);
    }, []);

    const handle_negotiation = useCallback(() => {
        const localOffer = peer.localDescription;
        socket.emit("Call-user", { emailID: remoteEmailID, offer: localOffer });
    }, [peer, remoteEmailID, socket]);

    // Mount and unmount event listeners
    useEffect(() => {
        socket.on("User-Joined", handle_NewUser_Joined);
        socket.on("Incoming-Call", handle_incoming_call);
        socket.on("Call-Accepted", handle_call_accepted);

        return () => {
            socket.off("User-Joined", handle_NewUser_Joined);
            socket.off("Incoming-Call", handle_incoming_call);
            socket.off("Call-Accepted", handle_call_accepted);
        };
    }, [handle_NewUser_Joined, handle_incoming_call, handle_call_accepted, socket]);

    useEffect(() => {
        peer.addEventListener("negotiationneeded", handle_negotiation);
        return () => {
            peer.removeEventListener("negotiationneeded", handle_negotiation);
        };
    }, [handle_negotiation, peer]);

    useEffect(() => {
        get_User_Media_Stream();
    }, [get_User_Media_Stream]);

    // Set streams to video elements
    useEffect(() => {
        if (myVideoRef.current && myStream) {
            myVideoRef.current.srcObject = myStream;
        }
    }, [myStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <div className="room-page-container">
            <h1>Room Page</h1>
            <h4>You Are Connected to {remoteEmailID}</h4>
            <button onClick={() => sendStream(myStream)}>Send My Video</button>

            <video ref={myVideoRef} autoPlay playsInline muted style={{ width: "300px", margin: "10px" }} />
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px", margin: "10px" }} />
        </div>
    );
};

export default Room;
