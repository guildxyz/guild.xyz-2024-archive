import { Header } from "@/components/Header"
import {
  Layout,
  LayoutBanner,
  LayoutHeadline,
  LayoutHero,
  LayoutMain,
} from "@/components/Layout"
import { LayoutContainer, LayoutFooter } from "@/components/Layout/Layout"
import { Anchor } from "@/components/ui/Anchor"
import {} from "@/components/ui/Avatar"
import { Center, Heading, Spinner } from "@chakra-ui/react"
import AccessHub from "components/[guild]/AccessHub"
import { GuildPageBanner } from "components/[guild]/GuildPageBanner"
import { GuildPageImageAndName } from "components/[guild]/GuildPageImageAndName"
import JoinButton from "components/[guild]/JoinButton"
import JoinModalProvider from "components/[guild]/JoinModal/JoinModalProvider"
import LeaveButton from "components/[guild]/LeaveButton"
import { MintGuildPinProvider } from "components/[guild]/Requirements/components/GuildCheckout/MintGuildPinContext"
import Roles from "components/[guild]/Roles"
import SocialIcon from "components/[guild]/SocialIcon"
import useStayConnectedToast from "components/[guild]/StayConnectedToast"
import { ThemeProvider, useThemeContext } from "components/[guild]/ThemeContext"
import useGuild from "components/[guild]/hooks/useGuild"
import useGuildPermission from "components/[guild]/hooks/useGuildPermission"
import BackButton from "components/common/Layout/components/BackButton"
import LinkPreviewHead from "components/common/LinkPreviewHead"
import Section from "components/common/Section"
import useMembership from "components/explorer/hooks/useMembership"
import { GetStaticPaths, GetStaticProps } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import ErrorPage from "pages/_error"
import { useEffect } from "react"
import { MintPolygonIDProofProvider } from "rewards/PolygonID/components/MintPolygonIDProofProvider"
import { SWRConfig } from "swr"
import { Guild, SocialLinkKey } from "types"
import fetcher from "utils/fetcher"
import { addIntercomSettings } from "utils/intercom"
import parseDescription from "utils/parseDescription"

const DynamicOngoingIssuesBanner = dynamic(
  () => import("components/[guild]/OngoingIssuesBanner")
)
const DynamicEditGuildButton = dynamic(() => import("components/[guild]/EditGuild"))
const DynamicAddAndOrderRoles = dynamic(
  () => import("components/[guild]/AddAndOrderRoles")
)
const DynamicAddRewardAndCampaign = dynamic(
  () => import("components/[guild]/AddRewardAndCampaign")
)
const DynamicMembersExporter = dynamic(
  () => import("components/[guild]/Members/components/MembersExporter")
)
const DynamicActiveStatusUpdates = dynamic(
  () => import("components/[guild]/ActiveStatusUpdates")
)
const DynamicRecheckAccessesButton = dynamic(() =>
  import("components/[guild]/RecheckAccessesButton").then(
    (module) => module.TopRecheckAccessesButton
  )
)
const DynamicDiscordBotPermissionsChecker = dynamic(
  () => import("components/[guild]/DiscordBotPermissionsChecker"),
  {
    ssr: false,
  }
)

