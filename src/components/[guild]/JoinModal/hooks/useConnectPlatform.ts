import { usePrevious } from "@chakra-ui/react"
import useUser from "components/[guild]/hooks/useUser"
import useDatadog from "components/_app/Datadog/useDatadog"
import { usePostHogContext } from "components/_app/PostHogProvider"
import useShowErrorToast from "hooks/useShowErrorToast"
import { SignedValdation, useSubmitWithSign } from "hooks/useSubmit"
import { useEffect } from "react"
import { PlatformName } from "types"
import fetcher from "utils/fetcher"
import useDCAuth from "./useDCAuth"
import useGHAuth from "./useGHAuth"
import useGoogleAuth from "./useGoogleAuth"
import useTGAuth from "./useTGAuth"
import useTwitterAuth from "./useTwitterAuth"

const parseConnectError = (
  error: string
):
  | string
  | {
      params: Record<string, string>
      errors: { msg: string }[]
    } => {
  const regex = /^"(\d+)".*params: ({.*}), error: (\[.*\])/

  try {
    const [, rawNumber, rawParams, rawErrors] = error.match(regex)
    const number: number = parseInt(rawNumber)
    const params: Record<string, string> = JSON.parse(rawParams)
    const errors: { msg: string }[] = JSON.parse(rawErrors)

    if (
      typeof number !== "number" ||
      isNaN(number) ||
      !params ||
      !Array.isArray(errors)
    )
      return error

    return { params, errors }
  } catch {
    return error
  }
}

const platformAuthHooks: Record<
  Exclude<PlatformName, "POAP">,
  (scope?: string) => any
> = {
  DISCORD: useDCAuth,
  GITHUB: useGHAuth,
  TWITTER: useTwitterAuth,
  TELEGRAM: useTGAuth,
  GOOGLE: useGoogleAuth,
}

const useConnectPlatform = (
  platform: PlatformName,
  onSuccess?: () => void,
  isReauth?: boolean, // Temporary, once /connect works without it, we can remove this
  scope?: string
) => {
  const { platformUsers } = useUser()
  const { onOpen, authData, isAuthenticating, ...rest } =
    platformAuthHooks[platform]?.(scope) ?? {}
  const prevAuthData = usePrevious(authData)

  const { onSubmit, isLoading, response } = useConnect(() => {
    onSuccess?.()
  })

  useEffect(() => {
    // couldn't prevent spamming requests without all these three conditions
    if (!platformUsers || !authData || prevAuthData) return

    onSubmit({
      platformName: platform,
      authData,
      reauth: isReauth || undefined,
    })
  }, [authData, platformUsers])

  return {
    onConnect: onOpen,
    isLoading: isAuthenticating || isLoading,
    loadingText: isAuthenticating && "Confirm in the pop-up",
    response,
    authData,
    ...rest,
  }
}

const useConnect = (onSuccess?: () => void) => {
  const { captureEvent } = usePostHogContext()
  const { addDatadogAction, addDatadogError } = useDatadog()
  const showErrorToast = useShowErrorToast()

  const { mutate: mutateUser } = useUser()

  const submit = (signedValidation: SignedValdation) =>
    fetcher("/user/connect", signedValidation).then((body) => {
      if (body === "rejected") {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "Something went wrong, connect request rejected."
      }

      if (typeof body === "string") {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw body
      }

      return body
    })

  return useSubmitWithSign<{
    platformName: PlatformName
    authData: any
    reauth?: boolean
  }>(submit, {
    onSuccess: () => {
      addDatadogAction("Successfully connected 3rd party account")
      mutateUser()
      onSuccess?.()
    },
    onError: (rawError) => {
      const errorObject = { error: undefined }
      let toastError

      if (typeof rawError === "string") {
        const parsedError = parseConnectError(rawError)
        errorObject.error = parsedError
        toastError =
          typeof parsedError === "string" ? parsedError : parsedError.errors[0].msg
      } else {
        errorObject.error = rawError
      }

      captureEvent("Platform connection error", errorObject)
      showErrorToast(toastError ?? rawError)
      addDatadogError("3rd party account connection error", errorObject)
    },
  })
}

export default useConnectPlatform
export { platformAuthHooks, useConnect }
