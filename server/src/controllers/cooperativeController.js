const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getActiveVotes = async (req, res) => {
  try {
    const votes = await prisma.cooperativeVote.findMany({
      where: { status: 'ACTIVE' },
      include: { votes: true },
      orderBy: { createdAt: 'desc' },
    });

    // Add user's vote to each
    const enriched = votes.map((vote) => ({
      ...vote,
      userVote: vote.votes.find((v) => v.userId === req.user.id)?.selectedOption || null,
      results: vote.options.map((opt) => ({
        option: opt,
        count: vote.votes.filter((v) => v.selectedOption === opt).length,
      })),
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get votes' });
  }
};

const getVoteById = async (req, res) => {
  try {
    const vote = await prisma.cooperativeVote.findUnique({
      where: { id: req.params.id },
      include: { votes: true },
    });
    if (!vote) return res.status(404).json({ success: false, message: 'Vote not found' });

    const enriched = {
      ...vote,
      userVote: vote.votes.find((v) => v.userId === req.user.id)?.selectedOption || null,
      results: vote.options.map((opt) => ({
        option: opt,
        count: vote.votes.filter((v) => v.selectedOption === opt).length,
      })),
    };

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get vote' });
  }
};

const castVote = async (req, res) => {
  try {
    const { selectedOption } = req.body;

    // Check if provider is a cooperative member
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    if (!provider?.cooperativeMember) {
      return res.status(403).json({ success: false, message: 'Only cooperative members can vote' });
    }

    const vote = await prisma.cooperativeVote.findUnique({ where: { id: req.params.id } });
    if (!vote) return res.status(404).json({ success: false, message: 'Vote not found' });
    if (vote.status !== 'ACTIVE') return res.status(400).json({ success: false, message: 'This vote is closed' });
    if (!vote.options.includes(selectedOption)) return res.status(400).json({ success: false, message: 'Invalid option' });

    const existing = await prisma.vote.findUnique({ where: { voteId_userId: { voteId: req.params.id, userId: req.user.id } } });
    if (existing) return res.status(400).json({ success: false, message: 'You have already voted' });

    const newVote = await prisma.vote.create({
      data: { voteId: req.params.id, userId: req.user.id, selectedOption },
    });

    res.json({ success: true, message: 'Vote cast successfully', data: newVote });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cast vote' });
  }
};

const createVote = async (req, res) => {
  try {
    const { title, description, options } = req.body;
    const vote = await prisma.cooperativeVote.create({
      data: { title, description, options, createdBy: req.user.id },
    });
    res.status(201).json({ success: true, data: vote });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create vote' });
  }
};

const closeVote = async (req, res) => {
  try {
    const vote = await prisma.cooperativeVote.update({
      where: { id: req.params.id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
    res.json({ success: true, message: 'Vote closed', data: vote });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to close vote' });
  }
};

const getWelfareFund = async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const contributions = await prisma.welfareFund.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        totalContribution: provider.welfareContribution,
        contributions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get welfare fund' });
  }
};

const contributeToWelfare = async (req, res) => {
  try {
    const { amount } = req.body;
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const contribution = await prisma.welfareFund.create({
      data: {
        providerId: provider.id,
        amount,
        type: 'CONTRIBUTION',
        description: 'Voluntary contribution',
      },
    });

    await prisma.provider.update({
      where: { id: provider.id },
      data: { welfareContribution: { increment: amount } },
    });

    res.status(201).json({ success: true, message: 'Contribution added', data: contribution });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to contribute' });
  }
};

module.exports = { getActiveVotes, getVoteById, castVote, createVote, closeVote, getWelfareFund, contributeToWelfare };
