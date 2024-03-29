import { FC, useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { CounterAction, CounterRecord } from "../contract"
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid"
import { QuestionMarkIcon } from "@/app/icons"

export type TimelineProps = {
    records: CounterRecord[]
}

const Timeline: FC<TimelineProps> = ({ records }) => {
    function renderTimeline(records: CounterRecord[]) {
        const getActionIcon = (action: CounterAction): JSX.Element => {
            const ACTION_ICONS: Record<CounterAction, JSX.Element> = {
                Increment: <PlusIcon className="fill-lime-300"/>,
                Decrement: <MinusIcon className="fill-rose-500" />,
                Random: <QuestionMarkIcon className="p-1 stroke-orange-500" />
            }

            return ACTION_ICONS[action]
        }

        return records
            .map(({ timestamp_ms, action, user }) => ({
                user,
                icon: getActionIcon(action),
                relativeTime: `${formatDistanceToNow(timestamp_ms)} ago`,
                timestamp_ms,
                timestampText: (new Date(timestamp_ms)).toLocaleString(),
            }))
            .map(record => {
                return (
                    <li key={record.timestamp_ms} className="m-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-900 rounded-full -left-3">
                            {record.icon}
                        </span>
                        <h3 className="mb-1 text-lg font-semibold text-white">{record.user}</h3>
                        <time className="block mb-2 text-sm font-normal leading-none text-gray-500">{record.relativeTime}</time>
                        <time className="block mb-2 text-sm font-normal leading-none text-gray-500">{record.timestampText}</time>
                    </li>
                )
            })
    }

    const timeline = useMemo(() => renderTimeline(records), [records])

    return (
        <ol className="relative border-l border-gray-700">
            {timeline}
        </ol>
    )

}

export default Timeline
