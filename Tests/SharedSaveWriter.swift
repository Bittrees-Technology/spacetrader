import Foundation
@main struct Writer {
 static func main() throws {
  let a=CommandLine.arguments,archive=SaveArchive(directory:URL(fileURLWithPath:a[1]))
  try archive.commit(Data(contentsOf:URL(fileURLWithPath:a[3])),expected:Data(contentsOf:URL(fileURLWithPath:a[2])),preserveOld:true)
 }
}
