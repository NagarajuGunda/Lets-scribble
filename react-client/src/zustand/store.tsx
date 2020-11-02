import create from 'zustand';
import io from 'socket.io-client';

type State = {
    socket: SocketIOClient.Socket
    room: string
    name: string
    isHost: boolean
    members: Member[]

    setSocket: (socket: SocketIOClient.Socket) => void
    setRoom: (room: string) => void
    setName: (name: string) => void
    setMembers: (members: Member[]) => void
    addMember: (newMember: Member) => void
    removeMember: (exMember: string) => void
    setIsHost: (isHost: boolean) => void
    reset: () => void

    getSocket: () => SocketIOClient.Socket
    getRoom: () => string
    getName: () => string
    getIsHost: () => boolean
}

type Member = {
    socketID: string
    name: string
}

const INIT_STATE = {
    socket: io.Socket,
    room: "",
    name: "",
    isHost: false,
    members: []
}

const useStore = create<State>((set, get) => ({
    ...INIT_STATE,

    setSocket: (socket: SocketIOClient.Socket) => set({ socket }),
    setRoom: (room: string) => set({ room }),
    setName: (name: string) => set({ name }),
    setMembers: (members: Member[]) => set({ members }),
    addMember: (newMember: Member) => set(state => ({ members: [...state.members, newMember] })),
    removeMember: (exMember: string) => set(state => {
        let members = state.members
        console.log(exMember, members)
        members = members.filter(member => member.socketID !== exMember)
        return { members }
    }),
    setIsHost: (isHost: boolean) => set({ isHost }),
    reset: () => set({ ...INIT_STATE }),
    
    getSocket: () => get().socket,
    getRoom: () => get().room,
    getName: () => get().name,
    getIsHost: () => get().isHost
}))

export default useStore