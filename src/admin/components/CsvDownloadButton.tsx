import { useState } from 'react';
import { ApiError } from '../../api/client';

interface CsvDownloadButtonProps {
  onDownload: () => Promise<void>;
  label?: string;
}

export default function CsvDownloadButton({ onDownload, label = 'Exportar CSV' }: CsvDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      await onDownload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo descargar el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="adm-btn adm-btn-outline" onClick={handleClick} disabled={loading}>
        {loading ? 'Descargando…' : `⬇ ${label}`}
      </button>
      {error && <p className="adm-field-error">{error}</p>}
    </div>
  );
}
