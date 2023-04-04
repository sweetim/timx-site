"use client"

import type { ReactNode } from "react";
import { FC, useCallback, useContext, useEffect, useState, createContext } from "react";

import type { AccountState, WalletSelector } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupModal } from "@near-wallet-selector/modal-ui";

import { distinctUntilChanged, map } from "rxjs";

import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNarwallets } from "@near-wallet-selector/narwallets";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupSender } from "@near-wallet-selector/sender";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupNearSnap } from "@near-wallet-selector/near-snap";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupXDEFI } from "@near-wallet-selector/xdefi";
import { setupNeth } from "@near-wallet-selector/neth";
import { setupOptoWallet } from "@near-wallet-selector/opto-wallet";
import { setupFinerWallet } from "@near-wallet-selector/finer-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";

import { CONTRACT_ADDRESS, getContractEnvironment } from "@/app/modules/counter/contract";

declare global {
    interface Window {
        selector: WalletSelector;
        modal: WalletSelectorModal;
    }
}

interface WalletSelectorContextValue {
    selector: WalletSelector;
    modal: WalletSelectorModal;
    accounts: Array<AccountState>;
    accountId: string | null;
}

const WalletSelectorContext = createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider: FC<{
    children: ReactNode;
}> = ({ children }) => {
    const [selector, setSelector] = useState<WalletSelector | null>(null);
    const [modal, setModal] = useState<WalletSelectorModal | null>(null);
    const [accounts, setAccounts] = useState<Array<AccountState>>([]);

    const init = useCallback(async () => {
        const _selector = await setupWalletSelector({
            network: getContractEnvironment().networkId,
            debug: true,
            modules: [
                setupMyNearWallet(),
                setupLedger(),
                setupNearWallet(),
                setupSender(),
                setupMathWallet(),
                setupNightly(),
                setupMeteorWallet(),
                setupNearSnap(),
                setupNarwallets(),
                setupWelldoneWallet(),
                setupHereWallet(),
                setupCoin98Wallet(),
                setupNearFi(),
                setupNeth({
                    gas: "300000000000000",
                    bundle: false,
                }),
                setupOptoWallet(),
                setupFinerWallet(),
                setupXDEFI(),
                setupWalletConnect({
                    projectId: "e9e38e0cb406f453196879846291454f",
                    metadata: {
                        name: "NEAR Wallet Selector",
                        description: "Example dApp used by NEAR Wallet Selector",
                        url: "https://github.com/near/wallet-selector",
                        icons: ["https://avatars.githubusercontent.com/u/37784886"],
                    },
                }),
            ],
        });
        const _modal = setupModal(_selector, {
            contractId: CONTRACT_ADDRESS,
        });
        const state = _selector.store.getState();
        setAccounts(state.accounts);

        window.selector = _selector;
        window.modal = _modal;

        setSelector(_selector);
        setModal(_modal);
    }, []);

    useEffect(() => {
        init().catch((err) => {
            console.error(err);
            alert("Failed to initialise wallet selector");
        });
    }, [init]);

    useEffect(() => {
        if (!selector) {
            return;
        }

        const subscription = selector.store.observable
            .pipe(
                map((state) => state.accounts),
                distinctUntilChanged()
            )
            .subscribe((nextAccounts) => {
                console.log("Accounts Update", nextAccounts);

                setAccounts(nextAccounts);
            });

        const onHideSubscription = modal!.on("onHide", ({ hideReason }) => {
            console.log(`The reason for hiding the modal ${hideReason}`);
        });

        return () => {
            subscription.unsubscribe();
            onHideSubscription.remove();
        };
    }, [selector]);

    if (!selector || !modal) {
        return <>
            <p>loading..</p>
        </>;
    }

    const accountId =
        accounts.find((account) => account.active)?.accountId || null;

    return (
        <WalletSelectorContext.Provider
            value={{
                selector,
                modal,
                accounts,
                accountId,
            }}
        >
            {children}
        </WalletSelectorContext.Provider>
    );
};

export function useWalletSelector() {
    const context = useContext(WalletSelectorContext);

    if (!context) {
        throw new Error(
            "useWalletSelector must be used within a WalletSelectorContextProvider"
        );
    }

    return context;
}
