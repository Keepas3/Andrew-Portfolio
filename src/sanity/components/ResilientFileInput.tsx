import React, { useCallback, useRef, useState } from 'react';
import { set, unset, useClient, type FileInputProps } from 'sanity';
import { apiVersion } from '@/sanity/env';

const STALL_TIMEOUT_MS = 20_000;
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000, 20_000];

type UploadStatus =
  | { state: 'idle' }
  | { state: 'uploading'; percent: number; attempt: number }
  | { state: 'error'; message: string };

type SanityClientLike = ReturnType<typeof useClient>;

function uploadResilient(
  client: SanityClientLike,
  file: File,
  onProgress: (percent: number, attempt: number) => void,
  isCancelled: () => boolean
): Promise<{ _id: string }> {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryUpload = () => {
      attempt += 1;
      let settled = false;
      let stallTimer: ReturnType<typeof setTimeout>;

      const subscription = client.observable.assets
        .upload('file', file, {
          preserveFilename: true,
          filename: file.name,
          contentType: file.type || undefined,
        })
        .subscribe({
          next: (event) => {
            if (isCancelled()) return;
            if (event.type === 'progress') {
              resetStallTimer();
              onProgress(event.percent ?? 0, attempt);
            } else if (event.type === 'response') {
              settled = true;
              clearTimeout(stallTimer);
              resolve(event.body.document as { _id: string });
            }
          },
          error: (err: unknown) => {
            if (settled) return;
            settled = true;
            clearTimeout(stallTimer);
            handleFailure(err);
          },
        });

      function resetStallTimer() {
        clearTimeout(stallTimer);
        stallTimer = setTimeout(() => {
          if (settled) return;
          settled = true;
          subscription.unsubscribe();
          handleFailure(new Error('Upload stalled — no progress received.'));
        }, STALL_TIMEOUT_MS);
      }
      resetStallTimer();

      function handleFailure(err: unknown) {
        if (isCancelled()) return;
        const delay = RETRY_DELAYS_MS[attempt - 1];
        if (delay === undefined) {
          const message = err instanceof Error ? err.message : 'Upload failed.';
          reject(new Error(message));
          return;
        }
        setTimeout(() => {
          if (!isCancelled()) tryUpload();
        }, delay);
      }
    };

    tryUpload();
  });
}

export function ResilientFileInput(props: FileInputProps) {
  const { value, onChange, readOnly, schemaType } = props;
  const client = useClient({ apiVersion });
  const [status, setStatus] = useState<UploadStatus>({ state: 'idle' });
  const cancelledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accept =
    (schemaType.options as { accept?: string } | undefined)?.accept ?? '*/*';

  const startUpload = useCallback(
    (file: File) => {
      cancelledRef.current = false;
      setStatus({ state: 'uploading', percent: 0, attempt: 1 });

      uploadResilient(
        client,
        file,
        (percent, attempt) => {
          if (!cancelledRef.current) setStatus({ state: 'uploading', percent, attempt });
        },
        () => cancelledRef.current
      )
        .then((assetDoc) => {
          if (cancelledRef.current) return;
          onChange(set({ _type: 'file', asset: { _type: 'reference', _ref: assetDoc._id } }));
          setStatus({ state: 'idle' });
        })
        .catch((err: Error) => {
          if (cancelledRef.current) return;
          setStatus({ state: 'error', message: err.message });
        });
    },
    [client, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) startUpload(file);
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    setStatus({ state: 'idle' });
  };

  const handleClear = () => {
    onChange(unset());
  };

  const browse = () => fileInputRef.current?.click();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={readOnly}
        style={{ display: 'none' }}
      />

      {status.state === 'idle' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={browse} disabled={readOnly}>
            {value?.asset ? 'Replace file' : 'Upload file'}
          </button>
          {value?.asset && (
            <button type="button" onClick={handleClear} disabled={readOnly}>
              Remove
            </button>
          )}
          {value?.asset && <span style={{ fontSize: 12, opacity: 0.7 }}>A file is attached.</span>}
        </div>
      )}

      {status.state === 'uploading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <progress value={status.percent} max={100} style={{ width: '100%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span>
              Uploading… {status.percent}%
              {status.attempt > 1 ? ` (retry ${status.attempt - 1})` : ''}
            </span>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {status.state === 'error' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#e03131' }}>Upload failed: {status.message}</span>
          <button type="button" onClick={browse}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
