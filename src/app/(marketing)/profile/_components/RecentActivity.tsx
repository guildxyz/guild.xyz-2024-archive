"use client"

import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup"
import { Circle, Rocket } from "@phosphor-icons/react"
import { useState } from "react"

const ACTIVITY_FILTERS = ["All", "Editing", "Join", "NFTs"] as const

export const RecentActivity = () => {
  const [activityFilter, setActivityFilter] =
    useState<(typeof ACTIVITY_FILTERS)[number]>("All")

  return (
    <>
      <ToggleGroup
        type="single"
        variant="primary"
        size="sm"
        className="mb-4 gap-1.5"
        onValueChange={(value) =>
          value && setActivityFilter(value as (typeof ACTIVITY_FILTERS)[number])
        }
        value={activityFilter}
      >
        {ACTIVITY_FILTERS.map((filter) => (
          <ToggleGroupItem value={filter} key={filter}>
            {filter}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Card className="flex" key={i}>
            <div className="flex h-full w-9 items-center justify-center border-border border-r-2 bg-accent">
              <div className="-rotate-90 flex items-center gap-1">
                <Avatar size="xs">
                  <AvatarFallback>#</AvatarFallback>
                </Avatar>
                <span className="font-bold font-display text-sm">Guild</span>
              </div>
            </div>
            <div className="px-5 py-6">
              <h3 className="font-bold">
                Acquire the{" "}
                <Badge className="whitespace-nowrap">
                  <Rocket weight="fill" className="mr-1" />
                  Enter Farcaster
                </Badge>{" "}
                role
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <p className="text-muted-foreground">2 hours ago</p>
                <Circle
                  className="hidden size-1.5 text-muted-foreground sm:block"
                  weight="fill"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
