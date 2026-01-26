/**
 * Repair Tickets API Router
 * 
 * Handles CRUD operations for repair tickets
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// In-memory storage (replace with database in production)
let tickets = [];

// Data file path
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load tickets from file
function loadTickets() {
  try {
    if (fs.existsSync(TICKETS_FILE)) {
      const data = fs.readFileSync(TICKETS_FILE, 'utf8');
      tickets = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading tickets:', err);
  }
}

// Save tickets to file
function saveTickets() {
  try {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2));
  } catch (err) {
    console.error('Error saving tickets:', err);
  }
}

// Load tickets on startup
loadTickets();

/**
 * GET /api/v1/tickets
 * Get all repair tickets
 */
router.get('/', (req, res) => {
  try {
    const { status, customerId, deviceId } = req.query;
    
    let filteredTickets = tickets;
    
    if (status) {
      filteredTickets = filteredTickets.filter(t => t.status === status);
    }
    
    if (customerId) {
      filteredTickets = filteredTickets.filter(t => t.customerId === customerId);
    }
    
    if (deviceId) {
      filteredTickets = filteredTickets.filter(t => t.deviceId === deviceId);
    }
    
    res.json(filteredTickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/tickets/:id
 * Get a specific repair ticket
 */
router.get('/:id', (req, res) => {
  try {
    const ticket = tickets.find(t => t.id === req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/tickets
 * Create a new repair ticket
 */
router.post('/', (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deviceId,
      deviceModel,
      issueDescription,
      estimatedCost,
    } = req.body;
    
    // Validation
    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: 'Customer information is required' });
    }
    
    if (!deviceId || !deviceModel) {
      return res.status(400).json({ error: 'Device information is required' });
    }
    
    if (!issueDescription) {
      return res.status(400).json({ error: 'Issue description is required' });
    }
    
    const newTicket = {
      id: uuidv4(),
      customerName,
      customerEmail,
      customerPhone,
      deviceId,
      deviceModel,
      issueDescription,
      status: 'pending',
      estimatedCost: estimatedCost || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      notes: [],
    };
    
    tickets.push(newTicket);
    saveTickets();
    
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/v1/tickets/:id
 * Update a repair ticket
 */
router.put('/:id', (req, res) => {
  try {
    const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const updatedTicket = {
      ...tickets[ticketIndex],
      ...req.body,
      id: tickets[ticketIndex].id, // Prevent ID from being changed
      createdAt: tickets[ticketIndex].createdAt, // Prevent creation date from being changed
      updatedAt: new Date().toISOString(),
    };
    
    // Set completedAt when status changes to completed
    if (updatedTicket.status === 'completed' && !updatedTicket.completedAt) {
      updatedTicket.completedAt = new Date().toISOString();
    }
    
    tickets[ticketIndex] = updatedTicket;
    saveTickets();
    
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v1/tickets/:id
 * Delete a repair ticket
 */
router.delete('/:id', (req, res) => {
  try {
    const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const deletedTicket = tickets.splice(ticketIndex, 1)[0];
    saveTickets();
    
    res.json({ message: 'Ticket deleted successfully', ticket: deletedTicket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/tickets/:id/notes
 * Add a note to a repair ticket
 */
router.post('/:id/notes', (req, res) => {
  try {
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({ error: 'Note is required' });
    }
    
    const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (!tickets[ticketIndex].notes) {
      tickets[ticketIndex].notes = [];
    }
    
    tickets[ticketIndex].notes.push({
      id: uuidv4(),
      text: note,
      timestamp: new Date().toISOString(),
    });
    
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    saveTickets();
    
    res.json(tickets[ticketIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/tickets/stats
 * Get ticket statistics
 */
router.get('/api/stats', (req, res) => {
  try {
    const stats = {
      total: tickets.length,
      byStatus: {
        pending: tickets.filter(t => t.status === 'pending').length,
        diagnosed: tickets.filter(t => t.status === 'diagnosed').length,
        inProgress: tickets.filter(t => t.status === 'inProgress').length,
        waitingForParts: tickets.filter(t => t.status === 'waitingForParts').length,
        completed: tickets.filter(t => t.status === 'completed').length,
        cancelled: tickets.filter(t => t.status === 'cancelled').length,
      },
      totalRevenue: tickets
        .filter(t => t.status === 'completed' && t.estimatedCost)
        .reduce((sum, t) => sum + t.estimatedCost, 0),
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
