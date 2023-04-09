import { FC } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

import { NearLogo } from "@/app/icons";

const ChainDropDownMenu: FC = () => {
    return (
        <div>
            <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="dropdown"
                className="text-white rounded-lg text-sm px-2 py-2 text-center inline-flex items-center hover:bg-slate-700 "
                type="button">
                <NearLogo className="mr-1 fill-white w-4" />
                <ChevronDownIcon className="w-6 h-6" />
            </button>
            {/* <!-- Dropdown menu --> */}
            <div
                id="dropdown"
                className="z-10 hidden divide-y divide-gray-100 rounded-lg shadow bg-gray-700">
                <ul
                    className="py-2 text-sm text-gray-200"
                    aria-labelledby="dropdownDefaultButton">
                    <li>
                        <span className="block px-4 py-2 hover:bg-gray-600 hover:text-white">
                            mainnet
                        </span>
                    </li>
                    <li>
                        <span className="block px-4 py-2 hover:bg-gray-600 hover:text-white">
                            testnet
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ChainDropDownMenu;
