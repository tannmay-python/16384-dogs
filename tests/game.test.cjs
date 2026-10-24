const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function game(previousState = null) {
  const ctx = vm.createContext({console, Math});
  for (const file of ['grid', 'tile', 'game_manager']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/'+file+'.js'), 'utf8'), ctx);
  ctx.GameManager.prototype.fillLegend = function() {};
  function Input() { this.events = {}; }
  Input.prototype.on = function(k, f) { this.events[k] = f; };
  function Actuator() {}
  Actuator.prototype.actuate = Actuator.prototype.continueGame = function() {};
  function Storage() { this.best = this.points = 0; }
  Storage.prototype.getGameState = function() { return previousState; };
  Storage.prototype.getBestScore = function() { return this.best; };
  Storage.prototype.getBestPoints = function() { return this.points; };
  Storage.prototype.setBestScore = function(v) { this.best = v; };
  Storage.prototype.setBestPoints = function(v) { this.points = v; };
  Storage.prototype.setGameState = function(v) { this.saved = v; };
  Storage.prototype.clearGameState = function() { this.saved = null; };
  const g = new ctx.GameManager(4, Input, Actuator, Storage);
  g.grid = new ctx.Grid(4); g.addRandomTile = function() {};
  g.put = (x,y,v) => g.grid.insertTile(new ctx.Tile({x,y},v));
  g.at = (x,y) => g.grid.cellContent({x,y})?.value || 0;
  return g;
}
test('two starting tiles, saved game, and clean restart', () => {
  const g=game();
  assert.equal(g.storageManager.saved.grid.cells.flat().filter(Boolean).length,2);
  g.restart();
  // Restart uses the stubbed spawner; verify state reset and persistence.
  assert.equal(g.points,0); assert.equal(g.won,false); assert.equal(g.over,false);
  assert.ok(g.storageManager.saved);
});
test('each direction merges matching dogs and awards their value', () => {
  for (const [dir,x,y] of [[0,0,0],[1,3,0],[2,0,3],[3,0,0]]) {
    const g=game(); g.put(0,0,2); g.put(dir===0||dir===2?0:1,dir===0||dir===2?1:0,2); g.move(dir);
    assert.equal(g.at(x,y),4); assert.equal(g.points,4);
  }
});
test('a tile merges only once per move', () => {
  const g=game(); [2,2,4,0].forEach((v,x)=>{if(v)g.put(x,0,v)}); g.move(3);
  assert.equal(g.at(0,0),4); assert.equal(g.at(1,0),4); assert.equal(g.points,4);
});
test('four matching tiles produce two merges', () => {
  const g=game(); for(let x=0;x<4;x++)g.put(x,0,2);g.move(3);
  assert.equal(g.at(0,0),4);assert.equal(g.at(1,0),4);assert.equal(g.points,8);
});
test('tiles below 2048 do not prematurely win', () => {
  for(const v of [256,512]){const g=game();g.put(0,0,v);g.put(1,0,v);g.move(3);assert.equal(g.won,false)}
});
test('1024 + 1024 wins at 2048 and Keep going unlocks bonus play', () => {
  const g=game();g.put(0,0,1024);g.put(1,0,1024);g.move(3);
  assert.equal(g.at(0,0),2048);assert.equal(g.won,true);assert.equal(g.points,2048);
  assert.equal(g.isGameTerminated(),true);
  g.inputManager.events.keepPlaying();assert.equal(g.isGameTerminated(),false);
  assert.equal(g.serialize().keepPlaying,true);
  assert.equal(g.storageManager.saved.keepPlaying,true);
  g.put(1,0,2048); g.move(3);
  assert.equal(g.at(0,0),4096);
  assert.equal(g.isGameTerminated(),false);
});
test('blocked moves do not spawn tiles or change score', () => {
  const g=game();g.put(0,0,2);let spawned=0;g.addRandomTile=()=>spawned++;g.move(3);
  assert.equal(spawned,0);assert.equal(g.points,0);
});
test('a full board without matches has no moves', () => {
  const g=game();for(let x=0;x<4;x++)for(let y=0;y<4;y++)g.put(x,y,((x+y)%2)?2:4);
  assert.equal(g.movesAvailable(),false);
});
test('every level through 16384 has a local dog image and name', () => {
  const assets=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets.json')));
  assert.equal(assets.length,14);
  for(let i=1;i<=14;i++){const v=2**i;assert.ok(assets.find(a=>a.value===v));assert.ok(fs.statSync(path.join(__dirname,'../style/img/'+v+'.jpg')).size>1000)}
});

test('an existing save with a 2048 dog recognizes the new win target', () => {
  const original=game(); original.put(0,0,2048);
  const saved=original.serialize(); saved.won=false;
  const restored=game(saved);
  assert.equal(restored.won,true);
  assert.equal(restored.isGameTerminated(),true);
});
