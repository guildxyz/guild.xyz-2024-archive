import { Header } from "@/components/Header"
import { Layout, LayoutBanner, LayoutHero, LayoutMain } from "@/components/Layout"
import svgToTinyDataUri from "mini-svg-data-uri"
import type { Metadata } from "next"
import { OnboardingDriver } from "./_components/OnboardingDriver"

export const metadata: Metadata = {
  title: "Create profile",
}

const Page = () => {
  // todo: get finetuned layout from new create-guild
  return (
    <Layout className="relative min-h-screen">
      <div
        className="-z-10 absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent -250%, hsl(var(--background)) 80%), url("${svgToTinyDataUri(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#666"><path d="M0 .5H31.5V32"/></svg>`
          )}")`,
        }}
      />
      <LayoutHero>
        <Header />
        <LayoutBanner className="-bottom-[206px] border-border border-b border-dashed dark:bg-banner-dark">
          <div className="absolute inset-0 bg-[auto_115%] bg-[top_5px_right_0] bg-[url('/banner.svg')] bg-repeat opacity-10" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at bottom, transparent 5%, var(--banner-dark))",
            }}
          />
        </LayoutBanner>
      </LayoutHero>
      <LayoutMain>
        <div className="my-8">
          <OnboardingDriver />
        </div>
      </LayoutMain>
    </Layout>
  )
}

export default Page
