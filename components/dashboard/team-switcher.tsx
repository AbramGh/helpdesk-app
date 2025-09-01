"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const teams = [
  {
    label: "Personal Account",
    value: "personal",
  },
  {
    label: "Team A",
    value: "team-a",
  },
  {
    label: "Team B",
    value: "team-b",
  },
]

export default function TeamSwitcher() {
  const [open, setOpen] = React.useState(false)
  const [selectedTeam, setSelectedTeam] = React.useState(teams[0])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a team"
          className="w-[200px] justify-between"
        >
          <span className="truncate">{selectedTeam.label}</span>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              {teams.map((team) => (
                <CommandItem
                  key={team.value}
                  onSelect={() => {
                    setSelectedTeam(team)
                    setOpen(false)
                  }}
                  className="text-sm"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTeam.value === team.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {team.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
