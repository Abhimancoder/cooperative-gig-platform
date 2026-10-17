import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import { Vote, CheckCircle, Users, Clock } from 'lucide-react';

export default function Governance() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery('votes', () => api.get('/cooperative/votes').then(r => r.data));

  const castVote = useMutation(({ voteId, selectedOption }) => api.post(`/cooperative/votes/${voteId}/cast`, { selectedOption }), {
    onSuccess: () => { toast.success('Vote cast! 🗳️'); qc.invalidateQueries('votes'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Vote failed'),
  });

  const votes = data?.data || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="PROVIDER" />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🗳️ Cooperative Governance</h1>
          <p className="text-gray-500 mt-1">As a cooperative member, your vote shapes our platform. Every voice matters.</p>
        </div>

        {/* Explainer */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 rounded-2xl p-5 mb-8">
          <h3 className="font-bold text-primary-900 mb-2">Why Democratic Voting?</h3>
          <p className="text-primary-700 text-sm">Unlike Uber or Urban Company, CoopServe is owned by workers. You vote on fee changes, new service categories, welfare policies, and platform rules. This is YOUR platform.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div></div>
        ) : votes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Vote size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No active votes</h3>
            <p className="text-gray-400">Check back later for new cooperative decisions</p>
          </div>
        ) : (
          <div className="space-y-6">
            {votes.map((vote) => {
              const totalVotes = vote.votes?.length || 0;
              return (
                <div key={vote.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{vote.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{vote.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Users size={14} /> {totalVotes} votes
                    </div>
                  </div>

                  <div className="space-y-3">
                    {vote.options.map((option) => {
                      const result = vote.results?.find(r => r.option === option);
                      const count = result?.count || 0;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      const isMyVote = vote.userVote === option;
                      const hasVoted = !!vote.userVote;

                      return (
                        <div key={option}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-sm font-medium ${isMyVote ? 'text-primary-700' : 'text-gray-700'}`}>
                              {isMyVote && '✓ '}{option}
                            </span>
                            {hasVoted && <span className="text-sm text-gray-400">{count} ({percent}%)</span>}
                          </div>
                          {hasVoted ? (
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div className={`h-2.5 rounded-full transition-all ${isMyVote ? 'bg-primary-600' : 'bg-gray-300'}`}
                                style={{ width: `${percent}%` }}></div>
                            </div>
                          ) : (
                            <button onClick={() => castVote.mutate({ voteId: vote.id, selectedOption: option })}
                              disabled={castVote.isLoading}
                              className="w-full text-left px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 transition-all font-medium disabled:opacity-50">
                              {option}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {vote.userVote && (
                    <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle size={16} /> You voted for "{vote.userVote}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
