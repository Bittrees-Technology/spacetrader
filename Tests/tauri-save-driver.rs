// Isolated audit driver for the exact storage implementation shipped by Tauri.
#[path = "../TauriStandalone/src-tauri/src/saves.rs"]
mod saves;
use std::io::{self, BufRead};
fn main() {
    let directory = std::env::args_os().nth(1).expect("isolated data directory");
    let store = saves::SaveStore::open(directory.into()).expect("open test vault");
    for line in io::stdin().lock().lines() {
        let request = serde_json::from_str(&line.expect("request line")).expect("request JSON");
        println!("{}", serde_json::to_string(&store.respond(request)).unwrap());
    }
}
