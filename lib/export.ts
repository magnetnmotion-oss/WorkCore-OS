export function downloadCSV(data: any[], filename: string) {
  if (!data || !data.length) {
    alert("No data to export");
    return;
  }

  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Convert to CSV string
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => headers.map(fieldName => {
      let value = row[fieldName];
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      // Handle strings with commas or quotes
      if (typeof value === 'string') {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      // Handle objects/arrays (stringify them so they fit in a cell)
      if (typeof value === 'object') {
          value = `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ].join('\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}