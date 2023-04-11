"use client"

import { useEffect, useState } from "react";
import { initFlowbite } from "flowbite";
import { InformationCircleIcon } from "@heroicons/react/24/solid"

import { CounterRecord, queryAllRecords } from "@/app/modules/counter/contract";
import { ActionCounter, Timeline } from "@/app/modules/counter/components";
import { NearLogo } from "../icons";

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
            <div className="w-full sm:w-1/2 flex flex-col">
                <div className="flex justify-center items-center h-full pt-4 pb-4">
                    <ActionCounter />
                </div>
                <div className="flex justify-center items-center pb-5">
                    <InformationCircleIcon className="w-6 h-6 fill-slate-300 mr-1" />
                    <p className="text-white mr-1">each action costs <strong>0.01</strong></p>
                    <NearLogo className=" w-6 h-6 p-1 fill-white"/>
                </div>
            </div>
            <div className="w-full sm:w-1/2 pl-6 overflow-y-auto">
                <Timeline records={records} />
            </div>
        </div>
    )
}
