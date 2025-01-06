import React from 'react'
import { ethers,Contract } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./config.js";
import { Web3Provider } from '@ethersproject/providers';
import { useState,useEffect } from 'react';
function Election() {
    const [candidates,setCandidates] = useState([]);
    const [hasVoted,setHasVoted] = useState(false);
    const [contract,setContract] = useState(null);
    const [account,setAccount] = useState("");
   
    const loadBlockchainData = async () => {
        if (!window.ethereum) {
          alert("Please install MetaMask!");
          return;
        }
    
        const provider = new Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const electionContract = new Contract(CONTRACT_ADDRESS,CONTRACT_ABI,signer);
    
        const address = await signer.getAddress();
        setAccount(address);
    
        const voterStatus = await electionContract.voters(address);
        setHasVoted(voterStatus);
    
        loadCandidates(electionContract);
        setContract(electionContract);
      };

      const loadCandidates = async(electionContract) =>{
        const candidatesCount = await electionContract.candidatesCount();
        const candidatesArray = [];
        for(let i = 1 ; i<=candidatesCount; i++){
            const candidate = await electionContract.candidates(i);
            candidatesArray.push({
                id: candidate.id,
                name: candidate.name,
                votes: candidate.votes.toString(),
            })
        }
        setCandidates(candidatesArray)
      }

      const vote = async(candidateID) =>{
        if(hasVoted){
            alert("You have already Voted");
            return;
        }
        try {
            const provider = new Web3Provider(window.ethereum);
            const tx = await contract.vote(candidateID);
            await provider.waitForTransaction(tx.hash);
            alert("Vote Cast Successfully!")
            setHasVoted(true);

        } catch (error) {
            console.error(error);
            alert("Vote Failed!");
        }
      };

      const setupEventListeners = (electionContract) => {
        electionContract.on("votedEvent", (candidateId) => {
          console.log(`Candidate ${candidateId} received a vote.`);
          loadCandidates(electionContract); // Refresh the candidate list
        });
      };

      useEffect(() => {
        loadBlockchainData().then(() => {
          if (contract) {
            setupEventListeners(contract);
          }
        });
    
        // Cleanup event listeners when the component unmounts
        return () => {
          if (contract) {
            contract.removeAllListeners("votedEvent");
          }
        };
      }, [contract]);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Election Voting</h1>
      <p className='pb-4'>Connected Account: {account}</p>
      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          className="p-4 border rounded-lg border-gray-500 mb-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{candidate.name}</p>
            <p>Votes: {candidate.votes}</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            onClick={() => vote(candidate.id)}
            disabled={hasVoted}
          >
            {hasVoted ? "Voted" : "Vote"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Election