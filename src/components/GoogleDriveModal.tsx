import { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  CloudUpload,
  RefreshCw,
  Trash2,
  ExternalLink,
  FileText,
  Check,
  AlertTriangle,
  Search,
  LogOut,
  FolderOpen,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  googleSignOut,
  getAccessToken,
  initAuth,
} from '../utils/googleAuth';
import {
  listDriveFiles,
  uploadCalculationFileToDrive,
  readDriveFileContent,
  deleteDriveFile,
  DriveFileItem,
} from '../utils/googleDriveService';
import { HistoryItem } from '../types/calculator';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onImportCalculation?: (expression: string, result: string) => void;
}

export function GoogleDriveModal({
  isOpen,
  onClose,
  history,
  onImportCalculation,
}: GoogleDriveModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // File viewing / preview
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    content: string;
  } | null>(null);

  // Mandatory Delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);

  // Init Auth on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch files when user is authenticated and modal is open
  const loadFiles = async (currentToken?: string) => {
    const activeToken = currentToken || token || (await getAccessToken());
    if (!activeToken) return;

    setLoading(true);
    setStatusMessage(null);
    try {
      const items = await listDriveFiles(activeToken, {
        search: searchQuery || undefined,
        pageSize: 25,
      });
      setFiles(items);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: err.message || 'Failed to list Google Drive files',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      loadFiles(token);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  // Handle Sign In
  const handleSignIn = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({
          text: `Signed in as ${res.user.displayName || res.user.email}`,
          type: 'success',
        });
        await loadFiles(res.accessToken);
      }
    } catch (err: any) {
      setStatusMessage({
        text: err.message || 'Google Sign-In failed',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await googleSignOut();
      setUser(null);
      setToken(null);
      setFiles([]);
      setStatusMessage({
        text: 'Successfully signed out from Google Drive',
        type: 'info',
      });
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Save current history to Drive
  const handleBackupHistory = async () => {
    if (!token) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `NEON-X_Calculations_${dateStr}_${Date.now().toString().slice(-4)}.json`;
      const dataToSave = {
        app: 'NEON-X | CYBER CALCULATOR',
        timestamp: new Date().toISOString(),
        totalItems: history.length,
        calculations: history,
      };

      await uploadCalculationFileToDrive(
        token,
        fileName,
        JSON.stringify(dataToSave, null, 2),
        'application/json'
      );

      setStatusMessage({
        text: `Uploaded "${fileName}" to Google Drive successfully!`,
        type: 'success',
      });
      await loadFiles(token);
    } catch (err: any) {
      setStatusMessage({
        text: err.message || 'Failed to upload backup',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Preview file content
  const handlePreviewFile = async (file: DriveFileItem) => {
    if (!token) return;
    setLoading(true);
    try {
      const text = await readDriveFileContent(token, file.id);
      setPreviewFile({ name: file.name, content: text });
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Explicit confirmation for deleting file (Mandatory per workspace rules)
  const confirmDeleteFile = async () => {
    if (!fileToDelete || !token) return;
    setLoading(true);
    try {
      await deleteDriveFile(token, fileToDelete.id);
      setStatusMessage({
        text: `Permanently removed "${fileToDelete.name}" from Google Drive.`,
        type: 'info',
      });
      setFileToDelete(null);
      if (previewFile?.name === fileToDelete.name) {
        setPreviewFile(null);
      }
      await loadFiles(token);
    } catch (err: any) {
      setStatusMessage({
        text: err.message || 'Failed to delete file',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-chakra">
      <div className="w-full max-w-2xl bg-[#060c18] border border-cyan-500/40 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.25)] p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-sm sm:text-base text-slate-100 tracking-wider">
                GOOGLE DRIVE CLOUD SYNC
              </h2>
              <div className="text-[11px] font-mono text-cyan-400">
                SAVE CALCULATIONS & ACCESS CLOUD WORKSPACES
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`my-3 p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'border-rose-500/40 bg-rose-950/30 text-rose-300'
                : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-200 ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Auth Ribbon */}
        <div className="p-3.5 my-3 rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google Account'}
                  className="w-9 h-9 rounded-full border border-cyan-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                  {(user.displayName || user.email || 'G')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-slate-100">
                  {user.displayName || 'Google User'}
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate max-w-[220px]">
                  {user.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-300">
              Sign in with your Google Account to enable cloud backups and file storage on Google Drive.
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleBackupHistory}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Backup History</span>
              </button>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Official Google Sign-In button */
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs shadow-md transition-all shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>

        {/* Content Body: Drive Browser */}
        {user ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search and Refresh bar */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadFiles()}
                  placeholder="Search files in Google Drive..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                onClick={() => loadFiles()}
                disabled={loading}
                title="Refresh Drive Files"
                className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-cyber-mono text-xs">
              {files.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-400" />
                  <div>No files found in Google Drive</div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Click "Backup History" above to save your first calculation log.
                  </p>
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-slate-200 font-medium truncate">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {file.modifiedTime
                            ? new Date(file.modifiedTime).toLocaleDateString()
                            : 'Unknown date'}
                          {file.size && ` · ${(parseInt(file.size) / 1024).toFixed(1)} KB`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handlePreviewFile(file)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-mono"
                      >
                        Preview
                      </button>
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => setFileToDelete(file)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete from Google Drive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <HardDrive className="w-10 h-10 opacity-30 text-cyan-400" />
            <div className="text-sm font-semibold text-slate-300">GOOGLE DRIVE OFFLINE</div>
            <p className="text-xs text-slate-500 max-w-sm">
              Please sign in above to view, sync, and organize your calculation workspaces directly in Google Drive.
            </p>
          </div>
        )}

        {/* File Preview Modal Drawer */}
        {previewFile && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-lg bg-[#050914] border border-cyan-500/50 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-300 truncate">
                  {previewFile.name}
                </span>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1 text-slate-400 hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <pre className="flex-1 overflow-y-auto p-3 my-3 bg-slate-950 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap">
                {previewFile.content}
              </pre>
              <div className="flex justify-end">
                <button
                  onClick={() => setPreviewFile(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mandatory User Confirmation Modal for Destructive Delete */}
        {fileToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85">
            <div className="w-full max-w-md bg-[#0a0510] border border-rose-500/50 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2.5 text-rose-400 mb-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-orbitron font-bold text-sm tracking-wider">
                  CONFIRM FILE DELETION
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Are you sure you want to permanently delete{' '}
                <strong className="text-rose-300 font-mono">"{fileToDelete.name}"</strong> from your Google Drive?
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2.5 font-mono text-xs">
                <button
                  onClick={() => setFileToDelete(null)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFile}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>WORKSPACE API: DRIVE v3</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
