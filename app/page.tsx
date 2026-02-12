"use client"

import { HomeScreen } from "@/components/home-screen"
import { ListEditor } from "@/components/list-editor"
import { PreviewScreen } from "@/components/preview-screen"
import { useScrimStore } from "@/hooks/use-scrim-store"

export default function Page() {
  const store = useScrimStore()

  if (store.view === "preview" && store.currentList) {
    return <PreviewScreen list={store.currentList} onBack={store.goToEditor} />
  }

  if (store.view === "editor" && store.currentList) {
    return (
      <ListEditor
        list={store.currentList}
        onUpdateList={store.updateList}
        onAddTeam={store.addTeam}
        onUpdateTeam={store.updateTeam}
        onRemoveTeam={store.removeTeam}
        onMoveTeam={store.moveTeam}
        onAddMember={store.addMember}
        onUpdateMember={store.updateMember}
        onRemoveMember={store.removeMember}
        onSave={store.saveList}
        onPreview={store.goToPreview}
        onBack={store.goHome}
      />
    )
  }

  return (
    <HomeScreen
      archive={store.archive}
      onCreateNew={store.createNewList}
      onLoad={store.loadList}
      onDelete={store.deleteList}
    />
  )
}
