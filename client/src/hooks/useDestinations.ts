import {useState} from "react";
import {Destination} from "../types/destination";

export const useDestinations = () => {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(false);

    const searchDestinations = async (query: string) =>{
        setLoading(true);
        try{
            const res = await fetch(`http://localhost:6039/api/destinations?search=${encodeURIComponent(query)}`);
            const data = await res.json();
            setDestinations(data);
        } catch (error){
            console.error("Failed to fetch destinations", error);
        } finally{
            setLoading(false);
        }
    };

    return{
        destinations,
        loading,
        searchDestinations
    };
};