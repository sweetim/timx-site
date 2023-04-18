"use client"

import { FC, useEffect, useState } from "react"
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid"
import { MIN_GAS_FEE, MethodName, getValue } from "../contract";
import { useWalletSelector } from "@/app/context/WalletSelectorContext";
import { QuestionMarkIcon } from "@/app/icons";

type ActionCounterProps = {
    entryFee: string
}

const ActionCounter: FC<ActionCounterProps> = ({ entryFee }) => {
    const { selector, accountId } = useWalletSelector();

    const [value, setValue] = useState<string>("...")

    const isVisible = !!accountId

    useEffect(() => {
        getValue().then(setValue)
    }, []);

    async function signAndSendTransaction(methodName: string) {
        if (!accountId) {
            return;
        }

        const wallet = await selector.wallet();

        return await wallet.signAndSendTransaction({
            signerId: accountId,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName,
                        args: {},
                        gas: MIN_GAS_FEE,
                        deposit: entryFee,
                    },
                },
            ],
        })
    }

    async function incrementHandler() {
        signAndSendTransaction(MethodName.Increment)
    }

    async function decrementHandler() {
        signAndSendTransaction(MethodName.Decrement)
    }

    async function randomHandler() {
        signAndSendTransaction(MethodName.Random)
    }

    return (
        <div className="flex flex-col justify-center items-center">
            {isVisible && <button
                onClick={incrementHandler}
                type="button"
                className="border stroke-white focus:ring-4 focus:outline-none font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-blue-500 text-blue-500 hover:text-white focus:ring-blue-800 hover:bg-blue-500">
                <PlusIcon className="w-6" />
                <span className="sr-only">Increment</span>
            </button>}

            <div className="relative">
                <h1 className="m-6 text-9xl	font-extrabold text-white">
                    {value}
                </h1>
                {isVisible && <button
                    onClick={randomHandler}
                    type="button"
                    className="absolute bottom-1/3 -right-1/2 border focus:ring-4 focus:outline-none font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-blue-500 text-blue-500 hover:text-white focus:ring-blue-800 hover:bg-blue-500">
                    <QuestionMarkIcon className="w-6 h-6" />
                    <span className="sr-only">Random</span>
                </button>}
            </div>

            {isVisible && <button
                onClick={decrementHandler}
                type="button"
                className="border stroke-white focus:ring-4 focus:outline-none font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-blue-500 text-blue-500 hover:text-white focus:ring-blue-800 hover:bg-blue-500">
                <MinusIcon className="w-6" />
                <span className="sr-only">Decrement</span>
            </button>}
        </div>
    )

}

export default ActionCounter
