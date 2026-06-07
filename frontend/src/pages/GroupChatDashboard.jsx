// // src/pages/GroupChatDashboard.jsx
// import { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";

// import GroupList from "../components/chat/GroupList";
// import ChatArea from "../components/chat/ChatArea";
// import GroupRoster from "../components/chat/GroupRoster";

// import {
//   getAllGroups,
//   getMyGroup,
//   getGroupMembers,
// } from "../services/groupService";

// import {
//   getChatHistory,
//   sendMessage,
// } from "../services/chatService";

// const BACKEND_URL = "http://localhost:5004";

// export default function GroupChatDashboard() {
//   const user = JSON.parse(localStorage.getItem("user"));

//   const isAdmin = user?.role === "ADMIN";

//   const [chatHistories, setChatHistories] = useState({});
//   const [groups, setGroups] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState(null);
//   const [roster, setRoster] = useState([]);

//   const socketRef = useRef(null);

//   const lastMembersFetch = useRef(null);
//   const lastHistoryFetch = useRef(null);
//   const socketInitialized = useRef(false);

//   const currentMessages = selectedGroup?.id
//     ? chatHistories[selectedGroup.id] || []
//     : [];

//   const currentRoster = roster;

//   // ---------------- SOCKET SETUP ----------------
//   useEffect(() => {
//     if (socketInitialized.current) return;
//     socketInitialized.current = true;

//     const token = localStorage.getItem("token");

//     socketRef.current = io(BACKEND_URL, {
//       auth: { token },
//     });

//     socketRef.current.on("connect", () => {
//       console.log("Socket connected:", socketRef.current.id);
//     });

//     socketRef.current.on("receive_message", (msg) => {
//       setChatHistories((prev) => ({
//         ...prev,
//         [msg.group_id]: [
//           ...(prev[msg.group_id] || []),
//           {
//             id: msg._id,
//             sender: msg.sender_name || "User",
//             text: msg.content,
//             time: new Date(msg.sent_at).toLocaleTimeString(),
//             isMe: msg.sender_id === user?.user_id,
//           },
//         ],
//       }));
//     });

//     socketRef.current.on("error_message", (err) => {
//       console.error("Socket error:", err);
//     });

//     return () => {
//       socketInitialized.current = false;
//       socketRef.current?.disconnect();
//     };
//   }, []);

//   // ---------------- JOIN GROUP SOCKET ----------------
//   useEffect(() => {
//     if (!socketRef.current) return;
//     if (!selectedGroup?.id) return;

//     const groupId = selectedGroup.id;

//     socketRef.current.emit("join_group", groupId);

//     return () => {
//       socketRef.current.emit("leave_group", groupId);
//     };
//   }, [selectedGroup?.id]);

//   // ---------------- LOAD GROUPS ----------------
//   useEffect(() => {
//     let active = true;

//     async function loadGroups() {
//       try {
//         let formatted = [];

//         if (isAdmin) {
//           const res = await getAllGroups();

//           formatted = res.data.groups.map((g) => ({
//             id: g._id,
//             name: g.name,
//             membersCount: g.members?.length || 0,
//             unread: 0,
//             lastActive: "Online",
//           }));
//         } else {
//           const res = await getMyGroup();

//           formatted = [
//             {
//               id: res.data._id,
//               name: res.data.name,
//               membersCount: res.data.members?.length || 0,
//               unread: 0,
//               lastActive: "Online",
//             },
//           ];
//         }

//         if (!active) return;

//         setGroups(formatted);

//         if (formatted.length > 0 && !selectedGroup) {
//           setSelectedGroup(formatted[0]);
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     }

//     loadGroups();

//     return () => {
//       active = false;
//     };
//   }, []);

//   // ---------------- LOAD MEMBERS (ANTI-SPAM FIXED) ----------------
//   useEffect(() => {
//     if (!selectedGroup?.id) return;

//     if (lastMembersFetch.current === selectedGroup.id) return;
//     lastMembersFetch.current = selectedGroup.id;

//     let cancelled = false;

//     async function loadMembers() {
//       try {
//         const res = await getGroupMembers(selectedGroup.id);

//         if (cancelled) return;

//         const members = res.data.member_details.map((m) => ({
//           id: m._id,
//           name: m.name,
//           status: "ACTIVE",
//           initials: m.name
//             .split(" ")
//             .map((w) => w[0])
//             .join("")
//             .slice(0, 2),
//         }));

//         setRoster(members);
//       } catch (err) {
//         console.error(err);
//       }
//     }

//     loadMembers();

//     return () => {
//       cancelled = true;
//     };
//   }, [selectedGroup?.id]);

//   // ---------------- LOAD CHAT HISTORY (ANTI-SPAM FIXED) ----------------
//   useEffect(() => {
//     if (!selectedGroup?.id) return;

