import { Response } from 'express';
import { complaintService } from '../services/complaint.service';
import { ComplaintStatus, ComplaintPriority } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

class ComplaintController {
  // Create a new complaint (any authenticated user)
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, priority } = req.body;
      const userId = req.user!.id;

      const complaint = await complaintService.create({
        title,
        description,
        priority,
        userId,
      });

      res.status(201).json({
        message: 'Complaint submitted successfully',
        complaint,
      });
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({ message: 'Failed to submit complaint' });
    }
  }

  // Get all complaints (admin) or user's complaints
  async findAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, priority, page, limit } = req.query;
      const user = req.user!;

      // If admin, get all complaints; otherwise get only user's complaints
      if (user.role === 'ADMIN') {
        const result = await complaintService.findAll({
          status: status as ComplaintStatus,
          priority: priority as ComplaintPriority,
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        });
        res.json(result);
      } else {
        const result = await complaintService.findByUser(user.id, {
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        });
        res.json(result);
      }
    } catch (error) {
      console.error('Find complaints error:', error);
      res.status(500).json({ message: 'Failed to fetch complaints' });
    }
  }

  // Get my complaints (for non-admin users)
  async findMine(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit } = req.query;
      const userId = req.user!.id;

      const result = await complaintService.findByUser(userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      console.error('Find my complaints error:', error);
      res.status(500).json({ message: 'Failed to fetch complaints' });
    }
  }

  // Get a single complaint by ID
  async findById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      const complaint = await complaintService.findById(id);

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      // Non-admin users can only view their own complaints
      if (user.role !== 'ADMIN' && complaint.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(complaint);
    } catch (error) {
      console.error('Find complaint error:', error);
      res.status(500).json({ message: 'Failed to fetch complaint' });
    }
  }

  // Update complaint status/response (admin only)
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, response } = req.body;

      const complaint = await complaintService.findById(id);

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      const updated = await complaintService.update(id, {
        status,
        response,
      });

      res.json({
        message: 'Complaint updated successfully',
        complaint: updated,
      });
    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({ message: 'Failed to update complaint' });
    }
  }

  // Get complaint statistics (admin only)
  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await complaintService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Get complaint stats error:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  }
}

export const complaintController = new ComplaintController();
