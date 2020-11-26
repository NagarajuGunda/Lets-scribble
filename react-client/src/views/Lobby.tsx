import React, { useState, useCallback, useEffect } from 'react';
import useStore from '../zustand/store';
import ModalBody from '../components/ModalBody';
import { Modal, Backdrop, Fade } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useParams } from 'react-router-dom';
import io from 'socket.io-client';

type RouteParams = {
    room: string
}

type Member = {
    socketID: string
    name: string
}

const useStyles = makeStyles((theme) => ({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    paper: {
      backgroundColor: "#f5f5f5",
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3)
    }
}));

const Lobby: React.FC = (props) => {
    const { isHost, setSocket, setRoom, setName, setMembers, addMember, removeMember, setIsHost, reset, getSocket, getRoom, getName } = useStore(useCallback(state => ({
        isHost: state.isHost,
        
        setSocket: state.setSocket,
        setRoom: state.setRoom,
        setName: state.setName,
        setMembers: state.setMembers,
        addMember: state.addMember,
        removeMember: state.removeMember,
        setIsHost: state.setIsHost,
        reset: state.reset,

        getSocket: state.getSocket,
        getRoom: state.getRoom,
        getName: state.getName
    }), []))
    const members = useStore(state => state.members)

    const [modalOpen, setModalOpen] = useState<boolean>(false)

    const history = useHistory()
    const { room } = useParams<RouteParams>()

    const classes = useStyles();

    useEffect(() => {
        if(getRoom() === ""){
            setRoom(room)
            
            if(getName() === ""){
                setModalOpen(true)
            }
            else{
                init()
            }
        }
        else{
            sharedSocketFns()
        }
    }, [])

    const init = () => {
        const socket = io("/")
        setSocket(socket)
        
        socket.on("members in this room", (membersInThisRoom: Member[]) => {
            setMembers(membersInThisRoom)
        })

        socket.emit("join room", { room, name: getName() })

        socket.on("game started", () => {
            history.replace("/playground")
        })
        
        socket.on("new host", () => {
            setIsHost(true)
        })

        socket.on("invalid room", () => {
            alert("Invalid room")
            history.replace("/")
        })
    }

    const sharedSocketFns = () => {
        const socket = getSocket()

        socket.on("game over", () => {
            alert("game over")
            socket.disconnect()
            reset()
            history.replace("/")
        })

        socket.on("new member", (member: Member) => {
            addMember(member)
        })

        socket.on("someone left", (member: string) => {
            removeMember(member)
        })

        socket.on("something broke", () => {
            alert("Something went wrong, please try again later")
        })
    }

    const modalHandler = (name: string) => {
        setName(name)
        setModalOpen(false)
        init()
        sharedSocketFns()
    }

    const startGame = () => {
        getSocket().emit("start game", {
            numRounds: 1,
            round_length: 60
        })
        history.replace("/playground")
    }

    return (
        <>
            <h1>Lobby</h1>
            <h4>{getRoom()}</h4>
            <p>{JSON.stringify(members)}</p>
            <button onClick={startGame} disabled={!(isHost && members.length > 1)}>Start game</button>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={modalOpen}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500
                }}
            >
                <Fade in={modalOpen}>
                    <div className={classes.paper}>
                        <ModalBody modalHandler={modalHandler} />
                    </div>
                </Fade>
            </Modal>
        </>
    )
}

export default Lobby