import { useState, Fragment } from "react";
import { Popover, Transition } from '@headlessui/react'
import { PaperClipIcon, PhotoIcon, FaceSmileIcon, HandThumbUpIcon, PaperAirplaneIcon, XCircleIcon } from "@heroicons/react/24/solid";
import NewMessageInput from "./NewMessageInput";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { isAudio, isImage } from "@/helpers";
import AttachmentPreview from "./AttachmentPreview";
import CustomAudioPlayer from "./CustomAudioPlayer";
import AudioRecorder from "./AudioRecorder";

const MessageInput = ({ conversation = null }) => {
    const [newMessage, setNewMessage] = useState("");
    const [inputErrorMessage, setInputErrorMessage] = useState('');
    const [messageSending, setMessageSending] = useState(false);
    const [chosenFiles, setChosenFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);


    const onFileChange = (e) => {
        const files = e.target.files;

        const updatedFiles = [...files].map((file) => {
            return {
                file:file,
                url:URL.createObjectURL(file),
            };
        });

        setChosenFiles((prevFiles) => {
            return [...prevFiles, ...updatedFiles];
        });
    }

    const onSendClick = () => {
        if(messageSending) {
            return;
        }

        if(newMessage.trim() === "" && chosenFiles.length === 0){
            setInputErrorMessage("Enter a message or upload attachments");
            setTimeout(() => {
                setInputErrorMessage();
            }, 3000);
            return;
        }
        const formData = new FormData();
        chosenFiles.forEach(file => {
            console.log(file);
            formData.append('attachments[]', file.file);
        });
        formData.append('message', newMessage);
        if(conversation.is_user){
            formData.append('receiver_id', conversation.id);
        } else if (conversation.is_group) {
            formData.append('group_id', conversation.id);
        }


        // const formDataObject = {};
        // for (const [key, value] of formData.entries()) {
        //     formDataObject[key] = value;
        // }

        // console.log(formDataObject);

        setMessageSending(true);
        axios.post(route("message.store"), formData, {
            onUploadProgress:(e) => {
                const progress = Math.round(
                    (e.loaded / e.total) * 100
                )
                console.log(progress);
                setUploadProgress(progress);
            }
        }).then((res) => {
            console.log("responce", res);
            setNewMessage("");
            setMessageSending(false);
            setUploadProgress(0);
            setChosenFiles([]);
        }).catch((err) => {
            setMessageSending(false);
            setChosenFiles([]);
            const message = err?.res?.data?.message;
            setInputErrorMessage(
                message || "An error occurred while sending message"
            )
        });
    }
    const onLikeClick = () => {
        if(messageSending){
            return;
        }
        const data = {
            message:"👍",
        }
        if(conversation.is_user){
            data['receiver_id'] = conversation.id;
        } else if (conversation.is_group) {
            data['group_id'] = conversation.id;
        }
        axios.post(route("message.store", data));
    }

    const removeAttachment = (name) => {
        setChosenFiles((prevFiles) =>
            prevFiles.filter((file) => file.file.name !== name)
        );
    };

    const recordedAudioReady = (file, url) => {
        setChosenFiles((prevFiles) => [...prevFiles,{file,url}]);
    }

    return (
        <div>
            {chosenFiles.length > 0 && (
                <div className="flex flex-col items-center gap-1 mt-2 fixed w-auto max-h-[250px] bg-gray-800 taankicha px-4 overflow-y-auto overflow-x-hidden">
                    {chosenFiles.map((file) => (
                        <div
                            key={file.file.name}
                            className={`relative flex justify-between cursor-pointer border my-3 ${
                                !isImage(file.file) ? "w-[200px]" : "w-[260px]"
                            }`}
                        >
                            {isImage(file.file) && (
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-16 h-16 object-cover"
                                />
                            )}
                            {isAudio(file.file) && (
                                <CustomAudioPlayer file={file} showVolume={false} />
                            )}
                            {!isAudio(file.file) && (
                                <AttachmentPreview file={file} />
                            )}

                            <button
                                onClick={() => removeAttachment(file.file.name)}
                                className="absolute w-6 h-6 rounded-full bg-gray-800 -right-2 -top-2 text-gray-300 hover:text-gray-100 z-10"
                            >
                                <XCircleIcon className="w-6" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex flex-wrap items-start border-t border-slate-700 py-3 h-auto">
                <div className="order-2 flex-1 xs:flex-none xs:order-1 p-2 flex">
                    <button className="p-1 text-gray-400 hover:text-gray-300 relative flex items-center">
                        <PaperClipIcon className="w-6" />
                        <input type="file" multiple onChange={onFileChange} className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-300 relative flex items-center">
                        <PhotoIcon className="w-6" />
                        <input type="file" multiple onChange={onFileChange} accept="image/*" className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer" />
                    </button>
                    <AudioRecorder fileReady={recordedAudioReady}/>
                </div>
                <div className="order-1 px-3 xs:p-0 basis-full xs:basis-0 xs:order-2 flex-1">
                    <div className="flex">
                        <NewMessageInput value={newMessage} isSending={messageSending} onSend={onSendClick} onChange={(e) => setNewMessage(e.target.value)} />
                        <button onClick={onSendClick} disabled={messageSending} className="btn btn-info rounded-l-none">
                            {messageSending && (
                                <span className="loading loading-spinner loading-xs"></span>
                            )}
                            <PaperAirplaneIcon className="w-6" />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </div>
                    {!!uploadProgress && (
                        <progress
                            className="progress progress-info w-full"
                            value={uploadProgress}
                            max="100"
                        ></progress>
                    )}
                    {inputErrorMessage && (
                        <p className="text-xs text-red-400 text-center">{inputErrorMessage}</p>
                    )}
                </div>
                <div className="order-3 xs:order-3 p-2 flex">
                    <Popover className="relative">
                        <Popover.Button className="p-1 text-gray-400 hover:text-gray-300">
                            <FaceSmileIcon className="w-6 h-6" />
                        </Popover.Button>
                        <Popover.Panel className="absolute z-10 right-0 bottom-full">
                            <EmojiPicker theme="dark" onEmojiClick={ev => setNewMessage(newMessage + ev.emoji)} />
                        </Popover.Panel>
                    </Popover>
                    <button onClick={onLikeClick} className="p-1 text-gray-400 hover:text-gray-300">
                        <HandThumbUpIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MessageInput;
