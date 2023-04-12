"use client"

import { useEffect, useState } from "react";
import { initFlowbite } from "flowbite";
import { InformationCircleIcon } from "@heroicons/react/24/solid"

import { utils } from "near-api-js"

import { CounterRecord, getEntryFee, queryAllRecords } from "@/app/modules/counter/contract";
import { ActionCounter, Timeline } from "@/app/modules/counter/components";
import { NearLogo } from "../icons";

export default function CounterPage() {
    const [records, setRecords] = useState<Array<CounterRecord>>([])
    const [entryFee, setEntryFee] = useState<string>("")

    useEffect(() => {
        initFlowbite()
    }, [])

    useEffect(() => {
        getEntryFee().then(setEntryFee)
        queryAllRecords().then(setRecords)
    }, [])

    const entryFeeText = utils.format.formatNearAmount(entryFee)

    return (
        <div className="flex flex-col sm:flex-row h-full">
            <div className="w-full sm:w-1/2 flex flex-col">
                <div className="flex flex-col flex-1 justify-center items-center pt-4">
                    <ActionCounter entryFee={entryFee} />
                    <div className="flex justify-center items-center p-5">
                        <InformationCircleIcon className="w-6 h-6 fill-slate-300 mr-1" />
                        <p className="text-white mr-1">each action costs <strong>{entryFeeText}</strong></p>
                        <NearLogo className=" w-6 h-6 p-1 fill-white"/>
                    </div>
                </div>
            </div>
            <div className="w-full sm:w-1/2 pl-6 overflow-y-auto">
                <Timeline records={records} />
            </div>
        </div>
    )
}
