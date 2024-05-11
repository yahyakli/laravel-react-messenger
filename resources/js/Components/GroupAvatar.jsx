import { UsersIcon } from "@heroicons/react/24/solid";

const GroupAvatar = ({}) => {
    return (
        <>
            <div className={`avatar palceholder`}>
                <div className={`bg-gray-400 text-gray-800 rounded-full w-8`}>
                    <span className="text-xl flex justify-center items-center h-full">
                        <UsersIcon className="h-5 w-5" />
                    </span>
                </div>
            </div>
        </>
    );
}

export default GroupAvatar;
