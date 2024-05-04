import { usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import React from "react";
import ReactMarkdown from "react-markdown";
import { formatMessageDateLong } from "@/helpers"

const MessageItem = ({ message }) => {
    const page = usePage();
    const currentUser = page.props.auth.user;
    return (
        <div className={`chat ${message.sender.id === currentUser.id ?'chat-end':'chat-start'}`}>
            <div className="chat-image avatar">
                {<UserAvatar user={message.sender}/>}
            </div>
            {console.log(message.sender.id !== currentUser.id)}
            {message.group_id && message.sender.id !== currentUser.id && (
                <div className="opacity-50">{message.sender.name}</div>
            )}
            <div className={`chat-bubble ${message.sender.id === currentUser.id? "chat-bubble-accent": "chat-bubble-primary"}`}><ReactMarkdown>{message.message}</ReactMarkdown></div>
            <div className="chat-footer">
                <time className="text-xs opacity-80">
                    {formatMessageDateLong(message.created_at)}
                </time>
            </div>
        </div>
    );
};

export default MessageItem;
