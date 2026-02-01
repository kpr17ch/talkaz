'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Trash2 } from 'lucide-react'
import { getCharacters, deleteCharacter, type SavedCharacter } from '@/lib/character-storage'
import { useRouter } from 'next/navigation'

export default function MyCharactersPage() {
  const [characters, setCharacters] = useState<SavedCharacter[]>([])
  const router = useRouter()

  useEffect(() => {
    setCharacters(getCharacters())
  }, [])

  const handleDownload = (character: SavedCharacter) => {
    const videoUrl = character.finalVideoUrl || character.greenscreenVideoUrl
    if (!videoUrl) return
    
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = `${character.name || 'character'}-video.mp4`
    link.click()
  }

  const handleDelete = (id: string) => {
    if (confirm('Do you really want to delete this character?')) {
      deleteCharacter(id)
      setCharacters(getCharacters())
    }
  }

  if (characters.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="mb-2 text-xl font-semibold">No characters created yet</h2>
            <p className="mb-6 text-muted-foreground text-center">
              Create your first character to see it here.
            </p>
            <Button onClick={() => router.push('/')}>
              Create Character
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Characters</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {characters.length} {characters.length === 1 ? 'Character' : 'Characters'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => {
          const videoUrl = character.finalVideoUrl || character.greenscreenVideoUrl
          const createdAt = new Date(character.createdAt)
          const formattedDate = createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          return (
            <Card key={character.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{character.name}</CardTitle>
                <CardDescription>{formattedDate}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                {videoUrl && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <video
                      src={videoUrl}
                      className="h-full w-full object-cover"
                      controls
                      preload="metadata"
                    >
                      Your browser does not support video.
                    </video>
                  </div>
                )}
                <div className="mt-auto flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(character)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(character.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
