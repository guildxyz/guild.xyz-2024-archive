import { useWeb3ConnectionManager } from "@/components/Web3ConnectionManager/hooks/useWeb3ConnectionManager"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSWRWithOptionalAuth from "hooks/useSWRWithOptionalAuth"
import { ConnectPolygonIDModal } from "requirements/PolygonID/components/ConnectPolygonID"
import { JoinStep } from "./JoinStep"

const ConnectPolygonIDJoinStep = (): JSX.Element => {
  const { isWeb3Connected } = useWeb3ConnectionManager()

  const { data: isDone, isLoading } = useSWRWithOptionalAuth(
    `/v2/util/gate-proof-existence/POLYGON_ID_BASIC_MAIN`
  )

  const { onOpen, onClose, isOpen } = useDisclosure()

  return (
    <>
      <JoinStep
        isDone={isDone}
        title="Connect PolygonID"
        disabledText="Connect wallet first"
        buttonProps={{
          leftIcon: (
            <img src="/requirementLogos/polygonId_white.svg" className="size-6" />
          ),
          disabled: !isWeb3Connected,
          isLoading,
          // TODO: extract it to a constant, just like we did with PLATFORM_COLORS
          className:
            "bg-purple-500 hover:bg-purple-600 hover:dark:bg-purple-400 active:bg-purple-700 active:dark:bg-purple-300 text-white",
          onClick: onOpen,
          children: isDone ? "Connected" : "Connect",
        }}
      />

      <ConnectPolygonIDModal
        type="POLYGON_ID_BASIC_MAIN"
        data={{}}
        onClose={onClose}
        isOpen={isOpen}
      />
    </>
  )
}

// biome-ignore lint/style/noDefaultExport: we only load this component dynamically, so it's much more convenient to use a default export here
export default ConnectPolygonIDJoinStep
