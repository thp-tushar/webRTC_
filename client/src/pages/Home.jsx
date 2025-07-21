import React , {useState, useEffect, useCallback} from 'react';
import {useNavigate} from "react-router-dom";
import { UseSocket } from '../providers/socket';
import { usePeer } from '../providers/peer';


const Home = () => {
  const {socket} = UseSocket();
  const {peer, createOffer} = usePeer();
  const navigate = useNavigate();

  const [email , setEmail] = useState();
  const [roomID, setRoomID] = useState();

  const handle_room_joined = useCallback(({roomID}) => {
    navigate(`/room/${roomID}`);
  },[navigate]);

  useEffect(() => {
    socket.on("joined-room" , handle_room_joined)
    return () =>{
      socket.off("joined-room" , handle_room_joined);
    }
  } ,[handle_room_joined, socket]);
  
  const handle_join_room = () => {
      socket.emit("join-room" , {emailID: email , roomID});
  }
  return (
    <div className='Homepage-Container'>
        <div className='Input_Container'>
            <input value={email} onChange={e => setEmail(e.target.value)}type='email' placeholder='Enter Your Email' />
            <input value={roomID} onChange={e => setRoomID(e.target.value)}type='text' placeholder='Enter Room Code' />
            <button onClick={handle_join_room}>Enter Room</button>
        </div>
    </div>
  )
}

export default Home;