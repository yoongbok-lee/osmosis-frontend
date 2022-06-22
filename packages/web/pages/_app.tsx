import Image from "next/image";
import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css
import { enableStaticRendering } from "mobx-react-lite";
import type { AppProps } from "next/app";
import { ToastContainer, Bounce } from "react-toastify";
import { StoreProvider } from "../stores";
import { MainLayout } from "../components/layouts";
import { TempBanner } from "../components/alert/temp-banner";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { GetKeplrProvider, useWindowSize } from "../hooks";
import { IbcNotifier } from "../stores/ibc-notifier";
import { IS_FRONTIER } from "../config";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);
enableStaticRendering(typeof window === "undefined");

function MyApp({ Component, pageProps }: AppProps) {
  const { isMobile } = useWindowSize();

  const menus = [
    {
      label: "Trade",
      link: "/",
      icon: IS_FRONTIER ? "/icons/trade-white.svg" : "/icons/trade.svg",
      iconSelected: "/icons/trade-selected.svg",
      selectionTest: /\/$/,
    },
    {
      label: "Pools",
      link: "/pools",
      icon: IS_FRONTIER ? "/icons/pool-white.svg" : "/icons/pool.svg",
      iconSelected: "/icons/pool-selected.svg",
      selectionTest: /\/pools/,
    },
    {
      label: "Assets",
      link: "/assets",
      icon: IS_FRONTIER ? "/icons/asset-white.svg" : "/icons/asset.svg",
      iconSelected: "/icons/asset-selected.svg",
      selectionTest: /\/assets/,
    },
    {
      label: "Stake",
      link: "https://wallet.keplr.app/#/osmosis/stake",
      icon: IS_FRONTIER ? "/icons/ticket-white.svg" : "/icons/ticket.svg",
    },
    {
      label: "Vote",
      link: "https://wallet.keplr.app/#/osmosis/governance",
      icon: IS_FRONTIER ? "/icons/vote-white.svg" : "/icons/vote.svg",
    },
    {
      label: "Info",
      link: "https://info.osmosis.zone",
      icon: IS_FRONTIER ? "/icons/chart-white.svg" : "/icons/chart.svg",
    },
  ];

  if (!IS_FRONTIER && !isMobile) {
    menus.push({
      label: "Pixel",
      link: "/pixels",
      icon: "/icons/osmopixel.png",
      iconSelected: "/icons/osmopixel.png",
      selectionTest: /\/pixels/,
    });
  }

  return (
    <GetKeplrProvider>
      <StoreProvider>
        <IbcNotifier />
        <TempBanner
          localStorageKey="ack_is_testnet"
          title="Welcome to the Osmosis Testnet."
          message={
            <>
              Head over to{" "}
              <a
                className="inline underline mr-1"
                href="https://faucet.osmosis.zone/"
                rel="noreferrer"
                target="_blank"
              >
                faucet.osmosis.zone
              </a>
              <Image
                className="opacity-50"
                alt="link"
                src="/icons/external-link-white.svg"
                height={10}
                width={10}
              />{" "}
              to get some tokens to play with. Practice good citizenry, don{"'"}
              t abuse this service--the number of available tokens is limited.
            </>
          }
        />
        <MainLayout menus={menus}>
          <Component {...pageProps} />
          <ToastContainer
            toastStyle={{
              backgroundColor: IS_FRONTIER ? "#2E2C2F" : "#2d2755",
            }}
            transition={Bounce}
          />
        </MainLayout>
      </StoreProvider>
    </GetKeplrProvider>
  );
}

export default MyApp;