const GuildPage = (): JSX.Element => {
  const {
    name,
    description,
    imageUrl,
    memberCount,
    socialLinks,
    tags,
    featureFlags,
    isDetailed,
  } = useGuild()

  const { isAdmin } = useGuildPermission()
  const { isMember } = useMembership()

  const { localThemeColor } = useThemeContext()

  useStayConnectedToast()

  return (
    <>
      <Head>
        <meta name="theme-color" content={localThemeColor} />
      </Head>

      {featureFlags?.includes("ONGOING_ISSUES") && <DynamicOngoingIssuesBanner />}

      <Layout>
        <LayoutHero>
          <LayoutBanner>
            <GuildPageBanner />
          </LayoutBanner>

          <Header />

          <LayoutContainer className="-mb-14 mt-6">
            <BackButton />
          </LayoutContainer>

          <LayoutHeadline className="pt-8">
            <GuildPageImageAndName />

            {isAdmin && isDetailed ? (
              <DynamicEditGuildButton />
            ) : !isMember ? (
              <JoinButton />
            ) : (
              <LeaveButton />
            )}
          </LayoutHeadline>

          {(description || Object.keys(socialLinks ?? {}).length > 0) && (
            <LayoutContainer className="mt-6 font-semibold">
              {description && parseDescription(description)}
              {Object.keys(socialLinks ?? {}).length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {Object.entries(socialLinks ?? {}).map(([type, link]) => {
                    const prettyLink = link
                      .replace(/(http(s)?:\/\/)*(www\.)*/i, "")
                      .replace(/\?.*/, "") // trim query params
                      .replace(/\/+$/, "") // trim ending slash

                    return (
                      <div key={type} className="flex items-center gap-1.5">
                        <SocialIcon type={type as SocialLinkKey} size="sm" />
                        <Anchor
                          href={link?.startsWith("http") ? link : `https://${link}`}
                          className="font-semibold text-banner-foreground text-sm"
                        >
                          {prettyLink}
                        </Anchor>
                      </div>
                    )
                  })}
                </div>
              )}
            </LayoutContainer>
          )}
        </LayoutHero>

        <LayoutMain className="flex flex-col items-start gap-8">
          <Section
            titleRightElement={isAdmin ? <DynamicAddRewardAndCampaign /> : undefined}
          >
            <AccessHub />
          </Section>

          <Section
            titleRightElement={isAdmin ? <DynamicAddAndOrderRoles /> : undefined}
          >
            <Roles />
          </Section>

          {isAdmin && <DynamicMembersExporter />}
          {isAdmin && <DynamicActiveStatusUpdates />}
        </LayoutMain>

        <LayoutFooter />
      </Layout>

      {isAdmin && <DynamicDiscordBotPermissionsChecker />}
    </>
  )
}

type Props = {
  fallback: { string: Guild }
}

const GuildPageWrapper = ({ fallback }: Props): JSX.Element => {
  const guild = useGuild()

  useEffect(() => {
    if (!guild?.id) return

    addIntercomSettings({
      guildId: guild.id,
      featureFlags: guild.featureFlags?.toString(),
      memberCount: guild.memberCount,
    })
  }, [guild])

  if (!fallback) {
    if (guild.isLoading)
      return (
        <Center h="100vh" w="screen">
          <Spinner />
          <Heading fontFamily={"display"} size="md" ml="4" mb="1">
            Loading guild...
          </Heading>
        </Center>
      )

    if (!guild.id) return <ErrorPage statusCode={404} />
  }

  return (
    <>
      <LinkPreviewHead path={Object.values(fallback)[0].urlName} />
      <Head>
        <title>{Object.values(fallback)[0].name}</title>
        <meta property="og:title" content={Object.values(fallback)[0].name} />
        <link
          rel="shortcut icon"
          href={Object.values(fallback)[0].imageUrl ?? "/guild-icon.png"}
        />
        <meta name="description" content={Object.values(fallback)[0].description} />
        <meta
          property="og:description"
          content={Object.values(fallback)[0].description}
        />
      </Head>
      <SWRConfig value={fallback && { fallback }}>
        <ThemeProvider>
          <MintGuildPinProvider>
            <MintPolygonIDProofProvider>
              <JoinModalProvider>
                <GuildPage />
              </JoinModalProvider>
            </MintPolygonIDProofProvider>
          </MintGuildPinProvider>
        </ThemeProvider>
      </SWRConfig>
    </>
  )
}

const getStaticProps: GetStaticProps = async ({ params }) => {
  const endpoint = `/v2/guilds/guild-page/${params.guild?.toString()}`

  const data = await fetcher(endpoint).catch((_) => ({}))

  if (!data?.id)
    return {
      props: {},
      revalidate: 300,
    }

  /**
   * Removing members and requirements, so they're not included in the SSG source
   * code, we only fetch them client side. Temporary until we switch to the new API
   * that won't return them on this endpoint anyway
   */
  const filteredData = { ...data }
  filteredData.roles?.forEach((role) => {
    role.members = []
    role.requirements = []
  })
  filteredData.isFallback = true

  return {
    props: {
      fallback: {
        [endpoint]: filteredData,
      },
    },
    revalidate: 300,
  }
}

const getStaticPaths: GetStaticPaths = async () => {
  const mapToPaths = (_: Guild[]) =>
    Array.isArray(_)
      ? _.map(({ urlName: guild }) => ({
          params: { guild },
        }))
      : []

  const paths = await fetcher(`/v2/guilds`).then(mapToPaths)

  return {
    paths,
    fallback: "blocking",
  }
}

export { getStaticPaths, getStaticProps }

export default GuildPageWrapper
