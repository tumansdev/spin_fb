// Google Sheets CSV parser for giveaway data
// Fetches published Google Sheet as CSV and converts to participant format

export interface SheetParticipant {
  name: string
  comment: string
  taggedFriendName: string // ชื่อเพื่อนที่แท็ก
  likedPage: boolean
  sharedPost: boolean
  hasHashtag: boolean
}

export interface SheetFetchResult {
  ok: boolean
  participants: SheetParticipant[]
  error?: string
  rawData?: string[][]
}

/**
 * Convert Google Sheets URL to CSV export URL
 * Supports various Google Sheets URL formats
 */
export function getCSVUrl(sheetUrl: string): string {
  // Already a CSV URL
  if (sheetUrl.includes('/pub?') && sheetUrl.includes('output=csv')) {
    return sheetUrl
  }
  
  // Extract sheet ID from various URL formats
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/,
  ]
  
  let sheetId = ''
  for (const pattern of patterns) {
    const match = sheetUrl.match(pattern)
    if (match) {
      sheetId = match[1]
      break
    }
  }
  
  if (!sheetId) {
    // Assume it's just the ID
    sheetId = sheetUrl.trim()
  }
  
  return `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`
}

/**
 * Parse CSV text into 2D array
 */
function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n')
  const result: string[][] = []
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const row: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    row.push(current.trim())
    result.push(row)
  }
  
  return result
}

/**
 * Fetch and parse Google Sheets data
 * Expected columns: ชื่อ | คอมเมนต์ | แท็กเพื่อน | ไลค์เพจ | แชร์โพสต์ | แฮชแท็ก
 */
export async function fetchGoogleSheet(sheetUrl: string): Promise<SheetFetchResult> {
  try {
    const csvUrl = getCSVUrl(sheetUrl)
    
    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      return {
        ok: false,
        participants: [],
        error: `ไม่สามารถดึงข้อมูลได้ (${response.status}). ตรวจสอบว่า Sheet ถูก Publish to web แล้ว`,
      }
    }
    
    const csvText = await response.text()
    
    if (!csvText.trim()) {
      return {
        ok: false,
        participants: [],
        error: 'Google Sheet ว่างเปล่า',
      }
    }
    
    const rows = parseCSV(csvText)
    
    if (rows.length < 2) {
      return {
        ok: false,
        participants: [],
        error: 'ต้องมีอย่างน้อย 1 row ข้อมูล (ไม่นับ header)',
      }
    }
    
    // Skip header row, parse data rows
    const participants: SheetParticipant[] = []
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (row.length < 3 || !row[0]?.trim()) continue
      
      const name = row[0]?.trim() || `ผู้เข้าร่วม #${i}`
      const comment = row[1]?.trim() || ''
      const taggedFriendName = row[2]?.trim() || '' // Column C - ชื่อเพื่อนที่แท็ก
      const likedPageRaw = row[3]?.trim().toLowerCase() || ''
      const sharedPostRaw = row[4]?.trim().toLowerCase() || ''
      const hashtagRaw = row[5]?.trim().toLowerCase() || ''
      
      // Parse boolean values - flexible matching
      const passWords = ['ผ่าน', 'pass', 'yes', 'true', '1', 'ใช่', 'ok']
      const likedPage = passWords.some(w => likedPageRaw.includes(w))
      const sharedPost = passWords.some(w => sharedPostRaw.includes(w))
      const hasHashtag = passWords.some(w => hashtagRaw.includes(w))
      
      participants.push({
        name,
        comment,
        taggedFriendName,
        likedPage,
        sharedPost,
        hasHashtag,
      })
    }
    
    if (participants.length === 0) {
      return {
        ok: false,
        participants: [],
        error: 'ไม่พบข้อมูลผู้เข้าร่วมใน Sheet (ตรวจสอบ format คอลัมน์)',
        rawData: rows,
      }
    }
    
    return {
      ok: true,
      participants,
      rawData: rows,
    }
    
  } catch (error) {
    return {
      ok: false,
      participants: [],
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล',
    }
  }
}
