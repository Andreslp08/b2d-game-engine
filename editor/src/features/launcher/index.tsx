import { EDITOR_VERSION } from "@/shared/constants"

import { PlusIcon, FolderOpen  } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"

export const Launcher = () => {
    return <div className="grow flex flex-col items-center justify-center">
        <div className="my-10 flex flex-col items-center">
        <img src="/b2d-mark.svg" alt="logo" className="w-30 my-5" />
        <h1 className="font-bold text-2xl 2xl:text-5xl">B2D Game Engine Editor</h1>
        <p className="font-bold text-gray-300">{EDITOR_VERSION}</p>
        </div>

    <div className="flex w-full max-w-md flex-col gap-6">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Create a new project</ItemTitle>
          <ItemDescription>
            Create a 2D game engine project
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            New <PlusIcon/>
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Open a project</ItemTitle>
          <ItemDescription>
            Load your game project and start editing
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="secondary" size="sm">
            Open <FolderOpen/>
          </Button>
        </ItemActions>
      </Item>

    </div>
    </div>
}