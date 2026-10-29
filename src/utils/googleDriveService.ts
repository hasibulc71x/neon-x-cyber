/**
 * Client-Side Google Drive API Service for NEON-X
 * Handles file listing, searching, reading, saving calculation sheets, and deleting files.
 */

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export async function listDriveFiles(
  token: string,
  options?: { folderId?: string; search?: string; pageSize?: number }
): Promise<DriveFileItem[]> {
  const queryParts = ["trashed = false"];

  if (options?.folderId) {
    queryParts.push(`'${options.folderId}' in parents`);
  }
  if (options?.search) {
    queryParts.push(`name contains '${options.search.replace(/'/g, "\\'")}'`);
  }

  const q = queryParts.join(' and ');
  const pageSize = options?.pageSize || 30;

  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(
    q
  )}&pageSize=${pageSize}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
}

export async function findOrCreateAppFolder(token: string): Promise<string> {
  const folderName = 'NEON-X Cyber Calculator';
  const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;

  const searchRes = await fetch(
    `${DRIVE_API_BASE}/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder
  const createRes = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to create NEON-X folder in Google Drive');
  }

  const created = await createRes.json();
  return created.id;
}

export async function uploadCalculationFileToDrive(
  token: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/plain'
): Promise<DriveFileItem> {
  // 1. Locate or create folder
  let parentFolderId: string | undefined;
  try {
    parentFolderId = await findOrCreateAppFolder(token);
  } catch {
    // If folder creation fails, fallback to root
  }

  // 2. Multipart upload metadata + content
  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: mimeType,
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload file to Google Drive: ${err}`);
  }

  return await res.json();
}

export async function readDriveFileContent(token: string, fileId: string): Promise<string> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Could not download file content from Google Drive');
  }

  return await res.text();
}

export async function deleteDriveFile(token: string, fileId: string): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete file from Google Drive');
  }
}
