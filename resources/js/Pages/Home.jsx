import ChatLayout from '@/Layouts/ChatLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ConversationHeader from '@/Components/ConversationHeader';
import MessageItem from '@/Components/MessageItem';
import MessageInput from '@/Components/MessageInput';
import { useEventBus } from '@/EventBus';
import axios from 'axios';
import { AttachmentPerviewModal } from '@/Components/AttachmentPerviewModal';


function Home({ messages = null, selectedConversation = null }) {

    const [localMessages, setLocalMessages] = useState([]);
    const messagesCtrRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const { on } = useEventBus();
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const [isLoadMessages, setIsLoadMessages] = useState(false);
    const [showAttachmentPerview, setShowAttachmentPerview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});

    const messageCreated = (message) => {
        if(selectedConversation && selectedConversation.is_group && selectedConversation.id === message.is_group){
            setLocalMessages((prevMessage) => [...prevMessage, message]);
        }
        if(selectedConversation && selectedConversation.is_user && selectedConversation.id === message.sender_id || selectedConversation.id == message.receiver_id){
            setLocalMessages((prevMessage) => [...prevMessage, message]);
        }
    };

    const messageDeleted = ({message}) => {
        if(selectedConversation && selectedConversation.is_group && selectedConversation.id === message.is_group){
            setLocalMessages((prevMessage) => {
                return prevMessage.filter((m) => m.id !== message.id);
            });
        }
        if(selectedConversation && selectedConversation.is_user && selectedConversation.id === message.sender_id || selectedConversation.id == message.receiver_id){
            setLocalMessages((prevMessage) => {
                return prevMessage.filter((m) => m.id !== message.id);
            });
        }
    }

    const onAttachmentClick = (attachments, ind) => {
        setPreviewAttachment({
            attachments,
            ind,
        });

        setShowAttachmentPerview(true);
    }

    const loadMoreMessages = useCallback(() => {

        if(noMoreMessages){
            return;
        }
        setIsLoadMessages(true);
        const firstMessage = localMessages[0];
        axios.get(route("message.loadOlder", firstMessage.id))
            .then(({data}) => {
                setIsLoadMessages(true);
                if(data.data.length === 0) {
                        setIsLoadMessages(false);
                        setNoMoreMessages(true);
                    return;
                }
                const scrollHeight = messagesCtrRef.current.scrollHeight;
                const scrollTop = messagesCtrRef.current.scrollTop;
                const clientHeight = messagesCtrRef.current.clientHeight;
                const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
                setScrollFromBottom(tmpScrollFromBottom);
                setLocalMessages((prevMessage) => {
                    setIsLoadMessages(false);
                    return [...data.data.reverse(), ...prevMessage];
                })
            });
    }, [localMessages, noMoreMessages]);

    useEffect(() => {
        setTimeout(() => {
            if(messagesCtrRef.current){
                messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            }
        }, 10);

        const offCreated = on('message.created', messageCreated);
        const offDeleted = on('message.deleted', messageDeleted);

        setScrollFromBottom(0);
        setNoMoreMessages(false);

        return () => {
            offCreated();
            offDeleted();
        }
    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse(): []);
    }, [messages]);

    useEffect(() => {
        if(messagesCtrRef.current && scrollFromBottom !== null) {
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight - messagesCtrRef.current.offsetHeight - scrollFromBottom;
        }

        if(noMoreMessages){
            return;
        }

        const observer = new IntersectionObserver(
            (entries)=>{
                entries.forEach(
                    (entry) => entry.isIntersecting && loadMoreMessages()
                ),
                {
                    rootMargin: "0px 0px 250px 0px",
                }
            }
        );

        if(loadMoreIntersect.current){
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100);
        }

        return ()=>{
            observer.disconnect();
        }
    }, [localMessages, noMoreMessages, scrollFromBottom]);


    useEffect(() => {
        if (messagesCtrRef.current && scrollFromBottom === 0) {
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
        }
    }, [localMessages]);


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
                        className='flex-1 p-5 overflow-y-auto h-[70vh] custommm'
                    >
                        {isLoadMessages && (
                            <div className='flex justify-center w-full mb-10'>
                                <span className="loading loading-spinner loading-md"></span>
                            </div>
                        )}
                        {localMessages.length === 0 && (
                            <div className='flex justify-center items-center h-full'>
                                <div className='text-lg text-slate-200'>
                                    No messages found
                                </div>
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className='flex-1 flex flex-col'>
                                <div ref={loadMoreIntersect}></div>
                                {localMessages.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                        attachmentClick={onAttachmentClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </div>
            )}
            {previewAttachment.attachments && (
                <AttachmentPerviewModal
                    attachments={previewAttachment.attachments}
                    index={previewAttachment.ind}
                    show={showAttachmentPerview}
                    onClose={() => setShowAttachmentPerview(false)}
                />
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
