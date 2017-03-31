

const units = ['B', 'KB', 'MB', 'GB', 'TB'];


export default function human_readable_byte(size) {
    let unit_index = 0;

    while (size >= 1000) {
        size /=  1000;
        unit_index++;
    }
    
    return `${unit_index > 0 ? size.toPrecision(3) : size} ${units[unit_index]}`;
}
