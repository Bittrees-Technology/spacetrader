import Foundation

@main struct SaveArchiveTests {
    static func main() throws {
        func check(_ condition:Bool) {precondition(condition)}
        let dir=URL(fileURLWithPath:CommandLine.arguments[1]).appendingPathComponent("save-archive-qa-"+UUID().uuidString)
        try FileManager.default.createDirectory(at:dir,withIntermediateDirectories:true)
        let archive=SaveArchive(directory:dir),old=Data("prior voyage, cargo and fleet".utf8),next=Data("next voyage, exact battle turn".utf8)
        try old.write(to:archive.current)
        let kept=try archive.replace(archive.current,with:next)!
        check(try Data(contentsOf:kept)==old)
        check(try Data(contentsOf:archive.current)==next)
        print("PASS native load preserves an independently readable copy before replacing the autosave")
        let first=try archive.replace(archive.checkpoint,with:old);precondition(first==nil)
        let checkpoint=try archive.replace(archive.checkpoint,with:next)!
        check(try Data(contentsOf:checkpoint)==old)
        check(try Data(contentsOf:archive.checkpoint)==next)
        print("PASS native checkpoint creation and replacement keep previous checkpoint contents")
        let slot=dir.appendingPathComponent("slot1.json");try old.write(to:slot)
        try archive.replace(archive.current,with:old)
        check(try Data(contentsOf:slot)==old)
        check(try Data(contentsOf:archive.checkpoint)==next)
        print("PASS native loads keep manual checkpoints and the quick checkpoint separate")
        var failure=archive;failure.write={_,_ in throw CocoaError(.fileWriteOutOfSpace)}
        do {try failure.replace(archive.current,with:next);preconditionFailure("Expected failure")} catch {}
        check(try Data(contentsOf:archive.current)==old)
        print("PASS native failed writes leave the original autosave and a recovery copy intact")
        var partial=archive;partial.write={data,url in try data.write(to:url);throw CocoaError(.fileWriteUnknown)}
        do {try partial.replace(archive.current,with:next);preconditionFailure("Expected failure")} catch {}
        check(try Data(contentsOf:archive.current)==old)
        print("PASS native interrupted replacements restore the previous autosave from its preserved copy")
        let unrelated=dir.appendingPathComponent("unrelated.json");try next.write(to:unrelated)
        let list=try archive.backups();precondition(list.count==5)
        for url in list {let data=try Data(contentsOf:url);precondition(data==old || data==next)}
        check(try Data(contentsOf:unrelated)==next)
        let older=dir.appendingPathComponent("voyage-backup-100-older.json"),newer=dir.appendingPathComponent("voyage-backup-200-newer.json")
        try old.write(to:older);try next.write(to:newer)
        try FileManager.default.setAttributes([.modificationDate:Date(timeIntervalSince1970:9999)],ofItemAtPath:older.path)
        try FileManager.default.setAttributes([.modificationDate:Date(timeIntervalSince1970:1)],ofItemAtPath:newer.path)
        let ordered=try archive.backups();precondition(ordered.firstIndex(of:newer)!<ordered.firstIndex(of:older)!)
        print("PASS native recovery lists retain every backup and exclude unrelated files without deleting them")
    }
}
