export function formatDateForAPI(date: string): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
}

export function formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
}