//     if (lastHistoryFetch.current === selectedGroup.id) return;
//     lastHistoryFetch.current = selectedGroup.id;

//     let cancelled = false;

//     async function loadHistory() {
//       try {
//         const res = await getChatHistory(selectedGroup.id);

//         if (cancelled) return;

//         const messages = res.data.data.map((msg) => ({
//           id: msg._id,
//           sender: msg.sender_name || "User",
//           text: msg.content,
//           time: new Date(msg.sent_at).toLocaleTimeString(),
//           isMe: msg.sender_id === user?.user_id,
//         }));

//         setChatHistories((prev) => ({
//           ...prev,
//           [selectedGroup.id]: messages,
//         }));
//       } catch (err) {
//         console.error(err);
//       }
//     }

//     loadHistory();

//     return () => {
//       cancelled = true;
//     };
//   }, [selectedGroup?.id]);

//   // ---------------- SEND MESSAGE ----------------
//   const handleSendMessage = async (text) => {
//     if (isAdmin) return;
//     if (!selectedGroup?.id) return;

//     try {
//       await sendMessage(selectedGroup.id, text);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleSelectGroup = (group) => {
//     setSelectedGroup(group);

//     setGroups((prev) =>
//       prev.map((g) =>
//         g.id === group.id ? { ...g, unread: 0 } : g
//       )
//     );
//   };

//   return (
//     <div className="flex flex-col flex-1 min-w-0">

//       {/* HEADER */}
//       <div className="px-8 pt-6 pb-2">
//         <h1 className="text-2xl font-bold text-white">
//           {isAdmin ? "Chat Monitoring Dashboard" : "Group Chat"}
//         </h1>
//         <p className="text-sm text-slate-400 mt-1">
//           {isAdmin
//             ? "Monitor conversations across all groups"
//             : "Communicate with your group members"}
//         </p>
//       </div>

//       {/* MAIN */}
//       <div className="flex-1 grid grid-cols-12 gap-6 p-6 min-h-0">

//         {/* GROUP LIST */}
//         <div className="col-span-3 bg-slate-900 border rounded-2xl overflow-hidden">
//           <GroupList
//             groups={groups}
//             selectedGroup={selectedGroup}
//             onSelectGroup={handleSelectGroup}
//           />
//         </div>

//         {/* CHAT */}
//         <div className="col-span-9 bg-slate-900 border rounded-2xl flex flex-col">

//           <div className="px-4 py-3 border-b border-slate-800">
//             <span className="text-slate-300 text-xs uppercase">
//               Group:
//             </span>{" "}
//             <span className="text-white font-semibold">
//               {selectedGroup?.name}
//             </span>
//           </div>

//           <div className="flex flex-1 min-h-0 bg-slate-950">
//             <ChatArea
//               messages={currentMessages}
//               onSendMessage={
//                 isAdmin ? null : handleSendMessage
//               }
//               readOnly={isAdmin || !selectedGroup}
//             />

//             <GroupRoster roster={currentRoster} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/GroupChatDashboard.jsx
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Note: Adjust these relative paths if your subcomponents are inside src/components/group or src/components/layout
import GroupList from "../components/chat/GroupList";
import ChatArea from "../components/chat/ChatArea";
import GroupRoster from "../components/chat/GroupRoster";
import {
  getAllGroups,
  getMyGroup,
  getGroupMembers,
} from "../services/groupService";
import {
  getChatHistory,
  sendMessage
} from "../services/chatService";

const initialChatHistories = {
  g1: [
    {
      id: 1,
      sender: "Helena Hills",
      time: "09:41 AM",
      text: "Hi everyone! Has anyone started the assignment yet?",
      isMe: false,
    },
    {
      id: 2,
      sender: "Julian Casablancas",
      time: "09:45 AM",
      text: "I just started reading the requirements.",
      isMe: false,
    },
  ],
  g2: [
    {
      id: 1,
      sender: "Albert Camus",
      time: "Yesterday",
      text: "Does anyone understand the layout matrix?",
      isMe: false,
    },
  ],
  g3: [
    {
      id: 1,
      sender: "Leo Tolstoy",
      time: "2 days ago",
      text: "Gamma group setup complete.",
      isMe: false,
    },
  ],
};

const BACKEND_URL = "http://localhost:3004";

export default function GroupChatDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const isStudent = user?.role === "STUDENT";

    const [chatHistories, setChatHistories] = useState(initialChatHistories);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [roster, setRoster] = useState([]);
