import dotenv from "dotenv";
dotenv.config();

import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

console.log("Connected to Solana Devnet:", connection.rpcEndpoint);

const address = process.argv[2];
if (!address) {
  console.error("Please provide a Solana address as a command line argument.");
  process.exit(1);
} else if (!PublicKey.isOnCurve(address)) {
  console.error("Invalid Solana address provided.");
  process.exit(1);
}

// Pass the parsedSecretKey to getKeypairFromEnvironment
const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");
if (!senderKeypair) {
  console.error("Sender keypair not found in environment variables.");
  process.exit(1);
}

console.log("Sender Keypair:", senderKeypair.publicKey.toBase58());

const publicKey = new PublicKey(address);
const balance = await connection.getBalance(publicKey);
console.log(`Balance of ${publicKey.toBase58()}: ${balance} lamports`);

const balanceInSol = balance / LAMPORTS_PER_SOL;
console.log(`Balance of ${publicKey.toBase58()}: ${balanceInSol} SOL`);

const transaction = new Transaction();

const LAMPORTS_TO_SEND = 5000;

const transactionInstruction = SystemProgram.transfer({
  fromPubkey: senderKeypair.publicKey,
  toPubkey: publicKey,
  lamports: LAMPORTS_TO_SEND,
});

transaction.add(transactionInstruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
console.log("Transaction signature:", signature);
console.log(`Sent ${LAMPORTS_TO_SEND} lamports to ${publicKey.toBase58()}`);