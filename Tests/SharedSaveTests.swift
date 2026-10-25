import Foundation
@main struct SharedSaveTests {
 static func main() throws {
  let root=URL(fileURLWithPath:CommandLine.arguments[1]).appendingPathComponent("shared-save-tests-"+UUID().uuidString)
  try FileManager.default.createDirectory(at:root,withIntermediateDirectories:true)
  let archive=SaveArchive(directory:root),a=Data("{\"captain\":\"A\"}".utf8),b=Data("{\"captain\":\"B\"}".utf8),c=Data("{\"captain\":\"C\"}".utf8)
  func check(_ name:String,_ body:()throws->Bool)throws {guard try body() else {fatalError(name)};print("PASS "+name)}
  try check("a missing shared save is created only against a missing revision") {try archive.commit(a,expected:nil);return try archive.currentData()==a}
  try check("a browser update is visible through the same native file") {try b.write(to:archive.current,options:.atomic);return try archive.withLock {try archive.currentData()==b}}
  try check("a stale native action cannot replace newer browser progress") {do{try archive.commit(c,expected:a);return false}catch SharedSaveError.changed{return try archive.currentData()==b}}
  try check("an already committed write can be reconciled without another mutation") {return try archive.commit(b,expected:a)==nil && archive.currentData()==b}
  try check("native checkpoint writes reject stale current progress") {do{try archive.checkpointWrite(archive.checkpoint,data:a,expected:a);return false}catch SharedSaveError.changed{return !FileManager.default.fileExists(atPath:archive.checkpoint.path)}}
  try check("explicit shared loads preserve the exact outgoing voyage for undo") {let kept=try archive.commit(c,expected:b,preserveOld:true);return try Data(contentsOf:kept!)==b && archive.currentData()==c}
  try check("checkpoint replacement retains its previous content independently") {try archive.checkpointWrite(archive.checkpoint,data:a,expected:c);let kept=try archive.checkpointWrite(archive.checkpoint,data:b,expected:c);return try Data(contentsOf:kept!)==a && Data(contentsOf:archive.checkpoint)==b}
  try check("a failed partial shared write restores the preceding voyage") {var failing=archive;failing.write={data,url in try Data("partial".utf8).write(to:url);throw CocoaError(.fileWriteUnknown)};do{try failing.commit(a,expected:c);return false}catch{return try archive.currentData()==c}}
  print("8 native shared-save coordination scenarios passed.")
 }
}
