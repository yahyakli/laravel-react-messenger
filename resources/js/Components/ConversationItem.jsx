import { Link, usePage } from "@inertiajs/react";
import UserAvatar from "@/Components/UserAvatar"
import GroupAvatar from "@/Components/GroupAvatar"
import UserOptionsDropdown from "@/Components/UserOptionsDropdown"
import { formatMessageDateShort } from "@/helpers";


export default function ConversationItem({
    conversation,
    selectedConversation = null,
    online = null
}) {
    const page = usePage();
    const currentUser = page.props.auth.user;
    let classes = "border-transparent";

    if (selectedConversation && selectedConversation.id === conversation.id) {
        classes = "border-white bg-black/20 border-l-4";
    }

    return (
        <div className="my-2 hover:bg-black/40">
            <Link
                href={
                    conversation.is_group
                        ? route("chat.group", conversation)
                        : route("chat.user", conversation)
                }
                className={
                    "conversation-item flex items-center gap-2 p-2 text-gray-300 transition-all cursor-pointer hover:bg-black/30 " +
                    classes +
                    (conversation.is_user && currentUser.is_admin ? " pr-2" : " pr-4")
                }
            >
                {conversation.is_user && <UserAvatar user={conversation} online={online} />}
                {conversation.is_group && <GroupAvatar />}
                <div
                    className={
                        `flex-1 text-xs max-w-full overflow-hidden` +
                        (conversation.is_user && conversation.blocked_at
                            ? " opacity-50"
                            : "")
                    }
                >
                    <div className="flex gap-1 justify-between items-center">
                        <h3 className="text-sm font-semibold overflow-hidden text-nowrap text-ellipsis">
                            {conversation.name}
                        </h3>
                        {conversation.last_message_date && (
                            <span className="text-nowrap">
                                {formatMessageDateShort(conversation.last_message_date)}
                            </span>
                        )}
                    </div>
                    {conversation.last_message && (
                        <p className="text-xs text-nowrap overflow-hidden text-ellipsis">
                            {conversation.last_message}
                        </p>
                    )}
                </div>
                {!!currentUser.is_admin && !!conversation.is_user && (
                    <UserOptionsDropdown conversation={conversation} />
                )}
            </Link>
        </div>
    );
}
