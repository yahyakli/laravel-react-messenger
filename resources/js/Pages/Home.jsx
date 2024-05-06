import ChatLayout from '@/Layouts/ChatLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ConversationHeader from '@/Components/ConversationHeader';
import MessageItem from '@/Components/MessageItem';
import MessageInput from '@/Components/MessageInput';
import { useEventBus } from '@/EventBus';


function Home({ messages = null, selectedConversation = null }) {

    const [localMessages, setLocalMessages] = useState([]);
    const messagesCtrRef = useRef();
    const { on } = useEventBus();

    const messageCreated = (message) => {
        if(selectedConversation && selectedConversation.is_group && selectedConversation.id === message.is_group){
            setLocalMessages((prevMessage) => [...prevMessage, message]);
        }
        if(selectedConversation && selectedConversation.is_user && selectedConversation.id === message.sender_id || selectedConversation.id == message.receiver_id){
            setLocalMessages((prevMessage) => [...prevMessage, message]);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            if(messagesCtrRef.current){
                messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            }
        }, 10);

        const offCreated = on('message.created', messageCreated);

        return () => {
            offCreated();
        }
    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse(): []);
    }, [messages]);

    return (
        <div>
            {!messages && (
                <div className='flex flex-col gap-8 justify-center items-center text-center h-full opacity-35'>
                    <div className='text-2xl md:text-4xl p-16 text-slate-200'>
                        select conversation
                    </div>
                    <ChatBubbleLeftRightIcon className='w-32 h-32 inline-block' />
                </div>
            )}
            {messages && (
                <div>
                    <ConversationHeader selectedConversation={selectedConversation}/>
                    <div
                        ref={messagesCtrRef}
                        className='flex-1 p-5 overflow-y-auto custommm'
                    >
                        {localMessages.length === 0 && (
                            <div className='flex justify-center items-center h-full'>
                                <div className='text-lg text-slate-200'>
                                    No messages found
                                </div>
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className='flex-1 flex flex-col'>
                                {localMessages.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </div>
            )}
        </div>
    );
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout>
            <ChatLayout children={page}/>
        </AuthenticatedLayout>
    );
}

export default Home;
