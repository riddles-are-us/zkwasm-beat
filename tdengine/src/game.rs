use zkwasm_rust_sdk::wasm_dbg;
use zkwasm_rust_sdk::require;
use zkwasm_rust_sdk::merkle::Merkle;
use sha2::{Sha256, Digest};
use wasm_bindgen::prelude::*;

use crate::tile::coordinate::Coordinate;

use self::state::init_state;
use self::state::GLOBAL;

pub mod object;
pub mod state;

// This is a standalone game state manipulate module that connets with UI
// controllers and model handlers

static mut MERKLE: Merkle = Merkle { root: [0; 4] };

const CMD_MOVE: u8 = 0;
const CMD_ATTACK: u8 = 1;
const CMD_DROP: u8 = 2;

/// Step function receives a encoded command and changes the global state accordingly
#[wasm_bindgen]
pub fn step(command: u64) {
    let commands = command.to_le_bytes();
    unsafe {
        wasm_dbg(commands[0] as u64);
    };

    if commands[0] == CMD_MOVE {
        let objindex = u16::from_le_bytes(commands[1..3].try_into().unwrap());
        unsafe {
            wasm_dbg(objindex as u64);
        };

        let pos = u32::from_le_bytes(commands[4..8].try_into().unwrap());

        unsafe {
            wasm_dbg(pos as u64);
        };
        state::handle_move(objindex as usize, pos as usize);
    }
}

// load the game with user account
#[wasm_bindgen]
pub fn load(account: u64, r0: u64, r1:u64, r2:u64, r3:u64) {
    unsafe {
        MERKLE.root = [r0, r1, r2, r3];
    }
}


#[wasm_bindgen]
pub fn init(seed: u64) {
    init_state()
    //zkwasm_rust_sdk::dbg!("finish loading {:?}", merkle_root);
}


#[wasm_bindgen]
pub fn get_objects() -> String {
    //zkwasm_rust_sdk::dbg!("finish loading {:?}", merkle_root);
    let global = unsafe {&GLOBAL};
    let mut coordinates = vec![];
    for obj in global.map.objects.iter() {
        let (x,y) = obj.position.repr();
        coordinates.push(vec![x,y]);
    }
    serde_json::to_string(&coordinates).unwrap()
}