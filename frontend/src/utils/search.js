export const normalizeSearch = value => value.trim().toLocaleLowerCase('vi-VN').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd')
