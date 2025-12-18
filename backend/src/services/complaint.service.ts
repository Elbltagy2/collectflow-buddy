import { prisma } from '../config/database';
import { ComplaintStatus, ComplaintPriority } from '@prisma/client';

interface CreateComplaintData {
  title: string;
  description: string;
  priority?: ComplaintPriority;
  userId: string;
}

interface UpdateComplaintData {
  status?: ComplaintStatus;
  response?: string;
}

class ComplaintService {
  // Create a new complaint
  async create(data: CreateComplaintData) {
    return prisma.complaint.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Get all complaints (for admin)
  async findAll(params?: {
    status?: ComplaintStatus;
    priority?: ComplaintPriority;
    page?: number;
    limit?: number;
  }) {
    const { status, priority, page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' }, // Pending first
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.complaint.count({ where }),
    ]);

    return {
      complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get complaints for a specific user
  async findByUser(userId: string, params?: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.complaint.count({ where: { userId } }),
    ]);

    return {
      complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get a single complaint by ID
  async findById(id: string) {
    return prisma.complaint.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Update complaint (admin only)
  async update(id: string, data: UpdateComplaintData) {
    const updateData: any = { ...data };

    // If status is being set to RESOLVED or REJECTED, set resolvedAt
    if (data.status === 'RESOLVED' || data.status === 'REJECTED') {
      updateData.resolvedAt = new Date();
    }

    return prisma.complaint.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Get complaint statistics (for admin dashboard)
  async getStats() {
    const [total, pending, inReview, resolved, rejected] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: 'PENDING' } }),
      prisma.complaint.count({ where: { status: 'IN_REVIEW' } }),
      prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      prisma.complaint.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      total,
      pending,
      inReview,
      resolved,
      rejected,
    };
  }
}

export const complaintService = new ComplaintService();
