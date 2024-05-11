import { useEffect, useRef } from "react";

const NewMessageInput = ({ value, onChange, onSend, isSending }) => {
    const input = useRef();

    const onInputKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    }

    const onChangeEvent = (e) => {
        onChange(e);
        adjustHeight();
    }

    const adjustHeight = () => {
        input.current.style.height = "50px";
        input.current.style.height = input.current.scrollHeight + "px";
    }

    useEffect(() => {
        adjustHeight();
    }, [value])

    return (
        <textarea
            disabled={isSending}
            ref={input}
            value={value}
            placeholder="Type a message"
            onKeyDown={onInputKeyDown}
            onChange={(e) => onChangeEvent(e)}
            className="input input-bordered w-full rounded-r-none py-[10px] resize-none overflow-y-auto"
            style={{ minHeight: '50px' }}
        />
    );
}

export default NewMessageInput;
