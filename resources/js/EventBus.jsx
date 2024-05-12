import React, { useContext, useState } from "react";


export const EventBusContext = React.createContext();


export const EventBusProvider = ({ children }) => {

    const [events, setEvents] = useState({});

    const emit = (name, data) => {
        if(events[name]) {
            for(let cb of events[name]) {
                cb(data);
            }
        }
    }

    const on = (name, cb) => {
        if(!events[name]) {
            events[name] = [];
        }

        events[name].push(cb);

        return () => {
            events[name] = events[name].filter((ele) => ele !== cb)
        };
    }

    return (
        <EventBusContext.Provider value={{ emit, on }}>
            {children}
        </EventBusContext.Provider>
    );
}

export const useEventBus = () => {
    return useContext(EventBusContext);
}
