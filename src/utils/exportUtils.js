/**
 * CascadeShield - Data Export Utilities
 * Provides functions for exporting data in JSON / CSV formats and clipboard management.
 */

/**
 * Trigger download of data as a formatted JSON file.
 * @param {any} data - Data object or array to export.
 * @param {string} [filename='cascadeshield-export.json'] - Target filename.
 */
export function exportAsJSON(data, filename = 'cascadeshield-export.json') {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    triggerDownload(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
    return true;
  } catch (error) {
    console.error('Failed to export JSON:', error);
    return false;
  }
}

/**
 * Convert an array of objects to CSV and trigger download.
 * Supports automatic header extraction, nested object stringification, and standard CSV escaping.
 * @param {Array<Object>} data - Array of row objects.
 * @param {string} [filename='cascadeshield-export.csv'] - Target filename.
 */
export function exportAsCSV(data, filename = 'cascadeshield-export.csv') {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('exportAsCSV: Provided data is empty or not an array.');
      const emptyBlob = new Blob(['No data available'], { type: 'text/csv;charset=utf-8;' });
      triggerDownload(emptyBlob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
      return false;
    }

    // Extract all distinct keys across objects to preserve sparse data
    const headers = Array.from(
      data.reduce((acc, row) => {
        if (row && typeof row === 'object') {
          Object.keys(row).forEach((k) => acc.add(k));
        }
        return acc;
      }, new Set())
    );

    const escapeCSVValue = (val) => {
      if (val === null || val === undefined) return '""';
      let stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Double up any quotes inside the value
      stringVal = stringVal.replace(/"/g, '""');
      return `"${stringVal}"`;
    };

    const csvRows = [];
    // Header row
    csvRows.push(headers.map((h) => escapeCSVValue(h)).join(','));

    // Content rows
    for (const row of data) {
      const values = headers.map((header) => {
        const val = row ? row[header] : '';
        return escapeCSVValue(val);
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
    return true;
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return false;
  }
}

/**
 * Safely copy text to clipboard with modern API and textarea fallback.
 * @param {string} text - Text to copy.
 * @returns {Promise<boolean>} True if copy succeeded.
 */
export async function copyToClipboard(text) {
  if (typeof text !== 'string') {
    text = String(text ?? '');
  }

  // Modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard failed, attempting fallback...', err);
    }
  }

  // Fallback using invisible textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
}

/**
 * Helper to trigger file download via temporary anchor element.
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 150);
}

export default {
  exportAsJSON,
  exportAsCSV,
  copyToClipboard,
};
