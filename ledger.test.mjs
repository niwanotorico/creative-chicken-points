import test from 'node:test';
import assert from 'node:assert/strict';
import {balances,validRecord,isAdmin} from './ledger.mjs';
const earn={child:'ぴよきち',type:'earn',points:100,reason:'お手伝い'};
test('earn, spend, deletion and children are independent',()=>{const spend={...earn,type:'spend',points:30}; const other={...earn,child:'ぴよみ',points:50}; assert.deepEqual(balances([earn,spend,other]),{'ぴよきち':70,'ぴよみ':50}); assert.equal(balances([earn,other])['ぴよきち'],100); assert.equal(balances([spend])['ぴよきち'],-30);});
test('invalid records cannot affect balance',()=>{for(const changes of [{points:0},{points:-1},{points:1.5},{points:Infinity},{points:1000001},{child:'unknown'},{type:'delete'},{reason:' '}]){assert.equal(validRecord({...earn,...changes}),false);assert.equal(balances([{...earn,...changes}])['ぴよきち'],0);}});
test('only specified administrator passes',()=>{assert.equal(isAdmin(null),false);assert.equal(isAdmin({email:'other@gmail.com'}),false);assert.equal(isAdmin({email:'getadry@gmail.com'}),true);});
