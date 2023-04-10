"use client"

import { useEffect, useState } from "react";
import { initFlowbite } from "flowbite";

import { CounterRecord, queryAllRecords } from "@/app/modules/counter/contract";
import { ActionCounter, Timeline } from "@/app/modules/counter/components";

export default function CounterPage() {
    const [records, setRecords] = useState<Array<CounterRecord>>([])

    useEffect(() => {
        initFlowbite()
    }, [])

    useEffect(() => {
        queryAllRecords().then(setRecords)
    }, [])

    return (
        <div className="flex flex-col sm:flex-row h-full">
            <div className="w-full sm:w-1/2">
                <div className="flex justify-center items-center h-full p-8">
                    <ActionCounter />
                </div>
            </div>
            <div className="w-full sm:w-1/2 pl-6 overflow-y-auto">
                <Timeline records={records} />
            </div>
        </div>
    )
}
