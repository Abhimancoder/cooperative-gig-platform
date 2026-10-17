const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getServices = async (req, res) => {
  try {
    const { category } = req.query;
    const services = await prisma.service.findMany({
      where: { isActive: true, ...(category && { category }) },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get services' });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get service' });
  }
};

const createService = async (req, res) => {
  try {
    const { name, description, category, basePrice, icon } = req.body;
    const service = await prisma.service.create({ data: { name, description, category, basePrice, icon } });
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await prisma.service.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
};

const deleteService = async (req, res) => {
  try {
    await prisma.service.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Service deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
};

module.exports = { getServices, getServiceById, createService, updateService, deleteService };
