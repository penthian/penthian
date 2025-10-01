"use client"

import { useState, useEffect } from "react"
import { VotingProposal } from "../context/types"

export function useVotingProposals() {
    const [proposals, setProposals] = useState<VotingProposal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>("")

    const fetchProposals = async () => {
        try {
            setLoading(true)
            setError("")
            // const data = await votingAPI.getProposals()
            // setProposals(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const submitVote = async (proposalId: string, vote: "yes" | "no") => {
        try {
            // await votingAPI.submitVote(proposalId, vote)
            // Update local state optimistically
            setProposals((prev) =>
                prev.map((proposal) => (proposal.id === proposalId ? { ...proposal, userVote: vote } : proposal)),
            )
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : "Failed to submit vote")
        }
    }

    useEffect(() => {
        fetchProposals()
    }, [])

    return {
        proposals,
        loading,
        error,
        refetch: fetchProposals,
        submitVote,
    }
}
