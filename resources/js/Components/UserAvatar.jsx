const UserAvatar = ({ user, online=null, profile=false }) => {
    let onlineClass = online===true ? "online" : online===false? "offline" : "";

    const sizeClass = profile ? "w-40" : "w-8";
    const fontSize = profile ? "text-9xl" : "text-xl";
    return(
        <>
            {user.avatar_url && (
                <div className={`chat-image avatar ${onlineClass}`}>
                    <div className={`rounded-full ${sizeClass}`}>
                        <img src={user.avatar_url} alt="user_avatar" />
                    </div>
                </div>
            )}
            {!user.avatar_url && (
                <div className={`chat-image avatar placeholder ${onlineClass}`}>
                    <div
                        className={`bg-gray-400 text-gray-800 rounded-full ${sizeClass}`}
                    >
                        <span className={fontSize}>
                            {user.name.substring(0,2)}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
}

export default UserAvatar;
