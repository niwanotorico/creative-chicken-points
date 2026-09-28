export const children = ['ぴよきち', 'ぴよみ'];
export function isAdmin(user) { return user?.email === 'getadry@gmail.com'; }
export function validRecord(r) { return children.includes(r.child) && ['earn','spend'].includes(r.type) && Number.isSafeInteger(r.points) && r.points > 0 && r.points <= 1000000 && typeof r.reason === 'string' && r.reason.trim().length > 0 && r.reason.length <= 200; }
export function balances(records) { const result = Object.fromEntries(children.map(c => [c,0])); for(const r of records) if(validRecord(r)) result[r.child] += r.points * (r.type === 'earn' ? 1 : -1); return result; }
