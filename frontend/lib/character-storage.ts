export interface SavedCharacter {
  id: string
  createdAt: string
  name: string
  imageUrl: string
  greenscreenVideoUrl: string
  finalVideoUrl?: string
  audioText: string
}

const STORAGE_KEY = 'talkaz_characters'

function getStorageKey(): string {
  return STORAGE_KEY
}

export function saveCharacter(character: SavedCharacter): void {
  if (typeof window === 'undefined') return
  
  const characters = getCharacters()
  characters.push(character)
  localStorage.setItem(getStorageKey(), JSON.stringify(characters))
}

export function getCharacters(): SavedCharacter[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(getStorageKey())
    if (!stored) return []
    return JSON.parse(stored) as SavedCharacter[]
  } catch (error) {
    console.error('Failed to load characters from localStorage:', error)
    return []
  }
}

export function deleteCharacter(id: string): void {
  if (typeof window === 'undefined') return
  
  const characters = getCharacters()
  const filtered = characters.filter((c) => c.id !== id)
  localStorage.setItem(getStorageKey(), JSON.stringify(filtered))
}

export function getCharacter(id: string): SavedCharacter | null {
  const characters = getCharacters()
  return characters.find((c) => c.id === id) || null
}
