import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { PencilSquareIcon } from "@heroicons/react/24/solid"
import TextInput from '@/Components/TextInput';
import ConversationItem from '@/Components/ConversationItem';
import { useEventBus } from '@/EventBus';
import { GroupModal } from '@/Components/GroupModal';

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [showGroupModal, setShowGroupModal] = useState(false);
    const { on, emit } = useEventBus();

    const isUserOnline = (userId) => onlineUsers[userId];

    const onSearch = (e) => {
        const search = e.target.value.toLowerCase();
        if (search){
            setLocalConversations(
                localConversations.filter(conversation => {
                    return (
                        conversation.name.toLowerCase().includes(search)
                    );
                })
            )
        }else{
            setLocalConversations(conversations);
        }
    }

    const messageCreated = (message) =>{
        setLocalConversations((oldUsers) => {
            return oldUsers.map((user) => {
                if(message.receiver_id && !user.is_group && (user.id == message.sender_id || user.id == message.receiver_id)){
                    user.last_message = message.message;
                    user.last_message_date = message.created_at;
                    return user;
                }

                if(message.group_id && user.is_group && user.id == message.group_id){
                    user.last_message = message.message;
                    user.last_message_date = message.created_at;
                    return user;
                }
                return user;
            })
        });
    }

    const messageDeleted = ({ prevMessage }) => {
        if (!prevMessage){
            return;
        }

        messageCreated(prevMessage);
    }

    useEffect(() => {
        const offCreated = on("message.created", messageCreated);
        const offDeleted = on("message.deleted", messageDeleted);
        const offModalShow = on("GroupModal.show", (group) => {
            setShowGroupModal(true);
        });

        const offGroupDelete = on("group.deleted", ({ id, name }) => {
            setLocalConversations((oldConversations) => {
                return oldConversations.filter((con) => con.id != id)
            });

            emit('toast.show', `group ${name} was deleted`);

            if(!selectedConversation || (selectedConversation.is_group && selectedConversation.id == id)) {
                router.visit(route("dashboard"));
            }
        });

        return () => {
            offCreated();
            offDeleted();
            offModalShow();
            offGroupDelete();
        }
    }, [on])

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                if(a.blocked_at && b.blocked_at){
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                }else if (a.blocked_at){
                    return 1;
                }else if (b.blocked_at){
                    return -1;
                }
                if (a.last_message_date && b.last_message_date){
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    );
                }else if(a.last_message_date) {
                    return -1;
                }else if (b.last_message_date){
                    return 1;
                }else{
                    return 0;
                }
            })
        );
    }, [localConversations]);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect (() => {
        window.Echo.join('online')
            .here((users) => {
                const onlineUsersObject = Object.fromEntries(users.map(user => [user.id, user]));
                setOnlineUsers((prevOnlineUsers) => {
                    return {...prevOnlineUsers, ...onlineUsersObject};
                });
            })
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = {...prevOnlineUsers};
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                })
            })
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = {...prevOnlineUsers};
                    delete updatedUsers[user.id];
                    return updatedUsers;
                })
            })
            .error((err) => {
                console.log('error', err);
            });
        return () =>{
            window.Echo.leave("online");
        };
    }, []);
    return(
        <>
            <div className='flex-1 w-full flex overflow-hidden'>
            <div
            className={`transition-all w-full sm:w-[350px] md:[300px] bg-slate-800 flex flex-col overflow-hidden ${
                selectedConversation ? "-ml-[100%] sm:ml-0" : ""
            }`}
            >
                <div className='flex items-center justify-between py-2 px-3 text-xl font-medium'>
                    <h2 className='text-gray-200'>My conversations</h2>
                    <div
                        className='tooltip tooltip-left'
                        data-tip='Create new Group'
                    >
                        <button
                            onClick={e => setShowGroupModal(true)}
                            className='text-gray-400 hover:text-gray-200'
                        >
                            <PencilSquareIcon className='w-4 h-4 inline-block ml-2'/>
                        </button>
                    </div>
                </div>
                <div className='p-3'>
                    <TextInput
                        onKeyUp={onSearch}
                        placeholder='Filter users and groups'
                        className='w-full'
                    />
                </div>
                <div className='flex-1 overflow-auto'>
                    {sortedConversations && sortedConversations.map((conversation, index) => (
                        <ConversationItem
                            key={index}
                            conversation={conversation}
                            online={!!isUserOnline(conversation.id)}
                            selectedConversation={selectedConversation}
                        />
                    ))}
                </div>
            </div>
            <div className='flex-1 flex flex-col overflow-hidden'>
                {children}
            </div>
        </div>
        <GroupModal show={showGroupModal} onClose={() => setShowGroupModal(false)}/>
        </>
    );
}

export default ChatLayout;
