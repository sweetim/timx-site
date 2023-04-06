import "@near-wallet-selector/modal-ui/styles.css";

import { WalletSelectorContextProvider } from "@/app/context/WalletSelectorContext"
import Counter from "@/app/modules/counter/components/Counter";

export default function CounterPage() {
    return (
        <WalletSelectorContextProvider>
            <Counter />
        </WalletSelectorContextProvider>
    )
}
