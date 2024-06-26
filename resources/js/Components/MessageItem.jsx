import { usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import React from "react";
import ReactMarkdown from "react-markdown";
import { formatMessageDateLong } from "@/helpers"
import MessageAttachments from "./MessageAttachments";
import MessageOptionsDropdown from "./MessageOptionsDropdown";

const MessageItem = ({ message, attachmentClick }) => {
    const page = usePage();
    const currentUser = page.props.auth.user;
    return (
        <div className={`chat ${message.sender.id === currentUser.id ?'chat-end':'chat-start'}`}>
            <div className="chat-image avatar">
                {<UserAvatar user={message.sender}/>}
            </div>
            {message.group_id && message.sender.id !== currentUser.id && (
                <div className="opacity-50">{message.sender.name}</div>
            )}
            <div className={`chat-bubble ${message.sender.id === currentUser.id? "chat-bubble-accent": "chat-bubble-primary"}`}>
                {message.sender_id == currentUser.id && (
                    <MessageOptionsDropdown message={message}/>
                )}
                <div className="chat-message">
                    <div className="chat-message-content overflow-hidden">
                        <ReactMarkdown>{message.message}</ReactMarkdown>
                    </div>
                    <MessageAttachments attachments={message.attachments} attachmentClick={attachmentClick} />
                </div>
            </div>
            <div className="chat-footer">
                <time className="text-xs opacity-80">
                    {formatMessageDateLong(message.created_at)}
                </time>
            </div>
        </div>
    );
};

export default MessageItem;
