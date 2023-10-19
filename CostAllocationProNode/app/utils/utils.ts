export function getSkipRecordCount(pageNo: number, pageSize: number) {
    return (Math.max(1, Number(pageNo)) - 1) * Math.min(100, Number(pageSize));
}