import { ZKWasmAppRpc } from 'zkwasm-minirollup-rpc';
import { createAsyncThunk } from '@reduxjs/toolkit';

// Get the current URL components
const currentLocation = window.location;
const protocol = currentLocation.protocol; // e.g., 'http:' or 'https:'
const hostname = currentLocation.hostname; // e.g., 'sinka' or 'localhost'

// We assume the rpc is at port 3000
const fullUrl = `${protocol}//${hostname}` + ":3000";
const rpc = new ZKWasmAppRpc(fullUrl);

async function queryConfigI() {
  try {
    const state = await rpc.query_config();
    return state;
  } catch (error) {
    throw "QueryStateError " + error;
  }
}

async function queryStateI(prikey: string) {
  try {
    const data: any = await rpc.queryState(prikey);
    return JSON.parse(data.data);
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 500) {
        throw "QueryStateError";
      } else {
        throw "UnknownError";
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      throw "No response was received from the server, please check your network connection.";
    } else {
      throw "UnknownError";
    }
  }
}


export const getConfig = createAsyncThunk(
  'client/getConfig',
  async () => {
    const res: any = await queryConfigI();
    const data = JSON.parse(res.data);
    return data;
  }
)

export const SERVER_TICK_TO_SECOND = 5;

interface UserState<P, S> {
  player: P | null,
  state: S,
}

interface SendTransactionParams {
    cmd: Array<bigint>;
    prikey: string;
}

interface QueryStateParams {
    prikey: string;
}


export const sendTransaction = createAsyncThunk(
  'client/sendTransaction',
  async (params: {cmd: BigUint64Array, prikey: string }, { rejectWithValue }) => {
    try {
      const { cmd, prikey } = params;
      const state: any = await rpc.sendTransaction(cmd, prikey);
      console.log("(Data-Transaction)", state);
      return state;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);

export const queryState = createAsyncThunk(
  'client/queryState',
  async (key: string, { rejectWithValue }) => {
    try {
      const state: any = await queryStateI(key);
      console.log("(Data-QueryState)", state);
      return state;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);
