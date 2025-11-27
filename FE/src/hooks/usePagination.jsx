import { useState, useMemo } from "react";

const usePagination= (data = [], itemsPerPage=5)=>{
    const [page, setPage] = useState(1);

    const pages = useMemo(()=>{
        return Math.ceil(data.length/itemsPerPage);
    },[data,itemsPerPage]);

    const currentData = useMemo(()=>{
        const start = (page-1) *itemsPerPage;
        const end = start+ itemsPerPage
        return data.slice(start,end);
    }, [data,page,itemsPerPage]);

    return{page, pages, currentData,setPage};
};

export default usePagination;