const currentMessages =
  selectedGroup
    ? chatHistories[selectedGroup.id] || []
    : [];
  const socketRef = useRef(null);

  const currentRoster = roster;

  useEffect(() => {
    const token = localStorage.getItem("token");

    socketRef.current = io(BACKEND_URL, { auth: { token } });

    socketRef.current.on("connect", () => {
      console.log(
        "Connected to backend Socket.io server with ID:",
        socketRef.current.id,
      );
    });

    socketRef.current.on("receive_message", (msg) => {
  setChatHistories((prev) => ({
    ...prev,
    [msg.group_id]: [
      ...(prev[msg.group_id] || []),
      {
        id: msg._id,
        sender: msg.sender_name || "User",
        text: msg.content,
        time: new Date(
          msg.sent_at
        ).toLocaleTimeString(),
        isMe:
          msg.sender_id ===
          user.user_id,
      },
    ],
  }));
});

    socketRef.current.on("error_message", (errorMessage) => {
      console.error("Socket server error encountered:", errorMessage);
      alert(`Server Notice: ${errorMessage}`);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;
    if (!selectedGroup) return;

    const activeGroupId = selectedGroup.id;

    socketRef.current.emit("join_group", activeGroupId);

    return () => {
      socketRef.current.emit("leave_group", activeGroupId);
    };
  }, [selectedGroup]);

  useEffect(() => {
    async function loadGroups() {
      try {
        let formattedGroups = [];

        if (isAdmin) {
          const res = await getAllGroups();

          formattedGroups = res.data.groups.map((group) => ({
            id: group._id,
            name: group.name,
            membersCount: group.members?.length || 0,
            unread: 0,
            lastActive: "Online",
          }));
        } else {
          const res = await getMyGroup();
          formattedGroups = res.data.map((group) => ({
            id: group._id,
            name: group.name,
            membersCount: group.members?.length || 0,
            unread: 0,
            lastActive: "Online",
          }));
        }

        setGroups(formattedGroups);

        if (formattedGroups.length > 0) {
          setSelectedGroup(formattedGroups[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadGroups();
  }, []);

  useEffect(() => {
    async function loadMembers() {
      if (!selectedGroup) return;

      try {
        const res = await getGroupMembers(selectedGroup.id);

        const members = res.data.member_details.map((member) => ({
          id: member._id,
          name: member.name,
          status: "ACTIVE",
          initials: member.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2),
        }));

        setRoster(members);
      } catch (err) {
        console.error(err);
      }
    }

    loadMembers();
  }, [selectedGroup]);

  useEffect(() => {
  async function loadHistory() {
    if (!selectedGroup) return;

    const res =
      await getChatHistory(
        selectedGroup.id
      );

    const messages =
      res.data.data.map(msg => ({
        id: msg._id,
        sender: msg.sender_name || "User",
        text: msg.content,
        time: new Date(
          msg.sent_at
        ).toLocaleTimeString(),
        isMe:
          msg.sender_id ===
          user.user_id,
      }));

    setChatHistories(prev => ({
      ...prev,
      [selectedGroup.id]:
        messages,
    }));
  }

  loadHistory();
}, [selectedGroup]);  

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setGroups((prevGroups) =>
      prevGroups.map((g) => (g.id === group.id ? { ...g, unread: 0 } : g)),
    );
  };

  const handleSendMessage = async (text) => {
    if (isAdmin) {
      return;
    }

    try {
      await sendMessage(
        selectedGroup.id,
        text
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = () => {
    alert(`Broadcast system triggered for: ${selectedGroup.name}`);
  };

  const handleExportLogs = () => {
    alert(`Log traces for ${selectedGroup.name} captured!`);
  };

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Interactive Title Header Section */}
      <div className="px-8 pt-6 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isAdmin ? "Chat Monitoring Dashboard" : "Group Chat"}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {isAdmin
                ? "Monitor conversations across all groups"
                : "Communicate with your group members"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isAdmin && (
              <>
                <button
                  onClick={handleExportLogs}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700"
                >
                  Export Logs
                </button>

                <button
                  onClick={handleBroadcast}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white"
                >
                  Broadcast
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 min-h-0">
        <div className="col-span-3 min-h-0 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <GroupList
            groups={groups}
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
          />
        </div>

        <div className="col-span-9 border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 flex flex-col min-h-0 shadow-xl">
          <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-wide text-xs uppercase text-slate-300">
                2. Group Chat:
              </span>
              <span className="font-bold text-sm">{selectedGroup?.name}</span>
            </div>
          </div>
          {isAdmin && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-amber-300 text-sm">
              Monitoring Mode: Message sending disabled for administrators.
            </div>
          )}
          <div className="flex flex-1 min-h-0 bg-slate-950">
            <ChatArea
              messages={currentMessages}
              onSendMessage={isAdmin ? null : handleSendMessage}
              readOnly={isAdmin}
            />
            <GroupRoster roster={currentRoster} />
          </div>
        </div>
      </div>
    </div>
  );
}